# Global Exception Filter

A single catch-all exception filter that standardizes all error responses.

## File location

`src/common/filters/global-exception.filter.ts`

## Behavior

| Aspect | Detail |
|--------|--------|
| Catches | All exceptions (`@Catch()`) |
| HTTP exceptions | Returns the original status code and message |
| Unexpected errors | Returns `500 Internal server error` |
| Development | Includes `stack` trace in response body |
| Production | Omits stack trace |
| Logging | Logs every error with method, URL, status, and stack |

## Response format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "timestamp": "2026-06-25T10:00:00.000Z",
  "path": "/api/v1/auth/login",
  "stack": "Error: ..."  // only when NODE_ENV !== 'production'
}
```

## Registration

In `src/main.ts`:

```typescript
app.useGlobalFilters(new GlobalExceptionFilter());
```

## Reproducible in other projects

1. Create `src/common/filters/global-exception.filter.ts` with the content above
2. Import and register in `main.ts` via `app.useGlobalFilters()`
3. Optionally extend with specific exception types for custom handling
