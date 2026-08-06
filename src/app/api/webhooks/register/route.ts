import { NextRequest, NextResponse } from "next/server";
import { shopifyGraphQL } from "@/lib/shopify";

/**
 * Register webhooks with Shopify
 * POST /api/webhooks/register
 */
export async function POST(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

    if (!shopDomain) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN not set" },
        { status: 400 }
      );
    }

    const webhookUrl = `${baseUrl}/api/webhooks/shopify`;

    console.log(`📝 Registering webhooks to: ${webhookUrl}`);

    // Topics to register
    const topics = [
      "orders/create",
      "orders/updated",
      "customers/create",
      "customers/update",
    ];

    const results: any[] = [];

    for (const topic of topics) {
      try {
        const mutation = `
          mutation CreateWebhookSubscription($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
            webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
              webhookSubscription {
                id
                topic
                endpoint {
                  __typename
                  ... on WebhookHttpEndpoint {
                    callbackUrl
                  }
                }
              }
              userErrors {
                field
                message
              }
            }
          }
        `;

        const data = await shopifyGraphQL(mutation, {
          topic,
          webhookSubscription: {
            callbackUrl: webhookUrl,
            format: "JSON",
          },
        });

        results.push({
          topic,
          success: true,
          data,
        });

        console.log(`✅ Registered webhook: ${topic}`);
      } catch (error) {
        results.push({
          topic,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        console.error(`❌ Failed to register ${topic}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Webhook registration completed",
      webhookUrl,
      results,
    });
  } catch (error) {
    console.error("❌ Webhook registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * List registered webhooks
 * GET /api/webhooks/register
 */
export async function GET() {
  try {
    const query = `
      query GetWebhooks {
        webhookSubscriptions(first: 10) {
          edges {
            node {
              id
              topic
              endpoint {
                __typename
                ... on WebhookHttpEndpoint {
                  callbackUrl
                }
              }
            }
          }
        }
      }
    `;

    const data = await shopifyGraphQL(query);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("❌ Error fetching webhooks:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
