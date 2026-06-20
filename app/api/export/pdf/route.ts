import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { menuId } = await req.json();

  const menu = await prisma.menu.findFirst({
    where: { id: menuId },
    include: { restaurant: true },
  });

  if (!menu || menu.restaurant.userId !== session.user.id) {
    return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  }

  return NextResponse.json({
    url: `/export/${menuId}`,
    message: "Utilisez la page d'export pour générer le PDF via html2canvas + jsPDF",
  });
}
