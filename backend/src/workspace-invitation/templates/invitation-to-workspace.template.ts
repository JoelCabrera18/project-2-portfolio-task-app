import { IWorkspace } from '../../workspace/interfaces/workspace-response.interface';

export interface InvitationTemplateData {
  workspace: IWorkspace;
  inviter: {
    name: string;
  };
  inviteUrl: string;
  appName: string;
}

export function invitationToWorkspaceTemplate(data: InvitationTemplateData): string {
  const { workspace, inviter, inviteUrl, appName } = data;
  const memberCount = workspace.workspaceMembers.length;
  const boardCount = workspace.boards.length;
  const visibleMembers = workspace.workspaceMembers.slice(0, 3);
  const extraMemberCount = Math.max(0, memberCount - 3);

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Invitación a ${workspace.title}</title>
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
                          <span style="display:inline-block;padding:2px 10px;font-size:11px;font-weight:600;color:#d97706;background-color:#fffbeb;border:1px solid #fde68a;border-radius:4px;letter-spacing:0.5px;text-transform:uppercase;">Premium</span>
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
                    <p style="margin:0 0 4px 0;font-size:16px;color:#475569;line-height:1.5;">
                      <strong style="color:#0f172a;">${inviter.name}</strong> te ha invitado a unirte a
                    </p>
                    <h1 style="margin:12px 0 0 0;font-size:28px;font-weight:700;color:#0f172a;letter-spacing:-0.5px;line-height:1.2;">
                      ${workspace.title}
                    </h1>
                    ${
                      workspace.description
                        ? `<p style="margin:8px 0 0 0;font-size:15px;color:#64748b;line-height:1.5;">${workspace.description}</p>`
                        : ''
                    }
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
                                <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">${memberCount}</p>
                                <p style="margin:2px 0 0 0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Miembros</p>
                              </td>
                              <td style="width:1px;background-color:#e2e8f0;padding:0;"></td>
                              <td align="center" style="padding:0 16px;">
                                <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">${boardCount}</p>
                                <p style="margin:2px 0 0 0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Tableros</p>
                              </td>
                              <td style="width:1px;background-color:#e2e8f0;padding:0;"></td>
                              <td align="center" style="padding:0 16px;">
                                <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">${workspace.boards.reduce((sum, b) => sum + b.taskList.length, 0)}</p>
                                <p style="margin:2px 0 0 0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Listas</p>
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
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              ${visibleMembers
                                .map(
                                  (m) => `
                              <td style="padding:0;">
                                <table role="presentation" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="width:36px;height:36px;border-radius:50%;background-color:#dbeafe;border:2px solid #ffffff;text-align:center;vertical-align:middle;font-size:13px;font-weight:600;color:#2563eb;">
                                      ${getInitials(m.fullname)}
                                    </td>
                                  </tr>
                                </table>
                              </td>`,
                                )
                                .join('')}
                              ${
                                extraMemberCount > 0
                                  ? `
                              <td style="padding:0;">
                                <table role="presentation" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="width:36px;height:36px;border-radius:50%;background-color:#f1f5f9;border:2px solid #ffffff;text-align:center;vertical-align:middle;font-size:12px;font-weight:600;color:#64748b;">
                                      +${extraMemberCount}
                                    </td>
                                  </tr>
                                </table>
                              </td>`
                                  : ''
                              }
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:6px;">
                          <p style="margin:0;font-size:13px;color:#64748b;">
                            ${memberCount} miembro${memberCount !== 1 ? 's' : ''} en el espacio
                          </p>
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
                                <a href="${inviteUrl}" target="_blank" style="display:inline-block;padding:14px 40px;font-size:15px;font-weight:600;color:#ffffff;background-color:#0f172a;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">
                                  Entrar a ${workspace.title}
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
                      Si no esperabas esta invitación, puedes ignorar este mensaje.
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

function getInitials(fullname: string): string {
  return fullname
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join('');
}
