import Handlebars from 'handlebars';

import { NotificationType } from '@domain/entities';
import { NotificationTemplateRegistry } from './notification-template-registry.type';

const welcomeTemplate = Handlebars.compile(
  `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bienvenido a la plataforma</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f7fb;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f5f7fb;padding:32px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 20px rgba(15,23,42,0.12);">
            <tr>
              <td style="font-family:'Helvetica Neue',Arial,sans-serif;padding:40px 48px 32px;">
                <h1 style="margin:0;font-size:28px;color:#0b4abf;">Hola {{name}},</h1>
                <p style="margin:16px 0 24px;font-size:16px;line-height:1.6;color:#475569;">
                  ¡Bienvenido a la plataforma! Estamos emocionados de que formes parte de la comunidad.
                </p>
                <p style="margin:0 0 32px;font-size:16px;line-height:1.6;color:#475569;">
                  Haz clic en el botón para finalizar tu registro y empezar a explorar.
                </p>
                <a href="{{link}}" style="display:inline-block;padding:14px 28px;background-color:#0b4abf;color:#ffffff;text-decoration:none;font-weight:600;border-radius:8px;">
                  Ir a la plataforma
                </a>
                <p style="margin:32px 0 0;font-size:14px;line-height:1.6;color:#94a3b8;">
                  Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
                  <span style="word-break:break-all;color:#0b4abf;">{{link}}</span>
                </p>
              </td>
            </tr>
            <tr>
              <td style="font-family:'Helvetica Neue',Arial,sans-serif;padding:24px 48px;background-color:#f8fafc;color:#94a3b8;font-size:13px;text-align:center;">
                © {{year}} Org Admin Suite. Todos los derechos reservados.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
);

const userRegistrationInvitationTemplate = Handlebars.compile(
  `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invitación a registrarte</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f7fb;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f5f7fb;padding:32px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 20px rgba(15,23,42,0.12);">
            <tr>
              <td style="font-family:'Helvetica Neue',Arial,sans-serif;padding:40px 48px 32px;">
                <h1 style="margin:0;font-size:28px;color:#0b4abf;">Hola {{name}},</h1>
                <p style="margin:16px 0 24px;font-size:16px;line-height:1.6;color:#475569;">
                  Has recibido una invitación para registrarte en la plataforma. Completa tu registro creando una contraseña y proporcionando la información que falte.
                </p>
                <a href="{{link}}" style="display:inline-block;padding:14px 28px;background-color:#0b4abf;color:#ffffff;text-decoration:none;font-weight:600;border-radius:8px;">
                  Completar registro
                </a>
                <p style="margin:32px 0 0;font-size:14px;line-height:1.6;color:#94a3b8;">
                  Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
                  <span style="word-break:break-all;color:#0b4abf;">{{link}}</span>
                </p>
              </td>
            </tr>
            <tr>
              <td style="font-family:'Helvetica Neue',Arial,sans-serif;padding:24px 48px;background-color:#f8fafc;color:#94a3b8;font-size:13px;text-align:center;">
                © {{year}} Org Admin Suite. Todos los derechos reservados.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
);

export const emailTemplates: NotificationTemplateRegistry = {
  [NotificationType.WELCOME_USER]: welcomeTemplate,
  [NotificationType.USER_REGISTRATION_INVITATION]:
    userRegistrationInvitationTemplate,
};

export const emailSubjects: NotificationTemplateRegistry = {
  [NotificationType.WELCOME_USER]: Handlebars.compile(
    'Bienvenido a la plataforma',
  ),
  [NotificationType.USER_REGISTRATION_INVITATION]: Handlebars.compile(
    'Invitación para completar tu registro',
  ),
};
