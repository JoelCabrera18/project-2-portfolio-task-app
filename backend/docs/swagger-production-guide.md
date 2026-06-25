# Swagger — Production Guide

Swagger (OpenAPI) is automatically enabled when `NODE_ENV` is **not** `production`.

## How it works

In `src/main.ts`:

```typescript
if (process.env.NODE_ENV !== 'production') {
  // Swagger setup
}
```

- **Development**: Swagger is available at `/api/docs` with Bearer Auth button
- **Production**: Swagger is **disabled** — the endpoint returns 404

## Environment variable

| Variable | Value in dev | Value in production |
|----------|-------------|-------------------|
| `NODE_ENV` | not set or `development` | `production` |

## To verify locally

```bash
# With Swagger (development)
npm run start:dev
# Visit http://localhost:3000/api/docs

# Without Swagger (production simulation)
NODE_ENV=production npm run start:dev
# http://localhost:3000/api/docs → 404
```

## Reproducible in other projects

1. Locate the Swagger setup block in `main.ts`
2. Wrap it in `if (process.env.NODE_ENV !== 'production')`
3. Set `NODE_ENV=production` on your deployment environment
