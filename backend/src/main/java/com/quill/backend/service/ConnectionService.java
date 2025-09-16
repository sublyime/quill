package com.quill.backend.service;

import com.quill.backend.model.Connection;
import com.quill.backend.repository.ConnectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
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
        return connectionRepository.save(connection);
    }
}
