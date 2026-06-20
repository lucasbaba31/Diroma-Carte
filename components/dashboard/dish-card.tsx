"use client";

import { useState } from "react";
import { GripVertical, Pencil, Trash2, Copy, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { DishForm } from "./dish-form";
import { Dish } from "@/types";
import { formatPrice, ALLERGEN_LABELS } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface DishCardProps {
  dish: Dish;
  onUpdate: (data: Partial<Dish>) => Promise<void>;
  onDelete: () => Promise<void>;
  onDuplicate: () => Promise<void>;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export function DishCard({
  dish,
  onUpdate,
  onDelete,
  onDuplicate,
  isDragging,
  dragHandleProps,
}: DishCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleToggleAvailable = async () => {
    try {
      await onUpdate({ available: !dish.available });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Supprimer "${dish.name}" ?`)) return;
    try {
      await onDelete();
      toast({ title: "Plat supprimé", variant: "success" });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  return (
    <>
      <div
        className={`bg-white border border-stone-200 rounded-lg transition-shadow ${
          isDragging ? "shadow-lg opacity-70" : "hover:shadow-sm"
        }`}
      >
        <div className="flex items-center gap-2 p-3">
          <button
            {...dragHandleProps}
            className="text-stone-300 hover:text-stone-500 cursor-grab active:cursor-grabbing shrink-0"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-stone-900 truncate">{dish.name}</span>
              {dish.badge && (
                <Badge className="text-xs shrink-0">{dish.badge}</Badge>
              )}
              {!dish.available && (
                <Badge variant="outline" className="text-xs shrink-0 text-stone-400">
                  Inactif
                </Badge>
              )}
            </div>
            {dish.description && !expanded && (
              <p className="text-xs text-stone-500 truncate mt-0.5">{dish.description}</p>
            )}
          </div>

          <span className="font-semibold text-sm text-amber-700 shrink-0">
            {formatPrice(Number(dish.price))}
          </span>

          <Switch
            checked={dish.available}
            onCheckedChange={handleToggleAvailable}
            className="shrink-0"
          />

          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onDuplicate}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="px-9 pb-3 border-t border-stone-100 pt-2">
            {dish.description && (
              <p className="text-xs text-stone-600 mb-1">{dish.description}</p>
            )}
            {dish.allergens && dish.allergens.length > 0 && (
              <p className="text-xs text-stone-400 italic">
                Allergènes : {dish.allergens.map((a) => ALLERGEN_LABELS[a] ?? a).join(", ")}
              </p>
            )}
          </div>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le plat</DialogTitle>
          </DialogHeader>
          <DishForm
            dish={dish}
            categoryId={dish.categoryId}
            onSubmit={async (data) => {
              await onUpdate(data);
              setEditOpen(false);
              toast({ title: "Plat modifié", variant: "success" });
            }}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
