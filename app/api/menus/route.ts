import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  format: z.enum(["A4_PORTRAIT", "A4_LANDSCAPE", "A5", "FOLDED", "DOUBLE_PAGE", "DRINKS_CARD"]).optional(),
  restaurantId: z.string(),
  templateId: z.string().optional(),
  themeId: z.string().optional(),
  blocks: z.array(z.any()).optional(),
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

    let blocks = data.blocks ?? [];

    if (data.templateId && blocks.length === 0) {
      const template = await prisma.template.findUnique({ where: { id: data.templateId } });
      if (template) blocks = template.blocks as object[];
    }

    const menu = await prisma.menu.create({
      data: {
        name: data.name,
        description: data.description,
        format: data.format ?? "A4_PORTRAIT",
        restaurantId: data.restaurantId,
        templateId: data.templateId,
        themeId: data.themeId,
        blocks,
      },
    });

    return NextResponse.json(menu, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
