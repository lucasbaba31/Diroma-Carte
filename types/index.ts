export type MenuFormat =
  | "A4_PORTRAIT"
  | "A4_LANDSCAPE"
  | "A5"
  | "FOLDED"
  | "DOUBLE_PAGE"
  | "DRINKS_CARD";

export type BlockType =
  | "RESTAURANT_NAME"
  | "RESTAURANT_LOGO"
  | "RESTAURANT_PHONE"
  | "RESTAURANT_ADDRESS"
  | "CATEGORY_TITLE"
  | "DISH_ITEM"
  | "DISH_NAME"
  | "DISH_PRICE"
  | "DISH_DESCRIPTION"
  | "DISH_ALLERGENS"
  | "DISH_IMAGE"
  | "SEPARATOR"
  | "FREE_TEXT"
  | "PROMOTION"
  | "CHEF_SIGNATURE"
  | "LEGAL_INFO"
  | "DECORATIVE"
  | "SPACER";

export interface BlockStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  padding?: { top: number; right: number; bottom: number; left: number };
  margin?: { top: number; right: number; bottom: number; left: number };
  border?: {
    width: number;
    style: string;
    color: string;
    radius?: number;
  };
  opacity?: number;
  letterSpacing?: number;
  lineHeight?: number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
}

export interface MenuBlock {
  id: string;
  type: BlockType;
  content?: string;
  variable?: string;
  style: BlockStyle;
  position: { x: number; y: number };
  size: { width: number | string; height: number | string };
  order: number;
  visible: boolean;
  dataBinding?: {
    categoryId?: string;
    dishId?: string;
  };
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
  accent: string;
}

export interface Theme {
  id: string;
  name: string;
  restaurantId: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  spacing?: {
    categoryGap: number;
    dishGap: number;
    pagePadding: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Dish {
  id: string;
  name: string;
  description?: string;
  price: number;
  allergens: string[];
  badge?: string;
  image?: string;
  categoryId: string;
  order: number;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
  restaurantId: string;
  dishes: Dish[];
  createdAt: string;
  updatedAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  phone?: string;
  address?: string;
  website?: string;
  userId: string;
  categories: Category[];
  themes: Theme[];
  createdAt: string;
  updatedAt: string;
}

export interface Menu {
  id: string;
  name: string;
  description?: string;
  format: MenuFormat;
  restaurantId: string;
  templateId?: string;
  themeId?: string;
  blocks: MenuBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuVersion {
  id: string;
  menuId: string;
  name?: string;
  blocks: MenuBlock[];
  themeId?: string;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  thumbnail?: string;
  blocks: MenuBlock[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RenderContext {
  restaurant: Restaurant;
  categories: Category[];
  currentDate: string;
}
