import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendOrderNotificationToSupplier,
  sendOrderConfirmationToCustomer,
} from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { orderId, type } = await request.json();

    if (!orderId || !type) {
      return NextResponse.json(
        { error: "orderId and type are required" },
        { status: 400 }
      );
    }

    // Fetch order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const orderForEmail = {
      orderNumber: order.orderNumber,
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phone,
      customerAddress: order.customer.address,
      items: order.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: order.totalAmount,
      currency: order.currency,
    };

    let result: any;

    if (type === "supplier") {
      result = await sendOrderNotificationToSupplier(orderForEmail);
    } else if (type === "customer") {
      result = await sendOrderConfirmationToCustomer(orderForEmail);
    } else {
      return NextResponse.json(
        { error: "Invalid type. Use 'supplier' or 'customer'" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email sent to ${type}`,
      result,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
