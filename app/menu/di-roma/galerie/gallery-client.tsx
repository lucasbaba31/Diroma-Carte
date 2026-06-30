"use client";

import { useState, useMemo } from "react";

type Dish = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  badge: string | null;
  image: string | null;
  categoryName: string;
  categoryId: string;
};

type Category = { id: string; name: string };

export function GalleryClient({ dishes, categories }: { dishes: Dish[]; categories: Category[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return dishes.filter(d => {
      const matchCat = activeCategory === "all" || d.categoryId === activeCategory;
      const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [dishes, activeCategory, search]);

  const priceLabel = (p: string) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(parseFloat(p));

  return (
    <div style={{ minHeight: "100dvh", background: "#0f0f0f", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(160deg, #1a0a05 0%, #2d1008 50%, #1a0a05 100%)",
        padding: "40px 20px 28px",
        textAlign: "center",
        borderBottom: "1px solid rgba(184,50,24,.25)"
      }}>
        <p style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "#b83218", margin: "0 0 8px", opacity: .8 }}>
          Di Roma · Aucamville
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.1, color: "#fff" }}>
          La Carte en photos
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,.45)", margin: "8px 0 0" }}>
          {dishes.length} plats · Cuisine italienne &amp; feu de bois
        </p>
      </div>

      {/* Search */}
      <div style={{ padding: "16px 16px 0", position: "sticky", top: 0, zIndex: 10, background: "#0f0f0f" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.35)", fontSize: 16 }}>
            🔍
          </span>
          <input
            type="search"
            placeholder="Rechercher un plat…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,.07)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 12,
              padding: "11px 14px 11px 40px",
              fontSize: 15,
              color: "#fff",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Category filter pills */}
      <div style={{
        padding: "14px 16px",
        display: "flex",
        gap: 8,
        overflowX: "auto",
        scrollbarWidth: "none",
        position: "sticky",
        top: 60,
        zIndex: 10,
        background: "#0f0f0f",
      }}>
        {[{ id: "all", name: "Tout" }, ...categories].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              flexShrink: 0,
              padding: "7px 16px",
              borderRadius: 999,
              border: activeCategory === cat.id ? "1.5px solid #b83218" : "1.5px solid rgba(255,255,255,.12)",
              background: activeCategory === cat.id ? "rgba(184,50,24,.15)" : "transparent",
              color: activeCategory === cat.id ? "#e06040" : "rgba(255,255,255,.55)",
              fontSize: 13,
              fontWeight: activeCategory === cat.id ? 600 : 400,
              cursor: "pointer",
              transition: "all .15s",
              whiteSpace: "nowrap",
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div style={{ padding: "4px 16px 12px", color: "rgba(255,255,255,.3)", fontSize: 12 }}>
        {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
        {activeCategory !== "all" && ` · ${categories.find(c => c.id === activeCategory)?.name}`}
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: 10,
        padding: "0 12px 32px",
      }}>
        {filtered.map(dish => (
          <div
            key={dish.id}
            style={{
              borderRadius: 14,
              overflow: "hidden",
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.07)",
              display: "flex",
              flexDirection: "column",
              transition: "transform .15s",
            }}
          >
            {/* Photo */}
            <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: "#1a1a1a" }}>
              <img
                src={dish.image || `https://picsum.photos/seed/${encodeURIComponent(dish.name)}/400/300`}
                alt={dish.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading="lazy"
              />
              {/* Badge */}
              {dish.badge && (
                <span style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "#b83218",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "3px 7px",
                  borderRadius: 6,
                }}>
                  {dish.badge}
                </span>
              )}
              {/* Price chip */}
              <span style={{
                position: "absolute",
                bottom: 8,
                right: 8,
                background: "rgba(0,0,0,.7)",
                backdropFilter: "blur(6px)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                padding: "4px 9px",
                borderRadius: 8,
              }}>
                {priceLabel(dish.price)}
              </span>
            </div>

            {/* Info */}
            <div style={{ padding: "10px 10px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0, lineHeight: 1.2 }}>{dish.name}</p>
              {dish.description && (
                <p style={{ fontSize: 11, color: "rgba(255,255,255,.45)", margin: 0, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {dish.description}
                </p>
              )}
              <p style={{ fontSize: 10, color: "#b83218", margin: "2px 0 0", opacity: .75, fontWeight: 500 }}>
                {dish.categoryName}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,.3)" }}>
          <p style={{ fontSize: 32, margin: "0 0 8px" }}>🍽</p>
          <p style={{ fontSize: 15 }}>Aucun plat trouvé</p>
        </div>
      )}
    </div>
  );
}
