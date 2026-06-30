"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

const CARTES = [
  {
    id: "creme",
    name: "Style Crème",
    description: "Fond ivoire, titres en écriture cursive terracotta, ambiance chaleureuse et élégante.",
    href: "/menu/di-roma",
    preview: {
      bg: "#faf5ee",
      accent: "#b83218",
      text: "#1e1e1e",
      textLight: "#7a6f68",
    },
  },
  {
    id: "rouge",
    name: "Style Bordeaux",
    description: "Fond bordeaux profond, typographie crème dorée, sections en pills ovales. Luxe et modernité.",
    href: "/menu/di-roma/rouge",
    preview: {
      bg: "#6e1414",
      accent: "#e8d5a3",
      text: "#e8d5a3",
      textLight: "rgba(232,213,163,.55)",
    },
  },
];

export default function TemplatesPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Mes cartes</h1>
        <p className="text-stone-500 text-sm mt-1">
          Aperçu et accès direct à chaque version de la carte Di Roma.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CARTES.map((carte) => (
          <div
            key={carte.id}
            className="rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Aperçu visuel */}
            <div
              style={{ background: carte.preview.bg, height: 220, padding: "28px 32px", position: "relative" }}
            >
              {/* Restaurant name */}
              <p style={{ fontFamily: "Georgia, serif", fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: carte.preview.textLight, margin: "0 0 4px" }}>
                Restaurant
              </p>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 36, fontWeight: 300, color: carte.preview.accent, margin: 0, lineHeight: 1 }}>
                Di Roma
              </p>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 12, fontStyle: "italic", color: carte.preview.textLight, margin: "4px 0 20px" }}>
                à Aucamville
              </p>

              {/* Mini section pills */}
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {["Apéritifs & Antipasti", "Viandes", "Pizzas au feu de bois"].map((s) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {carte.id === "rouge" ? (
                      <div style={{ border: `1px solid ${carte.preview.accent}`, borderRadius: 999, padding: "2px 12px", display: "inline-block" }}>
                        <span style={{ fontFamily: "Georgia, serif", fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase", color: carte.preview.text }}>
                          {s}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontFamily: "Georgia, serif", fontSize: 10, letterSpacing: "0.05em", color: carte.preview.accent }}>
                        {s}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Accent corner */}
              <div style={{
                position: "absolute", bottom: 16, right: 20,
                fontFamily: "Georgia, serif", fontSize: 9,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: carte.preview.textLight, opacity: .6,
              }}>
                {carte.id === "creme" ? "Style Crème" : "Style Bordeaux"}
              </div>
            </div>

            {/* Infos + actions */}
            <div className="p-5 bg-white">
              <div className="mb-4">
                <h3 className="font-semibold text-stone-800 text-base">{carte.name}</h3>
                <p className="text-sm text-stone-500 mt-1">{carte.description}</p>
              </div>
              <div className="flex gap-2">
                <Link href={carte.href} target="_blank" className="flex-1">
                  <button className="w-full flex items-center justify-center gap-2 bg-stone-900 text-white text-sm font-medium py-2.5 px-4 rounded-lg hover:bg-stone-700 transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Voir la carte
                  </button>
                </Link>
                <Link href={`${carte.href}?print=1`} target="_blank">
                  <button className="flex items-center justify-center gap-1.5 border border-stone-200 text-stone-600 text-sm py-2.5 px-4 rounded-lg hover:bg-stone-50 transition-colors whitespace-nowrap">
                    ↓ PDF
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
