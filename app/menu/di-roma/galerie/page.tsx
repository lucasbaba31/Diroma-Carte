import { prisma } from "@/lib/prisma";
import { GalleryClient } from "./gallery-client";

export default async function GaleriePage() {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: "di-roma" },
    include: {
      categories: {
        orderBy: { order: "asc" },
        include: { dishes: { where: { available: true }, orderBy: { order: "asc" } } },
      },
    },
  });

  if (!restaurant) return <div>Restaurant introuvable</div>;

  const categories = restaurant.categories
    .filter(c => c.dishes.length > 0)
    .map(c => ({ id: c.id, name: c.name }));

  const dishes = restaurant.categories.flatMap(c =>
    c.dishes.map(d => ({
      id: d.id,
      name: d.name,
      description: d.description,
      price: d.price.toString(),
      badge: d.badge,
      image: d.image,
      categoryName: c.name,
      categoryId: c.id,
    }))
  );

  return <GalleryClient dishes={dishes} categories={categories} />;
}
