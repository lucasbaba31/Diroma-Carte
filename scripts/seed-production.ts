/**
 * Seed de production — à lancer UNE FOIS après le premier déploiement Railway
 * via : railway run tsx scripts/seed-production.ts
 *
 * Ce script crée l'utilisateur admin et lance le seed Di Roma.
 */
import { PrismaClient } from "../app/generated/prisma/client";
import bcrypt from "bcryptjs";

const { PrismaPg } = require("@prisma/adapter-pg");
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log("🌱 Seed production démarré...");

  // ─── Compte admin ────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || "admin@diroma.fr";
  const adminPassword = process.env.ADMIN_PASSWORD || "DiRoma2024!";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin Di Roma",
        password: hashed,
      },
    });
    console.log(`✓ Utilisateur créé : ${adminEmail}`);
  } else {
    console.log(`→ Utilisateur déjà existant : ${adminEmail}`);
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { email: adminEmail } });

  // ─── Restaurant ───────────────────────────────────────────────────────────────
  await prisma.restaurant.upsert({
    where: { id: "di-roma" },
    update: {},
    create: {
      id: "di-roma",
      name: "Di Roma à Aucamville",
      description: "Cuisine italienne et spécialités au feu de bois",
      userId: user.id,
    },
  });
  console.log("✓ Restaurant créé");

  console.log("\n✅ Seed terminé !");
  console.log("→ Lance ensuite : railway run npm run db:seed-di-roma");
}

main().catch(console.error).finally(() => prisma.$disconnect());
