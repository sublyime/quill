CREATE TABLE modbus_readings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    connection_id BIGINT NOT NULL,
    register INT NOT NULL,
    value INT NOT NULL,
    read_at TIMESTAMP NOT NULL,
    register_type VARCHAR(50) NOT NULL,
    quality VARCHAR(20),
    FOREIGN KEY (connection_id) REFERENCES connections(id)
);