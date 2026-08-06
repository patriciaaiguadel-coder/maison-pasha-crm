const SHOPIFY_API_VERSION = "2024-01";

interface ShopifyGraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function shopifyGraphQL<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.SHOPIFY_ADMIN_API_PASSWORD;

  if (!shopDomain || !accessToken) {
    throw new Error("Missing Shopify credentials in environment variables");
  }

  const url = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: variables || {},
    }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.statusText}`);
  }

  const result: ShopifyGraphQLResponse<T> = await response.json();

  if (result.errors) {
    throw new Error(`Shopify GraphQL error: ${result.errors[0].message}`);
  }

  return result.data as T;
}

// Fetch existing orders from Shopify
export async function fetchShopifyOrders(after?: string, first: number = 250) {
  const query = `
    query GetOrders($after: String, $first: Int!) {
      orders(after: $after, first: $first, reverse: true) {
        edges {
          node {
            id
            name
            orderNumber
            createdAt
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            paymentStatus: displayFinancialStatus
            customer {
              id
              email
              firstName
              lastName
              phone
              defaultAddress {
                address1
                city
                provinceCode
                postalCode
                country
              }
            }
            lineItems(first: 100) {
              edges {
                node {
                  id
                  title
                  quantity
                  variant {
                    id
                    sku
                  }
                  originalUnitPriceSet {
                    shopMoney {
                      amount
                    }
                  }
                }
              }
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  return shopifyGraphQL(query, { after: after || null, first });
}

// Fetch existing customers from Shopify
export async function fetchShopifyCustomers(after?: string, first: number = 250) {
  const query = `
    query GetCustomers($after: String, $first: Int!) {
      customers(after: $after, first: $first) {
        edges {
          node {
            id
            email
            firstName
            lastName
            phone
            defaultAddress {
              address1
              city
              postalCode
              country
            }
            totalSpent
            createdAt
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  return shopifyGraphQL(query, { after: after || null, first });
}

// Extract ID from Shopify's base64-encoded global ID
export function parseShopifyId(globalId: string): string {
  return globalId.split("/").pop() || globalId;
}
