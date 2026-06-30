import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const adapter = new PrismaBetterSqlite3({ url: `file:${path.resolve("prisma/dev.db")}` });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  // ─── Renommer dr-cat-11 en "Salades" ─────────────────────────────────────
  await prisma.category.update({
    where: { id: "dr-cat-11" },
    data: { name: "Salades", order: 10 },
  });
  // Supprimer les anciens plats de cette catégorie
  await prisma.dish.deleteMany({ where: { categoryId: "dr-cat-11" } });

  // ─── Nouvelles catégories ─────────────────────────────────────────────────
  const newCats = [
    { id: "dr-cat-16", name: "Carpaccio",              order: 11 },
    { id: "dr-cat-17", name: "Bœuf",                   order: 12 },
    { id: "dr-cat-18", name: "Pièces de caractère",    order: 13 },
    { id: "dr-cat-19", name: "Burgers de collection",  order: 14 },
    { id: "dr-cat-20", name: "Veau et canard",         order: 15 },
  ];
  for (const c of newCats) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: { name: c.name, order: c.order },
      create: { ...c, restaurantId: "di-roma" },
    });
  }
  // Décaler les autres catégories plus loin
  await prisma.category.updateMany({
    where: { id: { in: ["dr-cat-12","dr-cat-13","dr-cat-14","dr-cat-15"] } },
    data: { order: 100 }, // temporaire pour éviter conflit
  });
  await prisma.category.update({ where: { id: "dr-cat-13" }, data: { order: 16 } });
  await prisma.category.update({ where: { id: "dr-cat-14" }, data: { order: 17 } });
  await prisma.category.update({ where: { id: "dr-cat-15" }, data: { order: 18 } });
  await prisma.category.update({ where: { id: "dr-cat-12" }, data: { order: 100 } }); // dr-cat-12 remplacé

  console.log("✓ Catégories mises à jour");

  // ─── SALADES (dr-cat-11) ─────────────────────────────────────────────────
  const salades = [
    { id: "dr-v2-s1",  name: "César poulet",        description: "Romaine, croûtons, poulet grillé, parmesan, sauce César maison",              price: 18.60, order: 0, allergens: '["gluten","eggs","fish","milk"]' },
    { id: "dr-v2-s2",  name: "César gravlax",        description: "Romaine, saumon gravlax mariné, croûtons, parmesan, sauce César",             price: 21.30, order: 1, allergens: '["gluten","eggs","fish","milk"]' },
    { id: "dr-v2-s3",  name: "César Saint-Jacques",  description: "Romaine, noix de Saint-Jacques snackées, parmesan, sauce César",              price: 24.90, order: 2, allergens: '["gluten","eggs","fish","milk","molluscs"]', badge: "Signature" },
    { id: "dr-v2-s4",  name: "Salade burrata",        description: "Burrata crémeuse, tomates cerises, basilic frais, huile d'olive AOP",        price: 18.70, order: 3, allergens: '["milk"]' },
    { id: "dr-v2-s5",  name: "Salade landaise",       description: "Magret fumé, gésiers confits, foie gras poêlé, salade verte, pignons",       price: 19.60, order: 4 },
    { id: "dr-v2-s6",  name: "Salade gersoise",       description: "Canard confit, gésiers, magret fumé, rillettes, œuf poché, salade mêlée",   price: 22.90, order: 5, badge: "Maison" },
  ];

  // ─── CARPACCIO (dr-cat-16) ───────────────────────────────────────────────
  const carpaccios = [
    { id: "dr-v2-c1",  name: "Parmesan",              description: "Carpaccio de bœuf, copeaux de parmesan, roquette, huile d'olive, citron",    price: 18.50, order: 0, allergens: '["milk"]' },
    { id: "dr-v2-c2",  name: "Trois saveurs",          description: "Carpaccio trio : bœuf, saumon, thon — sauce citronnée aux herbes",           price: 17.90, order: 1, allergens: '["fish"]' },
    { id: "dr-v2-c3",  name: "Saveur d'Italie",        description: "Carpaccio de bœuf, stracciatella, tomates séchées, basilic, balsamique",    price: 21.20, order: 2, allergens: '["milk"]', badge: "Coup de cœur" },
  ];

  // ─── BŒUF (dr-cat-17) ────────────────────────────────────────────────────
  const boeuf = [
    { id: "dr-v2-b1",  name: "Entrecôte 350 g",        description: "Garniture au choix : frites ou salade · Sauce Roquefort, foie gras ou poivre +2,00 €", price: 29.90, order: 0 },
    { id: "dr-v2-b2",  name: "Rumsteak 250 g",          description: "Garniture au choix : frites ou salade · Sauce Roquefort, foie gras ou poivre +2,00 €", price: 25.70, order: 1 },
  ];

  // ─── PIÈCES DE CARACTÈRE (dr-cat-18) ────────────────────────────────────
  const pieces = [
    { id: "dr-v2-p1",  name: "Pavé de rumsteak Rossini", description: "Foie gras poêlé, sauce Périgueux — garniture au choix : frites ou salade", price: 34.90, order: 0, badge: "Signature" },
    { id: "dr-v2-p2",  name: "Filet de bœuf",            description: "Garniture au choix : frites ou salade",                                    price: 20.50, order: 1 },
    { id: "dr-v2-p3",  name: "Tartare classique",         description: "Bœuf haché à la minute, câpres, cornichons, oignon — frites ou salade",   price: 20.70, order: 2, allergens: '["eggs","mustard"]' },
    { id: "dr-v2-p4",  name: "Tartare poêlé",             description: "Bœuf haché cuit à la poêle, herbes fraîches — frites ou salade",           price: 20.70, order: 3, allergens: '["eggs","mustard"]' },
  ];

  // ─── BURGERS (dr-cat-19) ─────────────────────────────────────────────────
  const burgers = [
    { id: "dr-v2-bu1", name: "Burger Italienne",          description: "Steak haché, mozzarella, tomate, roquette, pesto — frites ou salade",     price: 21.20, order: 0, allergens: '["gluten","milk","eggs"]' },
    { id: "dr-v2-bu2", name: "Burger Rossini",            description: "Steak haché, foie gras, sauce Périgueux, roquette — frites ou salade",    price: 21.20, order: 1, allergens: '["gluten","eggs"]', badge: "Populaire" },
  ];

  // ─── VEAU ET CANARD (dr-cat-20) ──────────────────────────────────────────
  const veauCanard = [
    { id: "dr-v2-v1",  name: "Escalope milanaise",        description: "Escalope de veau panée, tagliatelles fraîches, sauce tomate maison",     price: 23.20, order: 0, allergens: '["gluten","eggs","milk"]' },
  ];

  const allDishes = [
    ...salades.map(d => ({ ...d, categoryId: "dr-cat-11" })),
    ...carpaccios.map(d => ({ ...d, categoryId: "dr-cat-16" })),
    ...boeuf.map(d => ({ ...d, categoryId: "dr-cat-17" })),
    ...pieces.map(d => ({ ...d, categoryId: "dr-cat-18" })),
    ...burgers.map(d => ({ ...d, categoryId: "dr-cat-19" })),
    ...veauCanard.map(d => ({ ...d, categoryId: "dr-cat-20" })),
  ];

  for (const d of allDishes) {
    const { allergens, ...rest } = d as typeof d & { allergens?: string };
    await prisma.dish.upsert({
      where: { id: d.id },
      update: { name: d.name, description: d.description, price: d.price },
      create: { ...rest, allergens: allergens ?? "[]", available: true },
    });
  }
  console.log(`✓ ${allDishes.length} plats mis à jour`);

  // Supprimer les anciens plats de dr-cat-12 (ancienne "Viandes" générique)
  await prisma.dish.deleteMany({ where: { categoryId: "dr-cat-12" } });
  console.log("✓ Anciens plats Viandes supprimés");

  console.log("\n🎉 Carte Di Roma v2 prête !");
}

main().catch(console.error).finally(() => prisma.$disconnect());
