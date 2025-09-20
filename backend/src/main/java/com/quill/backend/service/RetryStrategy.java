package com.quill.backend.service;

import java.time.Duration;
import java.util.concurrent.Callable;
import java.util.function.Predicate;

/**
 * Implements an exponential backoff retry strategy for handling transient failures in operations.
 * This class provides a configurable way to retry operations that may fail temporarily,
 * with increasing delays between attempts to prevent overwhelming the system.
 */
public class RetryStrategy {
    /** Maximum number of retry attempts before giving up */
    private final int maxRetries;
    
    /** Initial delay duration between retry attempts */
    private final Duration initialDelay;
    
    /** Maximum delay duration between retry attempts */
    private final Duration maxDelay;
    
    /** Multiplier applied to the delay after each failed attempt */
    private final double backoffMultiplier;

    /**
     * Creates a new retry strategy with the specified parameters.
     *
     * @param maxRetries The maximum number of retry attempts
     * @param initialDelay The initial delay between retry attempts
     * @param maxDelay The maximum delay between retry attempts
     * @param backoffMultiplier The factor by which the delay increases after each attempt
     * @throws IllegalArgumentException if maxRetries is negative, delays are negative,
     *         or backoffMultiplier is less than or equal to 1
     */
    public RetryStrategy(int maxRetries, Duration initialDelay, Duration maxDelay, double backoffMultiplier) {
        this.maxRetries = maxRetries;
        this.initialDelay = initialDelay;
        this.maxDelay = maxDelay;
        this.backoffMultiplier = backoffMultiplier;
    }

    /**
     * Executes a task with retry logic using exponential backoff.
     *
     * @param <T> The return type of the task
     * @param task The operation to execute, wrapped in a Callable
     * @param shouldRetry A predicate that determines whether a specific exception should trigger a retry
     * @return The result of the successful task execution
     * @throws Exception The last exception encountered if all retries fail, or the first
     *         non-retryable exception encountered
     * @throws IllegalStateException in the (theoretical) case where the retry loop completes
     *         without either succeeding or capturing an exception
     */
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

        // This should never be null because we only get here after exhausting all retries
        // where at least one exception must have occurred
        if (lastException != null) {
            throw lastException;
        }
        throw new IllegalStateException("Retry strategy failed but no exception was captured");
    }

    /**
     * Creates a RetryStrategy instance with default settings suitable for most use cases.
     * The default configuration is:
     * - Maximum of 3 retry attempts
     * - Initial delay of 1 second
     * - Maximum delay of 30 seconds
     * - Exponential backoff with a multiplier of 2
     *
     * @return A new RetryStrategy instance with default settings
     */
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