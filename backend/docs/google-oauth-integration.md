# Pasos para integrar Google OAuth 2.0 en el backend

## 1. Obtener credenciales en Google Cloud Console

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un proyecto nuevo o seleccionar uno existente
3. Ir a **APIs & Services > Credentials**
4. Hacer clic en **Create Credentials > OAuth 2.0 Client ID**
5. Configurar la pantalla de consentimiento si es primera vez:
   - **User Type**: External (o Internal si es solo para tu dominio)
   - **App name**: Task App
   - **Support email**: tu email
   - **Developer contact**: tu email
6. En **Authorized redirect URIs** agregar:
   - `http://localhost:3000/auth/google/callback` (desarrollo)
   - `https://tudominio.com/auth/google/callback` (producción)
7. Seleccionar **Application type**: Web application
8. Copiar el **Client ID** y **Client Secret** generados

## 2. Instalar las dependencias

```bash
npm install passport-google-oauth20 @types/passport-google-oauth20
```

## 3. Agregar variables de entorno

En tu archivo `.env`, agrega:

```env
# GOOGLE OAUTH
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

## 4. Agregar campos a la entidad UserProfile

**src/auth/entities/auth.entity.ts**

Agrega los siguientes campos después de `password`:

```typescript
@Column('text', { nullable: true, unique: true })
googleId?: string;

@Column('boolean', { default: false })
isGoogleAccount: boolean;
```

## 5. Crear la Estrategia de Google (GoogleStrategy)

Crea el archivo **src/auth/strategies/google.strategy.ts**:

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback, StrategyOptions } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const options: StrategyOptions = {
      clientID: configService.get('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile'],
      passReqToCallback: false,
    };
    super(options);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, emails, name, photos } = profile;

    const user = {
      googleId: id,
      email: emails?.[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      picture: photos?.[0]?.value,
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}
```

## 6. Actualizar el AuthService

**src/auth/auth.service.ts**

Agrega `JwtService`, `ConfigService` y `Profile` Repository al constructor:

```typescript
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'src/profile/entities/profile.entity';

// En el constructor:
@InjectRepository(Profile)
private readonly profileRepository: Repository<Profile>,
private readonly jwtService: JwtService,
private readonly configService: ConfigService,
```

Agrega la interfaz para el perfil de Google:

```typescript
interface GoogleProfile {
  googleId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  accessToken: string;
  refreshToken?: string;
}
```

Agrega los métodos `findOrCreateByGoogle` y `generateJwt`:

```typescript
async findOrCreateByGoogle(googleProfile: GoogleProfile): Promise<UserProfile> {
  let user = await this.repository.findOne({
    where: { googleId: googleProfile.googleId },
    relations: { profile: true },
  });

  if (user) {
    return user;
  }

  user = await this.repository.findOne({
    where: { username: googleProfile.email },
    relations: { profile: true },
  });

  if (user) {
    user.googleId = googleProfile.googleId;
    user.isGoogleAccount = true;
    return this.repository.save(user);
  }

  const profile = this.profileRepository.create({
    firstName: googleProfile.firstName || 'Google',
    firstSurname: googleProfile.lastName || 'User',
    email: googleProfile.email,
    phone: [],
    dateBirth: new Date(),
    photo: googleProfile.picture,
    isProfileAuthenticated: true,
    settings: {},
  });
  const savedProfile = await this.profileRepository.save(profile);

  const newUser = this.repository.create({
    username: googleProfile.email,
    password: uuidv4(),
    googleId: googleProfile.googleId,
    isGoogleAccount: true,
    profile: savedProfile,
    isAvailable: true,
  });

  return this.repository.save(newUser);
}

generateJwt(user: UserProfile): string {
  const payload = {
    sub: user.id,
    userCode: user.code,
    email: user.username,
    isGoogleAccount: user.isGoogleAccount,
  };
  return this.jwtService.sign(payload);
}
```

