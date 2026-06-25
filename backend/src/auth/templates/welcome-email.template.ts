export interface WelcomeEmailData {
  name: string;
  email: string;
  appName: string;
  dashboardUrl: string;
  createdAt: Date;
  isGoogleAccount: boolean;
}

export function welcomeEmailTemplate(data: WelcomeEmailData): string {
  const { name, email, appName, dashboardUrl, createdAt, isGoogleAccount } = data;

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bienvenido a ${appName}</title>
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
                          <span style="display:inline-block;padding:2px 10px;font-size:11px;font-weight:600;color:#d97706;background-color:#fffbeb;border:1px solid #fde68a;border-radius:4px;letter-spacing:0.5px;text-transform:uppercase;">Nuevo</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:28px 40px 0 40px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:4px;height:28px;background-color:#3b82f6;border-radius:2px;display:inline-block;vertical-align:top;margin-right:4px;"></td>
                        <td style="width:4px;height:20px;background-color:#3b82f6;border-radius:2px;display:inline-block;vertical-align:top;margin-right:4px;opacity:0.6;"></td>
                        <td style="width:4px;height:12px;background-color:#3b82f6;border-radius:2px;display:inline-block;vertical-align:top;opacity:0.3;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 40px 0 40px;">
                    <h1 style="margin:0;font-size:28px;font-weight:700;color:#0f172a;letter-spacing:-0.5px;line-height:1.2;">
                      Bienvenido a ${appName}
                    </h1>
                    <p style="margin:12px 0 0 0;font-size:16px;color:#475569;line-height:1.6;">
                      Hola <strong style="color:#0f172a;">${name}</strong>, nos alegra tenerte a bordo. Tu cuenta ha sido creada exitosamente y ya puedes empezar a gestionar tus tareas.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:24px 40px 0 40px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center" style="padding:0 16px;">
                                <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">${email}</p>
                                <p style="margin:2px 0 0 0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Correo electrónico</p>
                              </td>
                              <td style="width:1px;background-color:#e2e8f0;padding:0;"></td>
                              <td align="center" style="padding:0 16px;">
                                <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">${createdAt.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p style="margin:2px 0 0 0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Fecha de registro</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:24px 40px 0 40px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:15px;color:#475569;line-height:1.6;padding-bottom:8px;">
                          <strong style="color:#0f172a;">Para empezar:</strong>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;color:#64748b;line-height:1.6;">
                            <tr>
                              <td style="width:24px;vertical-align:top;padding:2px 0;">1.</td>
                              <td style="padding:2px 0;">Crea tu primer workspace para organizar tus proyectos</td>
                            </tr>
                            <tr>
                              <td style="width:24px;vertical-align:top;padding:2px 0;">2.</td>
                              <td style="padding:2px 0;">Invita a tu equipo para colaborar en tiempo real</td>
                            </tr>
                            <tr>
                              <td style="width:24px;vertical-align:top;padding:2px 0;">3.</td>
                              <td style="padding:2px 0;">Crea tareas, asigna miembros y da seguimiento al progreso</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:28px 40px 0 40px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="background-color:#0f172a;border-radius:8px;padding:0;">
                                <a href="${dashboardUrl}" target="_blank" style="display:inline-block;padding:14px 40px;font-size:15px;font-weight:600;color:#ffffff;background-color:#0f172a;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">
                                  Ir a mi workspace
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
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
                      Si tienes alguna pregunta, responde a este correo o contacta a nuestro equipo de soporte.
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
