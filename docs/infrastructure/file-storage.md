# File Storage

User-uploaded files (club logos, business logos) are stored in AWS S3 and served via CloudFront. Deno Deploy has no filesystem access at runtime, so all file storage is external.

## Architecture

```
Browser → presigned URL → S3 (upload)
Browser ← CloudFront URL ← S3 (serve)
```

The SvelteKit server never handles the file bytes directly. It generates a presigned PUT URL, returns it to the browser, and the browser uploads directly to S3. On success the server writes the resulting CloudFront URL to `logoUrl` on `Club` or `Business`.

## AWS Resources

| Resource | Purpose |
|---|---|
| S3 bucket | Stores uploaded files. Not public — access is via CloudFront only |
| CloudFront distribution | CDN in front of the S3 bucket. All `logoUrl` values are CloudFront URLs |
| IAM user / role | Scoped policy for presigned URL generation — `s3:PutObject` on the bucket only |
| Origin Access Control (OAC) | Allows CloudFront to read from the private S3 bucket |

## Upload flow

1. Client requests a presigned URL from `POST /api/upload` with the file's MIME type and size
2. Server validates the request (auth check, file type allowlist, size limit) and calls `s3.createPresignedPost()` or `s3.getSignedUrl('putObject')`
3. Server returns the presigned URL and the final CloudFront URL to the client
4. Client uploads the file directly to S3 using the presigned URL
5. On upload success, client calls the relevant save endpoint with the CloudFront URL
6. Server writes the URL to `Club.logoUrl` or `Business.logoUrl`

## Security

- S3 bucket has **no public access** — blocked at the bucket policy level
- CloudFront is the only authorised reader via Origin Access Control
- Presigned URLs are scoped to a single key, expire after a short window (e.g. 60 seconds), and are only issued to authenticated users
- The IAM credential used server-side has `s3:PutObject` only — no read, delete, or list permissions
- File type is validated server-side before issuing the presigned URL; accepted types: `image/png`, `image/jpeg`, `image/svg+xml`, `image/webp`

## Environment variables

```
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_CLOUDFRONT_DOMAIN=
```

Set in the Deno Deploy dashboard. Locally, env vars are injected via the Deno Deploy tunnel (`deno task --tunnel dev`) — no local `.env` file.

## Key structure

All files are served via CloudFront at `https://d2hxbdf4sjiujo.cloudfront.net/{key}`.

| Prefix | Contents |
|---|---|
| `clubs/{clubId}/` | Club logo uploads |
| `businesses/{businessId}/` | Business logo uploads |
| `static/` | Non-code static content (marketing images, icons, PDFs, etc.) |

User-uploaded keys include a timestamp (`{folder}/{id}/{timestamp}.{ext}`) to bust CloudFront cache when a logo is replaced.

Static files are uploaded manually via the CLI:
```sh
aws --profile salt s3 cp ./file.png s3://saltcollective-uploads/static/file.png --content-type image/png
```
