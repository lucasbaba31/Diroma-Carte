"use client";

import { useState } from "react";
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
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DishCard } from "./dish-card";
import { DishForm } from "./dish-form";
import { Category, Dish } from "@/types";
import { toast } from "@/hooks/use-toast";

interface CategorySectionProps {
  category: Category;
  onUpdateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onAddDish: (data: Partial<Dish>) => Promise<void>;
  onUpdateDish: (id: string, data: Partial<Dish>) => Promise<void>;
  onDeleteDish: (id: string) => Promise<void>;
  onDuplicateDish: (id: string) => Promise<void>;
  onReorderDishes: (categoryId: string, ids: string[]) => Promise<void>;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

function SortableDishCard({
  dish,
  onUpdate,
  onDelete,
  onDuplicate,
}: {
  dish: Dish;
  onUpdate: (data: Partial<Dish>) => Promise<void>;
  onDelete: () => Promise<void>;
  onDuplicate: () => Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: dish.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <DishCard
        dish={dish}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners } as React.HTMLAttributes<HTMLButtonElement>}
      />
    </div>
  );
}

export function CategorySection({
  category,
  onUpdateCategory,
  onDeleteCategory,
  onAddDish,
  onUpdateDish,
  onDeleteDish,
  onDuplicateDish,
  onReorderDishes,
  dragHandleProps,
}: CategorySectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(category.name);
  const [addOpen, setAddOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const dishes = [...(category.dishes ?? [])].sort((a, b) => a.order - b.order);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = dishes.findIndex((d) => d.id === active.id);
    const newIndex = dishes.findIndex((d) => d.id === over.id);
    const newOrder = arrayMove(dishes, oldIndex, newIndex);
    await onReorderDishes(
      category.id,
      newOrder.map((d) => d.id)
    );
  };

  const handleRename = async () => {
    if (name.trim() && name !== category.name) {
      await onUpdateCategory(category.id, { name: name.trim() });
      toast({ title: "Catégorie renommée", variant: "success" });
    }
    setEditingName(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Supprimer la catégorie "${category.name}" et tous ses plats ?`)) return;
    await onDeleteCategory(category.id);
    toast({ title: "Catégorie supprimée", variant: "success" });
  };

  return (
    <>
      <div className="border border-stone-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2.5 bg-stone-50 border-b border-stone-200">
          <button
            {...dragHandleProps}
            className="text-stone-300 hover:text-stone-500 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <button
            className="text-stone-500"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {editingName ? (
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              className="h-7 text-sm font-medium flex-1"
            />
          ) : (
            <span
              className="font-semibold text-stone-800 flex-1 text-sm"
              onDoubleClick={() => setEditingName(true)}
            >
              {category.name}
              <span className="text-stone-400 font-normal ml-2">
                ({dishes.filter((d) => d.available).length}/{dishes.length})
              </span>
            </span>
          )}

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setEditingName(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="p-2 space-y-1.5">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={dishes.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                {dishes.map((dish) => (
                  <SortableDishCard
                    key={dish.id}
                    dish={dish}
                    onUpdate={(data) => onUpdateDish(dish.id, data)}
                    onDelete={() => onDeleteDish(dish.id)}
                    onDuplicate={() => onDuplicateDish(dish.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {dishes.length === 0 && (
              <p className="text-center text-stone-400 text-sm py-4">
                Aucun plat dans cette catégorie
              </p>
            )}

            <Button
              variant="ghost"
              className="w-full text-stone-500 hover:text-amber-700 hover:bg-amber-50 h-8 text-sm"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter un plat
            </Button>
          </div>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un plat — {category.name}</DialogTitle>
          </DialogHeader>
          <DishForm
            categoryId={category.id}
            onSubmit={async (data) => {
              await onAddDish(data);
              setAddOpen(false);
              toast({ title: "Plat ajouté", variant: "success" });
            }}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
