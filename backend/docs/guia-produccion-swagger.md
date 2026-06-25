# Swagger — Guía de Producción

Swagger (OpenAPI) se habilita automáticamente cuando `NODE_ENV` **no** es `production`.

## Cómo funciona

En `src/main.ts`:

```typescript
if (process.env.NODE_ENV !== 'production') {
  // Configuración de Swagger
}
```

- **Desarrollo**: Swagger disponible en `/api/docs` con botón de autenticación Bearer
- **Producción**: Swagger **deshabilitado** — el endpoint devuelve 404

## Variable de entorno

| Variable | Valor en desarrollo | Valor en producción |
|----------|-------------------|---------------------|
| `NODE_ENV` | no definida o `development` | `production` |

## Verificar localmente

```bash
# Con Swagger (desarrollo)
npm run start:dev
# Visitar http://localhost:3000/api/docs

# Sin Swagger (simulación de producción)
NODE_ENV=production npm run start:dev
# http://localhost:3000/api/docs → 404
```

## Reproducible en otros proyectos

1. Localiza el bloque de configuración de Swagger en `main.ts`
2. Envuélvelo en `if (process.env.NODE_ENV !== 'production')`
3. Define `NODE_ENV=production` en tu entorno de despliegue
