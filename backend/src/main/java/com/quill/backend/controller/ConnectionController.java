package com.quill.backend.controller;

import com.quill.backend.model.Connection;
import com.quill.backend.service.ConnectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {

    @Autowired
    private ConnectionService connectionService;

    @GetMapping
    public List<Connection> getAllConnections() {
        return connectionService.findAll();
    }

    @PostMapping
    public Connection createConnection(@RequestBody Connection connection) {
        return connectionService.save(connection);
    }
}
