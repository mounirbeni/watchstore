/**
 * Lightweight transactional email sender.
 *
 * Uses Resend's HTTP API when RESEND_API_KEY + EMAIL_FROM are configured.
 * When not configured (e.g. local/dev), it becomes a safe no-op so the app
 * never breaks — notifications still land in the in-app notification center.
 */

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export function isEmailEnabled(): boolean {
  return Boolean(process.env["RESEND_API_KEY"] && process.env["EMAIL_FROM"]);
}

export async function sendEmail({ to, subject, html, text }: SendEmailInput): Promise<boolean> {
  const apiKey = process.env["RESEND_API_KEY"];
  const from = process.env["EMAIL_FROM"];
  if (!apiKey || !from || !to) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html, text: text ?? subject }),
    });
    if (!res.ok) {
      console.error("[email] send failed", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send error", err);
    return false;
  }
}

const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://chronocraft.ma";
const PRIORITY_COLOR: Record<string, string> = { CRITICAL: "#EF4444", IMPORTANT: "#c9a86a", STANDARD: "#8a8a8a" };

/** Branded dark email template matching the store's look. */
export function renderEmail(opts: {
  title: string;
  message: string;
  actionUrl?: string | null;
  actionLabel?: string;
  priority?: "CRITICAL" | "IMPORTANT" | "STANDARD";
}): string {
  const accent = PRIORITY_COLOR[opts.priority ?? "IMPORTANT"];
  const cta =
    opts.actionUrl
      ? `<a href="${appUrl}${opts.actionUrl}" style="display:inline-block;margin-top:20px;background:#c9a86a;color:#0a0a0a;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:10px;">${opts.actionLabel ?? "Voir le détail"}</a>`
      : "";
  return `<!doctype html><html><body style="margin:0;background:#0a0a0a;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#161616;border:1px solid #2a2a2a;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:24px 28px;border-bottom:1px solid #2a2a2a;">
          <span style="color:#c9a86a;font-size:20px;font-weight:bold;letter-spacing:1px;">ChronoCraft</span>
        </td></tr>
        <tr><td style="padding:28px;">
          <div style="border-left:3px solid ${accent};padding-left:14px;">
            <h1 style="color:#ffffff;font-size:18px;margin:0 0 10px;">${opts.title}</h1>
            <p style="color:#b8b8b8;font-size:14px;line-height:1.6;margin:0;">${opts.message}</p>
          </div>
          ${cta}
        </td></tr>
        <tr><td style="padding:18px 28px;border-top:1px solid #2a2a2a;">
          <p style="color:#6b6b6b;font-size:12px;margin:0;">ChronoCraft — Montres & accessoires. Cet email vous a été envoyé suite à une activité sur votre compte.</p>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}
