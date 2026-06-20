import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DEFAULT_TEMPLATES } from "../lib/templates";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log("Seeding templates...");

  await prisma.template.deleteMany({});

  for (const template of DEFAULT_TEMPLATES) {
    await prisma.template.create({
      data: {
        name: template.name,
        description: template.description ?? null,
        category: template.category,
        thumbnail: template.thumbnail ?? null,
        blocks: template.blocks as object[],
        isPublic: template.isPublic,
      },
    });
    console.log(`  ✓ ${template.name}`);
  }

  console.log("Seeding complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
