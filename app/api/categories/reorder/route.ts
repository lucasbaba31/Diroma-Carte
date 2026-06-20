import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { restaurantId, ids } = await req.json();

  const restaurant = await prisma.restaurant.findFirst({
    where: { id: restaurantId, userId: session.user.id },
  });
  if (!restaurant) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  await Promise.all(
    (ids as string[]).map((id, index) =>
      prisma.category.update({ where: { id }, data: { order: index } })
    )
  );

  return NextResponse.json({ success: true });
}
