import crypto from 'crypto';

/**
 * Validates Shopify HMAC-SHA256 signature against the raw body buffer.
 */
export function verifyShopifyWebhookHmac(
  rawBody: Buffer | string,
  hmacHeader: string,
  secret: string
): boolean {
  if (!rawBody || !hmacHeader || !secret) {
    return false;
  }

  const generatedHash = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('base64');

  try {
    const generatedBuffer = Buffer.from(generatedHash, 'utf8');
    const headerBuffer = Buffer.from(hmacHeader, 'utf8');

    if (generatedBuffer.length !== headerBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(generatedBuffer, headerBuffer);
  } catch {
    return false;
  }
}

/**
 * Generates an HMAC SHA256 hash in hex or base64.
 */
export function generateHmacSha256(
  data: string | Buffer,
  secret: string,
  encoding: 'hex' | 'base64' = 'hex'
): string {
  return crypto.createHmac('sha256', secret).update(data).digest(encoding);
}
