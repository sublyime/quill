package com.quill.backend.service;

import com.quill.backend.exception.ModbusConnectionException;
import com.quill.backend.model.Connection;
import com.quill.backend.model.ModbusReading;
import com.quill.backend.repository.ModbusReadingRepository;
import net.wimpi.modbus.ModbusIOException;
import net.wimpi.modbus.ModbusSlaveException;
import net.wimpi.modbus.io.ModbusTCPTransaction;
import net.wimpi.modbus.msg.*;
import net.wimpi.modbus.net.TCPMasterConnection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

@Service
public class ModbusConnectionManager {
    private static final Logger logger = LoggerFactory.getLogger(ModbusConnectionManager.class);
    
    private final ModbusReadingRepository readingRepository;
    private final Map<Long, TCPMasterConnection> activeConnections;
    private final Map<Long, ScheduledFuture<?>> pollingTasks;
    private final ScheduledExecutorService scheduler;
    private final RetryStrategy retryStrategy;

    @Autowired
    public ModbusConnectionManager(ModbusReadingRepository readingRepository) {
        this.readingRepository = readingRepository;
        this.activeConnections = new ConcurrentHashMap<>();
        this.pollingTasks = new ConcurrentHashMap<>();
        this.scheduler = Executors.newScheduledThreadPool(4);
        this.retryStrategy = RetryStrategy.defaultStrategy();
    }

    public void startConnection(Connection connection) {
        Long connectionId = connection.getId();
        if (activeConnections.containsKey(connectionId)) {
            throw new ModbusConnectionException(
                connection.getConfigurationValue("ipAddress"),
                Integer.parseInt(connection.getConfigurationValue("port")),
                ModbusConnectionException.ErrorType.CONNECTION_FAILED,
                "Connection is already running"
            );
        }

        TCPMasterConnection con = createConnection(connection);
        activeConnections.put(connectionId, con);

        // Start polling
        int pollInterval = Integer.parseInt(
            connection.getConfigurationValue("pollInterval") != null ? 
            connection.getConfigurationValue("pollInterval") : "1000"
        );

        ScheduledFuture<?> task = scheduler.scheduleAtFixedRate(
            () -> pollData(connection),
            0,
            pollInterval,
            TimeUnit.MILLISECONDS
        );

        pollingTasks.put(connectionId, task);
        logger.info("Started Modbus connection for connection {}", connectionId);
    }

    public void stopConnection(Connection connection) {
        Long connectionId = connection.getId();
        
        // Cancel polling
        ScheduledFuture<?> task = pollingTasks.remove(connectionId);
        if (task != null) {
            task.cancel(true);
        }

        // Close connection
        TCPMasterConnection con = activeConnections.remove(connectionId);
        if (con != null && con.isConnected()) {
            con.close();
        }

        logger.info("Stopped Modbus connection for connection {}", connectionId);
    }

    public void writeHoldingRegister(Connection connection, int register, int value) throws Exception {
        Long connectionId = connection.getId();
        TCPMasterConnection con = activeConnections.get(connectionId);
        if (con == null || !con.isConnected()) {
            throw new ModbusConnectionException(
                connection.getConfigurationValue("ipAddress"),
                Integer.parseInt(connection.getConfigurationValue("port")),
                ModbusConnectionException.ErrorType.CONNECTION_FAILED,
                "No active connection"
            );
        }

        WriteMultipleRegistersRequest req = new WriteMultipleRegistersRequest(
            register,
            new net.wimpi.modbus.procimg.SimpleRegister[]{ new net.wimpi.modbus.procimg.SimpleRegister(value) }
        );
        req.setUnitID(Integer.parseInt(connection.getConfigurationValue("slaveId")));

        ModbusTCPTransaction trans = new ModbusTCPTransaction(con);
        trans.setRequest(req);
        trans.execute();
    }

    public void writeCoil(Connection connection, int coilAddress, boolean value) throws Exception {
        Long connectionId = connection.getId();
        TCPMasterConnection con = activeConnections.get(connectionId);
        if (con == null || !con.isConnected()) {
            throw new ModbusConnectionException(
                connection.getConfigurationValue("ipAddress"),
                Integer.parseInt(connection.getConfigurationValue("port")),
                ModbusConnectionException.ErrorType.CONNECTION_FAILED,
                "No active connection"
            );
        }

        WriteCoilRequest req = new WriteCoilRequest(coilAddress, value);
        req.setUnitID(Integer.parseInt(connection.getConfigurationValue("slaveId")));

        ModbusTCPTransaction trans = new ModbusTCPTransaction(con);
        trans.setRequest(req);
        trans.execute();
    }

    private TCPMasterConnection createConnection(Connection connection) {
        String ipAddress = connection.getConfigurationValue("ipAddress");
        int port = Integer.parseInt(connection.getConfigurationValue("port"));

        try {
            TCPMasterConnection con = new TCPMasterConnection(InetAddress.getByName(ipAddress));
            con.setPort(port);
            con.connect();
            return con;
        } catch (Exception e) {
            throw new ModbusConnectionException(
                ipAddress,
                port,
                ModbusConnectionException.ErrorType.CONNECTION_FAILED,
                "Failed to connect: " + e.getMessage(),
                e
            );
        }
    }

    private void pollData(Connection connection) {
        TCPMasterConnection con = activeConnections.get(connection.getId());
        if (con == null || !con.isConnected()) {
            handleDisconnection(connection);
            return;
        }

        try {
            List<ModbusReading> readings = retryStrategy.execute(
                () -> readRegisters(connection, con),
                this::shouldRetryException
            );
            readingRepository.saveAll(readings);
        } catch (Exception e) {
            logger.error("Error polling data for connection {}: {}", connection.getId(), e.getMessage());
            handleError(connection, e);
        }
    }

