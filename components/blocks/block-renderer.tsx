"use client";

import React, { CSSProperties } from "react";
import { MenuBlock, Category, Dish, Theme } from "@/types";
import { formatPrice, ALLERGEN_LABELS } from "@/lib/utils";

interface BlockRendererProps {
  block: MenuBlock;
  categories?: Category[];
  restaurantName?: string;
  restaurantLogo?: string;
  restaurantPhone?: string;
  restaurantAddress?: string;
  theme?: Theme | null;
  isSelected?: boolean;
  onClick?: () => void;
}

function blockStyleToCSS(block: MenuBlock, theme?: Theme | null): CSSProperties {
  const s = block.style;
  return {
    fontFamily: s.fontFamily ?? theme?.fonts?.body ?? "inherit",
    fontSize: s.fontSize ? `${s.fontSize}px` : undefined,
    fontWeight: s.fontWeight ?? undefined,
    color: s.color ?? theme?.colors?.text ?? undefined,
    backgroundColor: s.backgroundColor ?? undefined,
    textAlign: s.textAlign ?? undefined,
    paddingTop: s.padding?.top !== undefined ? `${s.padding.top}px` : undefined,
    paddingRight: s.padding?.right !== undefined ? `${s.padding.right}px` : undefined,
    paddingBottom: s.padding?.bottom !== undefined ? `${s.padding.bottom}px` : undefined,
    paddingLeft: s.padding?.left !== undefined ? `${s.padding.left}px` : undefined,
    marginTop: s.margin?.top !== undefined ? `${s.margin.top}px` : undefined,
    marginRight: s.margin?.right !== undefined ? `${s.margin.right}px` : undefined,
    marginBottom: s.margin?.bottom !== undefined ? `${s.margin.bottom}px` : undefined,
    marginLeft: s.margin?.left !== undefined ? `${s.margin.left}px` : undefined,
    borderWidth: s.border?.width !== undefined ? `${s.border.width}px` : undefined,
    borderStyle: s.border?.style ?? undefined,
    borderColor: s.border?.color ?? undefined,
    borderRadius: s.border?.radius !== undefined ? `${s.border.radius}px` : undefined,
    letterSpacing: s.letterSpacing ? `${s.letterSpacing}px` : undefined,
    lineHeight: s.lineHeight ?? undefined,
    textTransform: s.textTransform ?? undefined,
    opacity: s.opacity ?? undefined,
    width: typeof block.size.width === "number" ? `${block.size.width}px` : block.size.width,
    minHeight: typeof block.size.height === "number" ? `${block.size.height}px` : undefined,
  };
}

export function BlockRenderer({
  block,
  categories = [],
  restaurantName,
  restaurantLogo,
  restaurantPhone,
  restaurantAddress,
  theme,
  isSelected,
  onClick,
}: BlockRendererProps) {
  if (!block.visible) return null;

  const css = blockStyleToCSS(block, theme);
  const baseClass = `relative ${onClick ? "cursor-pointer" : ""} ${
    isSelected ? "ring-2 ring-amber-500 ring-offset-1" : ""
  }`;

  const wrap = (children: React.ReactNode) => (
    <div className={baseClass} style={css} onClick={onClick}>
      {children}
    </div>
  );

  switch (block.type) {
    case "RESTAURANT_NAME":
      return wrap(
        <span style={{ fontFamily: css.fontFamily ?? theme?.fonts?.heading }}>
          {restaurantName ?? "Nom du restaurant"}
        </span>
      );

    case "RESTAURANT_LOGO":
      return wrap(
        restaurantLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={restaurantLogo}
            alt="Logo"
            className="max-h-24 object-contain mx-auto"
          />
        ) : (
          <div className="h-16 w-32 mx-auto bg-stone-100 rounded flex items-center justify-center text-stone-400 text-sm">
            Logo
          </div>
        )
      );

    case "RESTAURANT_PHONE":
      return restaurantPhone ? wrap(<span>{restaurantPhone}</span>) : null;

    case "RESTAURANT_ADDRESS":
      return restaurantAddress ? wrap(<span>{restaurantAddress}</span>) : null;

    case "CATEGORY_TITLE":
      return wrap(
        <div
          style={{ fontFamily: css.fontFamily ?? theme?.fonts?.heading }}
          className="w-full"
        >
          {categories.map((cat) => (
            <CategorySection
              key={cat.id}
              category={cat}
              block={block}
              theme={theme}
            />
          ))}
        </div>
      );

    case "DISH_ITEM":
      return wrap(
        <div className="w-full">
          {categories.map((cat) => (
            <DishList
              key={cat.id}
              category={cat}
              block={block}
              theme={theme}
            />
          ))}
        </div>
      );

    case "SEPARATOR":
      return (
        <div
          className={baseClass}
          style={{
            ...css,
            height: typeof block.size.height === "number"
              ? `${block.size.height}px`
              : block.size.height,
            backgroundColor: css.color ?? "#e5e7eb",
          }}
          onClick={onClick}
        />
      );

    case "SPACER":
      return (
        <div
          className={baseClass}
          style={{
            ...css,
            height: typeof block.size.height === "number"
              ? `${block.size.height}px`
              : "32px",
          }}
          onClick={onClick}
        />
      );

    case "FREE_TEXT":
      return wrap(
        <div
          dangerouslySetInnerHTML={{ __html: block.content ?? "Texte libre..." }}
        />
      );

    case "PROMOTION":
      return wrap(
        <div
          className="border-2 rounded-lg p-4 text-center"
          style={{
            borderColor: theme?.colors?.accent ?? css.color ?? "#c9a96e",
            color: theme?.colors?.accent ?? css.color,
          }}
        >
          {block.content ?? "🎉 Promotion du moment"}
        </div>
      );

    case "CHEF_SIGNATURE":
      return wrap(
        <div className="text-center italic">
          {block.content ?? "— Le Chef"}
        </div>
      );

    case "LEGAL_INFO":
      return wrap(
        <div className="text-xs opacity-70">
          {block.content ?? "Prix TTC, service compris. Les allergènes sont disponibles sur demande."}
        </div>
      );

    case "DECORATIVE":
      return (
        <div
          className={baseClass}
          style={css}
          onClick={onClick}
          dangerouslySetInnerHTML={{ __html: block.content ?? "" }}
        />
      );

    default:
      return null;
  }
}

