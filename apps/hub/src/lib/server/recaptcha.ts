import { env } from '$env/dynamic/private';

const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const DEFAULT_SCORE_THRESHOLD = 0.5;

// Google's siteverify response. `score` and `action` are v3-only.
interface SiteVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

export interface RecaptchaResult {
  ok: boolean;
  score?: number;
  reason?: string;
}

/**
 * Verify a reCAPTCHA token server-side against Google's siteverify endpoint.
 *
 * Works for both v2 (checkbox — no score/action) and v3 (invisible — score +
 * action). For v3, pass `expectedAction` and optionally a `threshold`; for v2
 * those checks are skipped automatically since Google omits the fields.
 *
 * Never trust a token verified only on the client — always call this on the server.
 */
export async function verifyRecaptcha(
  token: string | null | undefined,
  opts: { expectedAction?: string; remoteIp?: string; threshold?: number } = {}
): Promise<RecaptchaResult> {
  const secret = env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    throw new Error('Missing required environment variable: RECAPTCHA_SECRET_KEY');
  }
  if (!token) return { ok: false, reason: 'missing-token' };

  const body = new URLSearchParams({ secret, response: token });
  if (opts.remoteIp) body.set('remoteip', opts.remoteIp);

  const res = await fetch(VERIFY_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = (await res.json()) as SiteVerifyResponse;

  if (!data.success) {
    return { ok: false, reason: data['error-codes']?.join(', ') ?? 'verification-failed' };
  }

  // v3 only: enforce the action matches and the score clears the threshold.
  if (opts.expectedAction && data.action && data.action !== opts.expectedAction) {
    return { ok: false, score: data.score, reason: `unexpected-action:${data.action}` };
  }
  const threshold = opts.threshold ?? DEFAULT_SCORE_THRESHOLD;
  if (typeof data.score === 'number' && data.score < threshold) {
    return { ok: false, score: data.score, reason: 'low-score' };
  }

  return { ok: true, score: data.score };
}
