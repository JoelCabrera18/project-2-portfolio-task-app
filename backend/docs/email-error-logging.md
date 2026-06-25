# Email Error Logging

## Overview

The `MailerService` wraps `@nestjs-modules/mailer` and adds error logging. Previously errors were silently swallowed by `.catch(() => {})` at every call site.

## File location

`src/common/services/mailer/mailer.service.ts`

## How it works

```typescript
async sendEmail(email: string, subject: string, html: string) {
  try {
    const response = await this.mailerService.sendMail({ to: email, subject, html });
    return response;
  } catch (error) {
    this.logger.error(`Failed to send email to ${email} — subject: ${subject}`, error.stack);
    throw error;  // Re-throw so callers can handle it
  }
}
```

## Caller pattern

Callers use `.catch(() => {})` which is acceptable after the service already logs:

```typescript
this.mailerService.sendEmail(...).catch(() => {});
```

The error is logged by `MailerService.sendEmail()` before being re-thrown, so the caller's `.catch(() => {})` only silences it from crashing the request — the log persists.

## Behavior

| Scenario | Logged? | Request affected? |
|----------|---------|-------------------|
| Email sent successfully | No | No |
| SMTP connection fails | Yes (error + stack) | No (caught by caller) |
| Invalid email address | Yes (error + stack) | No (caught by caller) |
| Rate limited by SMTP | Yes (error + stack) | No (caught by caller) |

## Reproducible in other projects

1. Inject `Logger` in your mailer service
2. Wrap `sendMail()` in a try-catch
3. Log the error with recipient and subject context
4. Re-throw so callers can decide how to handle it
