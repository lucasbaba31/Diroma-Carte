import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const adapter = new PrismaBetterSqlite3({ url: `file:${path.resolve("prisma/dev.db")}` });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  // ─── Réorganiser les catégories existantes ────────────────────────────────
  // dr-cat-13 "Pâtes, Risotto & Poissons" → devient "La mer"
  await prisma.category.update({
    where: { id: "dr-cat-13" },
    data: { name: "La mer", order: 16 },
  });
  await prisma.dish.deleteMany({ where: { categoryId: "dr-cat-13" } });

  // dr-cat-14 "Pizzas" → devient "Pizzas base tomate"
  await prisma.category.update({
    where: { id: "dr-cat-14" },
    data: { name: "Pizzas base tomate", order: 19 },
  });
  await prisma.dish.deleteMany({ where: { categoryId: "dr-cat-14" } });

  // ─── Nouvelles catégories ─────────────────────────────────────────────────
  const newCats = [
    { id: "dr-cat-25", name: "Les pâtes",               order: 17 },
    { id: "dr-cat-26", name: "Les risottos",             order: 18 },
    { id: "dr-cat-27", name: "Pizzas base crème fraîche", order: 20 },
  ];
  for (const c of newCats) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: { name: c.name, order: c.order },
      create: { ...c, restaurantId: "di-roma" },
    });
  }
  console.log("✓ Catégories mises à jour");

  // ─── LA MER (dr-cat-13) ───────────────────────────────────────────────────
  const laMer = [
    { id: "dr-v3-m1", name: "Calamars à la plancha",      description: "Sauce aïoli maison",                                              price: 19.40, order: 0, allergens: '["molluscs","eggs"]' },
    { id: "dr-v3-m2", name: "Saltimbocca de saumon",      description: "Saumon, jambon cru, sauge, sauce au vin blanc",                   price: 22.40, order: 1, allergens: '["fish","milk","sulphites"]', badge: "Signature" },
    { id: "dr-v3-m3", name: "Pavé de saumon",             description: "Garniture au choix : légumes de saison ou risotto",               price: 23.90, order: 2, allergens: '["fish"]' },
    { id: "dr-v3-m4", name: "Crevettes à la milanaise",   description: "Crevettes panées, sauce milanaise, riz ou tagliatelles",         price: 22.90, order: 3, allergens: '["crustaceans","gluten","eggs","milk"]' },
  ];

  // ─── LES PÂTES — sauces (dr-cat-25) ──────────────────────────────────────
  // Les types de pâtes (Tagliatelles, Spaghettis, Decatoni) sont des options
  // stockées dans la description de la catégorie via un plat spécial "order: -1"
  const lesPates = [
    { id: "dr-v3-p1",  name: "Bolognaise",         description: "Bœuf haché, tomate, aromates, parmesan",                 price: 16.60, order: 0, allergens: '["gluten","milk"]' },
    { id: "dr-v3-p2",  name: "Carbonara",           description: "Guanciale, œuf, pecorino romano, poivre noir",           price: 18.70, order: 1, allergens: '["gluten","eggs","milk"]' },
    { id: "dr-v3-p3",  name: "Foie gras poêlé",    description: "Foie gras frais poêlé, sauce Périgueux",                 price: 25.20, order: 2, allergens: '["gluten","milk"]', badge: "Signature" },
    { id: "dr-v3-p4",  name: "Gourmandole",         description: "Sauce crème, lardons, champignons, parmesan",            price: 27.70, order: 3, allergens: '["gluten","milk"]' },
    { id: "dr-v3-p5",  name: "Saumon gravlax",      description: "Saumon mariné maison, crème aneth, citron",             price: 22.20, order: 4, allergens: '["gluten","fish","milk"]' },
    { id: "dr-v3-p6",  name: "Lasagnes maison",     description: "Bœuf, sauce tomate, béchamel, gratinées au four",       price: 18.60, order: 5, allergens: '["gluten","eggs","milk"]', badge: "Maison" },
  ];

  // ─── LES RISOTTOS (dr-cat-26) ─────────────────────────────────────────────
  const lesRisottos = [
    { id: "dr-v3-r1",  name: "Risotto de Saint-Jacques",  description: "Noix de Saint-Jacques snackées, bisque de crustacés, parmesan",  price: 24.90, order: 0, allergens: '["milk","crustaceans","molluscs"]', badge: "Signature" },
    { id: "dr-v3-r2",  name: "Risotto de calamars",       description: "Calamars à l'encre, sauce vierge, herbes fraîches",              price: 21.30, order: 1, allergens: '["milk","molluscs"]' },
    { id: "dr-v3-r3",  name: "Risotto de saumon gravlax", description: "Saumon mariné maison, crème aneth, zeste de citron",             price: 22.20, order: 2, allergens: '["milk","fish"]' },
  ];

  // ─── PIZZAS BASE TOMATE — 32 cm (dr-cat-14) ──────────────────────────────
  // Prix unique affiché au niveau de la section (pas par plat)
  const pizzasTomate = [
    { id: "dr-v3-pt1",  name: "Margherita",    description: "Tomate, mozzarella, basilic",                                           price: 13.90, order: 0 },
    { id: "dr-v3-pt2",  name: "Senesia",       description: "Tomate, mozzarella, jambon, champignons, olives",                       price: 13.90, order: 1 },
    { id: "dr-v3-pt3",  name: "Reine",         description: "Tomate, mozzarella, jambon, champignons",                               price: 13.90, order: 2 },
    { id: "dr-v3-pt4",  name: "Impérial",      description: "Tomate, mozzarella, jambon, lardons, œuf",                              price: 14.90, order: 3 },
    { id: "dr-v3-pt5",  name: "Pepperoni",     description: "Tomate, mozzarella, pepperoni",                                         price: 13.90, order: 4 },
    { id: "dr-v3-pt6",  name: "Texane",        description: "Tomate, mozzarella, bœuf haché, oignon, poivrons",                      price: 14.90, order: 5 },
    { id: "dr-v3-pt7",  name: "Mécane",        description: "Tomate, mozzarella, merguez, harissa, poivrons",                        price: 14.90, order: 6 },
    { id: "dr-v3-pt8",  name: "Gyroma",        description: "Tomate, mozzarella, kebab, oignons, sauce blanche",                     price: 14.90, order: 7 },
    { id: "dr-v3-pt9",  name: "Calzone",       description: "Tomate, mozzarella, jambon, champignons — farcie et dorée au four",     price: 14.90, order: 8, allergens: '["gluten","milk","eggs"]' },
    { id: "dr-v3-pt10", name: "Italie",        description: "Tomate, mozzarella, jambon cru, roquette, parmesan, basilic",           price: 15.90, order: 9, allergens: '["milk"]', badge: "Signature" },
    { id: "dr-v3-pt11", name: "Original",      description: "Tomate, mozzarella, anchois, olives, câpres",                          price: 13.90, order: 10, allergens: '["fish","milk"]' },
  ];

  // ─── PIZZAS BASE CRÈME FRAÎCHE — 32 cm (dr-cat-27) ───────────────────────
  const pizzasCreme = [
    { id: "dr-v3-pc1",  name: "Forestière",         description: "Crème, mozzarella, champignons, lardons, persil",                  price: 14.90, order: 0 },
    { id: "dr-v3-pc2",  name: "Poulet curry",        description: "Crème, mozzarella, poulet, curry, poivrons",                      price: 14.90, order: 1 },
    { id: "dr-v3-pc3",  name: "Magnète Suprême",     description: "Crème, mozzarella, jambon, champignons, poivrons, oignons",       price: 14.90, order: 2 },
    { id: "dr-v3-pc4",  name: "Meetness Séga",       description: "Crème, mozzarella, bœuf épicé, oignons, poivrons, piment doux",  price: 15.90, order: 3 },
    { id: "dr-v3-pc5",  name: "Parmesan",            description: "Crème, mozzarella, parmesan, roquette, huile d'olive, basilic",   price: 14.90, order: 4, allergens: '["milk"]', badge: "Coup de cœur" },
    { id: "dr-v3-pc6",  name: "Carbonara",           description: "Crème, mozzarella, lardons, œuf, pecorino",                      price: 14.90, order: 5, allergens: '["milk","eggs"]' },
    { id: "dr-v3-pc7",  name: "Carizzo",             description: "Crème, mozzarella, chèvre frais, miel, noix, roquette",          price: 15.90, order: 6, allergens: '["milk","nuts"]' },
    { id: "dr-v3-pc8",  name: "Quatre fromages",     description: "Crème, mozzarella, gorgonzola, taleggio, parmesan",              price: 15.90, order: 7, allergens: '["milk"]' },
    { id: "dr-v3-pc9",  name: "Normande",            description: "Crème, mozzarella, camembert, pommes, lardons",                  price: 14.90, order: 8, allergens: '["milk"]' },
    { id: "dr-v3-pc10", name: "Saumon",              description: "Crème, mozzarella, saumon fumé, câpres, citron",                 price: 15.90, order: 9, allergens: '["fish","milk"]' },
  ];

  const allDishes = [
    ...laMer.map(d => ({ ...d, categoryId: "dr-cat-13" })),
    ...lesPates.map(d => ({ ...d, categoryId: "dr-cat-25" })),
    ...lesRisottos.map(d => ({ ...d, categoryId: "dr-cat-26" })),
    ...pizzasTomate.map(d => ({ ...d, categoryId: "dr-cat-14" })),
    ...pizzasCreme.map(d => ({ ...d, categoryId: "dr-cat-27" })),
  ];

  for (const d of allDishes) {
    const { allergens, ...rest } = d as typeof d & { allergens?: string };
    await prisma.dish.upsert({
      where: { id: d.id },
      update: { name: d.name, description: d.description, price: d.price },
      create: { ...rest, allergens: allergens ?? "[]", available: true },
    });
  }
  console.log(`✓ ${allDishes.length} plats créés / mis à jour`);
  console.log("\n🎉 Carte Di Roma v3 prête !");
}

main().catch(console.error).finally(() => prisma.$disconnect());
