"use client";

import { create } from "zustand";
import { Category, Dish, Menu, MenuBlock, Restaurant, Theme } from "@/types";

interface MenuStore {
  restaurant: Restaurant | null;
  categories: Category[];
  activeMenu: Menu | null;
  selectedBlockId: string | null;
  activeTheme: Theme | null;
  isPreviewMode: boolean;

  setRestaurant: (r: Restaurant) => void;
  setCategories: (cats: Category[]) => void;
  setActiveMenu: (menu: Menu) => void;
  setSelectedBlock: (id: string | null) => void;
  setActiveTheme: (theme: Theme | null) => void;
  togglePreviewMode: () => void;

  addCategory: (cat: Category) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (ids: string[]) => void;

  addDish: (dish: Dish) => void;
  updateDish: (id: string, data: Partial<Dish>) => void;
  deleteDish: (id: string) => void;
  reorderDishes: (categoryId: string, ids: string[]) => void;

  updateBlock: (id: string, data: Partial<MenuBlock>) => void;
  addBlock: (block: MenuBlock) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (ids: string[]) => void;
}

export const useMenuStore = create<MenuStore>((set, get) => ({
  restaurant: null,
  categories: [],
  activeMenu: null,
  selectedBlockId: null,
  activeTheme: null,
  isPreviewMode: false,

  setRestaurant: (r) => set({ restaurant: r }),
  setCategories: (cats) => set({ categories: cats }),
  setActiveMenu: (menu) => set({ activeMenu: menu }),
  setSelectedBlock: (id) => set({ selectedBlockId: id }),
  setActiveTheme: (theme) => set({ activeTheme: theme }),
  togglePreviewMode: () => set((s) => ({ isPreviewMode: !s.isPreviewMode })),

  addCategory: (cat) =>
    set((s) => ({ categories: [...s.categories, cat] })),

  updateCategory: (id, data) =>
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
    })),

  deleteCategory: (id) =>
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

  reorderCategories: (ids) =>
    set((s) => {
      const map = Object.fromEntries(s.categories.map((c) => [c.id, c]));
      return { categories: ids.map((id) => map[id]).filter(Boolean) };
    }),

  addDish: (dish) =>
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === dish.categoryId
          ? { ...c, dishes: [...(c.dishes ?? []), dish] }
          : c
      ),
    })),

  updateDish: (id, data) =>
    set((s) => ({
      categories: s.categories.map((c) => ({
        ...c,
        dishes: (c.dishes ?? []).map((d) =>
          d.id === id ? { ...d, ...data } : d
        ),
      })),
    })),

  deleteDish: (id) =>
    set((s) => ({
      categories: s.categories.map((c) => ({
        ...c,
        dishes: (c.dishes ?? []).filter((d) => d.id !== id),
      })),
    })),

  reorderDishes: (categoryId, ids) =>
    set((s) => ({
      categories: s.categories.map((c) => {
        if (c.id !== categoryId) return c;
        const map = Object.fromEntries((c.dishes ?? []).map((d) => [d.id, d]));
        return { ...c, dishes: ids.map((id) => map[id]).filter(Boolean) };
      }),
    })),

  updateBlock: (id, data) =>
    set((s) => {
      if (!s.activeMenu) return {};
      return {
        activeMenu: {
          ...s.activeMenu,
          blocks: s.activeMenu.blocks.map((b) =>
            b.id === id ? { ...b, ...data } : b
          ),
        },
      };
    }),

  addBlock: (block) =>
    set((s) => {
      if (!s.activeMenu) return {};
      return {
        activeMenu: {
          ...s.activeMenu,
          blocks: [...s.activeMenu.blocks, block],
        },
      };
    }),

  removeBlock: (id) =>
    set((s) => {
      if (!s.activeMenu) return {};
      return {
        activeMenu: {
          ...s.activeMenu,
          blocks: s.activeMenu.blocks.filter((b) => b.id !== id),
        },
      };
    }),

  reorderBlocks: (ids) =>
    set((s) => {
      if (!s.activeMenu) return {};
      const map = Object.fromEntries(s.activeMenu.blocks.map((b) => [b.id, b]));
      return {
        activeMenu: {
          ...s.activeMenu,
          blocks: ids.map((id) => map[id]).filter(Boolean),
        },
      };
    }),
}));
