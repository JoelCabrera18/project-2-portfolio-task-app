# Logging de Errores de Email

## Descripción

`MailerService` envuelve a `@nestjs-modules/mailer` y agrega logging de errores. Anteriormente los errores se silenciaban con `.catch(() => {})` en cada punto de llamada.

## Ubicación

`src/common/services/mailer/mailer.service.ts`

## Cómo funciona

```typescript
async sendEmail(email: string, subject: string, html: string) {
  try {
    const response = await this.mailerService.sendMail({ to: email, subject, html });
    return response;
  } catch (error) {
    this.logger.error(`Failed to send email to ${email} — subject: ${subject}`, error.stack);
    throw error;  // Re-lanza para que quien llama pueda manejarlo
  }
}
```

## Patrón en quien llama

Quien llama usa `.catch(() => {})` que es aceptable porque el servicio ya registró el error:

```typescript
this.mailerService.sendEmail(...).catch(() => {});
```

El error se registra en `MailerService.sendEmail()` antes de ser re-lanzado, así que el `.catch(() => {})` de quien llama solo lo silencia para que no detenga la petición — el log persiste.

## Comportamiento

| Escenario | ¿Se registra? | ¿Afecta la petición? |
|-----------|---------------|----------------------|
| Email enviado exitosamente | No | No |
| Fallo de conexión SMTP | Sí (error + stack) | No (capturado por quien llama) |
| Dirección de email inválida | Sí (error + stack) | No (capturado por quien llama) |
| Límite de tasa SMTP | Sí (error + stack) | No (capturado por quien llama) |

## Reproducible en otros proyectos

1. Inyecta `Logger` en tu servicio de correo
2. Envuelve `sendMail()` en un try-catch
3. Registra el error con contexto de destinatario y asunto
4. Re-lanza para que quien llama decida cómo manejarlo
