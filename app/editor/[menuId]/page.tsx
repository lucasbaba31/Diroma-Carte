"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Layers,
  Palette,
  Plus,
  History,
  Loader2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuPreview } from "@/components/menu/menu-preview";
import { BlockPanel } from "@/components/editor/block-panel";
import { BlocksList } from "@/components/editor/blocks-list";
import { StylePanel } from "@/components/editor/style-panel";
import { ThemePanel } from "@/components/editor/theme-panel";
import { ExportButton } from "@/components/menu/export-button";
import { Menu, Restaurant, Category, Theme, MenuBlock } from "@/types";
import { toast } from "@/hooks/use-toast";
import { generateId, FORMAT_DIMENSIONS } from "@/lib/utils";

type SidebarTab = "blocks" | "layers" | "style" | "theme";

export default function EditorPage() {
  const { menuId } = useParams<{ menuId: string }>();
  const router = useRouter();

  const [menu, setMenu] = useState<Menu | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("blocks");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [scale, setScale] = useState(0.65);
  const [unsaved, setUnsaved] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    const menuRes = await fetch(`/api/menus/${menuId}`);
    if (!menuRes.ok) { router.push("/dashboard"); return; }
    const menuData = await menuRes.json();
    setMenu(menuData);

    const restRes = await fetch(`/api/restaurants/${menuData.restaurantId}`);
    const restData = await restRes.json();
    setRestaurant(restData);
    setCategories(restData.categories ?? []);

    if (menuData.themeId) {
      const theme = restData.themes?.find((t: Theme) => t.id === menuData.themeId);
      if (theme) setActiveTheme(theme);
    }

    setLoading(false);
  }, [menuId, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateMenuBlocks = (blocks: MenuBlock[]) => {
    if (!menu) return;
    setMenu({ ...menu, blocks });
    setUnsaved(true);
  };

  const handleSave = async () => {
    if (!menu) return;
    setSaving(true);
    const res = await fetch(`/api/menus/${menu.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks: menu.blocks, themeId: activeTheme?.id ?? null }),
    });
    setSaving(false);
    if (res.ok) {
      setUnsaved(false);
      toast({ title: "Carte sauvegardée", variant: "success" });
    }
  };

  const handleAddBlock = (block: MenuBlock) => {
    if (!menu) return;
    const newBlock = { ...block, id: generateId(), order: menu.blocks.length };
    updateMenuBlocks([...menu.blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
    setSidebarTab("style");
  };

  const handleUpdateBlock = (id: string, data: Partial<MenuBlock>) => {
    if (!menu) return;
    updateMenuBlocks(
      menu.blocks.map((b) => (b.id === id ? { ...b, ...data } : b))
    );
  };

  const handleRemoveBlock = (id: string) => {
    if (!menu) return;
    updateMenuBlocks(menu.blocks.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const handleToggleVisible = (id: string) => {
    if (!menu) return;
    updateMenuBlocks(
      menu.blocks.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b))
    );
  };

  const handleReorderBlocks = (ids: string[]) => {
    if (!menu) return;
    const map = Object.fromEntries(menu.blocks.map((b) => [b.id, b]));
    updateMenuBlocks(ids.map((id, i) => ({ ...map[id], order: i })).filter(Boolean));
  };

  const handleSaveTheme = async (themeData: Partial<Theme>) => {
    if (!restaurant) return;
    const res = await fetch("/api/themes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...themeData, restaurantId: restaurant.id }),
    });
    if (res.ok) {
      const saved = await res.json();
      setActiveTheme(saved);
      setRestaurant((prev) =>
        prev ? { ...prev, themes: [...(prev.themes ?? []), saved] } : prev
      );
      toast({ title: "Thème sauvegardé", variant: "success" });
    }
  };

  const handleApplyTheme = (themeData: Partial<Theme>) => {
    setActiveTheme((prev) => ({ ...(prev ?? {} as Theme), ...themeData } as Theme));
    setUnsaved(true);
  };

  const selectedBlock = menu?.blocks.find((b) => b.id === selectedBlockId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-100">
        <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
      </div>
    );
  }

  if (!menu || !restaurant) return null;

  const dims = FORMAT_DIMENSIONS[menu.format] ?? FORMAT_DIMENSIONS.A4_PORTRAIT;

  const TAB_BUTTONS: { id: SidebarTab; icon: React.ElementType; label: string }[] = [
    { id: "blocks", icon: Plus, label: "Blocs" },
    { id: "layers", icon: Layers, label: "Calques" },
    { id: "style", icon: Palette, label: "Style" },
    { id: "theme", icon: Palette, label: "Thème" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-stone-200">
      <div className="w-72 bg-white border-r border-stone-200 flex flex-col shrink-0">
        <div className="p-3 border-b border-stone-200 flex items-center gap-2">
          <Link href={`/dashboard/menu?restaurantId=${restaurant.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-stone-800 truncate">{menu.name}</p>
            <p className="text-xs text-stone-400">{dims.label}</p>
          </div>
          {unsaved && (
            <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Non sauvegardé" />
          )}
        </div>

        <div className="flex border-b border-stone-200">
          {TAB_BUTTONS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setSidebarTab(id)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                sidebarTab === id
                  ? "text-amber-700 border-b-2 border-amber-700 -mb-px"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-hidden">
          {sidebarTab === "blocks" && (
            <BlockPanel
              onAddBlock={handleAddBlock}
              currentBlockCount={menu.blocks.length}
            />
          )}
          {sidebarTab === "layers" && (
            <BlocksList
              blocks={menu.blocks}
              selectedId={selectedBlockId}
              onSelect={(id) => { setSelectedBlockId(id); setSidebarTab("style"); }}
              onToggleVisible={handleToggleVisible}
              onReorder={handleReorderBlocks}
            />
          )}
          {sidebarTab === "style" && selectedBlock ? (
            <StylePanel
              block={selectedBlock}
              theme={activeTheme}
              onChange={(updates) => handleUpdateBlock(selectedBlock.id, updates)}
              onRemove={() => handleRemoveBlock(selectedBlock.id)}
            />
          ) : sidebarTab === "style" ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <Layers className="h-8 w-8 text-stone-300 mb-3" />
              <p className="text-sm text-stone-400">
                Sélectionnez un bloc dans la prévisualisation pour modifier son style
              </p>
            </div>
          ) : null}
          {sidebarTab === "theme" && (
            <ThemePanel
              theme={activeTheme}
              restaurantId={restaurant.id}
              onSave={handleSaveTheme}
              onApply={handleApplyTheme}
            />
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-12 bg-white border-b border-stone-200 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setScale((s) => Math.max(0.3, s - 0.1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-stone-500 w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setScale((s) => Math.min(1.5, s + 0.1))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
              className="text-xs"
            >
              {isPreview ? (
                <><EyeOff className="h-3.5 w-3.5 mr-1.5" />Édition</>
              ) : (
                <><Eye className="h-3.5 w-3.5 mr-1.5" />Aperçu</>
              )}
            </Button>
            {menu && (
              <ExportButton
                menu={menu}
                previewRef={previewRef}
              />
            )}
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1.5" />
              )}
              {saving ? "..." : "Sauvegarder"}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8">
          <div
            style={{
              width: `${dims.width * scale}px`,
              height: `${dims.height * scale}px`,
              margin: "0 auto",
              position: "relative",
            }}
          >
            <MenuPreview
              ref={previewRef}
              menu={menu}
              restaurant={restaurant}
              categories={categories}
              theme={activeTheme}
              selectedBlockId={isPreview ? null : selectedBlockId}
              onSelectBlock={
                isPreview
                  ? undefined
                  : (id) => {
                      setSelectedBlockId(id);
                      setSidebarTab("style");
                    }
              }
              scale={scale}
              isPrint={isPreview}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
