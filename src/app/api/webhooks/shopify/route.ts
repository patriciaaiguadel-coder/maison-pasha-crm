import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { verifyShopifyWebhook } from '@/lib/webhook-verify';

interface ShopifyOrder {
  id: string;
  order_number: number;
  email: string;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    default_address: {
      address1: string | null;
      city: string | null;
      zip: string | null;
      country: string | null;
    } | null;
  };
  line_items: Array<{
    id: string;
    title: string;
    quantity: number;
    price: string;
  }>;
  total_price: string;
  currency: string;
  payment_status: string;
  fulfillment_status: string | null;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const topic = request.headers.get('x-shopify-topic');
    const hmac = request.headers.get('x-shopify-hmac-sha256');
    const shopId = request.headers.get('x-shopify-shop-id');

    // Verify webhook authenticity
    if (!verifyShopifyWebhook(body, hmac || '')) {
      console.warn('❌ Invalid Shopify webhook signature');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = JSON.parse(body) as ShopifyOrder;

    // Log incoming webhook
    await prisma.shopifyWebhook.create({
      data: {
        topic: topic || 'unknown',
        shopifyId: data.id.toString(),
        data: data as any,
        processed: false,
      },
    });

    // Handle different webhook topics
    if (topic === 'orders/create' || topic === 'orders/updated') {
      await handleOrderWebhook(data);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: String(error) },
      { status: 500 }
    );
  }
}

async function handleOrderWebhook(data: ShopifyOrder) {
  try {
    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { email: data.customer.email },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email: data.customer.email,
          firstName: data.customer.first_name,
          lastName: data.customer.last_name,
          phone: data.customer.phone,
          address: data.customer.default_address?.address1,
          city: data.customer.default_address?.city,
          postalCode: data.customer.default_address?.zip,
          country: data.customer.default_address?.country,
          shopifyId: data.id.split('/').pop(),
          totalSpent: parseFloat(data.total_price),
        },
      });
    } else {
      // Update customer with latest order info
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          firstName: data.customer.first_name,
          lastName: data.customer.last_name,
          phone: data.customer.phone,
          address: data.customer.default_address?.address1,
          city: data.customer.default_address?.city,
          postalCode: data.customer.default_address?.zip,
          country: data.customer.default_address?.country,
          totalSpent: parseFloat(data.total_price),
        },
      });
    }

    // Find or create order
    const shopifyOrderId = data.id.split('/').pop() || '';
    let order = await prisma.order.findFirst({
      where: { shopifyId: shopifyOrderId },
    });

    const orderStatus = mapShopifyStatus(data.fulfillment_status) as any;

    if (order) {
      // Update existing order
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: orderStatus,
          paymentStatus: data.payment_status.toLowerCase(),
          totalAmount: parseFloat(data.total_price),
          currency: data.currency,
        },
      });
    } else {
      // Create new order
      order = await prisma.order.create({
        data: {
          shopifyId: shopifyOrderId,
          customerId: customer.id,
          orderNumber: `#${data.order_number}`,
          status: orderStatus,
          totalAmount: parseFloat(data.total_price),
          currency: data.currency,
          paymentStatus: data.payment_status.toLowerCase(),
        },
      });
    }

    // Create order items
    if (order && data.line_items.length > 0) {
      // Clear existing items
      await prisma.orderItem.deleteMany({
        where: { orderId: order.id },
      });

      // Create new items
      for (const item of data.line_items) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.id,
            productName: item.title,
            quantity: item.quantity,
            price: parseFloat(item.price),
          },
        });
      }
    }

    // Update customer loyalty points if order confirmed
    if (orderStatus === 'CONFIRMED') {
      const totalAmount = parseFloat(data.total_price);
      const points = Math.floor(totalAmount); // 1 point per AED

      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          loyaltyPoints: {
            increment: points,
          },
        },
      });
    }

    console.log(
      `✅ Order #${data.order_number} synced for ${data.customer.email}`
    );
  } catch (error) {
    console.error('❌ Error handling order webhook:', error);
    throw error;
  }
}

function mapShopifyStatus(fulfillmentStatus: string | null): string {
  switch (fulfillmentStatus) {
    case 'fulfilled':
      return 'DELIVERED';
    case 'partial':
      return 'SHIPPED';
    case 'unshipped':
      return 'CONFIRMED';
    case null:
      return 'PENDING';
    default:
      return 'PENDING';
  }
}
