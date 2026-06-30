import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";
import path from "path";

const adapter = new PrismaBetterSqlite3({ url: `file:${path.resolve("prisma/dev.db")}` });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function run() {
  const r = await prisma.restaurant.findUnique({
    where: { id: "di-roma" },
    include: { categories: { include: { dishes: true }, orderBy: { order: "asc" } } },
  });
  if (!r) { console.log("NOT FOUND"); return; }
  r.categories.forEach((c) => {
    const avail = c.dishes.filter((d) => d.available).length;
    console.log(`${c.id} | ${c.name} | total:${c.dishes.length} available:${avail}`);
  });
  await prisma.$disconnect();
}
run().catch(console.error);
