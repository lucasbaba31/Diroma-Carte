import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getMenu(id: string, userId: string) {
  return prisma.menu.findFirst({
    where: { id },
    include: { restaurant: true, versions: { orderBy: { createdAt: "desc" }, take: 20 } },
  }).then((m) => (m?.restaurant.userId === userId ? m : null));
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const menu = await getMenu(id, session.user.id);
  if (!menu) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  return NextResponse.json(menu);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const menu = await getMenu(id, session.user.id);
  if (!menu) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

  const body = await req.json();

  if (body.blocks) {
    await prisma.menuVersion.create({
      data: {
        menuId: id,
        blocks: menu.blocks as object[],
        themeId: menu.themeId ?? undefined,
        name: `Version ${new Date().toLocaleString("fr-FR")}`,
      },
    });
  }

  const updated = await prisma.menu.update({ where: { id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const menu = await getMenu(id, session.user.id);
  if (!menu) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

  await prisma.menu.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
