import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  restaurantId: z.string(),
  order: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const restaurant = await prisma.restaurant.findFirst({
      where: { id: data.restaurantId, userId: session.user.id },
    });
    if (!restaurant) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

    const count = await prisma.category.count({ where: { restaurantId: data.restaurantId } });
    const category = await prisma.category.create({
      data: { ...data, order: data.order ?? count },
      include: { dishes: true },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
