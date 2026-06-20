"use client";

import React, { forwardRef } from "react";
import { Menu, Restaurant, Category, Theme } from "@/types";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { FORMAT_DIMENSIONS } from "@/lib/utils";

interface MenuPreviewProps {
  menu: Menu;
  restaurant: Restaurant;
  categories: Category[];
  theme?: Theme | null;
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string) => void;
  scale?: number;
  isPrint?: boolean;
}

export const MenuPreview = forwardRef<HTMLDivElement, MenuPreviewProps>(
  (
    {
      menu,
      restaurant,
      categories,
      theme,
      selectedBlockId,
      onSelectBlock,
      scale = 1,
      isPrint = false,
    },
    ref
  ) => {
    const dims = FORMAT_DIMENSIONS[menu.format] ?? FORMAT_DIMENSIONS.A4_PORTRAIT;
    const sortedBlocks = [...(menu.blocks ?? [])].sort((a, b) => a.order - b.order);
    const activeCats = categories.filter((c) =>
      (c.dishes ?? []).some((d) => d.available)
    );

    const bgColor =
      theme?.colors?.background ??
      (menu.blocks.find((b) => b.type === "DISH_ITEM")?.style?.backgroundColor) ??
      "#ffffff";

    return (
      <div
        ref={ref}
        id="menu-preview"
        style={{
          width: `${dims.width}px`,
          minHeight: `${dims.height}px`,
          backgroundColor: bgColor,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          position: "relative",
          fontFamily: theme?.fonts?.body ?? "serif",
          boxShadow: isPrint ? "none" : "0 4px 32px rgba(0,0,0,0.12)",
        }}
        className="overflow-hidden"
      >
        {sortedBlocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            categories={activeCats}
            restaurantName={restaurant.name}
            restaurantLogo={restaurant.logo ?? undefined}
            restaurantPhone={restaurant.phone ?? undefined}
            restaurantAddress={restaurant.address ?? undefined}
            theme={theme}
            isSelected={!isPrint && selectedBlockId === block.id}
            onClick={
              onSelectBlock && !isPrint
                ? () => onSelectBlock(block.id)
                : undefined
            }
          />
        ))}
      </div>
    );
  }
);

MenuPreview.displayName = "MenuPreview";
