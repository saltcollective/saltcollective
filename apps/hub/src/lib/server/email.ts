import process from 'node:process';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_KEY);
const FROM = 'Salt Collective <invites@updates.saltcollective.com>';

export async function sendInviteEmail(opts: {
  to: string;
  clubName: string;
  inviterName: string;
  inviteUrl: string;
}) {
  const { to, clubName, inviterName, inviteUrl } = opts;

  if (!process.env.RESEND_KEY) {
    throw new Error('RESEND_KEY is not set — cannot send email');
  }

  const { error } = await resend.emails.send({
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
            Salt Collective · <a href="https://saltcollective.com" style="color:#666;text-decoration:none;">saltcollective.com</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  // Resend v4 returns { error } rather than throwing — surface it so the
  // caller doesn't report a false success.
  if (error) {
    throw new Error(`Resend failed to send invite email: ${error.name} — ${error.message}`);
  }
}

export async function sendSponsorRequestEmail(opts: {
  to: string[];
  clubName: string;
  dashboardUrl: string;
  businessName: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  websiteUrl?: string | null;
  desiredTier?: string | null;
  desiredSpend?: string | null;
  message?: string | null;
}) {
  if (!process.env.RESEND_KEY) {
    throw new Error('RESEND_KEY is not set — cannot send email');
  }
  if (opts.to.length === 0) return; // no admins to notify

  const row = (label: string, value?: string | null) =>
    value
      ? `<tr>
          <td style="padding:6px 0;font-size:13px;color:#888;width:120px;vertical-align:top;">${label}</td>
          <td style="padding:6px 0;font-size:14px;color:#e5e5e5;">${value}</td>
        </tr>`
      : '';

  const { error } = await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `New sponsorship request for ${opts.clubName}`,
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
            New sponsorship request
          </h1>
          <p style="margin:0 0 28px;font-size:15px;color:#a0a0a0;line-height:1.6;">
            <strong style="color:#e5e5e5;">${opts.businessName}</strong> has expressed interest in sponsoring ${opts.clubName}.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #2a2a2a;margin-bottom:28px;">
            ${row('Business', opts.businessName)}
            ${row('Contact', opts.contactName)}
            ${row('Email', opts.email)}
            ${row('Phone', opts.phone)}
            ${row('Website', opts.websiteUrl)}
            ${row('Desired tier', opts.desiredTier)}
            ${row('Desired spend', opts.desiredSpend)}
            ${row('Message', opts.message)}
          </table>
          <a href="${opts.dashboardUrl}"
             style="display:inline-block;background:#fff;color:#0d0d0d;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">
            Review request
          </a>
          <p style="margin:28px 0 0;font-size:12px;color:#666;line-height:1.6;">
            The request is saved as a lead and is not yet visible on your hub. Review it, then publish or decline.
          </p>
        </td></tr>
        <tr><td style="padding-top:24px;">
          <p style="margin:0;font-size:12px;color:#444;text-align:center;">
            Salt Collective · <a href="https://saltcollective.com" style="color:#666;text-decoration:none;">saltcollective.com</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  if (error) {
    throw new Error(`Resend failed to send sponsor request email: ${error.name} — ${error.message}`);
  }
}
