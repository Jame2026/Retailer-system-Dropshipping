import { test, describe } from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';
import { verifyShopifyWebhookHmac } from '../utils/crypto.js';

describe('Shopify HMAC Verification Tests', () => {
  const secret = 'test_secret_key_123456';
  const rawBody = JSON.stringify({
    id: 123456789,
    name: '#1001',
    email: 'buyer@example.com',
  });

  test('should verify valid HMAC signature successfully', () => {
    const validHmac = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('base64');

    const isValid = verifyShopifyWebhookHmac(rawBody, validHmac, secret);
    assert.strictEqual(isValid, true);
  });

  test('should reject invalid HMAC signature', () => {
    const invalidHmac = 'invalid_base64_signature==';
    const isValid = verifyShopifyWebhookHmac(rawBody, invalidHmac, secret);
    assert.strictEqual(isValid, false);
  });

  test('should return false on empty inputs', () => {
    assert.strictEqual(verifyShopifyWebhookHmac('', '', secret), false);
  });
});
