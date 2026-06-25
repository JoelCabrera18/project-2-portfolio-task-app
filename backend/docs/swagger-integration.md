# Swagger Integration — Task App Backend

Guía paso a paso para la integración de **Swagger / OpenAPI** en una aplicación NestJS.

---

## 1. Instalar dependencias

```bash
npm install --save @nestjs/swagger
```

| Paquete          | Versión usada | Rol                                                         |
|------------------|---------------|-------------------------------------------------------------|
| `@nestjs/swagger`| `11.4.4`      | Módulo oficial de NestJS para generar documentación OpenAPI |

> `@nestjs/swagger` no requiere instalar `swagger-ui-express` por separado; lo incluye automáticamente.

---

## 2. Configurar Swagger en `main.ts`

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Swagger ────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Task App')             // Título de la API
    .setDescription('Task App API')   // Descripción
    .setVersion('1.0')                // Versión de la API
    .addBearerAuth()                  // Agrega soporte para JWT Bearer token
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  // ─────────────────────────────────────────────────────────────

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Application is running on port: ${process.env.PORT}`);
}
bootstrap();
```

La documentación queda disponible en:

```
http://localhost:3000/api/docs
```

---

## 3. Métodos de `DocumentBuilder`

| Método                  | Descripción                                                           |
|-------------------------|-----------------------------------------------------------------------|
| `.setTitle(string)`     | Nombre principal de la API en la UI                                   |
| `.setDescription(string)`| Descripción larga, acepta Markdown                                  |
| `.setVersion(string)`   | Versión semántica (`1.0`, `2.1`, etc.)                               |
| `.addBearerAuth()`      | Declara el esquema de seguridad JWT; habilita el botón "Authorize"    |
| `.addServer(url)`       | Agrega servidores (útil para staging / producción)                    |
| `.addTag(name, desc)`   | Agrupa endpoints por etiqueta                                         |

---

## 4. Decorar controladores y DTOs

### 4.1 Controladores

```typescript
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('workspaces')       // agrupa los endpoints bajo "workspaces" en la UI
@ApiBearerAuth()             // marca todos los endpoints del controlador como protegidos
@Controller('workspaces')
export class WorkspaceController {

  @Get()
  @ApiOperation({ summary: 'Listar todos los workspaces del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de workspaces', type: [WorkspaceDto] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll() { /* ... */ }
}
```

### 4.2 DTOs

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateWorkspaceDto {
  @ApiProperty({
    description: 'Nombre del workspace',
    example: 'Mi proyecto',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del workspace',
    example: 'Workspace para el equipo de frontend',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
```

---

## 5. Decoradores más usados

### Controladores / métodos

| Decorador                         | Uso                                                      |
|-----------------------------------|----------------------------------------------------------|
| `@ApiTags('nombre')`              | Agrupa endpoints bajo una etiqueta                       |
| `@ApiBearerAuth()`                | Indica que el endpoint requiere JWT                      |
| `@ApiOperation({ summary })`      | Descripción corta del endpoint                           |
| `@ApiResponse({ status, description })` | Documenta una respuesta posible                  |
| `@ApiParam({ name, description })` | Documenta un parámetro de ruta (`/:id`)                 |
| `@ApiQuery({ name, description })` | Documenta un query param (`?page=1`)                    |
| `@ApiBody({ type })`              | Documenta el body de la petición                         |

### DTOs / propiedades

| Decorador                     | Uso                                                         |
|-------------------------------|-------------------------------------------------------------|
| `@ApiProperty(options)`       | Propiedad requerida con metadata                            |
| `@ApiPropertyOptional(options)`| Propiedad opcional                                         |
| `@ApiHideProperty()`          | Oculta la propiedad en la documentación                     |

---

## 6. Proteger la ruta de la documentación en producción

Por defecto Swagger está expuesto públicamente. Para ocultarlo en producción:

```typescript
if (process.env.NODE_ENV !== 'production') {
  const config = new DocumentBuilder()
    .setTitle('Task App')
    .setDescription('Task App API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
```

O agrega autenticación básica a la ruta usando un middleware de express.

---

## 7. Resultado esperado

Al acceder a `http://localhost:3000/api/docs` verás:

- Listado de todos los endpoints agrupados por `@ApiTags`.
- Botón **Authorize** para ingresar el JWT Bearer token.
- Formularios interactivos para probar cada endpoint directamente.
- Esquemas de request/response generados automáticamente desde los DTOs.
