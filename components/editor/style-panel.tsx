"use client";

import { MenuBlock, BlockStyle, Theme } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Trash2 } from "lucide-react";

const FONT_OPTIONS = [
  "inherit",
  "Playfair Display",
  "Cormorant Garamond",
  "Merriweather",
  "Montserrat",
  "Lato",
  "Cinzel",
  "Dancing Script",
  "Georgia",
  "Times New Roman",
  "Arial",
  "Helvetica",
];

interface StylePanelProps {
  block: MenuBlock;
  theme?: Theme | null;
  onChange: (updates: Partial<MenuBlock>) => void;
  onRemove: () => void;
}

function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 200,
}: {
  label: string;
  value?: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <Label className="text-xs text-stone-500">{label}</Label>
      <Input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        className="h-7 text-xs mt-0.5"
      />
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value ?? "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 rounded border border-stone-200 cursor-pointer p-0.5"
      />
      <div className="flex-1">
        <Label className="text-xs text-stone-500">{label}</Label>
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="h-6 text-xs mt-0.5 font-mono"
        />
      </div>
    </div>
  );
}

export function StylePanel({ block, theme: _theme, onChange, onRemove }: StylePanelProps) {
  const s = block.style;

  const updateStyle = (updates: Partial<BlockStyle>) => {
    onChange({ style: { ...s, ...updates } });
  };

  const updatePadding = (side: "top" | "right" | "bottom" | "left", val: number) => {
    updateStyle({ padding: { top: 0, right: 0, bottom: 0, left: 0, ...s.padding, [side]: val } });
  };

  const updateMargin = (side: "top" | "right" | "bottom" | "left", val: number) => {
    updateStyle({ margin: { top: 0, right: 0, bottom: 0, left: 0, ...s.margin, [side]: val } });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3 border-b border-stone-200 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
            Propriétés du bloc
          </p>
          <p className="text-xs text-stone-400 mt-0.5">{block.type}</p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onChange({ visible: !block.visible })}
            title={block.visible ? "Masquer" : "Afficher"}
          >
            {block.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-400 hover:text-red-600"
            onClick={onRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="p-3 space-y-5">
        {(block.type === "FREE_TEXT" ||
          block.type === "PROMOTION" ||
          block.type === "CHEF_SIGNATURE" ||
          block.type === "LEGAL_INFO") && (
          <section>
            <p className="text-xs font-semibold text-stone-600 mb-2">Contenu</p>
            <textarea
              value={block.content ?? ""}
              onChange={(e) => onChange({ content: e.target.value })}
              className="w-full text-sm border border-stone-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
              rows={3}
            />
          </section>
        )}

        <section>
          <p className="text-xs font-semibold text-stone-600 mb-2">Typographie</p>
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-stone-500">Police</Label>
              <select
                value={s.fontFamily ?? "inherit"}
                onChange={(e) => updateStyle({ fontFamily: e.target.value })}
                className="w-full mt-0.5 text-sm border border-stone-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f} value={f} style={{ fontFamily: f }}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <NumberInput
                label="Taille (px)"
                value={s.fontSize}
                onChange={(v) => updateStyle({ fontSize: v })}
                min={8}
                max={120}
              />
              <NumberInput
                label="Espacement"
                value={s.letterSpacing}
                onChange={(v) => updateStyle({ letterSpacing: v })}
                min={0}
                max={20}
              />
            </div>
            <div>
              <Label className="text-xs text-stone-500">Graisse</Label>
              <select
                value={s.fontWeight ?? "400"}
                onChange={(e) => updateStyle({ fontWeight: e.target.value })}
                className="w-full mt-0.5 text-sm border border-stone-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="300">Light</option>
                <option value="400">Normal</option>
                <option value="600">Semi-bold</option>
                <option value="700">Bold</option>
                <option value="800">Extra-bold</option>
              </select>
            </div>
            <div>
              <Label className="text-xs text-stone-500">Alignement</Label>
              <div className="flex gap-1 mt-0.5">
                {(["left", "center", "right"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => updateStyle({ textAlign: a })}
                    className={`flex-1 py-1 text-xs rounded border transition-colors ${
                      s.textAlign === a
                        ? "bg-amber-700 text-white border-amber-700"
                        : "border-stone-200 hover:border-amber-300"
                    }`}
                  >
                    {a === "left" ? "G" : a === "center" ? "C" : "D"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs text-stone-500">Casse</Label>
              <select
                value={s.textTransform ?? "none"}
                onChange={(e) => updateStyle({ textTransform: e.target.value as BlockStyle["textTransform"] })}
                className="w-full mt-0.5 text-sm border border-stone-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="none">Normal</option>
                <option value="uppercase">MAJUSCULES</option>
                <option value="capitalize">Premières Majuscules</option>
                <option value="lowercase">minuscules</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold text-stone-600 mb-2">Couleurs</p>
          <div className="space-y-2">
            <ColorInput
              label="Couleur du texte"
              value={s.color}
              onChange={(v) => updateStyle({ color: v })}
            />
            <ColorInput
              label="Fond"
              value={s.backgroundColor}
              onChange={(v) => updateStyle({ backgroundColor: v })}
            />
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold text-stone-600 mb-2">Espacement interne</p>
          <div className="grid grid-cols-2 gap-2">
            <NumberInput label="Haut" value={s.padding?.top} onChange={(v) => updatePadding("top", v)} />
            <NumberInput label="Bas" value={s.padding?.bottom} onChange={(v) => updatePadding("bottom", v)} />
            <NumberInput label="Gauche" value={s.padding?.left} onChange={(v) => updatePadding("left", v)} />
            <NumberInput label="Droite" value={s.padding?.right} onChange={(v) => updatePadding("right", v)} />
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold text-stone-600 mb-2">Marges externes</p>
          <div className="grid grid-cols-2 gap-2">
            <NumberInput label="Haut" value={s.margin?.top} onChange={(v) => updateMargin("top", v)} />
            <NumberInput label="Bas" value={s.margin?.bottom} onChange={(v) => updateMargin("bottom", v)} />
            <NumberInput label="Gauche" value={s.margin?.left} onChange={(v) => updateMargin("left", v)} />
            <NumberInput label="Droite" value={s.margin?.right} onChange={(v) => updateMargin("right", v)} />
          </div>
        </section>

        {(block.type === "SPACER" || block.type === "SEPARATOR") && (
          <section>
            <p className="text-xs font-semibold text-stone-600 mb-2">Taille</p>
            <NumberInput
              label="Hauteur (px)"
              value={
                typeof block.size.height === "number" ? block.size.height : undefined
              }
              onChange={(v) => onChange({ size: { ...block.size, height: v } })}
              min={1}
              max={200}
            />
            {block.type === "SEPARATOR" && (
              <ColorInput
                label="Couleur de la ligne"
                value={s.color}
                onChange={(v) => updateStyle({ color: v })}
              />
            )}
          </section>
        )}

        <section>
          <p className="text-xs font-semibold text-stone-600 mb-2">Visibilité</p>
          <div className="flex items-center gap-2">
            <Switch
              checked={block.visible}
              onCheckedChange={(v) => onChange({ visible: v })}
            />
            <Label className="text-xs">Bloc visible</Label>
          </div>
        </section>
      </div>
    </div>
  );
}
