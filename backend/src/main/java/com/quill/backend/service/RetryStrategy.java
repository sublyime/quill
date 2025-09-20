package com.quill.backend.service;

import java.time.Duration;
import java.util.concurrent.Callable;
import java.util.function.Predicate;

public class RetryStrategy {
    private final int maxRetries;
    private final Duration initialDelay;
    private final Duration maxDelay;
    private final double backoffMultiplier;

    public RetryStrategy(int maxRetries, Duration initialDelay, Duration maxDelay, double backoffMultiplier) {
        this.maxRetries = maxRetries;
        this.initialDelay = initialDelay;
        this.maxDelay = maxDelay;
        this.backoffMultiplier = backoffMultiplier;
    }

    public <T> T execute(Callable<T> task, Predicate<Exception> shouldRetry) throws Exception {
        int attempts = 0;
        Duration delay = initialDelay;
        Exception lastException = null;

        while (attempts < maxRetries) {
            try {
                return task.call();
            } catch (Exception e) {
                lastException = e;
                if (!shouldRetry.test(e) || attempts == maxRetries - 1) {
                    throw e;
                }

                Thread.sleep(delay.toMillis());
                delay = Duration.ofMillis(Math.min(
                    (long) (delay.toMillis() * backoffMultiplier),
                    maxDelay.toMillis()
                ));
                attempts++;
            }
        }

        throw lastException;
    }

    public static RetryStrategy defaultStrategy() {
        return new RetryStrategy(
            3,                          // maxRetries
            Duration.ofSeconds(1),      // initialDelay
            Duration.ofSeconds(30),     // maxDelay
            2.0                         // backoffMultiplier
        );
    }

    public static RetryStrategy aggressive() {
        return new RetryStrategy(
            5,                          // maxRetries
            Duration.ofMillis(100),     // initialDelay
            Duration.ofSeconds(5),      // maxDelay
            1.5                         // backoffMultiplier
        );
    }

    public static RetryStrategy gentle() {
        return new RetryStrategy(
            3,                          // maxRetries
            Duration.ofSeconds(5),      // initialDelay
            Duration.ofMinutes(1),      // maxDelay
            2.0                         // backoffMultiplier
        );
    }
}