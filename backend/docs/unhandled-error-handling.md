# Unhandled Error Handling

Prevents the application from crashing silently by catching unhandled promise rejections and uncaught exceptions.

## File location

`src/main.ts` (before `app.listen`)

## Handlers

### `unhandledRejection`

Catches promise rejections that are not handled with `.catch()`.

```typescript
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});
```

### `uncaughtException`

Catches synchronous errors that bubble up uncaught.

```typescript
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`, error.stack);
  process.exit(1);  // Exit to avoid undefined state
});
```

## Why this matters

- Without these handlers, Node.js logs a warning (or crashes in future versions)
- With them, errors are logged with full context via NestJS Logger
- `uncaughtException` exits the process because the app may be in an undefined state — a process manager (PM2, Docker restart policy) will restart it

## Reproducible in other projects

1. Add both `process.on('unhandledRejection', ...)` and `process.on('uncaughtException', ...)` in your bootstrap function
2. Use your framework's Logger for consistent formatting
3. For `uncaughtException`, always call `process.exit(1)` after logging to avoid undefined behavior
