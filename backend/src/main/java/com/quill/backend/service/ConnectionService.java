package com.quill.backend.service;

import com.quill.backend.model.Connection;
import com.quill.backend.repository.ConnectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ConnectionService {

    @Autowired
    private ConnectionRepository connectionRepository;

    public List<Connection> findAll() {
        return connectionRepository.findAll();
    }

    public Optional<Connection> findById(Long id) {
        return connectionRepository.findById(id);
    }

    public Connection save(Connection connection) {
        if (connection.getId() == null) {
            connection.setCreatedAt(LocalDateTime.now());
        }
        return connectionRepository.save(connection);
    }

    public void deleteById(Long id) {
        connectionRepository.deleteById(id);
    }

    public boolean testConnection(Long id) {
        Optional<Connection> connectionOpt = findById(id);
        if (connectionOpt.isEmpty()) {
            return false;
        }

        Connection connection = connectionOpt.get();
        try {
            // Parse the config JSON to get connection parameters
            // This is where you'd implement actual connection testing
            // For now, we'll simulate a successful test
            connection.setStatus(Connection.ConnectionStatus.ONLINE);
            connection.setLastConnected(LocalDateTime.now());
            connection.setLastError(null);
            save(connection);
            return true;
        } catch (Exception e) {
            connection.setStatus(Connection.ConnectionStatus.ERROR);
            connection.setLastError(e.getMessage());
            save(connection);
            return false;
        }
    }
}
