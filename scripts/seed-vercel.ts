/**
 * Seed automatique lancé à chaque déploiement Vercel.
 * Utilise upsert partout — safe à relancer plusieurs fois.
 */
import { PrismaClient } from "../app/generated/prisma/client";
import bcrypt from "bcryptjs";

const { PrismaPg } = require("@prisma/adapter-pg");
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  // ─── Compte admin ────────────────────────────────────────────────────────────
  const email = "admin@diroma.fr";
  const password = "DiRoma2024!";
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, name: "Admin Di Roma", password: await bcrypt.hash(password, 12) },
    });
    console.log("✓ Compte admin créé");
  } else {
    console.log("→ Compte admin déjà existant");
  }

  // ─── Restaurant ───────────────────────────────────────────────────────────────
  await prisma.restaurant.upsert({
    where: { id: "di-roma" },
    update: { name: "Di Roma à Aucamville", description: "Cuisine italienne et spécialités au feu de bois", userId: user.id },
    create: { id: "di-roma", name: "Di Roma à Aucamville", description: "Cuisine italienne et spécialités au feu de bois", userId: user.id },
  });
  console.log("✓ Restaurant");

  // ─── Catégories ───────────────────────────────────────────────────────────────
  const categories = [
    { id: "dr-cat-1",  name: "Cocktails italiens",          order: 0 },
    { id: "dr-cat-2",  name: "Cocktails classiques",        order: 1 },
    { id: "dr-cat-3",  name: "Cocktails sans alcool",       order: 2 },
    { id: "dr-cat-4",  name: "Les grands classiques",       order: 3 },
    { id: "dr-cat-5",  name: "Bières pression",             order: 4 },
    { id: "dr-cat-6",  name: "À partager",                  order: 5 },
    { id: "dr-cat-7",  name: "Assiettes Antipasti",         order: 6 },
    { id: "dr-cat-8",  name: "Assiettes",                   order: 7 },
    { id: "dr-cat-9",  name: "Softs",                       order: 8 },
    { id: "dr-cat-10", name: "Jus de fruits",               order: 9 },
    { id: "dr-cat-11", name: "Salades",                     order: 10 },
    { id: "dr-cat-13", name: "La mer",                      order: 16 },
    { id: "dr-cat-14", name: "Pizzas base tomate",          order: 19 },
    { id: "dr-cat-15", name: "Desserts & Cafétéria",        order: 21 },
    { id: "dr-cat-16", name: "Carpaccio",                   order: 11 },
    { id: "dr-cat-17", name: "Bœuf",                        order: 12 },
    { id: "dr-cat-18", name: "Pièces de caractère",         order: 13 },
    { id: "dr-cat-19", name: "Burgers de collection",       order: 14 },
    { id: "dr-cat-20", name: "Veau et canard",              order: 15 },
    { id: "dr-cat-25", name: "Les pâtes",                   order: 17 },
    { id: "dr-cat-26", name: "Les risottos",                order: 18 },
    { id: "dr-cat-27", name: "Pizzas base crème fraîche",   order: 20 },
  ];
  for (const c of categories) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: { name: c.name, order: c.order },
      create: { ...c, restaurantId: "di-roma" },
    });
  }
  console.log(`✓ ${categories.length} catégories`);

  // ─── Plats ────────────────────────────────────────────────────────────────────
  const dishes: Array<{ id: string; categoryId: string; name: string; description: string; price: number; order: number; allergens?: string; badge?: string }> = [
    // Cocktails italiens
    { id:"dr-d1",  categoryId:"dr-cat-1",  name:"Americano",               description:"Campari, vermouth doux, eau gazeuse",                 price:9.90,  order:0 },
    { id:"dr-d2",  categoryId:"dr-cat-1",  name:"Spritz Vénitien",         description:"Prosecco, Aperol, eau gazeuse, orange",               price:9.90,  order:1 },
    { id:"dr-d3",  categoryId:"dr-cat-1",  name:"Spritz Saint-Germain",    description:"Prosecco, liqueur de sureau, eau gazeuse",            price:10.90, order:2 },
    // Cocktails classiques
    { id:"dr-d4",  categoryId:"dr-cat-2",  name:"Gin Tonic",               description:"Gin premium, tonic, citron vert",                    price:9.90,  order:0 },
    { id:"dr-d5",  categoryId:"dr-cat-2",  name:"Mojito",                  description:"Rhum blanc, citron vert, menthe fraîche, sucre",     price:9.90,  order:1 },
    // Cocktails sans alcool
    { id:"dr-d6",  categoryId:"dr-cat-3",  name:"Soleil Jaune",            description:"Ananas, mangue, passion, gingembre",                price:6.90,  order:0 },
    { id:"dr-d7",  categoryId:"dr-cat-3",  name:"Magic Amazon",            description:"Fruits rouges, grenadine, jus de pomme",            price:6.90,  order:1 },
    { id:"dr-d8",  categoryId:"dr-cat-3",  name:"Mojito Virgin",           description:"Citron vert, menthe, sucre de canne, eau gazeuse",  price:6.90,  order:2 },
    // Grands classiques
    { id:"dr-d9",  categoryId:"dr-cat-4",  name:"Ricard",                  description:"Pastis de Marseille",                               price:4.90,  order:0 },
    { id:"dr-d10", categoryId:"dr-cat-4",  name:"Whisky",                  description:"Scotch blend",                                      price:7.60,  order:1 },
    { id:"dr-d11", categoryId:"dr-cat-4",  name:"Whisky Prestige Frozes",  description:"Single malt d'exception",                           price:10.90, order:2 },
    { id:"dr-d12", categoryId:"dr-cat-4",  name:"Kir Classique",           description:"Vin blanc, crème de cassis",                        price:4.90,  order:3 },
    { id:"dr-d13", categoryId:"dr-cat-4",  name:"Kir Royal",               description:"Champagne, crème de cassis",                        price:6.90,  order:4 },
    // Bières
    { id:"dr-d14", categoryId:"dr-cat-5",  name:"Lef Blonde — 25 cl",     description:"Bière blonde légère et dorée",                      price:5.40,  order:0 },
    { id:"dr-d15", categoryId:"dr-cat-5",  name:"Lef Blonde — 50 cl",     description:"Bière blonde légère et dorée",                      price:9.40,  order:1 },
    { id:"dr-d16", categoryId:"dr-cat-5",  name:"Moëvrei Blanche — 25 cl",description:"Bière blanche aux notes d'agrumes",                  price:5.40,  order:2 },
    { id:"dr-d17", categoryId:"dr-cat-5",  name:"Moëvrei Blanche — 50 cl",description:"Bière blanche aux notes d'agrumes",                  price:9.40,  order:3 },
    // À partager
    { id:"dr-d18", categoryId:"dr-cat-6",  name:"Scampi Fritti",           description:"10 pièces, sauce citron-ail, herbes fraîches",      price:18.60, order:0, allergens:'["crustaceans","gluten"]' },
    { id:"dr-d19", categoryId:"dr-cat-6",  name:"Foie Gras Maison",        description:"100 g, chutney de figues, pain toasté",             price:25.30, order:1, badge:"Maison" },
    { id:"dr-d20", categoryId:"dr-cat-6",  name:"Chiffonnade",             description:"160 g, jambon cru affiné, gressins, huile d'olive", price:20.40, order:2 },
    // Assiettes Antipasti
    { id:"dr-d21", categoryId:"dr-cat-7",  name:"Assiette Antipasti Piccolino", description:"Charcuteries, fromages, olives, bruschetta",   price:23.90, order:0 },
    { id:"dr-d22", categoryId:"dr-cat-7",  name:"Assiette Antipasti Grande",    description:"Sélection généreuse pour 2-3 personnes",       price:32.50, order:1, badge:"À partager" },
    // Assiettes
    { id:"dr-d23", categoryId:"dr-cat-8",  name:"Saumon Gravlax",          description:"Saumon mariné, crème aneth, câpres, blinis",       price:19.90, order:0, allergens:'["fish","gluten","eggs","milk"]' },
    { id:"dr-d24", categoryId:"dr-cat-8",  name:"Stracciatella",           description:"Stracciatella de bufflonne, tomates cerises, basilic, huile d'olive", price:17.90, order:1, allergens:'["milk"]' },
    // Softs
    { id:"dr-d25", categoryId:"dr-cat-9",  name:"Coca-Cola",               description:"33 cl",                                            price:4.30,  order:0 },
    { id:"dr-d26", categoryId:"dr-cat-9",  name:"Coca-Cola Zéro",          description:"33 cl",                                            price:4.30,  order:1 },
    { id:"dr-d27", categoryId:"dr-cat-9",  name:"Orangina",                description:"25 cl",                                            price:4.30,  order:2 },
    { id:"dr-d28", categoryId:"dr-cat-9",  name:"Iced Tea",                description:"25 cl, pêche ou citron",                           price:4.30,  order:3 },
    // Jus
    { id:"dr-d29", categoryId:"dr-cat-10", name:"Jus d'orange",            description:"Pressé ou bouteille",                              price:4.30,  order:0 },
    { id:"dr-d30", categoryId:"dr-cat-10", name:"Jus de pomme",            description:"Bouteille 25 cl",                                  price:4.30,  order:1 },
    // Salades
    { id:"dr-v2-s1", categoryId:"dr-cat-11", name:"César poulet",          description:"Romaine, croûtons, poulet grillé, parmesan, sauce César maison",       price:18.60, order:0, allergens:'["gluten","eggs","fish","milk"]' },
    { id:"dr-v2-s2", categoryId:"dr-cat-11", name:"César gravlax",         description:"Romaine, saumon gravlax mariné, croûtons, parmesan, sauce César",      price:21.30, order:1, allergens:'["gluten","eggs","fish","milk"]' },
    { id:"dr-v2-s3", categoryId:"dr-cat-11", name:"César Saint-Jacques",   description:"Romaine, noix de Saint-Jacques snackées, parmesan, sauce César",       price:24.90, order:2, allergens:'["gluten","eggs","fish","milk","molluscs"]', badge:"Signature" },
    { id:"dr-v2-s4", categoryId:"dr-cat-11", name:"Salade burrata",        description:"Burrata crémeuse, tomates cerises, basilic frais, huile d'olive AOP",  price:18.70, order:3, allergens:'["milk"]' },
    { id:"dr-v2-s5", categoryId:"dr-cat-11", name:"Salade landaise",       description:"Magret fumé, gésiers confits, foie gras poêlé, salade verte, pignons", price:19.60, order:4 },
    { id:"dr-v2-s6", categoryId:"dr-cat-11", name:"Salade gersoise",       description:"Canard confit, gésiers, magret fumé, rillettes, œuf poché, salade mêlée", price:22.90, order:5, badge:"Maison" },
    // Carpaccio
    { id:"dr-v2-c1", categoryId:"dr-cat-16", name:"Parmesan",              description:"Carpaccio de bœuf, copeaux de parmesan, roquette, huile d'olive, citron", price:18.50, order:0, allergens:'["milk"]' },
    { id:"dr-v2-c2", categoryId:"dr-cat-16", name:"Trois saveurs",         description:"Carpaccio trio : bœuf, saumon, thon — sauce citronnée aux herbes",        price:17.90, order:1, allergens:'["fish"]' },
    { id:"dr-v2-c3", categoryId:"dr-cat-16", name:"Saveur d'Italie",       description:"Carpaccio de bœuf, stracciatella, tomates séchées, basilic, balsamique",  price:21.20, order:2, allergens:'["milk"]', badge:"Coup de cœur" },
    // Bœuf
    { id:"dr-v2-b1", categoryId:"dr-cat-17", name:"Entrecôte 350 g",       description:"Garniture au choix : frites ou salade · Sauce Roquefort, foie gras ou poivre +2,00 €", price:29.90, order:0 },
    { id:"dr-v2-b2", categoryId:"dr-cat-17", name:"Rumsteak 250 g",        description:"Garniture au choix : frites ou salade · Sauce Roquefort, foie gras ou poivre +2,00 €", price:25.70, order:1 },
    // Pièces
    { id:"dr-v2-p1", categoryId:"dr-cat-18", name:"Pavé de rumsteak Rossini", description:"Foie gras poêlé, sauce Périgueux — garniture au choix",             price:34.90, order:0, badge:"Signature" },
    { id:"dr-v2-p2", categoryId:"dr-cat-18", name:"Filet de bœuf",         description:"Garniture au choix : frites ou salade",                               price:20.50, order:1 },
    { id:"dr-v2-p3", categoryId:"dr-cat-18", name:"Tartare classique",     description:"Bœuf haché à la minute, câpres, cornichons, oignon — frites ou salade", price:20.70, order:2, allergens:'["eggs","mustard"]' },
    { id:"dr-v2-p4", categoryId:"dr-cat-18", name:"Tartare poêlé",         description:"Bœuf haché cuit à la poêle, herbes fraîches — frites ou salade",       price:20.70, order:3, allergens:'["eggs","mustard"]' },
    // Burgers
    { id:"dr-v2-bu1",categoryId:"dr-cat-19", name:"Burger Italienne",      description:"Steak haché, mozzarella, tomate, roquette, pesto — frites ou salade", price:21.20, order:0, allergens:'["gluten","milk","eggs"]' },
    { id:"dr-v2-bu2",categoryId:"dr-cat-19", name:"Burger Rossini",        description:"Steak haché, foie gras, sauce Périgueux, roquette — frites ou salade", price:21.20, order:1, allergens:'["gluten","eggs"]', badge:"Populaire" },
    // Veau & canard
    { id:"dr-v2-v1", categoryId:"dr-cat-20", name:"Escalope milanaise",    description:"Escalope de veau panée, tagliatelles fraîches, sauce tomate maison",  price:23.20, order:0, allergens:'["gluten","eggs","milk"]' },
    // La mer
    { id:"dr-v3-m1", categoryId:"dr-cat-13", name:"Calamars à la plancha",    description:"Sauce aïoli maison",                                              price:19.40, order:0, allergens:'["molluscs","eggs"]' },
    { id:"dr-v3-m2", categoryId:"dr-cat-13", name:"Saltimbocca de saumon",    description:"Saumon, jambon cru, sauge, sauce au vin blanc",                   price:22.40, order:1, allergens:'["fish","milk","sulphites"]', badge:"Signature" },
    { id:"dr-v3-m3", categoryId:"dr-cat-13", name:"Pavé de saumon",           description:"Garniture au choix : légumes de saison ou risotto",               price:23.90, order:2, allergens:'["fish"]' },
    { id:"dr-v3-m4", categoryId:"dr-cat-13", name:"Crevettes à la milanaise", description:"Crevettes panées, sauce milanaise, riz ou tagliatelles",          price:22.90, order:3, allergens:'["crustaceans","gluten","eggs","milk"]' },
    // Les pâtes
    { id:"dr-v3-p1", categoryId:"dr-cat-25", name:"Bolognaise",            description:"Bœuf haché, tomate, aromates, parmesan",                             price:16.60, order:0, allergens:'["gluten","milk"]' },
    { id:"dr-v3-p2", categoryId:"dr-cat-25", name:"Carbonara",             description:"Guanciale, œuf, pecorino romano, poivre noir",                       price:18.70, order:1, allergens:'["gluten","eggs","milk"]' },
    { id:"dr-v3-p3", categoryId:"dr-cat-25", name:"Foie gras poêlé",       description:"Foie gras frais poêlé, sauce Périgueux",                             price:25.20, order:2, allergens:'["gluten","milk"]', badge:"Signature" },
    { id:"dr-v3-p4", categoryId:"dr-cat-25", name:"Gourmandole",           description:"Sauce crème, lardons, champignons, parmesan",                        price:27.70, order:3, allergens:'["gluten","milk"]' },
    { id:"dr-v3-p5", categoryId:"dr-cat-25", name:"Saumon gravlax",        description:"Saumon mariné maison, crème aneth, citron",                          price:22.20, order:4, allergens:'["gluten","fish","milk"]' },
    { id:"dr-v3-p6", categoryId:"dr-cat-25", name:"Lasagnes maison",       description:"Bœuf, sauce tomate, béchamel, gratinées au four",                   price:18.60, order:5, allergens:'["gluten","eggs","milk"]', badge:"Maison" },
    // Risottos
    { id:"dr-v3-r1", categoryId:"dr-cat-26", name:"Risotto de Saint-Jacques",  description:"Noix de Saint-Jacques snackées, bisque de crustacés, parmesan", price:24.90, order:0, allergens:'["milk","crustaceans","molluscs"]', badge:"Signature" },
    { id:"dr-v3-r2", categoryId:"dr-cat-26", name:"Risotto de calamars",       description:"Calamars à l'encre, sauce vierge, herbes fraîches",              price:21.30, order:1, allergens:'["milk","molluscs"]' },
    { id:"dr-v3-r3", categoryId:"dr-cat-26", name:"Risotto de saumon gravlax", description:"Saumon mariné maison, crème aneth, zeste de citron",             price:22.20, order:2, allergens:'["milk","fish"]' },
    // Pizzas base tomate
    { id:"dr-v3-pt1",  categoryId:"dr-cat-14", name:"Margherita",    description:"Tomate, mozzarella, basilic",                                         price:13.90, order:0 },
    { id:"dr-v3-pt2",  categoryId:"dr-cat-14", name:"Senesia",       description:"Tomate, mozzarella, jambon, champignons, olives",                     price:13.90, order:1 },
    { id:"dr-v3-pt3",  categoryId:"dr-cat-14", name:"Reine",         description:"Tomate, mozzarella, jambon, champignons",                             price:13.90, order:2 },
    { id:"dr-v3-pt4",  categoryId:"dr-cat-14", name:"Impérial",      description:"Tomate, mozzarella, jambon, lardons, œuf",                            price:14.90, order:3 },
    { id:"dr-v3-pt5",  categoryId:"dr-cat-14", name:"Pepperoni",     description:"Tomate, mozzarella, pepperoni",                                       price:13.90, order:4 },
    { id:"dr-v3-pt6",  categoryId:"dr-cat-14", name:"Texane",        description:"Tomate, mozzarella, bœuf haché, oignon, poivrons",                    price:14.90, order:5 },
    { id:"dr-v3-pt7",  categoryId:"dr-cat-14", name:"Mécane",        description:"Tomate, mozzarella, merguez, harissa, poivrons",                      price:14.90, order:6 },
    { id:"dr-v3-pt8",  categoryId:"dr-cat-14", name:"Gyroma",        description:"Tomate, mozzarella, kebab, oignons, sauce blanche",                   price:14.90, order:7 },
    { id:"dr-v3-pt9",  categoryId:"dr-cat-14", name:"Calzone",       description:"Tomate, mozzarella, jambon, champignons — farcie et dorée au four",   price:14.90, order:8, allergens:'["gluten","milk","eggs"]' },
    { id:"dr-v3-pt10", categoryId:"dr-cat-14", name:"Italie",        description:"Tomate, mozzarella, jambon cru, roquette, parmesan, basilic",         price:15.90, order:9, allergens:'["milk"]', badge:"Signature" },
    { id:"dr-v3-pt11", categoryId:"dr-cat-14", name:"Original",      description:"Tomate, mozzarella, anchois, olives, câpres",                        price:13.90, order:10, allergens:'["fish","milk"]' },
    // Pizzas base crème
    { id:"dr-v3-pc1",  categoryId:"dr-cat-27", name:"Forestière",       description:"Crème, mozzarella, champignons, lardons, persil",                price:14.90, order:0 },
    { id:"dr-v3-pc2",  categoryId:"dr-cat-27", name:"Poulet curry",     description:"Crème, mozzarella, poulet, curry, poivrons",                     price:14.90, order:1 },
    { id:"dr-v3-pc3",  categoryId:"dr-cat-27", name:"Magnète Suprême",  description:"Crème, mozzarella, jambon, champignons, poivrons, oignons",      price:14.90, order:2 },
    { id:"dr-v3-pc4",  categoryId:"dr-cat-27", name:"Meetness Séga",    description:"Crème, mozzarella, bœuf épicé, oignons, poivrons, piment doux", price:15.90, order:3 },
    { id:"dr-v3-pc5",  categoryId:"dr-cat-27", name:"Parmesan",         description:"Crème, mozzarella, parmesan, roquette, huile d'olive, basilic",  price:14.90, order:4, allergens:'["milk"]', badge:"Coup de cœur" },
    { id:"dr-v3-pc6",  categoryId:"dr-cat-27", name:"Carbonara",        description:"Crème, mozzarella, lardons, œuf, pecorino",                     price:14.90, order:5, allergens:'["milk","eggs"]' },
    { id:"dr-v3-pc7",  categoryId:"dr-cat-27", name:"Carizzo",          description:"Crème, mozzarella, chèvre frais, miel, noix, roquette",         price:15.90, order:6, allergens:'["milk","nuts"]' },
    { id:"dr-v3-pc8",  categoryId:"dr-cat-27", name:"Quatre fromages",  description:"Crème, mozzarella, gorgonzola, taleggio, parmesan",             price:15.90, order:7, allergens:'["milk"]' },
    { id:"dr-v3-pc9",  categoryId:"dr-cat-27", name:"Normande",         description:"Crème, mozzarella, camembert, pommes, lardons",                 price:14.90, order:8, allergens:'["milk"]' },
    { id:"dr-v3-pc10", categoryId:"dr-cat-27", name:"Saumon",           description:"Crème, mozzarella, saumon fumé, câpres, citron",               price:15.90, order:9, allergens:'["fish","milk"]' },
    // Desserts
    { id:"dr-d46", categoryId:"dr-cat-15", name:"Tiramisù Maison",    description:"Mascarpone, biscuit savoiardi, café, cacao amer",                  price:8.90,  order:0, allergens:'["gluten","eggs","milk"]', badge:"Maison" },
    { id:"dr-d47", categoryId:"dr-cat-15", name:"Pannacotta Vanille", description:"Coulis de fruits rouges, menthe fraîche",                          price:7.90,  order:1, allergens:'["milk"]' },
    { id:"dr-d48", categoryId:"dr-cat-15", name:"Cannoli Siciliani",  description:"Pâte croustillante, ricotta citronnée, pistache",                 price:8.50,  order:2, allergens:'["gluten","eggs","milk","nuts"]' },
    { id:"dr-d49", categoryId:"dr-cat-15", name:"Gelato Artigianale", description:"2 boules au choix : vanille, pistache, chocolat, stracciatella",  price:6.90,  order:3, allergens:'["milk","eggs"]' },
    { id:"dr-d50", categoryId:"dr-cat-15", name:"Café Espresso",      description:"Grain Arabica, torréfaction artisanale",                          price:2.50,  order:4 },
    { id:"dr-d51", categoryId:"dr-cat-15", name:"Cappuccino",         description:"Espresso, lait moussé, poudre de cacao",                          price:3.50,  order:5, allergens:'["milk"]' },
  ];

  for (const d of dishes) {
    await prisma.dish.upsert({
      where: { id: d.id },
      update: {},
      create: { id: d.id, name: d.name, description: d.description, price: d.price, order: d.order, allergens: d.allergens ?? "[]", badge: d.badge ?? null, available: true, categoryId: d.categoryId },
    });
  }
  console.log(`✓ ${dishes.length} plats`);
  console.log("\n✅ Seed Vercel terminé !");
}

main().catch(console.error).finally(() => prisma.$disconnect());
