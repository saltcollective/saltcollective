import { env } from '$env/dynamic/public';

// Public-facing domain for hub URLs, overridable per environment
// (testing/UAT/production) via the Deno Deploy dashboard.
export const siteDomain = env.PUBLIC_SITE_DOMAIN ?? 'saltcollective.com';
export const siteUrl = `https://${siteDomain}`;

export function clubUrl(slug: string): string {
  return `${siteUrl}/${slug}`;
}
