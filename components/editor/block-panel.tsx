"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlockType, MenuBlock } from "@/types";
import { generateId } from "@/lib/utils";

const BLOCK_TYPES: { type: BlockType; label: string; icon: string; description: string }[] = [
  { type: "RESTAURANT_NAME", label: "Nom du restaurant", icon: "🏪", description: "{{restaurant.name}}" },
  { type: "RESTAURANT_LOGO", label: "Logo", icon: "🖼️", description: "{{restaurant.logo}}" },
  { type: "RESTAURANT_PHONE", label: "Téléphone", icon: "📞", description: "{{restaurant.phone}}" },
  { type: "RESTAURANT_ADDRESS", label: "Adresse", icon: "📍", description: "{{restaurant.address}}" },
  { type: "CATEGORY_TITLE", label: "Titres de catégories", icon: "📂", description: "{{category.name}} pour toutes les catégories" },
  { type: "DISH_ITEM", label: "Liste des plats", icon: "🍽️", description: "{{dish.*}} pour toutes les catégories" },
  { type: "SEPARATOR", label: "Séparateur", icon: "➖", description: "Ligne de séparation" },
  { type: "SPACER", label: "Espace", icon: "⬜", description: "Espace vide" },
  { type: "FREE_TEXT", label: "Texte libre", icon: "✏️", description: "Contenu personnalisé" },
  { type: "PROMOTION", label: "Promotion", icon: "🎉", description: "Encadré promotionnel" },
  { type: "CHEF_SIGNATURE", label: "Signature du chef", icon: "👨‍🍳", description: "Message du chef" },
  { type: "LEGAL_INFO", label: "Infos légales", icon: "ℹ️", description: "Mentions obligatoires" },
];

interface BlockPanelProps {
  onAddBlock: (block: MenuBlock) => void;
  currentBlockCount: number;
}

export function BlockPanel({ onAddBlock, currentBlockCount }: BlockPanelProps) {
  const [search, setSearch] = useState("");

  const filtered = BLOCK_TYPES.filter(
    (b) =>
      b.label.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase())
  );

  const addBlock = (type: BlockType) => {
    const block: MenuBlock = {
      id: generateId(),
      type,
      style: {},
      position: { x: 0, y: 0 },
      size: { width: "100%", height: "auto" },
      order: currentBlockCount,
      visible: true,
      content: type === "FREE_TEXT" ? "Votre texte ici..." : undefined,
      variable:
        type === "RESTAURANT_NAME" ? "restaurant.name" :
        type === "RESTAURANT_LOGO" ? "restaurant.logo" :
        type === "RESTAURANT_PHONE" ? "restaurant.phone" :
        type === "RESTAURANT_ADDRESS" ? "restaurant.address" :
        type === "CATEGORY_TITLE" ? "category.name" :
        type === "DISH_ITEM" ? "dish" : undefined,
    };
    onAddBlock(block);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-stone-200">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
          Ajouter un bloc
        </p>
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm border border-stone-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.map((item) => (
          <button
            key={item.type}
            onClick={() => addBlock(item.type)}
            className="w-full flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-amber-50 hover:border-amber-200 border border-transparent transition-colors text-left group"
          >
            <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-stone-800 group-hover:text-amber-800">
                {item.label}
              </p>
              <p className="text-xs text-stone-400 font-mono truncate">{item.description}</p>
            </div>
            <Plus className="h-4 w-4 text-stone-300 group-hover:text-amber-500 shrink-0 ml-auto mt-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
