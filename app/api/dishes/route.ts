import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  allergens: z.array(z.string()).optional(),
  badge: z.string().optional(),
  image: z.string().optional(),
  categoryId: z.string(),
  order: z.number().optional(),
  available: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const category = await prisma.category.findFirst({
      where: { id: data.categoryId },
      include: { restaurant: true },
    });
    if (!category || category.restaurant.userId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const count = await prisma.dish.count({ where: { categoryId: data.categoryId } });
    const dish = await prisma.dish.create({
      data: {
        ...data,
        price: data.price,
        allergens: JSON.stringify(data.allergens ?? []),
        order: data.order ?? count,
        available: data.available ?? true,
      },
    });

    return NextResponse.json(dish, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
