import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Initializing database with seed data...");

  // Créer l'utilisateur admin Patricia
  const adminUser = await prisma.user.upsert({
    where: { email: "patricia@maison-pasha.com" },
    update: {},
    create: {
      email: "patricia@maison-pasha.com",
      name: "Patricia Aiguadel",
      role: Role.ADMIN,
      password: await bcrypt.hash("admin123", 10), // À changer après la première connexion
    },
  });

  console.log("✅ Admin user created:", adminUser.email);

  // Créer l'utilisateur fournisseur Mandy
  const supplierUser = await prisma.user.upsert({
    where: { email: "mandy@maison-pasha.com" },
    update: {},
    create: {
      email: "mandy@maison-pasha.com",
      name: "Mandy",
      role: Role.SUPPLIER,
      password: await bcrypt.hash("supplier123", 10), // À changer après la première connexion
    },
  });

  console.log("✅ Supplier user created:", supplierUser.email);

  console.log("🎉 Seed completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
