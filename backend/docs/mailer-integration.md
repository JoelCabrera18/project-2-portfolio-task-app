# Mailer Integration — Task App Backend

Guía paso a paso para la integración de **Nodemailer** vía `@nestjs-modules/mailer` en una aplicación NestJS.

---

## 1. Instalar dependencias

```bash
npm install --save @nestjs-modules/mailer nodemailer
npm install --save-dev @types/nodemailer
```

| Paquete                  | Versión usada | Rol                                                    |
|--------------------------|---------------|--------------------------------------------------------|
| `@nestjs-modules/mailer` | `2.3.6`       | Módulo de integración NestJS ↔ Nodemailer              |
| `nodemailer`             | `8.0.11`      | Librería para envío de correos electrónicos en Node.js |
| `@types/nodemailer`      | `8.0.1`       | Tipos TypeScript para Nodemailer (dev)                 |

---

## 2. Variables de entorno

Agrega las siguientes variables al archivo `.env`:

```env
# MAILER
MAILER_HOST=smtp.gmail.com
MAILER_PORT=465
MAILER_USER=tu-correo@gmail.com
MAILER_SECRET=tu-app-password-de-gmail
```

> **Importante — Gmail App Password:**  
> Gmail bloquea las contraseñas normales para aplicaciones de terceros.  
> Debes generar una **App Password** en:  
> `Google Account → Security → 2-Step Verification → App passwords`  
> El formato típico es 16 caracteres sin espacios, ej.: `eyhfocxfdxlptzwp`.

---

## 3. Registrar MailerModule en AppModule

En `src/app.module.ts`, importa `MailerModule` y configúralo con `forRoot()`:

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAILER_HOST,       // smtp.gmail.com
        port: Number(process.env.MAILER_PORT), // 465
        secure: true,  // true para el puerto 465, false para 587
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_SECRET,   // App Password, no la contraseña de Gmail
        },
      },
      defaults: {
        from: `"Task App Support" <${process.env.MAILER_USER}>`,
      },
    }),
    // ... otros módulos
  ],
})
export class AppModule {}
```

### Opciones de `transport`

| Opción     | Valor actual        | Descripción                                         |
|------------|---------------------|-----------------------------------------------------|
| `host`     | `smtp.gmail.com`    | Servidor SMTP de Gmail                              |
| `port`     | `465`               | Puerto SSL de Gmail                                 |
| `secure`   | `true`              | `true` = SSL/TLS en puerto 465; `false` = STARTTLS en 587 |
| `auth.user`| tu correo           | Cuenta Gmail desde la que se envían los correos     |
| `auth.pass`| App Password        | Contraseña de aplicación generada en Google         |

---

## 4. Inyectar MailerService en un servicio

```typescript
// src/workspace-invitation/workspace-invitation.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class WorkspaceInvitationService {
  constructor(private readonly mailerService: MailerService) {}

  async sendInvitationEmail(to: string, workspaceName: string, token: string) {
    await this.mailerService.sendMail({
      to,
      subject: `Invitación al workspace "${workspaceName}"`,
      html: `
        <h2>Has sido invitado a unirte a <strong>${workspaceName}</strong></h2>
        <p>Haz clic en el enlace para aceptar la invitación:</p>
        <a href="${process.env.HOST_FRONTEND}/invitations/accept?token=${token}">
          Aceptar invitación
        </a>
      `,
    });
  }
}
```

---

## 5. Opciones de `sendMail`

| Campo     | Tipo     | Descripción                                                |
|-----------|----------|------------------------------------------------------------|
| `to`      | `string` | Dirección de destino                                       |
| `subject` | `string` | Asunto del correo                                          |
| `html`    | `string` | Cuerpo en HTML                                             |
| `text`    | `string` | Cuerpo en texto plano (alternativa a `html`)               |
| `from`    | `string` | Remitente (se puede sobrescribir el `defaults.from`)       |

---

## 6. Plantillas con Handlebars (opcional)

Si deseas usar plantillas `.hbs` en lugar de HTML incrustado:

```bash
npm install --save handlebars
```

```typescript
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

MailerModule.forRoot({
  transport: { /* ... */ },
  defaults: { from: `"Task App" <${process.env.MAILER_USER}>` },
  template: {
    dir: join(__dirname, 'templates'),   // carpeta con los .hbs
    adapter: new HandlebarsAdapter(),
    options: { strict: true },
  },
}),
```

Y en el servicio:

```typescript
await this.mailerService.sendMail({
  to,
  subject: 'Invitación',
  template: './invitation',   // src/templates/invitation.hbs
  context: { workspaceName, token },
});
```

---

## 7. Consideraciones de seguridad

- **Nunca** comitees el `MAILER_SECRET` en el repositorio — está en `.env` que se ignora con `.gitignore`.
- En producción, considera servicios como **SendGrid**, **AWS SES** o **Resend** que ofrecen mayor deliverability y dashboards de monitoreo.
- Usa `try/catch` al llamar `sendMail` para manejar fallos de red o SMTP sin romper el flujo principal.
