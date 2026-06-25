export interface NewMemberWorkspaceData {
  name: string;
  workspaceName: string;
  workspaceUrl: string;
  inviterName: string;
  appName: string;
}

export function newMemberWorkspaceTemplate(data: NewMemberWorkspaceData): string {
  const { name, workspaceName, workspaceUrl, inviterName, appName } = data;

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Te han agregado a ${workspaceName}</title>
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
                          <span style="display:inline-block;padding:2px 10px;font-size:11px;font-weight:600;color:#d97706;background-color:#fffbeb;border:1px solid #fde68a;border-radius:4px;letter-spacing:0.5px;text-transform:uppercase;">Workspace</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:28px 40px 0 40px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:4px;height:28px;background-color:#d97706;border-radius:2px;display:inline-block;vertical-align:top;margin-right:4px;"></td>
                        <td style="width:4px;height:20px;background-color:#d97706;border-radius:2px;display:inline-block;vertical-align:top;margin-right:4px;opacity:0.6;"></td>
                        <td style="width:4px;height:12px;background-color:#d97706;border-radius:2px;display:inline-block;vertical-align:top;opacity:0.3;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 40px 0 40px;">
                    <h1 style="margin:0;font-size:28px;font-weight:700;color:#0f172a;letter-spacing:-0.5px;line-height:1.2;">
                      Bienvenido a ${workspaceName}
                    </h1>
                    <p style="margin:12px 0 0 0;font-size:16px;color:#475569;line-height:1.6;">
                      Hola <strong style="color:#0f172a;">${name}</strong>, <strong style="color:#0f172a;">${inviterName}</strong> te ha agregado al workspace <strong style="color:#0f172a;">${workspaceName}</strong>. Ahora puedes colaborar con tu equipo en tiempo real.
                    </p>
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
                                <a href="${workspaceUrl}" target="_blank" style="display:inline-block;padding:14px 40px;font-size:15px;font-weight:600;color:#ffffff;background-color:#0f172a;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">
                                  Ir a ${workspaceName}
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
