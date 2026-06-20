import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  logo: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const restaurants = await prisma.restaurant.findMany({
    where: { userId: session.user.id },
    include: {
      categories: {
        include: { dishes: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
      themes: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(restaurants);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const restaurant = await prisma.restaurant.create({
      data: { ...data, userId: session.user.id },
    });

    return NextResponse.json(restaurant, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 422 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
