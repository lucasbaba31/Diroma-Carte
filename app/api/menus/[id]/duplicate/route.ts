import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const menu = await prisma.menu.findFirst({
    where: { id },
    include: { restaurant: true },
  });

  if (!menu || menu.restaurant.userId !== session.user.id) {
    return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  }

  const copy = await prisma.menu.create({
    data: {
      name: `${menu.name} (copie)`,
      description: menu.description ?? undefined,
      format: menu.format,
      restaurantId: menu.restaurantId,
      templateId: menu.templateId ?? undefined,
      themeId: menu.themeId ?? undefined,
      blocks: menu.blocks as object[],
    },
  });

  return NextResponse.json(copy, { status: 201 });
}
