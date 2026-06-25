# Filtro Global de Excepciones

Un filtro único que captura todas las excepciones y estandariza las respuestas de error.

## Ubicación

`src/common/filters/global-exception.filter.ts`

## Comportamiento

| Aspecto | Detalle |
|---------|---------|
| Captura | Todas las excepciones (`@Catch()`) |
| Excepciones HTTP | Devuelve el código de estado y mensaje original |
| Errores inesperados | Devuelve `500 Internal server error` |
| Desarrollo | Incluye `stack` trace en la respuesta |
| Producción | Omite el stack trace |
| Logging | Registra cada error con método, URL, estado y stack |

## Formato de respuesta

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "timestamp": "2026-06-25T10:00:00.000Z",
  "path": "/api/v1/auth/login",
  "stack": "Error: ..."  // solo cuando NODE_ENV !== 'production'
}
```

## Registro

En `src/main.ts`:

```typescript
app.useGlobalFilters(new GlobalExceptionFilter());
```

## Reproducible en otros proyectos

1. Crea `src/common/filters/global-exception.filter.ts` con el contenido indicado
2. Impórtalo y regístralo en `main.ts` mediante `app.useGlobalFilters()`
3. Opcionalmente extiéndelo con tipos de excepción específicos para manejo personalizado
