import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MenuBlock, RenderContext } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

export function resolveVariable(
  variable: string,
  context: RenderContext
): string {
  const { restaurant, currentDate } = context;

  const map: Record<string, string> = {
    "restaurant.name": restaurant.name,
    "restaurant.logo": restaurant.logo ?? "",
    "restaurant.phone": restaurant.phone ?? "",
    "restaurant.address": restaurant.address ?? "",
    "restaurant.website": restaurant.website ?? "",
    date: currentDate,
  };

  return map[variable] ?? variable;
}

export function resolveBlockContent(
  block: MenuBlock,
  context: RenderContext
): string {
  if (block.variable) {
    return resolveVariable(block.variable, context);
  }
  return block.content ?? "";
}

export const FORMAT_DIMENSIONS: Record<
  string,
  { width: number; height: number; label: string }
> = {
  A4_PORTRAIT: { width: 794, height: 1123, label: "A4 Portrait" },
  A4_LANDSCAPE: { width: 1123, height: 794, label: "A4 Paysage" },
  A5: { width: 559, height: 794, label: "A5" },
  FOLDED: { width: 794, height: 1123, label: "Menu plié" },
  DOUBLE_PAGE: { width: 1588, height: 1123, label: "Double page" },
  DRINKS_CARD: { width: 794, height: 1123, label: "Carte boissons" },
};

export const ALLERGEN_LABELS: Record<string, string> = {
  gluten: "Gluten",
  crustaceans: "Crustacés",
  eggs: "Œufs",
  fish: "Poisson",
  peanuts: "Cacahuètes",
  soy: "Soja",
  milk: "Lait",
  nuts: "Fruits à coque",
  celery: "Céleri",
  mustard: "Moutarde",
  sesame: "Sésame",
  sulphites: "Sulfites",
  lupin: "Lupin",
  molluscs: "Mollusques",
};

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