function CategorySection({
  category,
  block,
  theme,
}: {
  category: Category;
  block: MenuBlock;
  theme?: Theme | null;
}) {
  const s = block.style;
  return (
    <div
      style={{
        fontFamily: s.fontFamily ?? theme?.fonts?.heading ?? "inherit",
        fontSize: s.fontSize ? `${s.fontSize}px` : "20px",
        fontWeight: s.fontWeight ?? "600",
        color: s.color ?? theme?.colors?.primary ?? "#1a1a1a",
        textAlign: s.textAlign ?? "left",
        textTransform: s.textTransform ?? "none",
        letterSpacing: s.letterSpacing ? `${s.letterSpacing}px` : undefined,
        paddingTop: s.padding?.top ? `${s.padding.top}px` : "16px",
        paddingBottom: s.padding?.bottom ? `${s.padding.bottom}px` : "8px",
        paddingLeft: s.padding?.left ? `${s.padding.left}px` : undefined,
        paddingRight: s.padding?.right ? `${s.padding.right}px` : undefined,
        backgroundColor: s.backgroundColor ?? undefined,
        marginTop: s.margin?.top ? `${s.margin.top}px` : undefined,
      }}
    >
      {category.name}
    </div>
  );
}

function DishList({
  category,
  block,
  theme,
}: {
  category: Category;
  block: MenuBlock;
  theme?: Theme | null;
}) {
  const dishes = (category.dishes ?? []).filter((d) => d.available);
  if (!dishes.length) return null;

  return (
    <div>
      {dishes.map((dish) => (
        <DishRow key={dish.id} dish={dish} block={block} theme={theme} />
      ))}
    </div>
  );
}

function DishRow({
  dish,
  block,
  theme,
}: {
  dish: Dish;
  block: MenuBlock;
  theme?: Theme | null;
}) {
  const s = block.style;
  const bodyFont = s.fontFamily ?? theme?.fonts?.body ?? "inherit";

  return (
    <div
      style={{
        paddingTop: s.padding?.top ? `${s.padding.top}px` : "6px",
        paddingBottom: s.padding?.bottom ? `${s.padding.bottom}px` : "6px",
        paddingLeft: s.padding?.left ? `${s.padding.left}px` : "0px",
        paddingRight: s.padding?.right ? `${s.padding.right}px` : "0px",
        color: s.color ?? theme?.colors?.text ?? "#1a1a1a",
      }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {dish.badge && (
            <span
              className="text-xs px-1.5 py-0.5 rounded shrink-0"
              style={{
                backgroundColor: theme?.colors?.accent ?? "#c9a96e",
                color: "#fff",
                fontFamily: bodyFont,
              }}
            >
              {dish.badge}
            </span>
          )}
          <span
            style={{
              fontFamily: bodyFont,
              fontSize: s.fontSize ? `${s.fontSize}px` : "15px",
              fontWeight: "600",
            }}
          >
            {dish.name}
          </span>
        </div>
        <span
          className="shrink-0 font-semibold"
          style={{
            fontFamily: bodyFont,
            fontSize: s.fontSize ? `${s.fontSize}px` : "15px",
            color: theme?.colors?.primary ?? s.color ?? "inherit",
          }}
        >
          {formatPrice(Number(dish.price))}
        </span>
      </div>
      {dish.description && (
        <p
          className="opacity-70 mt-0.5"
          style={{
            fontFamily: bodyFont,
            fontSize: s.fontSize ? `${Math.max((s.fontSize ?? 15) - 2, 11)}px` : "13px",
          }}
        >
          {dish.description}
        </p>
      )}
      {dish.allergens && dish.allergens.length > 0 && (
        <p
          className="opacity-50 mt-0.5 text-xs italic"
          style={{ fontFamily: bodyFont }}
        >
          Allergènes : {dish.allergens.map((a) => ALLERGEN_LABELS[a] ?? a).join(", ")}
        </p>
      )}
    </div>
  );
}
