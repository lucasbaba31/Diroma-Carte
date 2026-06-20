import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getRestaurant(id: string, userId: string) {
  return prisma.restaurant.findFirst({ where: { id, userId } });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const restaurant = await prisma.restaurant.findFirst({
    where: { id, userId: session.user.id },
    include: {
      categories: {
        include: { dishes: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
      themes: true,
      menus: { orderBy: { updatedAt: "desc" } },
    },
  });

  if (!restaurant) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  return NextResponse.json(restaurant);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const existing = await getRestaurant(id, session.user.id);
  if (!existing) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.restaurant.update({ where: { id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const existing = await getRestaurant(id, session.user.id);
  if (!existing) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

  await prisma.restaurant.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
