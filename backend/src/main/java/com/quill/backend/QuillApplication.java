package com.quill.backend;

import com.quill.backend.service.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class QuillApplication {

    private static final Logger logger = LoggerFactory.getLogger(QuillApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(QuillApplication.class, args);
    }

    @Bean
    public CommandLineRunner ensureDefaultStorage(StorageService storageService) {
        return args -> {
            try {
                storageService.createDefaultIfNone();
                logger.info("Default storage configuration checked/created successfully.");
            } catch (Exception e) {
                logger.error("Failed to create default storage configuration", e);
            }
        };
    }
}
