/**
 * Email test harness — exercises the Resend integration in isolation.
 *
 *   deno task --tunnel email:test                       # config check only (no send)
 *   deno task --tunnel email:test you@example.com       # attempt a real send
 *
 * Intentionally independent of the app's module wiring (uses `npm:resend` and
 * reads the env directly) so it isolates "is the Resend key + domain working?"
 * from "is the app's import/env wiring correct?":
 *   - harness works, app doesn't  → app wiring (resend install / process.env)
 *   - harness also fails          → key or unverified sender domain
 */
import { Resend } from 'npm:resend@^4.8.0';

// Mirror the app's sender. Keep in sync with apps/hub/src/lib/server/email.ts.
const FROM = 'Salt Collective <invites@updates.saltcollective.com>';

const to = Deno.args[0];

// 1. Env presence — check both access styles, since the app uses process.env
//    and a raw Deno script uses Deno.env.
const viaDeno = Deno.env.get('RESEND_KEY');
const viaProcess = (globalThis as { process?: { env?: Record<string, string> } }).process?.env
  ?.RESEND_KEY;
const key = viaDeno ?? viaProcess;

console.log('— Email test harness —');
console.log(
  `  RESEND_KEY via Deno.env.get : ${viaDeno ? `present (${viaDeno.slice(0, 6)}…)` : 'MISSING'}`
);
console.log(`  RESEND_KEY via process.env  : ${viaProcess ? 'present' : 'MISSING'}`);
console.log(`  FROM                        : ${FROM}`);

if (!key) {
  console.error(
    '\n✗ No RESEND_KEY in the environment.\n' +
      '  Are you running with --tunnel? Is RESEND_KEY set in the Deno Deploy dashboard?'
  );
  Deno.exit(1);
}

if (!to) {
  console.log('\n✓ Key present. Re-run with a recipient to attempt a send:');
  console.log('    deno task --tunnel email:test you@example.com');
  Deno.exit(0);
}

console.log(`\nSending test email to ${to} …`);

const resend = new Resend(key);
const { data, error } = await resend.emails.send({
  from: FROM,
  to,
  subject: 'Salt Collective — email harness test',
  html: '<p>If you can read this, the Resend integration works. 🎉</p>',
});

if (error) {
  console.error('\n✗ Resend returned an error (this is what the app silently swallows):');
  console.error(JSON.stringify(error, null, 2));
  console.error('\n  401 / "API key is invalid"      → check RESEND_KEY value');
  console.error(
    '  403 / domain not verified       → verify saltcollective.com in Resend → Domains'
  );
  Deno.exit(1);
}

console.log(`\n✓ Sent. Resend id: ${data?.id}`);
console.log('  Confirm delivery in the Resend dashboard → Emails.');
