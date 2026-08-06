import { NextRequest, NextResponse } from "next/server";
import {
  sendOrderNotificationToSupplier,
  sendOrderConfirmationToCustomer,
} from "@/lib/email";

// Test email sending
export async function POST(request: NextRequest) {
  try {
    const testOrder = {
      orderNumber: "#TEST-001",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      customerPhone: "+971501234567",
      customerAddress: "123 Main St, Dubai, UAE",
      items: [
        { productName: "Dog Food Premium", quantity: 2, price: 150 },
        { productName: "Cat Collar", quantity: 1, price: 50 },
      ],
      totalAmount: 350,
      currency: "AED",
    };

    console.log("📧 Sending test email to supplier...");
    const supplierResult = await sendOrderNotificationToSupplier(testOrder);

    console.log("📧 Sending test email to customer...");
    const customerResult = await sendOrderConfirmationToCustomer(testOrder);

    return NextResponse.json({
      success: true,
      message: "Test emails sent successfully",
      supplier: supplierResult,
      customer: customerResult,
    });
  } catch (error) {
    console.error("Error sending test emails:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET: Check email configuration
export async function GET() {
  const hasResendKey = !!process.env.RESEND_API_KEY;
  const hasSupplierEmail = !!process.env.SUPPLIER_EMAIL;

  return NextResponse.json({
    status: "Email service ready",
    configured: {
      resend: hasResendKey ? "✓ Configured" : "✗ Missing RESEND_API_KEY",
      supplier: hasSupplierEmail
        ? `✓ ${process.env.SUPPLIER_EMAIL}`
        : "✗ Missing SUPPLIER_EMAIL",
    },
    test: {
      message: "POST to this endpoint to send test emails",
      endpoint: "/api/notifications/test",
    },
  });
}
