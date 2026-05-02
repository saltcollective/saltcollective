import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '$env/dynamic/private';

const ALLOWED_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

const PRESIGNED_URL_TTL = 60; // seconds

function requireEnv(key: string): string {
  const val = env[key as keyof typeof env];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

const client = new S3Client({
  region: requireEnv('AWS_REGION'),
  credentials: {
    accessKeyId: requireEnv('AWS_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('AWS_SECRET_ACCESS_KEY'),
  },
});

export type UploadFolder = 'clubs' | 'businesses';

export async function createPresignedUpload(
  folder: UploadFolder,
  id: string,
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const ext = ALLOWED_TYPES[contentType];
  if (!ext) throw new Error(`Unsupported content type: ${contentType}`);

  const key = `${folder}/${id}/${Date.now()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: requireEnv('AWS_S3_BUCKET'),
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: PRESIGNED_URL_TTL });
  const publicUrl = `https://${requireEnv('AWS_CLOUDFRONT_DOMAIN')}/${key}`;

  return { uploadUrl, publicUrl };
}
