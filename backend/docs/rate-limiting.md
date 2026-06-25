# Rate Limiting with `@nestjs/throttler`

## Instalación

```bash
npm install @nestjs/throttler
```

## Configuración global

Registra `ThrottlerModule` y el guard global en `AppModule`:

```typescript
import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,   // ventana de tiempo en milisegundos (1 minuto)
        limit: 30,    // número máximo de requests por ventana
      },
    ]),
    // ... otros módulos
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // activa el guard globalmente
    },
  ],
})
export class AppModule {}
```

Esto aplica un límite de **30 requests por minuto** a todos los endpoints del proyecto.

## Sobrescribir límites por endpoint

Usa el decorador `@Throttle()` para aplicar límites más restrictivos en endpoints sensibles:

```typescript
import { Throttle } from '@nestjs/throttler';

@Post('login')
@Throttle({ default: { ttl: 60000, limit: 10 } }) // 10 intentos por minuto
login(@Body() dto: CredentialDto) {
  return this.authService.authenticate(dto);
}
```

## Omitir rate limiting

Usa `@SkipThrottle()` para excluir endpoints (útil para health checks o webhooks):

```typescript
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Get('health')
healthCheck() {
  return { status: 'ok' };
}
```

## Límites recomendados

| Endpoint | Límite | Ventana | Justificación |
|---|---|---|---|
| `POST /auth/login` | 10 | 60s | Evita ataques de fuerza bruta |
| `POST /auth/register` | 5 | 60s | Evita creación masiva de cuentas |
| `POST /auth/forgot-password` | 3 | 60s | Evita spam de correos de restablecimiento |
| `POST /auth/verify-reset-code` | 10 | 60s | Evita brute force de códigos de verificación |
| `POST /auth/refresh` | 15 | 60s | Suficiente para refresco normal de tokens |
| Rutas autenticadas con JWT | — | — | No requieren límite adicional (la autenticación ya protege) |
| Default global (resto) | 30 | 60s | Protección general contra abuso |

## Almacenamiento

Por defecto `@nestjs/throttler` usa memoria (`MemoryStorage`). Esto funciona correctamente en despliegues de una sola instancia.

### Para múltiples instancias (cluster, load balancing)

Instala el storage con Redis:

```bash
npm install @nestjs/throttler-storage-redis ioredis
```

```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nestjs/throttler-storage-redis';
import Redis from 'ioredis';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
        storage: new ThrottlerStorageRedisService(new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT) || 6379,
        })),
      },
    ]),
  ],
})
```

## Respuesta HTTP al exceder el límite

Cuando se supera el límite, NestJS retorna automáticamente:

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "error": "Too Many Requests"
}
```

## Notas importantes

- `@Throttle()` **reemplaza** el límite global para ese endpoint, no lo suma
- El decorador se aplica a nivel de método del controlador
- Si usas `@UseGuards(ThrottlerGuard)` explícitamente + `APP_GUARD`, puede duplicar la contabilización. Prefiere solo `APP_GUARD`
- Para tests, mockea `ThrottlerGuard` para evitar límites falsos durante el desarrollo