    private List<ModbusReading> readRegisters(Connection connection, TCPMasterConnection con) throws Exception {
        int startAddress = Integer.parseInt(connection.getConfigurationValue("startAddress"));
        int quantity = Integer.parseInt(connection.getConfigurationValue("quantity"));
        int slaveId = Integer.parseInt(connection.getConfigurationValue("slaveId"));
        String registerType = connection.getConfigurationValue("registerType");

        ModbusTCPTransaction trans = new ModbusTCPTransaction(con);
        ModbusRequest req = createRequest(registerType, startAddress, quantity, slaveId);
        trans.setRequest(req);
        trans.execute();

        ModbusResponse response = trans.getResponse();
        return processResponse(connection, response, startAddress, registerType);
    }

    private ModbusRequest createRequest(String registerType, int startAddress, int quantity, int slaveId) {
        ModbusRequest req;
        switch (registerType.toLowerCase()) {
            case "holding":
                req = new ReadMultipleRegistersRequest(startAddress, quantity);
                break;
            case "input":
                req = new ReadInputRegistersRequest(startAddress, quantity);
                break;
            case "coil":
                req = new ReadCoilsRequest(startAddress, quantity);
                break;
            case "discrete":
                req = new ReadInputDiscretesRequest(startAddress, quantity);
                break;
            default:
                throw new IllegalArgumentException("Unsupported register type: " + registerType);
        }
        req.setUnitID(slaveId);
        return req;
    }

    private List<ModbusReading> processResponse(Connection connection, ModbusResponse response, int startAddress, String registerType) {
        List<ModbusReading> readings = new ArrayList<>();

        if (response instanceof ReadMultipleRegistersResponse) {
            var registers = ((ReadMultipleRegistersResponse) response).getRegisters();
            for (int i = 0; i < registers.length; i++) {
                readings.add(new ModbusReading(
                    connection,
                    startAddress + i,
                    registerType,
                    registers[i].getValue()
                ));
            }
        } else if (response instanceof ReadInputRegistersResponse) {
            var registers = ((ReadInputRegistersResponse) response).getRegisters();
            for (int i = 0; i < registers.length; i++) {
                readings.add(new ModbusReading(
                    connection,
                    startAddress + i,
                    registerType,
                    registers[i].getValue()
                ));
            }
        } else if (response instanceof ReadCoilsResponse) {
            var coils = ((ReadCoilsResponse) response).getCoils();
            for (int i = 0; i < coils.size(); i++) {
                readings.add(new ModbusReading(
                    connection,
                    startAddress + i,
                    registerType,
                    coils.getBit(i) ? 1 : 0
                ));
            }
        } else if (response instanceof ReadInputDiscretesResponse) {
            var discretes = ((ReadInputDiscretesResponse) response).getDiscretes();
            for (int i = 0; i < discretes.size(); i++) {
                readings.add(new ModbusReading(
                    connection,
                    startAddress + i,
                    registerType,
                    discretes.getBit(i) ? 1 : 0
                ));
            }
        }

        return readings;
    }

    private void handleDisconnection(Connection connection) {
        String ipAddress = connection.getConfigurationValue("ipAddress");
        int port = Integer.parseInt(connection.getConfigurationValue("port"));

        try {
            logger.warn("Connection lost to {}:{}, attempting to reconnect...", ipAddress, port);
            TCPMasterConnection con = createConnection(connection);
            activeConnections.put(connection.getId(), con);
        } catch (Exception e) {
            logger.error("Failed to reconnect to {}:{}: {}", ipAddress, port, e.getMessage());
        }
    }

    private void handleError(Connection connection, Exception e) {
        ModbusConnectionException.ErrorType errorType;
        String message;

        if (e instanceof ModbusIOException) {
            errorType = ModbusConnectionException.ErrorType.CONNECTION_FAILED;
            message = "IO error communicating with device";
        } else if (e instanceof ModbusSlaveException) {
            errorType = ModbusConnectionException.ErrorType.SLAVE_DEVICE_FAILURE;
            message = "Device reported an error";
        } else if (e instanceof ModbusConnectionException) {
            ModbusConnectionException mce = (ModbusConnectionException) e;
            errorType = mce.getErrorType();
            message = mce.getMessage();
        } else {
            errorType = ModbusConnectionException.ErrorType.DEVICE_FAILURE;
            message = e.getMessage();
        }

        // Save error reading
        ModbusReading errorReading = new ModbusReading(
            connection,
            Integer.parseInt(connection.getConfigurationValue("startAddress")),
            connection.getConfigurationValue("registerType"),
            -999
        );
        errorReading.setQuality("BAD");
        errorReading.setErrorMessage(message);
        readingRepository.save(errorReading);

        logger.error("Modbus error for connection {}: {} - {}", connection.getId(), errorType, message);
    }

    private boolean shouldRetryException(Exception e) {
        if (e instanceof ModbusConnectionException) {
            ModbusConnectionException mce = (ModbusConnectionException) e;
            return mce.getErrorType() == ModbusConnectionException.ErrorType.CONNECTION_FAILED ||
                   mce.getErrorType() == ModbusConnectionException.ErrorType.CONNECTION_TIMEOUT ||
                   mce.getErrorType() == ModbusConnectionException.ErrorType.DEVICE_BUSY;
        }
        return e instanceof ModbusIOException;
    }

    public void shutdown() {
        scheduler.shutdown();
        try {
            if (!scheduler.awaitTermination(60, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
            }
        } catch (InterruptedException e) {
            scheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }

        // Close all connections
        for (TCPMasterConnection con : activeConnections.values()) {
            if (con.isConnected()) {
                con.close();
            }
        }
        activeConnections.clear();
        pollingTasks.clear();
    }
}