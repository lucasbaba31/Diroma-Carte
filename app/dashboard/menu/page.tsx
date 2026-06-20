"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Search, Pencil, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CategorySection } from "@/components/dashboard/category-section";
import { Category, Dish, Menu, Restaurant } from "@/types";
import { toast } from "@/hooks/use-toast";
import { FORMAT_DIMENSIONS } from "@/lib/utils";

function SortableCategory({
  category,
  ...props
}: {
  category: Category;
} & Omit<React.ComponentProps<typeof CategorySection>, "category" | "dragHandleProps">) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CategorySection
        category={category}
        dragHandleProps={{ ...attributes, ...listeners } as React.HTMLAttributes<HTMLButtonElement>}
        {...props}
      />
    </div>
  );
}

function MenuContent() {
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get("restaurantId");
  const router = useRouter();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuFormat, setNewMenuFormat] = useState("A4_PORTRAIT");
  const [creatingMenu, setCreatingMenu] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchData = useCallback(async () => {
    if (!restaurantId) return;
    const res = await fetch(`/api/restaurants/${restaurantId}`);
    if (!res.ok) { router.push("/dashboard"); return; }
    const data = await res.json();
    setRestaurant(data);
    setMenus(data.menus ?? []);
    setLoading(false);
  }, [restaurantId, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const categories = restaurant?.categories ?? [];

  const filteredCategories = categories.map((c) => ({
    ...c,
    dishes: (c.dishes ?? []).filter(
      (d) =>
        !search ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.description?.toLowerCase().includes(search.toLowerCase())
    ),
  }));

  const handleAddCategory = async () => {
    const name = prompt("Nom de la catégorie :");
    if (!name?.trim()) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), restaurantId }),
    });
    if (res.ok) {
      const cat = await res.json();
      setRestaurant((prev) =>
        prev ? { ...prev, categories: [...prev.categories, cat] } : prev
      );
      toast({ title: "Catégorie ajoutée", variant: "success" });
    }
  };

  const handleUpdateCategory = async (id: string, data: Partial<Category>) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setRestaurant((prev) =>
        prev
          ? {
              ...prev,
              categories: prev.categories.map((c) => (c.id === id ? updated : c)),
            }
          : prev
      );
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setRestaurant((prev) =>
        prev
          ? { ...prev, categories: prev.categories.filter((c) => c.id !== id) }
          : prev
      );
    }
  };

  const handleAddDish = async (data: Partial<Dish>) => {
    const res = await fetch("/api/dishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const dish = await res.json();
      setRestaurant((prev) =>
        prev
          ? {
              ...prev,
              categories: prev.categories.map((c) =>
                c.id === dish.categoryId
                  ? { ...c, dishes: [...(c.dishes ?? []), dish] }
                  : c
              ),
            }
          : prev
      );
    }
  };

  const handleUpdateDish = async (id: string, data: Partial<Dish>) => {
    const res = await fetch(`/api/dishes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setRestaurant((prev) =>
        prev
          ? {
              ...prev,
              categories: prev.categories.map((c) => ({
                ...c,
                dishes: (c.dishes ?? []).map((d) => (d.id === id ? updated : d)),
              })),
            }
          : prev
      );
    }
  };

  const handleDeleteDish = async (id: string) => {
    const res = await fetch(`/api/dishes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setRestaurant((prev) =>
        prev
          ? {
              ...prev,
              categories: prev.categories.map((c) => ({
                ...c,
                dishes: (c.dishes ?? []).filter((d) => d.id !== id),
              })),
            }
          : prev
      );
    }
  };

  const handleDuplicateDish = async (id: string) => {
    const res = await fetch(`/api/dishes/${id}/duplicate`, { method: "POST" });
    if (res.ok) {
      const dish = await res.json();
      setRestaurant((prev) =>
        prev
          ? {
              ...prev,
              categories: prev.categories.map((c) =>
                c.id === dish.categoryId
                  ? { ...c, dishes: [...(c.dishes ?? []), dish] }
                  : c
              ),
            }
          : prev
      );
      toast({ title: "Plat dupliqué", variant: "success" });
    }
  };

  const handleReorderDishes = async (categoryId: string, ids: string[]) => {
    const cat = restaurant?.categories.find((c) => c.id === categoryId);
    if (!cat) return;
    const dishMap = Object.fromEntries((cat.dishes ?? []).map((d) => [d.id, d]));
    const reordered = ids.map((id) => dishMap[id]).filter(Boolean);
    setRestaurant((prev) =>
      prev
        ? {
            ...prev,
            categories: prev.categories.map((c) =>
              c.id === categoryId ? { ...c, dishes: reordered } : c
            ),
          }
        : prev
    );
    await Promise.all(
      ids.map((id, i) =>
        fetch(`/api/dishes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: i }),
        })
      )
    );
  };

  const handleCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !restaurant) return;
    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const newOrder = arrayMove(categories, oldIndex, newIndex);
    setRestaurant((prev) =>
      prev ? { ...prev, categories: newOrder } : prev
    );
    await fetch("/api/categories/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId,
        ids: newOrder.map((c) => c.id),
      }),
    });
  };

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingMenu(true);
    const res = await fetch("/api/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newMenuName,
        format: newMenuFormat,
        restaurantId,
      }),
    });
    setCreatingMenu(false);
    if (res.ok) {
      const menu = await res.json();
      setMenus((prev) => [menu, ...prev]);
      setCreateMenuOpen(false);
      setNewMenuName("");
      router.push(`/editor/${menu.id}`);
    }
  };

  const handleDuplicateMenu = async (id: string) => {
    const res = await fetch(`/api/menus/${id}/duplicate`, { method: "POST" });
    if (res.ok) {
      const menu = await res.json();
      setMenus((prev) => [menu, ...prev]);
      toast({ title: "Carte dupliquée", variant: "success" });
    }
  };

  if (!restaurantId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-stone-500">
          Sélectionnez un restaurant depuis le{" "}
          <Link href="/dashboard" className="text-amber-700 underline">
            dashboard
          </Link>
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-stone-400">Chargement...</div>
      </div>
    );
  }

  const totalDishes = categories.reduce((s, c) => s + (c.dishes?.length ?? 0), 0);
  const availableDishes = categories.reduce(
    (s, c) => s + (c.dishes?.filter((d) => d.available).length ?? 0),
    0
  );

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-stone-900">{restaurant?.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="secondary">{categories.length} catégories</Badge>
                <Badge variant="success">{availableDishes} plats actifs</Badge>
                <span className="text-stone-400 text-sm">/ {totalDishes} total</span>
              </div>
            </div>
            <Button onClick={handleAddCategory}>
              <Plus className="h-4 w-4 mr-2" />
              Catégorie
            </Button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un plat..."
              className="pl-9"
            />
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleCategoryDragEnd}
          >
            <SortableContext
              items={filteredCategories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {filteredCategories.map((cat) => (
                  <SortableCategory
                    key={cat.id}
                    category={cat}
                    onUpdateCategory={handleUpdateCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onAddDish={handleAddDish}
                    onUpdateDish={handleUpdateDish}
                    onDeleteDish={handleDeleteDish}
                    onDuplicateDish={handleDuplicateDish}
                    onReorderDishes={handleReorderDishes}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-stone-400 mb-4">
                Commencez par créer une catégorie (Entrées, Plats, Desserts...)
              </p>
              <Button onClick={handleAddCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Première catégorie
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="w-72 border-l border-stone-200 bg-white overflow-y-auto p-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-stone-800">Mes cartes</h2>
          <Button size="sm" onClick={() => setCreateMenuOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Nouvelle
          </Button>
        </div>

        <div className="space-y-2">
          {menus.map((menu) => (
            <Card key={menu.id} className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-stone-800 truncate">{menu.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {FORMAT_DIMENSIONS[menu.format]?.label ?? menu.format}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Link href={`/editor/${menu.id}`}>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleDuplicateMenu(menu.id)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {menus.length === 0 && (
            <p className="text-xs text-stone-400 text-center py-4">
              Aucune carte créée
            </p>
          )}
        </div>
      </div>

      <Dialog open={createMenuOpen} onOpenChange={setCreateMenuOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une carte</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateMenu} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-700">Nom de la carte</label>
              <Input
                value={newMenuName}
                onChange={(e) => setNewMenuName(e.target.value)}
                placeholder="Carte printemps 2024"
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700">Format</label>
              <select
                value={newMenuFormat}
                onChange={(e) => setNewMenuFormat(e.target.value)}
                className="w-full mt-1 text-sm border border-stone-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {Object.entries(FORMAT_DIMENSIONS).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={creatingMenu} className="flex-1">
                {creatingMenu ? "Création..." : "Créer et ouvrir l'éditeur"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setCreateMenuOpen(false)}>
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-stone-400">Chargement...</div>}>
      <MenuContent />
    </Suspense>
  );
}
