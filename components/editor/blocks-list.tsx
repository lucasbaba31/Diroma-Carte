"use client";

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
import { Eye, EyeOff, GripVertical } from "lucide-react";
import { MenuBlock } from "@/types";

const BLOCK_LABELS: Record<string, string> = {
  RESTAURANT_NAME: "Nom du restaurant",
  RESTAURANT_LOGO: "Logo",
  RESTAURANT_PHONE: "Téléphone",
  RESTAURANT_ADDRESS: "Adresse",
  CATEGORY_TITLE: "Titres catégories",
  DISH_ITEM: "Liste des plats",
  SEPARATOR: "Séparateur",
  SPACER: "Espace",
  FREE_TEXT: "Texte libre",
  PROMOTION: "Promotion",
  CHEF_SIGNATURE: "Signature chef",
  LEGAL_INFO: "Infos légales",
  DECORATIVE: "Décoratif",
};

const BLOCK_ICONS: Record<string, string> = {
  RESTAURANT_NAME: "🏪",
  RESTAURANT_LOGO: "🖼️",
  RESTAURANT_PHONE: "📞",
  RESTAURANT_ADDRESS: "📍",
  CATEGORY_TITLE: "📂",
  DISH_ITEM: "🍽️",
  SEPARATOR: "➖",
  SPACER: "⬜",
  FREE_TEXT: "✏️",
  PROMOTION: "🎉",
  CHEF_SIGNATURE: "👨‍🍳",
  LEGAL_INFO: "ℹ️",
  DECORATIVE: "🎨",
};

interface BlocksListProps {
  blocks: MenuBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onReorder: (newOrder: string[]) => void;
}

function SortableBlockItem({
  block,
  isSelected,
  onSelect,
  onToggleVisible,
}: {
  block: MenuBlock;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisible: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? "bg-amber-100 border border-amber-300"
          : "hover:bg-stone-50 border border-transparent"
      } ${!block.visible ? "opacity-40" : ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-stone-300 hover:text-stone-500 cursor-grab active:cursor-grabbing shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <span className="text-sm">{BLOCK_ICONS[block.type] ?? "📦"}</span>
      <span className="text-xs font-medium text-stone-700 flex-1 truncate">
        {BLOCK_LABELS[block.type] ?? block.type}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleVisible(); }}
        className="shrink-0 text-stone-300 hover:text-stone-600"
      >
        {block.visible ? (
          <Eye className="h-3 w-3" />
        ) : (
          <EyeOff className="h-3 w-3" />
        )}
      </button>
    </div>
  );
}

export function BlocksList({
  blocks,
  selectedId,
  onSelect,
  onToggleVisible,
  onReorder,
}: BlocksListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex((b) => b.id === active.id);
    const newIndex = sorted.findIndex((b) => b.id === over.id);
    const newOrder = arrayMove(sorted, oldIndex, newIndex);
    onReorder(newOrder.map((b) => b.id));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-stone-200">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
          Blocs ({blocks.length})
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sorted.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {sorted.map((block) => (
              <SortableBlockItem
                key={block.id}
                block={block}
                isSelected={selectedId === block.id}
                onSelect={() => onSelect(block.id)}
                onToggleVisible={() => onToggleVisible(block.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
        {blocks.length === 0 && (
          <p className="text-center text-stone-400 text-sm py-8">
            Ajoutez des blocs depuis le panneau gauche
          </p>
        )}
      </div>
    </div>
  );
}
