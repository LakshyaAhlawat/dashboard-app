import nodemailer from "nodemailer";

let transporterPromise;

function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = (async () => {
      const host = process.env.SMTP_HOST;
      const port = Number(process.env.SMTP_PORT || 587);
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;

      if (!host || !user || !pass) {
        throw new Error("SMTP configuration is missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.");
      }

      return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    })();
  }
  return transporterPromise;
}

function buildResetPasswordHtml(resetUrl, email) {
  const appName = "Admin Control Center";
  const baseBg = "#020617";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <title>Reset your password</title>
  </head>
  <body style="margin:0;padding:0;background:${baseBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e5e7eb;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:radial-gradient(circle at top,#0f172a 0,#020617 55%);padding:40px 12px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;background:linear-gradient(135deg,rgba(56,189,248,0.22),rgba(129,140,248,0.08)) border-box;border-radius:28px;padding:1px;">
            <tr>
              <td style="background:#020617;border-radius:26px;padding:28px 24px 26px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td align="center" style="padding-bottom:18px;">
                      <div style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:18px;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#f9fafb;font-weight:600;font-size:15px;box-shadow:0 0 24px rgba(56,189,248,0.65);">
                        AD
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom:6px;">
                      <div style="font-size:19px;font-weight:600;color:#e5e7eb;letter-spacing:0.03em;">Reset your password</div>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom:18px;">
                      <p style="margin:0;font-size:13px;line-height:1.6;color:#9ca3af;max-width:420px;">
                        We received a request to reset the password for <span style="color:#e5e7eb;">${email}</span> on <span style="color:#f9fafb;">${appName}</span>.
                        Click the button below to choose a new password.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom:20px;">
                      <a href="${resetUrl}" style="display:inline-block;padding:11px 22px;border-radius:999px;background-image:linear-gradient(90deg,#0ea5e9,#6366f1);color:#f9fafb;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;box-shadow:0 12px 35px rgba(56,189,248,0.45);">
                        Reset password
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom:16px;">
                      <p style="margin:0;font-size:11px;line-height:1.6;color:#6b7280;max-width:420px;">
                        This link will expire in <span style="color:#e5e7eb;">1 hour</span>. If you did not request this,
                        you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:10px;border-top:1px solid rgba(31,41,55,0.85);">
                      <p style="margin:10px 0 0 0;font-size:10px;line-height:1.5;color:#4b5563;">
                        ${appName} · Secure admin dashboard demo
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendPasswordResetEmail({ to, resetUrl }) {
  const transporter = await getTransporter();

  const from = process.env.MAIL_FROM || "Admin Control Center <no-reply@example.com>";
  const html = buildResetPasswordHtml(resetUrl, to);

  await transporter.sendMail({
    from,
    to,
    subject: "Reset your Admin Control Center password",
    html,
  });
}
