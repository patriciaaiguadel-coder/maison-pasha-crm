import { prisma } from "@/lib/prisma";
import { parseShopifyId } from "@/lib/shopify";
import {
  sendOrderNotificationToSupplier,
  sendOrderConfirmationToCustomer,
} from "@/lib/email";

/**
 * Handle orders/create webhook
 * Créé ou met à jour une commande et son client
 */
export async function handleOrderCreate(orderData: any) {
  try {
    console.log(`📦 Processing order #${orderData.order_number}`);

    const customer = orderData.customer;
    if (!customer) {
      console.warn("⚠️ Order has no customer, skipping");
      return;
    }

    // Find or create customer
    let dbCustomer = await prisma.customer.findUnique({
      where: { email: customer.email },
    });

    if (!dbCustomer) {
      dbCustomer = await prisma.customer.create({
        data: {
          email: customer.email,
          firstName: customer.first_name || "Unknown",
          lastName: customer.last_name || "User",
          phone: customer.phone,
          shopifyId: parseShopifyId(customer.id),
          address: customer.default_address?.address1,
          city: customer.default_address?.city,
          postalCode: customer.default_address?.zip,
          country: customer.default_address?.country,
        },
      });
      console.log(`✨ Created new customer: ${customer.email}`);
    }

    // Create or update order
    const order = await prisma.order.upsert({
      where: { shopifyId: parseShopifyId(orderData.id) },
      update: {
        status: "CONFIRMED",
        paymentStatus: orderData.financial_status?.toLowerCase() || "pending",
        updatedAt: new Date(),
      },
      create: {
        shopifyId: parseShopifyId(orderData.id),
        customerId: dbCustomer.id,
        orderNumber: `#${orderData.order_number}`,
        totalAmount: parseFloat(orderData.total_price),
        currency: orderData.currency,
        paymentStatus: orderData.financial_status?.toLowerCase() || "pending",
        status: "PENDING",
      },
    });

    // Delete old order items if updating
    await prisma.orderItem.deleteMany({
      where: { orderId: order.id },
    });

    // Add order items
    for (const item of orderData.line_items) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: parseShopifyId(item.product_id),
          productName: item.title,
          quantity: item.quantity,
          price: parseFloat(item.price),
        },
      });
    }

    // Send email notifications
    try {
      const orderForEmail = {
        orderNumber: orderData.order_number.toString(),
        customerName: `${orderData.customer.first_name} ${orderData.customer.last_name}`,
        customerEmail: orderData.customer.email,
        customerPhone: orderData.customer.phone,
        customerAddress: orderData.customer.default_address?.address1,
        items: orderData.line_items.map((item: any) => ({
          productName: item.title,
          quantity: item.quantity,
          price: parseFloat(item.price),
        })),
        totalAmount: parseFloat(orderData.total_price),
        currency: orderData.currency,
      };

      // Send to supplier
      await sendOrderNotificationToSupplier(orderForEmail);
      console.log(`📧 Supplier notified for order #${orderData.order_number}`);

      // Send to customer
      await sendOrderConfirmationToCustomer(orderForEmail);
      console.log(`📧 Customer notified for order #${orderData.order_number}`);

      // Mark order as notified
      await prisma.order.update({
        where: { id: order.id },
        data: { notifiedSupplier: true },
      });
    } catch (emailError) {
      console.error("⚠️ Error sending email notifications:", emailError);
      // Don't throw - order was created successfully
    }

    console.log(`✅ Order #${orderData.order_number} synced successfully`);
    return order;
  } catch (error) {
    console.error("❌ Error handling order create:", error);
    throw error;
  }
}

/**
 * Handle customers/create webhook
 * Crée un nouveau client
 */
export async function handleCustomerCreate(customerData: any) {
  try {
    console.log(`👥 Processing customer: ${customerData.email}`);

    const customer = await prisma.customer.upsert({
      where: { email: customerData.email },
      update: {
        firstName: customerData.first_name || "Unknown",
        lastName: customerData.last_name || "User",
        phone: customerData.phone,
        address: customerData.default_address?.address1,
        city: customerData.default_address?.city,
        postalCode: customerData.default_address?.zip,
        country: customerData.default_address?.country,
      },
      create: {
        email: customerData.email,
        firstName: customerData.first_name || "Unknown",
        lastName: customerData.last_name || "User",
        phone: customerData.phone,
        shopifyId: parseShopifyId(customerData.id),
        address: customerData.default_address?.address1,
        city: customerData.default_address?.city,
        postalCode: customerData.default_address?.zip,
        country: customerData.default_address?.country,
      },
    });

    console.log(`✅ Customer ${customerData.email} synced`);
    return customer;
  } catch (error) {
    console.error("❌ Error handling customer create:", error);
    throw error;
  }
}

/**
 * Store webhook in database for audit trail
 */
export async function logWebhook(
  topic: string,
  shopifyId: string,
  data: any
) {
  try {
    await prisma.shopifyWebhook.create({
      data: {
        topic,
        shopifyId,
        data,
        processed: true,
      },
    });
  } catch (error) {
    console.error("❌ Error logging webhook:", error);
  }
}
