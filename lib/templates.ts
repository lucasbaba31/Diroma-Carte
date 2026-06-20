import { MenuBlock, Template } from "@/types";
import { generateId } from "./utils";

function makeBlock(
  type: MenuBlock["type"],
  overrides: Partial<MenuBlock> = {}
): MenuBlock {
  return {
    id: generateId(),
    type,
    style: {},
    position: { x: 0, y: 0 },
    size: { width: "100%", height: "auto" },
    order: 0,
    visible: true,
    ...overrides,
  };
}

export const DEFAULT_TEMPLATES: Omit<Template, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "Restaurant Gastronomique",
    description: "Élégant et raffiné, idéal pour les tables gastronomiques",
    category: "gastronomique",
    thumbnail: "/templates/gastro.jpg",
    isPublic: true,
    blocks: [
      makeBlock("RESTAURANT_LOGO", {
        order: 0,
        style: { textAlign: "center", padding: { top: 32, right: 0, bottom: 16, left: 0 } },
        size: { width: "100%", height: 120 },
        variable: "restaurant.logo",
      }),
      makeBlock("RESTAURANT_NAME", {
        order: 1,
        style: {
          fontFamily: "Playfair Display",
          fontSize: 32,
          fontWeight: "700",
          textAlign: "center",
          color: "#1a1a1a",
          letterSpacing: 3,
          textTransform: "uppercase",
          padding: { top: 8, right: 0, bottom: 8, left: 0 },
        },
        variable: "restaurant.name",
      }),
      makeBlock("SEPARATOR", {
        order: 2,
        style: {
          color: "#c9a96e",
          margin: { top: 16, right: 48, bottom: 16, left: 48 },
        },
        size: { width: "100%", height: 2 },
      }),
      makeBlock("CATEGORY_TITLE", {
        order: 3,
        style: {
          fontFamily: "Playfair Display",
          fontSize: 20,
          fontWeight: "600",
          textAlign: "center",
          color: "#c9a96e",
          textTransform: "uppercase",
          letterSpacing: 2,
          padding: { top: 24, right: 0, bottom: 12, left: 0 },
        },
        variable: "category.name",
      }),
      makeBlock("DISH_ITEM", {
        order: 4,
        style: {
          fontFamily: "Cormorant Garamond",
          fontSize: 16,
          padding: { top: 8, right: 24, bottom: 8, left: 24 },
        },
        variable: "dish",
      }),
    ],
  },
  {
    name: "Brasserie Traditionnelle",
    description: "Convivial et chaleureux, parfait pour les brasseries",
    category: "brasserie",
    thumbnail: "/templates/brasserie.jpg",
    isPublic: true,
    blocks: [
      makeBlock("RESTAURANT_NAME", {
        order: 0,
        style: {
          fontFamily: "Merriweather",
          fontSize: 28,
          fontWeight: "700",
          textAlign: "center",
          color: "#2c1810",
          backgroundColor: "#f5e6d3",
          padding: { top: 24, right: 24, bottom: 24, left: 24 },
        },
        variable: "restaurant.name",
      }),
      makeBlock("CATEGORY_TITLE", {
        order: 1,
        style: {
          fontFamily: "Merriweather",
          fontSize: 18,
          fontWeight: "700",
          color: "#ffffff",
          backgroundColor: "#8b2635",
          padding: { top: 10, right: 16, bottom: 10, left: 16 },
          margin: { top: 16, right: 0, bottom: 8, left: 0 },
        },
        variable: "category.name",
      }),
      makeBlock("DISH_ITEM", {
        order: 2,
        style: {
          fontFamily: "Lato",
          fontSize: 15,
          padding: { top: 6, right: 16, bottom: 6, left: 16 },
        },
        variable: "dish",
      }),
    ],
  },
  {
    name: "Fast Food Moderne",
    description: "Dynamique et lisible, idéal pour les restos rapides",
    category: "fast-food",
    thumbnail: "/templates/fastfood.jpg",
    isPublic: true,
    blocks: [
      makeBlock("RESTAURANT_NAME", {
        order: 0,
        style: {
          fontFamily: "Montserrat",
          fontSize: 36,
          fontWeight: "800",
          textAlign: "center",
          color: "#ffffff",
          backgroundColor: "#e63946",
          padding: { top: 20, right: 0, bottom: 20, left: 0 },
          textTransform: "uppercase",
        },
        variable: "restaurant.name",
      }),
      makeBlock("CATEGORY_TITLE", {
        order: 1,
        style: {
          fontFamily: "Montserrat",
          fontSize: 16,
          fontWeight: "700",
          color: "#e63946",
          textTransform: "uppercase",
          letterSpacing: 2,
          padding: { top: 20, right: 0, bottom: 8, left: 16 },
          border: { width: 0, style: "solid", color: "transparent", radius: 0 },
        },
        variable: "category.name",
      }),
      makeBlock("DISH_ITEM", {
        order: 2,
        style: {
          fontFamily: "Montserrat",
          fontSize: 14,
          padding: { top: 4, right: 16, bottom: 4, left: 16 },
        },
        variable: "dish",
      }),
    ],
  },
  {
    name: "Bar à Cocktails",
    description: "Élégant et sombre, parfait pour les bars et cocktails",
    category: "bar",
    thumbnail: "/templates/bar.jpg",
    isPublic: true,
    blocks: [
      makeBlock("RESTAURANT_NAME", {
        order: 0,
        style: {
          fontFamily: "Cinzel",
          fontSize: 30,
          fontWeight: "700",
          textAlign: "center",
          color: "#d4af37",
          backgroundColor: "#0d0d0d",
          padding: { top: 32, right: 0, bottom: 16, left: 0 },
          letterSpacing: 4,
        },
        variable: "restaurant.name",
      }),
      makeBlock("SEPARATOR", {
        order: 1,
        style: { color: "#d4af37", margin: { top: 0, right: 48, bottom: 24, left: 48 } },
        size: { width: "100%", height: 1 },
      }),
      makeBlock("CATEGORY_TITLE", {
        order: 2,
        style: {
          fontFamily: "Cinzel",
          fontSize: 18,
          textAlign: "center",
          color: "#d4af37",
          letterSpacing: 3,
          textTransform: "uppercase",
          padding: { top: 20, right: 0, bottom: 12, left: 0 },
        },
        variable: "category.name",
      }),
      makeBlock("DISH_ITEM", {
        order: 3,
        style: {
          fontFamily: "Lato",
          fontSize: 15,
          color: "#e0e0e0",
          backgroundColor: "#0d0d0d",
          padding: { top: 8, right: 24, bottom: 8, left: 24 },
        },
        variable: "dish",
      }),
    ],
  },
  {
    name: "Café Parisien",
    description: "Simple et chic, idéal pour les cafés et bistrots",
    category: "cafe",
    thumbnail: "/templates/cafe.jpg",
    isPublic: true,
    blocks: [
      makeBlock("RESTAURANT_NAME", {
        order: 0,
        style: {
          fontFamily: "Dancing Script",
          fontSize: 42,
          fontWeight: "700",
          textAlign: "center",
          color: "#3d2b1f",
          padding: { top: 24, right: 0, bottom: 8, left: 0 },
        },
        variable: "restaurant.name",
      }),
      makeBlock("RESTAURANT_PHONE", {
        order: 1,
        style: {
          fontFamily: "Lato",
          fontSize: 13,
          textAlign: "center",
          color: "#888",
          padding: { top: 0, right: 0, bottom: 16, left: 0 },
        },
        variable: "restaurant.phone",
      }),
      makeBlock("CATEGORY_TITLE", {
        order: 2,
        style: {
          fontFamily: "Dancing Script",
          fontSize: 26,
          color: "#3d2b1f",
          padding: { top: 20, right: 16, bottom: 4, left: 16 },
        },
        variable: "category.name",
      }),
      makeBlock("SEPARATOR", {
        order: 3,
        style: { color: "#c8a97e", margin: { top: 0, right: 16, bottom: 8, left: 16 } },
        size: { width: "calc(100% - 32px)", height: 1 },
      }),
      makeBlock("DISH_ITEM", {
        order: 4,
        style: {
          fontFamily: "Lato",
          fontSize: 14,
          padding: { top: 5, right: 16, bottom: 5, left: 16 },
        },
        variable: "dish",
      }),
    ],
  },
];
