import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').replace(/^"(.*)"$/, '$1');
      process.env[key.trim()] = value;
    }
  });
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test data...');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();

  // Create test customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        email: 'fatima.dubai@example.com',
        firstName: 'Fatima',
        lastName: 'Al Mansouri',
        phone: '+971501234567',
        address: 'Dubai Marina, Dubai',
        city: 'Dubai',
        postalCode: '12345',
        country: 'UAE',
        totalSpent: 2500,
        loyaltyPoints: 2500,
      },
    }),
    prisma.customer.create({
      data: {
        email: 'ahmed.abujaber@example.com',
        firstName: 'Ahmed',
        lastName: 'Abu Jaber',
        phone: '+971502345678',
        address: 'Downtown Dubai, Dubai',
        city: 'Dubai',
        postalCode: '54321',
        country: 'UAE',
        totalSpent: 5200,
        loyaltyPoints: 5200,
      },
    }),
    prisma.customer.create({
      data: {
        email: 'sara.sharjah@example.com',
        firstName: 'Sara',
        lastName: 'Al Shehhi',
        phone: '+971503456789',
        address: 'Sharjah, UAE',
        city: 'Sharjah',
        postalCode: '67890',
        country: 'UAE',
        totalSpent: 1800,
        loyaltyPoints: 1800,
      },
    }),
    prisma.customer.create({
      data: {
        email: 'layla.abudhabi@example.com',
        firstName: 'Layla',
        lastName: 'Al Kazimi',
        phone: '+971504567890',
        address: 'Abu Dhabi, UAE',
        city: 'Abu Dhabi',
        postalCode: '11111',
        country: 'UAE',
        totalSpent: 3400,
        loyaltyPoints: 3400,
      },
    }),
    prisma.customer.create({
      data: {
        email: 'mohammed.pets@example.com',
        firstName: 'Mohammed',
        lastName: 'Al Falahi',
        phone: '+971505678901',
        address: 'Jumeirah, Dubai',
        city: 'Dubai',
        postalCode: '22222',
        country: 'UAE',
        totalSpent: 6800,
        loyaltyPoints: 6800,
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} test customers`);

  // Create test orders
  const products = [
    { name: 'Premium Pet Food', price: 450 },
    { name: 'Dog Bed Deluxe', price: 650 },
    { name: 'Cat Tree Tower', price: 380 },
    { name: 'Pet Grooming Kit', price: 290 },
    { name: 'Interactive Toy Set', price: 220 },
    { name: 'Pet Travel Carrier', price: 520 },
    { name: 'Water Fountain', price: 310 },
    { name: 'Training Treats Pack', price: 150 },
  ];

  let orderCount = 0;

  for (const customer of customers) {
    // Create 3-5 orders per customer
    const orderCount_ = Math.floor(Math.random() * 3) + 3;

    for (let i = 0; i < orderCount_; i++) {
      const selectedProducts = products
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 1);

      const totalAmount = selectedProducts.reduce((sum, p) => sum + p.price, 0);

      const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'] as const;
      const order = await prisma.order.create({
        data: {
          customerId: customer.id,
          orderNumber: `#${Date.now()}-${Math.random().toString(36).substring(7)}`,
          status: statuses[Math.floor(Math.random() * 4)] as any,
          totalAmount,
          currency: 'AED',
          paymentStatus: 'paid',
          items: {
            create: selectedProducts.map((p) => ({
              productId: `prod_${Math.random().toString(36).substring(7)}`,
              productName: p.name,
              quantity: Math.floor(Math.random() * 3) + 1,
              price: p.price,
            })),
          },
        },
      });

      orderCount++;
    }
  }

  console.log(`✅ Created ${orderCount} test orders`);
  console.log('🎉 Test data seeded successfully!');
  console.log('\n📊 You can now:');
  console.log('   1. Go to http://localhost:3000/dashboard - See all orders');
  console.log('   2. Go to http://localhost:3000/dashboard/orders-live - Live tracking');
  console.log('   3. Go to http://localhost:3000/dashboard/sourcing - Launch AI Agent');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
