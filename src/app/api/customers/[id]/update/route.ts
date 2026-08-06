import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: id },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Update allowed fields
    const updatedCustomer = await prisma.customer.update({
      where: { id: id },
      data: {
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        phone: data.phone !== undefined ? data.phone : undefined,
        address: data.address !== undefined ? data.address : undefined,
        city: data.city !== undefined ? data.city : undefined,
        postalCode: data.postalCode !== undefined ? data.postalCode : undefined,
        country: data.country !== undefined ? data.country : undefined,
        loyaltyPoints: data.loyaltyPoints !== undefined ? data.loyaltyPoints : undefined,
      },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            createdAt: true,
          },
          take: 5,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCustomer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
