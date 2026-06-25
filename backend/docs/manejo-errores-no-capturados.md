# Manejo de Errores No Capturados

Evita que la aplicación se detenga silenciosamente capturando promesas rechazadas no manejadas y excepciones no capturadas.

## Ubicación

`src/main.ts` (antes de `app.listen`)

## Handlers

### `unhandledRejection`

Captura promesas rechazadas que no se manejaron con `.catch()`.

```typescript
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});
```

### `uncaughtException`

Captura errores síncronos que suben sin ser capturados.

```typescript
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`, error.stack);
  process.exit(1);  // Sale para evitar estado indefinido
});
```

## Por qué es importante

- Sin estos handlers, Node.js muestra una advertencia (o se detiene en versiones futuras)
- Con ellos, los errores se registran con contexto completo via NestJS Logger
- `uncaughtException` termina el proceso porque la app puede estar en estado indefinido — un manager de procesos (PM2, política de reinicio de Docker) lo reiniciará

## Reproducible en otros proyectos

1. Agrega ambos `process.on('unhandledRejection', ...)` y `process.on('uncaughtException', ...)` en tu función bootstrap
2. Usa el Logger de tu framework para formato consistente
3. Para `uncaughtException`, siempre llama a `process.exit(1)` después de loguear para evitar comportamiento indefinido
