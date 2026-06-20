"use client";

import { useState } from "react";
import { Theme, ThemeColors, ThemeFonts } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

const FONT_OPTIONS = [
  "Playfair Display",
  "Cormorant Garamond",
  "Merriweather",
  "Montserrat",
  "Lato",
  "Cinzel",
  "Dancing Script",
  "Georgia",
  "Arial",
  "Helvetica",
];

const PRESET_THEMES: { name: string; colors: ThemeColors; fonts: ThemeFonts }[] = [
  {
    name: "Gastronomique",
    colors: { primary: "#1a1a1a", secondary: "#c9a96e", accent: "#c9a96e", background: "#fffdf9", text: "#1a1a1a", muted: "#888" },
    fonts: { heading: "Playfair Display", body: "Cormorant Garamond", accent: "Playfair Display" },
  },
  {
    name: "Brasserie",
    colors: { primary: "#8b2635", secondary: "#f5e6d3", accent: "#8b2635", background: "#fffdf7", text: "#2c1810", muted: "#888" },
    fonts: { heading: "Merriweather", body: "Lato", accent: "Merriweather" },
  },
  {
    name: "Fast Food",
    colors: { primary: "#e63946", secondary: "#f1faee", accent: "#e63946", background: "#ffffff", text: "#1d1d1d", muted: "#666" },
    fonts: { heading: "Montserrat", body: "Montserrat", accent: "Montserrat" },
  },
  {
    name: "Bar / Cocktail",
    colors: { primary: "#d4af37", secondary: "#1a1a2e", accent: "#d4af37", background: "#0d0d0d", text: "#e0e0e0", muted: "#888" },
    fonts: { heading: "Cinzel", body: "Lato", accent: "Cinzel" },
  },
  {
    name: "Café Parisien",
    colors: { primary: "#3d2b1f", secondary: "#f8f0e3", accent: "#c8a97e", background: "#fdf9f3", text: "#3d2b1f", muted: "#999" },
    fonts: { heading: "Dancing Script", body: "Lato", accent: "Dancing Script" },
  },
];

interface ThemePanelProps {
  theme: Theme | null;
  restaurantId: string;
  onSave: (theme: Partial<Theme>) => Promise<void>;
  onApply: (theme: Partial<Theme>) => void;
}

export function ThemePanel({ theme, restaurantId, onSave, onApply }: ThemePanelProps) {
  const [colors, setColors] = useState<ThemeColors>(
    (theme?.colors as ThemeColors) ?? PRESET_THEMES[0].colors
  );
  const [fonts, setFonts] = useState<ThemeFonts>(
    (theme?.fonts as ThemeFonts) ?? PRESET_THEMES[0].fonts
  );
  const [name, setName] = useState(theme?.name ?? "Mon thème");
  const [saving, setSaving] = useState(false);

  const applyPreset = (preset: (typeof PRESET_THEMES)[0]) => {
    setColors(preset.colors);
    setFonts(preset.fonts);
    setName(preset.name);
    onApply({ colors: preset.colors, fonts: preset.fonts });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ name, restaurantId, colors, fonts });
    } finally {
      setSaving(false);
    }
  };

  const updateColor = (key: keyof ThemeColors, value: string) => {
    const updated = { ...colors, [key]: value };
    setColors(updated);
    onApply({ colors: updated, fonts });
  };

  const updateFont = (key: keyof ThemeFonts, value: string) => {
    const updated = { ...fonts, [key]: value };
    setFonts(updated);
    onApply({ colors, fonts: updated });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3 border-b border-stone-200">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Thème graphique</p>
      </div>

      <div className="p-3 space-y-5">
        <section>
          <p className="text-xs font-semibold text-stone-600 mb-2">Thèmes prédéfinis</p>
          <div className="grid grid-cols-1 gap-1.5">
            {PRESET_THEMES.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="flex items-center gap-3 p-2 rounded-lg border border-stone-200 hover:border-amber-300 hover:bg-amber-50 transition-colors text-left"
              >
                <div className="flex gap-1">
                  {[preset.colors.primary, preset.colors.secondary, preset.colors.accent].map(
                    (c, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: c }}
                      />
                    )
                  )}
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ fontFamily: preset.fonts.heading }}
                >
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold text-stone-600 mb-2">Couleurs</p>
          <div className="space-y-2">
            {(Object.entries(colors) as [keyof ThemeColors, string][]).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateColor(key, e.target.value)}
                  className="h-7 w-7 rounded border border-stone-200 cursor-pointer p-0.5 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Label className="text-xs text-stone-500 capitalize">
                    {key === "primary" ? "Principale" :
                     key === "secondary" ? "Secondaire" :
                     key === "accent" ? "Accent" :
                     key === "background" ? "Fond" :
                     key === "text" ? "Texte" : "Discret"}
                  </Label>
                  <Input
                    value={value}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="h-6 text-xs mt-0.5 font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold text-stone-600 mb-2">Polices</p>
          <div className="space-y-2">
            {(["heading", "body", "accent"] as const).map((key) => (
              <div key={key}>
                <Label className="text-xs text-stone-500">
                  {key === "heading" ? "Titres" : key === "body" ? "Corps de texte" : "Accent"}
                </Label>
                <select
                  value={fonts[key]}
                  onChange={(e) => updateFont(key, e.target.value)}
                  className="w-full mt-0.5 text-sm border border-stone-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  style={{ fontFamily: fonts[key] }}
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f} style={{ fontFamily: f }}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>

        <div>
          <Label className="text-xs text-stone-500">Nom du thème</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 text-sm"
            placeholder="Ex: Thème principal"
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Sauvegarde..." : "Sauvegarder le thème"}
        </Button>
      </div>
    </div>
  );
}
