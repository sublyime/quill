package com.quill.backend.service;

import com.quill.backend.model.Connection;
import net.wimpi.modbus.io.ModbusTCPTransaction;
import net.wimpi.modbus.msg.*;
import net.wimpi.modbus.net.TCPMasterConnection;
import net.wimpi.modbus.procimg.InputRegister;
import net.wimpi.modbus.procimg.Register;
import org.springframework.stereotype.Component;

import java.net.InetAddress;

@Component
public class ModbusHandler {
    public void handleModbusConnection(Connection connection) throws Exception {
        // Parse configuration
        String ipAddress = connection.getConfigurationValue("ipAddress");
        int port = Integer.parseInt(connection.getConfigurationValue("port"));
        int slaveId = Integer.parseInt(connection.getConfigurationValue("slaveId"));
        String registerType = connection.getConfigurationValue("registerType");
        int startAddress = Integer.parseInt(connection.getConfigurationValue("startAddress"));
        int quantity = Integer.parseInt(connection.getConfigurationValue("quantity"));

        // Create the connection
        TCPMasterConnection con = null;
        try {
            // Connect to Modbus device
            con = new TCPMasterConnection(InetAddress.getByName(ipAddress));
            con.setPort(port);
            con.connect();

            // Prepare the transaction
            ModbusTCPTransaction trans = new ModbusTCPTransaction(con);

            // Create the appropriate request based on register type
            ModbusRequest req;
            
            switch (registerType.toLowerCase()) {
                case "holding":
                    ReadMultipleRegistersRequest holdingReq = new ReadMultipleRegistersRequest(startAddress, quantity);
                    holdingReq.setUnitID(slaveId);
                    req = holdingReq;
                    break;
                    
                case "input":
                    ReadInputRegistersRequest inputReq = new ReadInputRegistersRequest(startAddress, quantity);
                    inputReq.setUnitID(slaveId);
                    req = inputReq;
                    break;
                    
                case "coil":
                    ReadCoilsRequest coilReq = new ReadCoilsRequest(startAddress, quantity);
                    coilReq.setUnitID(slaveId);
                    req = coilReq;
                    break;
                    
                case "discrete":
                    ReadInputDiscretesRequest discreteReq = new ReadInputDiscretesRequest(startAddress, quantity);
                    discreteReq.setUnitID(slaveId);
                    req = discreteReq;
                    break;
                    
                default:
                    throw new UnsupportedOperationException("Unsupported register type: " + registerType);
            }

            trans.setRequest(req);
            
            // Execute transaction
            trans.execute();
            
            // Get response and process data
            ModbusResponse response = trans.getResponse();
            
            if (response instanceof ReadMultipleRegistersResponse) {
                Register[] registers = ((ReadMultipleRegistersResponse) response).getRegisters();
                System.out.println("Successfully read " + registers.length + " holding registers:");
                for (int i = 0; i < registers.length; i++) {
                    System.out.println("Register " + (startAddress + i) + ": " + registers[i].getValue());
                }
            } else if (response instanceof ReadInputRegistersResponse) {
                InputRegister[] registers = ((ReadInputRegistersResponse) response).getRegisters();
                System.out.println("Successfully read " + registers.length + " input registers:");
                for (int i = 0; i < registers.length; i++) {
                    System.out.println("Register " + (startAddress + i) + ": " + registers[i].getValue());
                }
            } else if (response instanceof ReadCoilsResponse) {
                var coils = ((ReadCoilsResponse) response).getCoils();
                System.out.println("Successfully read " + coils.size() + " coils:");
                for (int i = 0; i < coils.size(); i++) {
                    System.out.println("Coil " + (startAddress + i) + ": " + (coils.getBit(i) ? 1 : 0));
                }
            } else if (response instanceof ReadInputDiscretesResponse) {
                var discretes = ((ReadInputDiscretesResponse) response).getDiscretes();
                System.out.println("Successfully read " + discretes.size() + " discrete inputs:");
                for (int i = 0; i < discretes.size(); i++) {
                    System.out.println("Discrete " + (startAddress + i) + ": " + (discretes.getBit(i) ? 1 : 0));
                }
            }

        } finally {
            // Close the connection
            if (con != null && con.isConnected()) {
                con.close();
            }
        }
    }
}