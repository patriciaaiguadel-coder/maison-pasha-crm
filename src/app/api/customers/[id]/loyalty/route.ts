import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Get loyalty points for a customer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        loyaltyPoints: true,
        totalSpent: true,
        orders: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Calculate loyalty stats
    const pointsPerAED = 1; // 1 point per AED spent
    const expectedPoints = Math.floor(customer.totalSpent * pointsPerAED);
    const pointsDifference = customer.loyaltyPoints - expectedPoints;

    return NextResponse.json({
      success: true,
      data: {
        customer,
        stats: {
          currentPoints: customer.loyaltyPoints,
          expectedPoints,
          pointsDifference,
          totalSpent: customer.totalSpent,
          averageOrderValue:
            customer.orders.length > 0
              ? customer.totalSpent / customer.orders.length
              : 0,
          nextTierAt: Math.max(0, 1000 - customer.loyaltyPoints), // 1000 points = next tier
        },
      },
    });
  } catch (error) {
    console.error("Error fetching loyalty points:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Add or subtract loyalty points
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { amount, reason } = await request.json();

    if (!amount) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Update points
    const updated = await prisma.customer.update({
      where: { id },
      data: {
        loyaltyPoints: {
          increment: amount,
        },
      },
      select: {
        id: true,
        loyaltyPoints: true,
      },
    });

    // Ensure points don't go negative
    if (updated.loyaltyPoints < 0) {
      await prisma.customer.update({
        where: { id },
        data: { loyaltyPoints: 0 },
      });
      updated.loyaltyPoints = 0;
    }

    return NextResponse.json(
      {
        success: true,
        message: `${amount > 0 ? "Added" : "Subtracted"} ${Math.abs(amount)} points ${reason ? `for ${reason}` : ""}`,
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating loyalty points:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Reset loyalty points to calculated value based on spending
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        totalSpent: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Calculate points based on spending
    const pointsPerAED = 1;
    const calculatedPoints = Math.floor(customer.totalSpent * pointsPerAED);

    const updated = await prisma.customer.update({
      where: { id: id },
      data: {
        loyaltyPoints: calculatedPoints,
      },
      select: {
        id: true,
        loyaltyPoints: true,
        totalSpent: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Points recalculated based on spending (${calculatedPoints} points)`,
      data: updated,
    });
  } catch (error) {
    console.error("Error recalculating loyalty points:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