## 7. Agregar endpoints en el AuthController

**src/auth/auth.controller.ts**

```typescript
import { Controller, Post, Body, UseGuards, Get, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// En el constructor:
constructor(
  private readonly authService: AuthService,
  private readonly configService: ConfigService,
) {}

@Get('google')
@UseGuards(AuthGuard('google'))
@ApiOperation({ summary: 'Iniciar autenticación con Google' })
async googleAuth() {}

@Get('google/callback')
@UseGuards(AuthGuard('google'))
@ApiOperation({ summary: 'Callback de Google OAuth' })
async googleCallback(@Req() req: any, @Res() res: any) {
  const user = req.user;
  const jwt = this.authService.generateJwt(user);
  const frontendUrl = this.configService.get('HOST_FRONTEND') || 'http://localhost:4200';
  return res.redirect(`${frontendUrl}/auth/callback?token=${jwt}`);
}
```

## 8. Registrar GoogleStrategy en AuthModule

**src/auth/auth.module.ts**

```typescript
import { GoogleStrategy } from './strategies/google.strategy';

// En providers:
GoogleStrategy,
```

Si el `AuthService` usa `ProfileRepository`, agrega `Profile` al `TypeOrmModule.forFeature`:

```typescript
import { Profile } from 'src/profile/entities/profile.entity';

TypeOrmModule.forFeature([UserProfile, Profile]),
```

## 9. Migración de base de datos

Si usas `synchronize: true` en la configuración de TypeORM (desarrollo), las nuevas columnas se crearán automáticamente al iniciar la app.

Para producción, crea una migración manual (si tienes configurado el CLI de TypeORM):

```bash
npm run migration:generate --name AddGoogleFieldsToUserProfile
```

O ejecuta el siguiente SQL directamente en la base de datos:

```sql
ALTER TABLE auth.user_profile 
ADD COLUMN "googleId" text UNIQUE,
ADD COLUMN "isGoogleAccount" boolean NOT NULL DEFAULT false;
```

## 10. Probar la integración

1. Inicia el servidor: `npm run start:dev`
2. Abre en el navegador: `http://localhost:3000/api/v1/auth/google`
3. Serás redirigido a la pantalla de inicio de sesión de Google
4. Después de autorizar, serás redirigido a `http://localhost:4200/auth/callback?token=JWT`

## Flujo completo

```
Frontend (Angular)                    Backend (NestJS)                 Google
      |                                    |                            |
      |--- GET /auth/google --------------->|                            |
      |                                     |--- Redirect a Google ------>|
      |                                     |                            |
      |<--- Login Google Consent Screen ----|                            |
      |                                     |                            |
      |--- (Usuario autoriza) ------------->|                            |
      |                                     |<--- Código de auth --------|
      |                                     |                            |
      |                                     |--- Intercambia code ------>|
      |                                     |<--- Tokens + Profile ------|
      |                                     |                            |
      |                                     |--- findOrCreateByGoogle    |
      |                                     |--- generateJwt(user)       |
      |<-- Redirect: /auth/callback?token --|                            |
      |                                     |                            |
      |--- Almacena token en localStorage   |                            |
      |--- Navega a /workspace              |                            |
```

## Vincular cuenta de Google con cuenta existente

Si un usuario ya registrado con email/password inicia sesión con Google usando el mismo email, automáticamente se vinculará la cuenta:

- Se actualiza el `googleId` en el registro existente
- Se marca `isGoogleAccount = true`
- El usuario puede iniciar sesión con ambos métodos

## Consideraciones de seguridad

1. **Siempre validar el token** en el callback (Passport lo maneja automáticamente)
2. **Usar HTTPS** en producción para evitar interceptación del código de autorización
3. **No exponer** el `GOOGLE_CLIENT_SECRET` en el frontend
4. **Configurar correctamente** las URIs de redirección en Google Cloud Console
5. **Considerar rate limiting** en el endpoint `/auth/google` para evitar abusos
