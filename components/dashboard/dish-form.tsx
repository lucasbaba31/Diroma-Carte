"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ALLERGEN_LABELS } from "@/lib/utils";
import { Dish } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  description: z.string().optional(),
  price: z.number().positive("Prix invalide"),
  badge: z.string().optional(),
  available: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface DishFormProps {
  dish?: Dish;
  categoryId: string;
  onSubmit: (data: Partial<Dish>) => Promise<void>;
  onCancel: () => void;
}

const ALLERGENS = Object.keys(ALLERGEN_LABELS);

export function DishForm({ dish, categoryId, onSubmit, onCancel }: DishFormProps) {
  const [allergens, setAllergens] = useState<string[]>(dish?.allergens ?? []);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: dish?.name ?? "",
      description: dish?.description ?? "",
      price: dish?.price ? Number(dish.price) : undefined,
      badge: dish?.badge ?? "",
      available: dish?.available ?? true,
    },
  });

  const available = watch("available");

  const toggleAllergen = (key: string) => {
    setAllergens((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );
  };

  const onFormSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await onSubmit({ ...values, allergens, categoryId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nom du plat *</Label>
        <Input id="name" {...register("name")} placeholder="Ex: Tartare de bœuf" className="mt-1" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Ingrédients, préparation..."
          className="mt-1"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="price">Prix (€) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            placeholder="14.50"
            className="mt-1"
          />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
        </div>
        <div>
          <Label htmlFor="badge">Badge</Label>
          <Input id="badge" {...register("badge")} placeholder="Nouveau, Populaire..." className="mt-1" />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Allergènes</Label>
        <div className="flex flex-wrap gap-2">
          {ALLERGENS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleAllergen(key)}
              className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                allergens.includes(key)
                  ? "bg-amber-700 text-white border-amber-700"
                  : "bg-white text-stone-600 border-stone-300 hover:border-amber-400"
              }`}
            >
              {ALLERGEN_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="available"
          checked={available}
          onCheckedChange={(v) => setValue("available", v)}
        />
        <Label htmlFor="available">Plat disponible</Label>
        {available ? (
          <Badge variant="success">Actif</Badge>
        ) : (
          <Badge variant="outline">Inactif</Badge>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Enregistrement..." : dish ? "Modifier" : "Ajouter le plat"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
