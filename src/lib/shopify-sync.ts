import { prisma } from "@/lib/prisma";
import {
  fetchShopifyOrders,
  fetchShopifyCustomers,
  parseShopifyId,
} from "@/lib/shopify";

interface ShopifyCustomer {
  node: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    defaultAddress: {
      address1: string | null;
      city: string | null;
      postalCode: string | null;
      country: string | null;
    } | null;
    totalSpent: string;
  };
}

interface ShopifyOrder {
  node: {
    id: string;
    name: string;
    orderNumber: number;
    createdAt: string;
    totalPriceSet: {
      shopMoney: {
        amount: string;
        currencyCode: string;
      };
    };
    paymentStatus: string;
    customer: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phone: string | null;
      defaultAddress: {
        address1: string | null;
        city: string | null;
        provinceCode: string | null;
        postalCode: string | null;
        country: string | null;
      } | null;
    };
    lineItems: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          quantity: number;
          variant: {
            id: string;
            sku: string | null;
          };
          originalUnitPriceSet: {
            shopMoney: {
              amount: string;
            };
          };
        };
      }>;
    };
  };
}

// Sync customers from Shopify
export async function syncShopifyCustomers() {
  console.log("📥 Starting Shopify customer sync...");
  let after: string | undefined;
  let totalSynced = 0;

  try {
    while (true) {
      const response: any = await fetchShopifyCustomers(after);

      const customers = response.customers.edges;
      if (customers.length === 0) break;

      for (const customer of customers) {
        const c = customer.node as ShopifyCustomer["node"];

        await prisma.customer.upsert({
          where: { email: c.email },
          update: {
            firstName: c.firstName,
            lastName: c.lastName,
            phone: c.phone,
            address: c.defaultAddress?.address1,
            city: c.defaultAddress?.city,
            postalCode: c.defaultAddress?.postalCode,
            country: c.defaultAddress?.country,
            totalSpent: parseFloat(c.totalSpent),
            shopifyId: parseShopifyId(c.id),
          },
          create: {
            email: c.email,
            firstName: c.firstName,
            lastName: c.lastName,
            phone: c.phone,
            address: c.defaultAddress?.address1,
            city: c.defaultAddress?.city,
            postalCode: c.defaultAddress?.postalCode,
            country: c.defaultAddress?.country,
            totalSpent: parseFloat(c.totalSpent),
            shopifyId: parseShopifyId(c.id),
          },
        });

        totalSynced++;
      }

      if (!response.customers.pageInfo.hasNextPage) break;
      after = response.customers.pageInfo.endCursor;
    }

    console.log(`✅ Synced ${totalSynced} customers from Shopify`);
    return { success: true, synced: totalSynced };
  } catch (error) {
    console.error("❌ Error syncing customers:", error);
    throw error;
  }
}

// Sync orders from Shopify
export async function syncShopifyOrders() {
  console.log("📥 Starting Shopify order sync...");
  let after: string | undefined;
  let totalSynced = 0;

  try {
    while (true) {
      const response: any = await fetchShopifyOrders(after);

      const orders = response.orders.edges;
      if (orders.length === 0) break;

      for (const order of orders) {
        const o = order.node as ShopifyOrder["node"];

        // Find or create customer
        const customer = await prisma.customer.findUnique({
          where: { email: o.customer.email },
        });

        if (!customer) {
          console.warn(`⚠️ Customer ${o.customer.email} not found, skipping order`);
          continue;
        }

        // Create/update order
        const createdOrder = await prisma.order.upsert({
          where: { shopifyId: parseShopifyId(o.id) },
          update: {
            status: "CONFIRMED",
            paymentStatus: o.paymentStatus.toLowerCase(),
          },
          create: {
            shopifyId: parseShopifyId(o.id),
            customerId: customer.id,
            orderNumber: `#${o.orderNumber}`,
            totalAmount: parseFloat(o.totalPriceSet.shopMoney.amount),
            currency: o.totalPriceSet.shopMoney.currencyCode,
            paymentStatus: o.paymentStatus.toLowerCase(),
            status: "PENDING",
          },
        });

        // Create order items
        for (const item of o.lineItems.edges) {
          const i = item.node;

          await prisma.orderItem.create({
            data: {
              orderId: createdOrder.id,
              productId: parseShopifyId(i.variant.id),
              productName: i.title,
              quantity: i.quantity,
              price: parseFloat(i.originalUnitPriceSet.shopMoney.amount),
            },
          });
        }

        totalSynced++;
      }

      if (!response.orders.pageInfo.hasNextPage) break;
      after = response.orders.pageInfo.endCursor;
    }

    console.log(`✅ Synced ${totalSynced} orders from Shopify`);
    return { success: true, synced: totalSynced };
  } catch (error) {
    console.error("❌ Error syncing orders:", error);
    throw error;
  }
}

// Full sync: customers first, then orders
export async function fullShopifySyncInitial() {
  try {
    console.log("\n🚀 Starting full Shopify sync...\n");

    const customersResult = await syncShopifyCustomers();
    const ordersResult = await syncShopifyOrders();

    console.log("\n✨ Full sync completed!\n");
    return {
      customers: customersResult.synced,
      orders: ordersResult.synced,
    };
  } catch (error) {
    console.error("❌ Full sync failed:", error);
    throw error;
  }
}
