import crypto from "crypto";

/**
 * Verify Shopify webhook signature
 * @param body - Raw request body as string
 * @param signature - X-Shopify-Hmac-SHA256 header value
 * @returns true if signature is valid
 */
export function verifyShopifyWebhook(body: string, signature: string): boolean {
  const apiSecret = process.env.SHOPIFY_ADMIN_API_PASSWORD;

  if (!apiSecret) {
    console.error("SHOPIFY_ADMIN_API_PASSWORD not set");
    return false;
  }

  // Shopify uses HMAC-SHA256 with the API secret
  const hmac = crypto
    .createHmac("sha256", apiSecret)
    .update(body, "utf8")
    .digest("base64");

  return hmac === signature;
}

/**
 * Extract topic from X-Shopify-Topic header
 */
export function getWebhookTopic(headers: Headers): string | null {
  return headers.get("x-shopify-topic");
}

/**
 * Extract shop domain from X-Shopify-Shop-Id header
 */
export function getShopDomain(headers: Headers): string | null {
  return headers.get("x-shopify-shop-id");
}
