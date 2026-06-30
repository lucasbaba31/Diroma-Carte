import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  // Retrouver l'utilisateur demo
  const user = await prisma.user.findUnique({ where: { email: "demo@menucarte.fr" } });
  if (!user) throw new Error("Compte demo introuvable. Lancez d'abord: npm run db:seed");

  // Restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { id: "di-roma" },
    update: { name: "Restaurant Di Roma", description: "Cuisine italienne - Esprit du sud", phone: "05 61 XX XX XX", address: "Aucamville, 31140" },
    create: {
      id: "di-roma",
      name: "Restaurant Di Roma",
      description: "Cuisine italienne - Esprit du sud",
      phone: "05 61 XX XX XX",
      address: "Aucamville, 31140",
      userId: user.id,
    },
  });
  console.log("✓ Restaurant Di Roma");

  // ─── CATÉGORIES ───────────────────────────────────────────────────────────
  const categories = [
    // Pour commencer — colonne gauche (apéritifs)
    { id: "dr-cat-1", name: "Cocktails italiens",     order: 0 },
    { id: "dr-cat-2", name: "Cocktails classiques",   order: 1 },
    { id: "dr-cat-3", name: "Cocktails sans alcool",  order: 2 },
    { id: "dr-cat-4", name: "Les grands classiques",  order: 3 },
    { id: "dr-cat-5", name: "Bières pression",        order: 4 },
    // Pour commencer — colonne droite
    { id: "dr-cat-6", name: "À partager",             order: 5 },
    { id: "dr-cat-7", name: "Assiettes Antipasti",    order: 6 },
    { id: "dr-cat-8", name: "Assiettes",              order: 7 },
    { id: "dr-cat-9", name: "Softs",                  order: 8 },
    { id: "dr-cat-10", name: "Jus de fruits",         order: 9 },
    // La carte complète
    { id: "dr-cat-11", name: "Salades & Carpaccio",   order: 10 },
    { id: "dr-cat-12", name: "Viandes",               order: 11 },
    { id: "dr-cat-13", name: "Pâtes, Risotto & Poissons", order: 12 },
    { id: "dr-cat-14", name: "Pizzas",                order: 13 },
    { id: "dr-cat-15", name: "Desserts & Cafétéria",  order: 14 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name, order: cat.order },
      create: { ...cat, restaurantId: restaurant.id },
    });
  }
  console.log(`✓ ${categories.length} catégories`);

  // ─── PLATS ────────────────────────────────────────────────────────────────
  const dishes = [
    // Cocktails italiens
    { id: "dr-d1",  categoryId: "dr-cat-1",  name: "Americano",              description: "Campari, vermouth doux, eau gazeuse",           price: 9.90,  order: 0 },
    { id: "dr-d2",  categoryId: "dr-cat-1",  name: "Spritz Vénitien",        description: "Prosecco, Aperol, eau gazeuse, orange",          price: 9.90,  order: 1 },
    { id: "dr-d3",  categoryId: "dr-cat-1",  name: "Spritz Saint-Germain",   description: "Prosecco, liqueur de sureau, eau gazeuse",       price: 10.90, order: 2 },

    // Cocktails classiques
    { id: "dr-d4",  categoryId: "dr-cat-2",  name: "Gin Tonic",              description: "Gin premium, tonic, citron vert",                price: 9.90,  order: 0 },
    { id: "dr-d5",  categoryId: "dr-cat-2",  name: "Mojito",                 description: "Rhum blanc, citron vert, menthe fraîche, sucre", price: 9.90,  order: 1 },

    // Cocktails sans alcool
    { id: "dr-d6",  categoryId: "dr-cat-3",  name: "Soleil Jaune",           description: "Ananas, mangue, passion, gingembre",            price: 6.90,  order: 0 },
    { id: "dr-d7",  categoryId: "dr-cat-3",  name: "Magic Amazon",           description: "Fruits rouges, grenadine, jus de pomme",        price: 6.90,  order: 1 },
    { id: "dr-d8",  categoryId: "dr-cat-3",  name: "Mojito Virgin",          description: "Citron vert, menthe, sucre de canne, eau gazeuse", price: 6.90, order: 2 },

    // Grands classiques
    { id: "dr-d9",  categoryId: "dr-cat-4",  name: "Ricard",                 description: "Pastis de Marseille",                           price: 4.90,  order: 0 },
    { id: "dr-d10", categoryId: "dr-cat-4",  name: "Whisky",                 description: "Scotch blend",                                  price: 7.60,  order: 1 },
    { id: "dr-d11", categoryId: "dr-cat-4",  name: "Whisky Prestige Frozes", description: "Single malt d'exception",                       price: 10.90, order: 2 },
    { id: "dr-d12", categoryId: "dr-cat-4",  name: "Kir Classique",          description: "Vin blanc, crème de cassis",                    price: 4.90,  order: 3 },
    { id: "dr-d13", categoryId: "dr-cat-4",  name: "Kir Royal",              description: "Champagne, crème de cassis",                    price: 6.90,  order: 4 },

    // Bières pression
    { id: "dr-d14", categoryId: "dr-cat-5",  name: "Lef Blonde — 25 cl",    description: "Bière blonde légère et dorée",                  price: 5.40,  order: 0 },
    { id: "dr-d15", categoryId: "dr-cat-5",  name: "Lef Blonde — 50 cl",    description: "Bière blonde légère et dorée",                  price: 9.40,  order: 1 },
    { id: "dr-d16", categoryId: "dr-cat-5",  name: "Moëvrei Blanche — 25 cl", description: "Bière blanche aux notes d'agrumes",           price: 5.40,  order: 2 },
    { id: "dr-d17", categoryId: "dr-cat-5",  name: "Moëvrei Blanche — 50 cl", description: "Bière blanche aux notes d'agrumes",           price: 9.40,  order: 3 },

    // À partager
    { id: "dr-d18", categoryId: "dr-cat-6",  name: "Scampi Fritti",          description: "10 pièces, sauce citron-ail, herbes fraîches",  price: 18.60, order: 0, allergens: '["crustaceans","gluten"]' },
    { id: "dr-d19", categoryId: "dr-cat-6",  name: "Foie Gras Maison",       description: "100 g, chutney de figues, pain toasté",         price: 25.30, order: 1, badge: "Maison" },
    { id: "dr-d20", categoryId: "dr-cat-6",  name: "Chiffonnade",            description: "160 g, jambon cru affiné, gressins, huile d'olive", price: 20.40, order: 2 },

    // Assiettes Antipasti
    { id: "dr-d21", categoryId: "dr-cat-7",  name: "Assiette Antipasti Piccolino", description: "Charcuteries, fromages, olives, bruschetta", price: 23.90, order: 0 },
    { id: "dr-d22", categoryId: "dr-cat-7",  name: "Assiette Antipasti Grande",    description: "Sélection généreuse pour 2-3 personnes",     price: 32.50, order: 1, badge: "À partager" },

    // Assiettes
    { id: "dr-d23", categoryId: "dr-cat-8",  name: "Saumon Gravlax",         description: "Saumon mariné, crème aneth, câpres, blinis",    price: 19.90, order: 0, allergens: '["fish","gluten","eggs","milk"]' },
    { id: "dr-d24", categoryId: "dr-cat-8",  name: "Stracciatella",          description: "Stracciatella de bufflonne, tomates cerises, basilic, huile d'olive", price: 17.90, order: 1, allergens: '["milk"]' },

    // Softs
    { id: "dr-d25", categoryId: "dr-cat-9",  name: "Coca-Cola",              description: "33 cl",                                         price: 4.30,  order: 0 },
    { id: "dr-d26", categoryId: "dr-cat-9",  name: "Coca-Cola Zéro",         description: "33 cl",                                         price: 4.30,  order: 1 },
    { id: "dr-d27", categoryId: "dr-cat-9",  name: "Orangina",               description: "25 cl",                                         price: 4.30,  order: 2 },
    { id: "dr-d28", categoryId: "dr-cat-9",  name: "Iced Tea",               description: "25 cl, pêche ou citron",                        price: 4.30,  order: 3 },

    // Jus de fruits
    { id: "dr-d29", categoryId: "dr-cat-10", name: "Jus d'orange",           description: "Pressé ou bouteille",                           price: 4.30,  order: 0 },
    { id: "dr-d30", categoryId: "dr-cat-10", name: "Jus de pomme",           description: "Bouteille 25 cl",                               price: 4.30,  order: 1 },

    // Salades & Carpaccio
    { id: "dr-d31", categoryId: "dr-cat-11", name: "Salade César",           description: "Romaine, croûtons, parmesan, sauce César maison", price: 14.90, order: 0, allergens: '["gluten","eggs","fish","milk"]' },
    { id: "dr-d32", categoryId: "dr-cat-11", name: "Carpaccio di Manzo",     description: "Fines tranches de bœuf, roquette, parmesan, câpres", price: 18.50, order: 1, allergens: '["milk"]', badge: "Signature" },
    { id: "dr-d33", categoryId: "dr-cat-11", name: "Salade Tricolore",       description: "Tomates, mozzarella, basilic, huile d'olive AOP", price: 13.90, order: 2, allergens: '["milk"]' },

    // Viandes
    { id: "dr-d34", categoryId: "dr-cat-12", name: "Tagliata di Manzo",      description: "Rumsteck tranché, roquette, copeaux de parmesan, tomates cerises", price: 26.90, order: 0, allergens: '["milk"]', badge: "Signature" },
    { id: "dr-d35", categoryId: "dr-cat-12", name: "Piccata Limone",         description: "Escalope de veau, sauce citron-câpres, pâtes fraîches", price: 23.90, order: 1, allergens: '["gluten","eggs","milk"]' },
    { id: "dr-d36", categoryId: "dr-cat-12", name: "Saltimbocca alla Romana", description: "Veau, jambon cru, sauge, marsala, polenta crémeuse", price: 24.90, order: 2, allergens: '["gluten","milk"]' },

    // Pâtes, Risotto & Poissons
    { id: "dr-d37", categoryId: "dr-cat-13", name: "Spaghetti Carbonara",    description: "Guanciale, œuf, pecorino romano, poivre noir",   price: 16.90, order: 0, allergens: '["gluten","eggs","milk"]' },
    { id: "dr-d38", categoryId: "dr-cat-13", name: "Tagliatelles aux Truffes", description: "Tagliatelles fraîches, truffe noire, parmesan, beurre", price: 22.90, order: 1, allergens: '["gluten","eggs","milk"]', badge: "Maison" },
    { id: "dr-d39", categoryId: "dr-cat-13", name: "Risotto ai Funghi",      description: "Champignons sauvages, parmesan, vin blanc sec",  price: 18.90, order: 2, allergens: '["milk","sulphites"]' },
    { id: "dr-d40", categoryId: "dr-cat-13", name: "Branzino al Forno",      description: "Loup de mer au four, légumes méditerranéens, huile d'olive", price: 24.90, order: 3, allergens: '["fish"]' },

    // Pizzas
    { id: "dr-d41", categoryId: "dr-cat-14", name: "Margherita",             description: "Tomate San Marzano, mozzarella fior di latte, basilic", price: 13.90, order: 0, allergens: '["gluten","milk"]' },
    { id: "dr-d42", categoryId: "dr-cat-14", name: "Quattro Formaggi",       description: "Mozzarella, gorgonzola, taleggio, parmesan",     price: 16.90, order: 1, allergens: '["gluten","milk"]' },
    { id: "dr-d43", categoryId: "dr-cat-14", name: "Diavola",                description: "Tomate, mozzarella, salami piquant, piment d'Espelette", price: 15.90, order: 2, allergens: '["gluten","milk"]' },
    { id: "dr-d44", categoryId: "dr-cat-14", name: "Tartufo",                description: "Crème de truffe, mozzarella, champignons, roquette", price: 19.90, order: 3, allergens: '["gluten","milk"]', badge: "Coup de cœur" },
    { id: "dr-d45", categoryId: "dr-cat-14", name: "Calzone Classico",       description: "Farcie : ricotta, jambon, mozzarella, tomate",   price: 16.90, order: 4, allergens: '["gluten","milk","eggs"]' },

    // Desserts & Cafétéria
    { id: "dr-d46", categoryId: "dr-cat-15", name: "Tiramisù Maison",        description: "Mascarpone, biscuit savoiardi, café, cacao amer", price: 8.90,  order: 0, allergens: '["gluten","eggs","milk"]', badge: "Maison" },
    { id: "dr-d47", categoryId: "dr-cat-15", name: "Pannacotta Vanille",     description: "Coulis de fruits rouges, menthe fraîche",        price: 7.90,  order: 1, allergens: '["milk"]' },
    { id: "dr-d48", categoryId: "dr-cat-15", name: "Cannoli Siciliani",      description: "Pâte croustillante, ricotta citronnée, pistache", price: 8.50, order: 2, allergens: '["gluten","eggs","milk","nuts"]' },
    { id: "dr-d49", categoryId: "dr-cat-15", name: "Gelato Artigianale",     description: "2 boules au choix : vanille, pistache, chocolat, stracciatella", price: 6.90, order: 3, allergens: '["milk","eggs"]' },
    { id: "dr-d50", categoryId: "dr-cat-15", name: "Café Espresso",          description: "Grain Arabica, torréfaction artisanale",         price: 2.50,  order: 4 },
    { id: "dr-d51", categoryId: "dr-cat-15", name: "Cappuccino",             description: "Espresso, lait moussé, poudre de cacao",         price: 3.50,  order: 5, allergens: '["milk"]' },
  ];

  for (const d of dishes) {
    const { allergens, ...rest } = d as typeof d & { allergens?: string };
    await prisma.dish.upsert({
      where: { id: d.id },
      update: {},
      create: { ...rest, allergens: allergens ?? "[]", available: true },
    });
  }
  console.log(`✓ ${dishes.length} plats créés`);

  console.log("\n🎉 Restaurant Di Roma prêt !");
  console.log("   Connectez-vous avec demo@menucarte.fr / demo1234");
  console.log("   Puis choisissez le template 'Di Roma — Carte Italienne'");
}

main().catch(console.error).finally(() => prisma.$disconnect());
