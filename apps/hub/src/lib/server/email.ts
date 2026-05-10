import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_KEY);
const FROM = 'Salt Collective <invites@saltcollective.club>';

export async function sendInviteEmail(opts: {
  to: string;
  clubName: string;
  inviterName: string;
  inviteUrl: string;
}) {
  const { to, clubName, inviterName, inviteUrl } = opts;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `You've been invited to join ${clubName} on Salt Collective`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:Inter,system-ui,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;background:#0d0d0d;">
    <tr><td align="center" style="padding:48px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr><td style="padding-bottom:32px;">
          <span style="font-size:18px;font-weight:800;letter-spacing:-0.03em;color:#fff;">Salt Collective</span>
        </td></tr>
        <tr><td style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:40px;">
          <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#fff;line-height:1.3;">
            You're invited to join ${clubName}
          </h1>
          <p style="margin:0 0 28px;font-size:15px;color:#a0a0a0;line-height:1.6;">
            ${inviterName} has invited you to collaborate on <strong style="color:#e5e5e5;">${clubName}</strong> on Salt Collective.
          </p>
          <a href="${inviteUrl}"
             style="display:inline-block;background:#fff;color:#0d0d0d;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">
            Accept invitation
          </a>
          <p style="margin:28px 0 0;font-size:12px;color:#666;line-height:1.6;">
            This invitation expires in 7 days. If you weren't expecting this, you can safely ignore this email.
          </p>
        </td></tr>
        <tr><td style="padding-top:24px;">
          <p style="margin:0;font-size:12px;color:#444;text-align:center;">
            Salt Collective · <a href="https://saltcollective.club" style="color:#666;text-decoration:none;">saltcollective.club</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
