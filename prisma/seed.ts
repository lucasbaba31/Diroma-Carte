import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import { DEFAULT_TEMPLATES } from "../lib/templates";

const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  const password = await bcrypt.hash("demo1234", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@menucarte.fr" },
    update: {},
    create: { name: "Restaurant Demo", email: "demo@menucarte.fr", password },
  });
  console.log(`✓ Compte : demo@menucarte.fr / demo1234`);

  const restaurant = await prisma.restaurant.upsert({
    where: { id: "demo-restaurant" },
    update: {},
    create: {
      id: "demo-restaurant",
      name: "Le Petit Bistrot",
      description: "Cuisine traditionnelle française",
      phone: "01 23 45 67 89",
      address: "12 rue de la Paix, Paris",
      userId: user.id,
    },
  });
  console.log(`✓ Restaurant demo`);

  const entrees = await prisma.category.upsert({ where: { id: "demo-cat-1" }, update: {}, create: { id: "demo-cat-1", name: "Entrées", order: 0, restaurantId: restaurant.id } });
  const plats   = await prisma.category.upsert({ where: { id: "demo-cat-2" }, update: {}, create: { id: "demo-cat-2", name: "Plats",   order: 1, restaurantId: restaurant.id } });
  const desserts= await prisma.category.upsert({ where: { id: "demo-cat-3" }, update: {}, create: { id: "demo-cat-3", name: "Desserts",order: 2, restaurantId: restaurant.id } });

  const dishes = [
    { id: "d1", name: "Soupe à l'oignon gratinée",  description: "Bouillon de bœuf, croûton, emmental fondu",       price: 9.5, categoryId: entrees.id,  order: 0 },
    { id: "d2", name: "Terrine de foie gras",        description: "Chutney de figues, pain brioché toasté",          price: 16,  categoryId: entrees.id,  order: 1, badge: "Signature" },
    { id: "d3", name: "Salade niçoise",              description: "Thon, œuf mollet, olives, anchois",               price: 13,  categoryId: entrees.id,  order: 2 },
    { id: "d4", name: "Confit de canard",            description: "Pommes sarladaises, salade verte",                price: 22,  categoryId: plats.id,    order: 0 },
    { id: "d5", name: "Bœuf bourguignon",            description: "Mijotée 3h, carottes, champignons, lardons",      price: 24,  categoryId: plats.id,    order: 1, badge: "Populaire" },
    { id: "d6", name: "Sole meunière",               description: "Beurre citronné, haricots verts",                 price: 26,  categoryId: plats.id,    order: 2 },
    { id: "d7", name: "Crème brûlée à la vanille",  description: "Vanille de Madagascar",                           price: 8,   categoryId: desserts.id, order: 0 },
    { id: "d8", name: "Tarte tatin",                 description: "Pommes caramélisées, crème fraîche",              price: 9,   categoryId: desserts.id, order: 1, badge: "Maison" },
    { id: "d9", name: "Mousse au chocolat",          description: "Chocolat noir 70%, tuile croustillante",          price: 8,   categoryId: desserts.id, order: 2 },
  ];

  for (const d of dishes) {
    await prisma.dish.upsert({ where: { id: d.id }, update: {}, create: { ...d, allergens: "[]", available: true } });
  }
  console.log(`✓ ${dishes.length} plats demo`);

  await prisma.template.deleteMany({});
  for (const t of DEFAULT_TEMPLATES) {
    await prisma.template.create({
      data: { name: t.name, description: t.description ?? null, category: t.category, thumbnail: t.thumbnail ?? null, blocks: t.blocks as object[], isPublic: t.isPublic },
    });
  }
  console.log(`✓ 5 templates créés`);

  console.log("\n🎉 Prêt !");
  console.log("   Email        : demo@menucarte.fr");
  console.log("   Mot de passe : demo1234");
}

main().catch(console.error).finally(() => prisma.$disconnect());
