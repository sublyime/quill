# Development Guidelines

## Code Style

### Java Code Style

1. **Naming Conventions**
   - Classes: PascalCase (e.g., `DataSourceHandler`)
   - Methods/Variables: camelCase (e.g., `connectionTimeout`)
   - Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`)
   - Packages: lowercase (e.g., `com.quill.backend.service`)

2. **Documentation**
   - All public APIs must have JavaDoc
   - Include parameter descriptions
   - Document exceptions
   - Provide usage examples for complex methods

Example:
```java
/**
 * Executes a task with retry logic using exponential backoff.
 *
 * @param <T> The return type of the task
 * @param task The operation to execute
 * @param shouldRetry Determines if an exception should trigger retry
 * @return The result of the successful task execution
 * @throws Exception if all retries fail
 */
public <T> T execute(Callable<T> task, Predicate<Exception> shouldRetry)
    throws Exception {
    // Implementation
}
```

3. **Error Handling**
   - Use specific exception types
   - Include context in exceptions
   - Implement proper cleanup
   - Use the RetryStrategy where appropriate

### TypeScript Code Style

1. **Naming Conventions**
   - Components: PascalCase (e.g., `DataTable`)
   - Functions/Variables: camelCase (e.g., `handleSubmit`)
   - Interfaces/Types: PascalCase (e.g., `ConnectionConfig`)
   - Files: kebab-case (e.g., `data-table.tsx`)

2. **Type Safety**
   - Use explicit types
   - Avoid `any`
   - Use interfaces for objects
   - Define union types for variants

Example:
```typescript
interface ConnectionConfig {
  type: 'modbus' | 'mqtt';
  name: string;
  configuration: Record<string, unknown>;
  enabled: boolean;
}
```

## Git Workflow

### 1. Branch Naming

- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Documentation: `docs/description`
- Release branches: `release/version`

### 2. Commit Messages

Format:
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

Example:
```
feat(modbus): add support for writing to holding registers

- Implement write functionality
- Add validation
- Update documentation

Closes #123
```

### 3. Pull Requests

- Clear description of changes
- Reference related issues
- Include testing steps
- Add screenshots for UI changes
- Update documentation

## Testing Guidelines

### 1. Unit Tests

- Test each class in isolation
- Mock dependencies
- Test edge cases
- Test error conditions

Example:
```java
@Test
void shouldRetryOnTransientFailure() {
    RetryStrategy strategy = RetryStrategy.defaultStrategy();
    AtomicInteger attempts = new AtomicInteger();
    
    assertDoesNotThrow(() -> 
        strategy.execute(
            () -> {
                if (attempts.incrementAndGet() < 2) {
                    throw new TransientException();
                }
                return "success";
            },
            e -> e instanceof TransientException
        )
    );
    
    assertEquals(2, attempts.get());
}
```

### 2. Integration Tests

- Test component interactions
- Use test containers
- Test configuration changes
- Verify error handling

### 3. E2E Tests

- Test complete workflows
- Verify UI interactions
- Test data persistence
- Validate error displays

## Performance Guidelines

### 1. Database

- Use appropriate indexes
- Implement pagination
- Batch operations
- Monitor query performance

### 2. API

- Cache when appropriate
- Use compression
- Implement rate limiting
- Monitor response times

### 3. Frontend

- Implement lazy loading
- Optimize bundle size
- Use proper memoization
- Monitor render performance

## Security Guidelines

### 1. Authentication

- Use JWT tokens
- Implement refresh tokens
- Secure password storage
- Rate limit auth attempts

### 2. Authorization

- Implement RBAC
- Validate permissions
- Audit access
- Principle of least privilege

### 3. Data Security

- Encrypt sensitive data
- Validate input
- Prevent SQL injection
- Use HTTPS

## Monitoring

### 1. Metrics

- Response times
- Error rates
- Resource usage
- Business metrics

### 2. Logging

- Use appropriate levels
- Include context
- Structured logging
- Log retention

### 3. Alerts

- Define SLOs
- Set up alerting
- Document procedures
- On-call rotation