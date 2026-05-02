import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createPresignedUpload, type UploadFolder } from '$lib/server/s3';

const VALID_FOLDERS: UploadFolder[] = ['clubs', 'businesses'];

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, 'Unauthorised');

  const body = await request.json().catch(() => null);
  const { contentType, folder, id } = body ?? {};

  if (!contentType || !folder || !id) error(400, 'contentType, folder, and id are required');
  if (!VALID_FOLDERS.includes(folder)) error(400, 'Invalid folder');

  const result = await createPresignedUpload(folder, id, contentType).catch((e: Error) => {
    if (e.message.startsWith('Unsupported')) error(400, e.message);
    error(500, 'Failed to generate upload URL');
  });

  return json(result);
};
