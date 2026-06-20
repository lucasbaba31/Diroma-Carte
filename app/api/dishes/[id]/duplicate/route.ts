import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const dish = await prisma.dish.findFirst({
    where: { id },
    include: { category: { include: { restaurant: true } } },
  });

  if (!dish || dish.category.restaurant.userId !== session.user.id) {
    return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  }

  const count = await prisma.dish.count({ where: { categoryId: dish.categoryId } });
  const copy = await prisma.dish.create({
    data: {
      name: `${dish.name} (copie)`,
      description: dish.description,
      price: dish.price,
      allergens: dish.allergens,
      badge: dish.badge,
      image: dish.image,
      categoryId: dish.categoryId,
      order: count,
      available: dish.available,
    },
  });

  return NextResponse.json(copy, { status: 201 });
}
