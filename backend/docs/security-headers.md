# Security Headers & CORS

## Instalación

```bash
npm install helmet
```

## Helmet — HTTP Security Headers

Helmet configura automáticamente headers HTTP de seguridad como `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, etc.

### Uso básico en NestJS (`main.ts`)

```typescript
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  // ...
}
```

### Content Security Policy (CSP) para Swagger

Si usas Swagger UI, necesitas aflojar CSP para que los scripts y estilos inline funcionen:

```typescript
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
        connectSrc: ["'self'"],
      },
    },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginEmbedderPolicy: false,
  }),
);
```

### Headers configurados por Helmet

| Header | Valor por defecto | Propósito |
|---|---|---|
| `Content-Security-Policy` | Personalizado | Previene XSS y data injection |
| `Cross-Origin-Opener-Policy` | `same-origin` | Aísla ventanas de origen cruzado |
| `Cross-Origin-Resource-Policy` | `same-origin` | Controla el acceso a recursos |
| `Origin-Agent-Cluster` | `?1` | Aísla agentes de usuario |
| `Referrer-Policy` | `no-referrer` | Controla el header `Referer` |
| `Strict-Transport-Security` | `max-age=15552000; includeSubDomains` | Forza HTTPS |
| `X-Content-Type-Options` | `nosniff` | Previene MIME sniffing |
| `X-DNS-Prefetch-Control` | `off` | Controla DNS prefetching |
| `X-Download-Options` | `noopen` | Previene descargas automáticas en IE |
| `X-Frame-Options` | `SAMEORIGIN` | Previene clickjacking |
| `X-Permitted-Cross-Domain-Policies` | `none` | Controla políticas cross-domain (Flash, PDF) |
| `X-Powered-By` | removido | Oculta la tecnología del servidor |
| `X-XSS-Protection` | `0` | Desactiva el legacy XSS filter |

## CORS — Cross-Origin Resource Sharing

### Configuración restringida

Usa `HOST_FRONTEND` de las variables de entorno para permitir solo el origen del frontend:

```typescript
const frontendUrl = process.env.HOST_FRONTEND || 'http://localhost:4200';
app.enableCors({
  origin: [frontendUrl],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
```

### Opciones de CORS

| Opción | Valor | Descripción |
|---|---|---|
| `origin` | `['http://localhost:4200']` | Solo el frontend puede hacer requests |
| `methods` | `GET, POST, PUT, PATCH, DELETE, OPTIONS` | Métodos HTTP permitidos |
| `allowedHeaders` | `Content-Type, Authorization` | Headers permitidos en requests |
| `credentials` | `true` | Permite cookies / tokens en requests cross-origin |

### Múltiples orígenes

Si tienes frontends en staging y producción:

```typescript
const allowedOrigins = [
  process.env.HOST_FRONTEND,
  process.env.HOST_STAGING,
].filter(Boolean);

app.enableCors({
  origin: allowedOrigins,
  // ...
});
```

## Trust Proxy

### ¿Por qué es necesario?

Si el servidor NestJS corre detrás de un reverse proxy (Nginx, Cloudflare, AWS ELB, etc.), la IP del cliente real se pasa en el header `X-Forwarded-For`. Sin `trust proxy`, Express usa la IP del proxy como `req.ip`.

### Configuración

```typescript
const trustProxy = process.env.TRUST_PROXY || 'loopback';
app.getHttpAdapter().getInstance().set('trust proxy', trustProxy);
```

### Valores comunes de `trust proxy`

| Valor | Descripción |
|---|---|
| `loopback` | Solo proxies locales (127.0.0.1, ::1) |
| `1` | Un salto de proxy (ej. Nginx local) |
| `2` | Dos saltos (ej. Cloudflare → Nginx) |
| `['2001:db8::1', '203.0.113.0/24']` | IPs específicas |
| `true` | Confiar en cualquier proxy (solo en entornos controlados) |

### Ejemplo para producción con Nginx

```env
TRUST_PROXY=1
```

### Ejemplo para producción con Cloudflare

```env
TRUST_PROXY=2
```

## Variables de entorno requeridas

```env
# .env
HOST_FRONTEND=http://localhost:4200
TRUST_PROXY=loopback
```

## Orden recomendado en `main.ts`

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Trust proxy (antes que cualquier middleware que lea req.ip)
  app.getHttpAdapter().getInstance().set('trust proxy', trustProxy);

  // 2. Helmet (seguridad HTTP)
  app.use(helmet({ ... }));

  // 3. CORS
  app.enableCors({ ... });

  // 4. Global prefix
  app.setGlobalPrefix('api/v1');

  // 5. Global pipes
  app.useGlobalPipes(new ValidationPipe({ ... }));

  // 6. Swagger
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
```
