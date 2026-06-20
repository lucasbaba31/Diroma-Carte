"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  UtensilsCrossed,
  FileText,
  Pencil,
  Trash2,
  Settings,
  ChefHat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Restaurant } from "@/types";
import { toast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);

  const fetchRestaurants = useCallback(async () => {
    const res = await fetch("/api/restaurants");
    if (res.ok) setRestaurants(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      const r = await res.json();
      setRestaurants((prev) => [r, ...prev]);
      setCreateOpen(false);
      setForm({ name: "", description: "", phone: "", address: "" });
      toast({ title: "Restaurant créé !", variant: "success" });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer "${name}" et toutes ses données ?`)) return;
    const res = await fetch(`/api/restaurants/${id}`, { method: "DELETE" });
    if (res.ok) {
      setRestaurants((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Restaurant supprimé", variant: "success" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-stone-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Mes restaurants</h1>
          <p className="text-stone-500 text-sm mt-1">
            Gérez vos restaurants et créez vos cartes
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau restaurant
        </Button>
      </div>

      {restaurants.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-4">
            <ChefHat className="h-8 w-8 text-amber-700" />
          </div>
          <h2 className="text-xl font-semibold text-stone-700 mb-2">
            Commencez par créer votre restaurant
          </h2>
          <p className="text-stone-500 text-sm mb-6">
            Ajoutez vos plats, choisissez un template et générez votre carte en quelques minutes.
          </p>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer mon premier restaurant
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((r) => (
            <Card key={r.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{r.name}</CardTitle>
                  <div className="flex gap-1">
                    <Link href={`/dashboard/settings?restaurantId=${r.id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(r.id, r.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {r.description && (
                  <p className="text-sm text-stone-500">{r.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 text-sm text-stone-500 mb-4">
                  <span className="flex items-center gap-1">
                    <UtensilsCrossed className="h-3.5 w-3.5" />
                    {r.categories?.length ?? 0} catégories
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    {(r as Restaurant & { menus?: unknown[] }).menus?.length ?? 0} cartes
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/menu?restaurantId=${r.id}`} className="flex-1">
                    <Button variant="default" className="w-full text-sm h-8">
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      Gérer les plats
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un restaurant</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="rname">Nom du restaurant *</Label>
              <Input
                id="rname"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Le Petit Bistrot"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="rdesc">Description</Label>
              <Textarea
                id="rdesc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Cuisine traditionnelle française..."
                className="mt-1"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rphone">Téléphone</Label>
                <Input
                  id="rphone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="01 23 45 67 89"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="raddress">Adresse</Label>
                <Input
                  id="raddress"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Paris, France"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? "Création..." : "Créer le restaurant"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
