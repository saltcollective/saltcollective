import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

// Temporary endpoint to verify AWS env vars are present. Delete once confirmed.
export const GET: RequestHandler = () => {
  return json({
    AWS_REGION: env.AWS_REGION ?? 'NOT SET',
    AWS_S3_BUCKET: env.AWS_S3_BUCKET ?? 'NOT SET',
    AWS_CLOUDFRONT_DOMAIN: env.AWS_CLOUDFRONT_DOMAIN ?? 'NOT SET',
    AWS_ACCESS_KEY_ID: env.AWS_ACCESS_KEY_ID ? '✓ set' : 'NOT SET',
    AWS_SECRET_ACCESS_KEY: env.AWS_SECRET_ACCESS_KEY ? '✓ set' : 'NOT SET',
  });
};
