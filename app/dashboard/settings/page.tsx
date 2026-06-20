"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Restaurant } from "@/types";
import { toast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

function SettingsContent() {
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get("restaurantId");

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [form, setForm] = useState({ name: "", description: "", phone: "", address: "", website: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/restaurants").then((r) => r.json()).then((data: Restaurant[]) => {
      setRestaurants(data);
      const target = restaurantId ? data.find((r) => r.id === restaurantId) : data[0];
      if (target) {
        setSelected(target);
        setForm({
          name: target.name,
          description: target.description ?? "",
          phone: target.phone ?? "",
          address: target.address ?? "",
          website: target.website ?? "",
        });
      }
    });
  }, [restaurantId]);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await fetch(`/api/restaurants/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) toast({ title: "Paramètres sauvegardés", variant: "success" });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Paramètres</h1>

      {restaurants.length > 1 && (
        <div className="mb-6">
          <Label>Restaurant</Label>
          <select
            value={selected?.id ?? ""}
            onChange={(e) => {
              const r = restaurants.find((x) => x.id === e.target.value);
              if (r) {
                setSelected(r);
                setForm({ name: r.name, description: r.description ?? "", phone: r.phone ?? "", address: r.address ?? "", website: r.website ?? "" });
              }
            }}
            className="w-full mt-1 text-sm border border-stone-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      )}

      {selected && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-semibold text-stone-800">Informations du restaurant</h2>
          <div>
            <Label htmlFor="sname">Nom *</Label>
            <Input id="sname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="sdesc">Description</Label>
            <Textarea id="sdesc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sphone">Téléphone</Label>
              <Input id="sphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="swebsite">Site web</Label>
              <Input id="swebsite" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="saddress">Adresse</Label>
            <Input id="saddress" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1" />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-stone-400">Chargement...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
