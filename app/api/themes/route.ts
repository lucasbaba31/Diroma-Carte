import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  restaurantId: z.string(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    text: z.string(),
    muted: z.string(),
  }),
  fonts: z.object({
    heading: z.string(),
    body: z.string(),
    accent: z.string(),
  }),
  spacing: z.object({
    categoryGap: z.number(),
    dishGap: z.number(),
    pagePadding: z.number(),
  }).optional(),
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

    const theme = await prisma.theme.create({ data });
    return NextResponse.json(theme, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
