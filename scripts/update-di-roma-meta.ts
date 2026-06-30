import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const adapter = new PrismaBetterSqlite3({ url: `file:${path.resolve("prisma/dev.db")}` });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  await prisma.restaurant.update({
    where: { id: "di-roma" },
    data: {
      name: "Restaurant d'Iroma au Cambille",
      description: "Cuisine italienne et spécialités au feu de bois",
    },
  });
  console.log("✓ Restaurant mis à jour");
  await prisma.$disconnect();
}
main().catch(console.error);
