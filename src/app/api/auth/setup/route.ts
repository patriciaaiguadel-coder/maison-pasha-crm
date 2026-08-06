import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Ensure admin user exists
    const adminEmail = 'patricia@maison-pasha.com';
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        role: 'ADMIN',
        name: 'Patricia Admin',
      },
      create: {
        email: adminEmail,
        name: 'Patricia Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    // Ensure supplier user exists
    const supplierEmail = 'mandy@maison-pasha.com';
    const supplierUser = await prisma.user.upsert({
      where: { email: supplierEmail },
      update: {
        role: 'SUPPLIER',
      },
      create: {
        email: supplierEmail,
        name: 'Mandy Supplier',
        password: await bcrypt.hash('supplier123', 10),
        role: 'SUPPLIER',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Users setup completed',
      admin: {
        email: adminUser.email,
        role: adminUser.role,
      },
      supplier: {
        email: supplierUser.email,
        role: supplierUser.role,
      },
      credentials: {
        admin: 'patricia@maison-pasha.com / admin123',
        supplier: 'mandy@maison-pasha.com / supplier123',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to setup users',
  });
}
