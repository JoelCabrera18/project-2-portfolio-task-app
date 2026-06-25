# Pasos para integrar Passport y JWT en el backend

## 1. Instalar las dependencias

```bash
npm install @nestjs/passport passport @nestjs/jwt passport-jwt -E
```

Dependencias de desarrollo:

```bash
npm install --save-dev @types/passport-jwt -E
```

## 2. Crear el archivo de variables de entorno

En tu archivo `.env`, define las siguientes variables:

```env
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRES_IN=1h
```

## 3. Crear el módulo de autenticación

_(En caso de no tenerlo creado)_

```bash
nest generate module auth --no-spec
```

## 4. Crear la Estrategia de JWT (JwtStrategy)

Crea el archivo **src/auth/strategies/jwt.strategy.ts** para validar el token y adjuntar los datos del usuario a la petición (`request.user`):

**src/auth/strategies/jwt.strategy.ts**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { UserProfile } from './entities/auth.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userRepository: Repository<UserProfile>,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<UserProfile> {
    const { username } = payload;
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new UnauthorizedException('Token invalid');
    }

    if (!user.isAvailable) {
      throw new UnauthorizedException('User account is currently unavailable');
    }

    if (user.isLoginLocked) {
      throw new UnauthorizedException('The account is locked. Please contact support');
    }

    return user;
  }
}
```

## 5. Configurar el Módulo de Autenticación

Integra Passport y JWT dentro de tu módulo actual. Asegúrate de importar `ConfigModule` y `ConfigService` para manejar de manera segura las variables de entorno:

**src/auth/auth.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserProfile } from './entities/auth.entity';
import { CommonModule } from 'src/common/common.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProfile]),
    CommonModule,
    ConfigModule, // Asegura el acceso a las variables de entorno
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN') || '1h',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
```

## 6. Importar AuthModule en los módulos que requieran protección

Para usar el `AuthGuard()` en controladores pertenecientes a otros módulos (por ejemplo, `WorkspaceModule` o `ProfileModule`), es **obligatorio** importar `AuthModule` en la lista de `imports` del módulo correspondiente. De lo contrario, obtendrás un error indicando que debes importar `PassportModule`.

**Ejemplo en src/workspace/workspace.module.ts:**

```typescript
import { Module } from '@nestjs/common';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { AuthModule } from 'src/auth/auth.module'; // <-- Importar AuthModule

@Module({
  imports: [
    AuthModule, // <-- Agregar a los imports del módulo
    // otros módulos...
  ],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
})
export class WorkspaceModule {}
```

## 7. Proteger rutas en los Controladores

Agrega el decorador `@UseGuards(AuthGuard())` a nivel de controlador o a los métodos individuales que requieran autenticación.

### Caso A: Proteger rutas individuales (ej. en WorkspaceController)

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  @UseGuards(AuthGuard()) // Solo este endpoint está protegido
  create(@Body() createWorkspaceDto: CreateWorkspaceDto) {
    return this.workspaceService.create(createWorkspaceDto);
  }

  @Get() // Endpoint público
  findAll() {
    return this.workspaceService.findAll();
  }

  @Patch(':code')
  @UseGuards(AuthGuard()) // Este también
  update(@Param('code', ParseUUIDPipe) code: string, @Body() updateWorkspaceDto: UpdateWorkspaceDto) {
    return this.workspaceService.update(code, updateWorkspaceDto);
  }
}
```

### Caso B: Proteger todo el controlador excepto rutas específicas

Si deseas proteger todas las rutas de un controlador excepto algunas en particular (por ejemplo, permitir la creación pública de un perfil pero proteger las consultas y actualizaciones), debes aplicar el guard individualmente en cada método que sí requiera autenticación, omitiendo el método que deseas público:

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post() // Público (sin guard)
  create(@Body() createProfileDto: CreateProfileDto) {
    return this.profileService.create(createProfileDto);
  }

  @Get()
  @UseGuards(AuthGuard()) // Protegido
  findAll() {
    return this.profileService.findAll();
  }
}
```

**Nota:** Los métodos o controladores que no requieran autenticación no deben llevar el decorador `@UseGuards(AuthGuard())`.

## 8. Probar la integración

Para probar la integración, puedes usar herramientas como Postman. Asegúrate de incluir el token JWT en el encabezado de la petición:

```
Authorization: Bearer <token>
```

Si los datos del token JWT son válidos y el usuario existe en la base de datos, el guard permitirá el acceso a la ruta y los datos del usuario estarán disponibles en el objeto `req.user` en el controlador. De lo contrario, se mostrará un error 401 Unauthorized.
