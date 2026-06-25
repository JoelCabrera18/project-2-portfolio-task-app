export interface PasswordResetData {
  name: string;
  email: string;
  appName: string;
  resetCode: string;
  expirationMinutes: number;
}

export function passwordResetTemplate(data: PasswordResetData): string {
  const { name, email, appName, resetCode, expirationMinutes } = data;

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Restablecer contraseña - ${appName}</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Inter',-apple-system,Segoe UI,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:40px 40px 0 40px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:14px;color:#64748b;letter-spacing:1.5px;text-transform:uppercase;">${appName}</td>
                        <td align="right">
                          <span style="display:inline-block;padding:2px 10px;font-size:11px;font-weight:600;color:#d97706;background-color:#fffbeb;border:1px solid #fde68a;border-radius:4px;letter-spacing:0.5px;text-transform:uppercase;">Seguridad</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:28px 40px 0 40px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:4px;height:28px;background-color:#f59e0b;border-radius:2px;display:inline-block;vertical-align:top;margin-right:4px;"></td>
                        <td style="width:4px;height:20px;background-color:#f59e0b;border-radius:2px;display:inline-block;vertical-align:top;margin-right:4px;opacity:0.6;"></td>
                        <td style="width:4px;height:12px;background-color:#f59e0b;border-radius:2px;display:inline-block;vertical-align:top;opacity:0.3;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 40px 0 40px;">
                    <h1 style="margin:0;font-size:28px;font-weight:700;color:#0f172a;letter-spacing:-0.5px;line-height:1.2;">
                      Restablece tu contraseña
                    </h1>
                    <p style="margin:12px 0 0 0;font-size:16px;color:#475569;line-height:1.6;">
                      Hola <strong style="color:#0f172a;">${name}</strong>, hemos recibido una solicitud para restablecer la contraseña de tu cuenta en ${appName}.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:28px 40px 0 40px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
                      <tr>
                        <td style="padding:24px 20px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center">
                                <p style="margin:0 0 8px 0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Código de verificación</p>
                                <p style="margin:0;font-size:36px;font-weight:800;color:#0f172a;letter-spacing:8px;font-family:'Courier New',monospace;">${resetCode}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 40px 0 40px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;">
                      <tr>
                        <td style="padding:12px 16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:20px;vertical-align:top;font-size:16px;color:#ef4444;">&#9888;</td>
                              <td style="font-size:13px;color:#991b1b;line-height:1.5;">
                                Este código expirar\u00e1 en <strong>${expirationMinutes} minutos</strong>. Si no solicitaste este cambio, ignora este mensaje.
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 40px 0 40px;">
                    <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
                      Ingresa este c\u00f3digo en la p\u00e1gina de restablecimiento para continuar con el proceso.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:32px 40px 0 40px;">
                    <hr style="border:none;border-top:1px solid #e2e8f0;margin:0;" />
                  </td>
                </tr>

                <tr>
                  <td style="padding:16px 40px 40px 40px;">
                    <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.5;text-align:center;">
                      Este mensaje se envi\u00f3 autom\u00e1ticamente a <strong>${email}</strong> por razones de seguridad.
                      <br />
                      &copy; ${new Date().getFullYear()} ${appName}. Todos los derechos reservados.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;
}
