import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getDish(id: string, userId: string) {
  return prisma.dish.findFirst({
    where: { id },
    include: { category: { include: { restaurant: true } } },
  }).then((d) => (d?.category.restaurant.userId === userId ? d : null));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const dish = await getDish(id, session.user.id);
  if (!dish) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.dish.update({ where: { id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const dish = await getDish(id, session.user.id);
  if (!dish) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

  await prisma.dish.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
