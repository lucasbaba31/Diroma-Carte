"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Template } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  gastronomique: "🍷 Gastronomique",
  brasserie: "🍺 Brasserie",
  "fast-food": "🍔 Fast Food",
  bar: "🍸 Bar / Cocktails",
  cafe: "☕ Café / Bistrot",
  pizzeria: "🍕 Pizzeria",
};

function TemplatesContent() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/templates").then((r) => r.json()).then((data) => {
      setTemplates(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6 text-stone-400">Chargement...</div>;

  const byCategory = templates.reduce<Record<string, Template[]>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-900 mb-2">Templates</h1>
      <p className="text-stone-500 text-sm mb-8">
        Choisissez un template de départ. Il sera personnalisable dans l'éditeur.
      </p>

      {Object.entries(byCategory).map(([cat, items]) => (
        <div key={cat} className="mb-8">
          <h2 className="text-lg font-semibold text-stone-700 mb-3">
            {CATEGORY_LABELS[cat] ?? cat}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((t) => (
              <div
                key={t.id}
                className="border border-stone-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow cursor-pointer hover:border-amber-300"
              >
                <div className="aspect-[3/4] bg-stone-100 rounded-lg mb-3 flex items-center justify-center text-stone-400 text-sm">
                  {t.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    "Aperçu"
                  )}
                </div>
                <h3 className="font-semibold text-stone-800">{t.name}</h3>
                {t.description && (
                  <p className="text-xs text-stone-500 mt-1">{t.description}</p>
                )}
                <p className="text-xs text-stone-400 mt-2">{t.blocks.length} blocs</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {templates.length === 0 && (
        <p className="text-center text-stone-400 py-12">
          Aucun template disponible. Initialisez la base de données avec les templates par défaut.
        </p>
      )}
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-stone-400">Chargement...</div>}>
      <TemplatesContent />
    </Suspense>
  );
}
