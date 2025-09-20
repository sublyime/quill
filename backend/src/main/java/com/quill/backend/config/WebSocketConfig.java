package com.quill.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import com.quill.backend.websocket.TerminalWebSocketHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.lang.NonNull;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Bean
    public TerminalWebSocketHandler terminalWebSocketHandler() {
        return new TerminalWebSocketHandler();
    }

    @Override
    public void registerWebSocketHandlers(@NonNull WebSocketHandlerRegistry registry) {
        registry.addHandler(terminalWebSocketHandler(), "/ws/terminal")
               .setAllowedOrigins("*");  // Configure this appropriately in production
    }
}