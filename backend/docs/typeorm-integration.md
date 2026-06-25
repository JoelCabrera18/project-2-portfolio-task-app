# TypeORM Integration — Task App Backend

Guía paso a paso para la integración de **TypeORM** con **PostgreSQL** en una aplicación NestJS.

---

## 1. Instalar dependencias

```bash
npm install --save @nestjs/typeorm typeorm pg
```

| Paquete          | Versión usada | Rol                                              |
|------------------|---------------|--------------------------------------------------|
| `@nestjs/typeorm`| `11.0.1`      | Módulo de integración NestJS ↔ TypeORM           |
| `typeorm`        | `1.0.0`       | ORM principal (entidades, repositorios, migraciones) |
| `pg`             | `8.21.0`      | Driver nativo de PostgreSQL para Node.js         |

---

## 2. Variables de entorno

Agrega las siguientes variables al archivo `.env` en la raíz del proyecto:

```env
# Database
TORM_PG_HOST=localhost
TORM_PG_DATABASE=clon_trello
TORM_PG_USER_DB=postgres
TORM_PG_PASSWORD_DB=postgres
TORM_PG_PORT=5434
```

> **Nota:** estas variables las consume directamente `TypeOrmModule.forRoot()` a través de `process.env`.

---

## 3. Levantar PostgreSQL con Docker

El proyecto incluye un `docker-compose.yaml` que levanta PostgreSQL y pgAdmin:

```yaml
# docker-compose.yaml
services:
  postgres:
    image: postgres:16
    container_name: app-task-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - '5434:5432'       # Puerto externo 5434 → interno 5432
    volumes:
      - ./db/postgres_data:/var/lib/postgresql/data
    networks:
      - postgres
    restart: always
```

Levanta los servicios con:

```bash
docker-compose up -d
```

pgAdmin queda disponible en `http://localhost:8083`.

---

## 4. Registrar TypeOrmModule en AppModule

En `src/app.module.ts`, importa `TypeOrmModule` y configúralo con `forRoot()`:

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot(), // carga las variables de .env
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.TORM_PG_HOST,
      database: process.env.TORM_PG_DATABASE,
      username: process.env.TORM_PG_USER_DB,
      password: process.env.TORM_PG_PASSWORD_DB,
      port: Number(process.env.TORM_PG_PORT),
      autoLoadEntities: true,   // carga automáticamente las entidades registradas
      synchronize: true,        // ⚠️ cambiar a false en producción
    }),
    // ... otros módulos
  ],
})
export class AppModule {}
```

### Opciones relevantes

| Opción             | Valor actual | Descripción                                                       |
|--------------------|-------------|-------------------------------------------------------------------|
| `type`             | `'postgres'`| Motor de base de datos                                            |
| `autoLoadEntities` | `true`      | Registra automáticamente las entidades vía `TypeOrmModule.forFeature()` |
| `synchronize`      | `true`      | Sincroniza el schema con las entidades al arrancar (**solo desarrollo**) |

---

## 5. Definir una entidad

Crea un archivo `*.entity.ts` dentro del módulo correspondiente:

```typescript
// src/workspace/workspace.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('workspaces')
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;
}
```

---

## 6. Registrar la entidad en el módulo

En el módulo del feature, usa `TypeOrmModule.forFeature()`:

```typescript
// src/workspace/workspace.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from './workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace])],
  // providers, controllers...
})
export class WorkspaceModule {}
```

---

## 7. Inyectar el repositorio en un servicio

```typescript
// src/workspace/workspace.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './workspace.entity';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
  ) {}

  findAll(): Promise<Workspace[]> {
    return this.workspaceRepo.find();
  }
}
```

---

## 8. Consideraciones de producción

- Cambia `synchronize: false` en producción para evitar pérdidas de datos.
- Usa **migraciones** de TypeORM (`typeorm migration:generate`) para gestionar cambios de schema de forma controlada.
- Considera usar `ConfigService` de `@nestjs/config` en lugar de `process.env` directamente, para tener validación de variables en el arranque.
