"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { RecipeCard } from "@/components/RecipeCard";
import { useAppState } from "@/context/AppState";
import { formatUnitPrice, unitLabelIsRedundant } from "@/lib/flyers/pricing";
import { matchRecipesToFlyerItem } from "@/lib/matching";
import { toMatchedRecipes } from "@/lib/recipes/themealdb";
import type { MatchedRecipe, Recipe } from "@/lib/types";

export function ProductRecipesClient() {
  const params = useParams<{ itemId: string }>();
  const itemId = decodeURIComponent(params.itemId ?? "");
  const {
    ready,
    flyer,
    flyers,
    preferences,
    mealPlan,
    setMealForDay,
    rememberRecipe,
  } = useAppState();
  const [addedRecipeId, setAddedRecipeId] = useState<string | null>(null);
  const [remoteMatches, setRemoteMatches] = useState<MatchedRecipe[]>([]);
  const [remoteStatus, setRemoteStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [remoteNote, setRemoteNote] = useState<string | null>(null);

  const item = useMemo(() => {
    const fromActive = flyer?.items.find((entry) => entry.id === itemId);
    if (fromActive) return fromActive;
    for (const candidate of flyers) {
      const found = candidate.items.find((entry) => entry.id === itemId);
      if (found) return found;
    }
    return null;
  }, [flyer, flyers, itemId]);

  const sourceFlyer = useMemo(() => {
    if (!item) return flyer;
    if (flyer?.items.some((entry) => entry.id === item.id)) return flyer;
    return (
      flyers.find((entry) => entry.items.some((i) => i.id === item.id)) ?? flyer
    );
  }, [flyer, flyers, item]);

  const localMatches = useMemo(() => {
    if (!item) return [];
    return matchRecipesToFlyerItem(item, preferences, sourceFlyer);
  }, [item, preferences, sourceFlyer]);

  useEffect(() => {
    if (!item) return;

    if (localMatches.length >= 3) {
      setRemoteMatches([]);
      setRemoteStatus("idle");
      setRemoteNote(null);
      return;
    }

    const controller = new AbortController();
    setRemoteStatus("loading");
    setRemoteNote(null);

    void (async () => {
      try {
        const response = await fetch(
          `/api/recipes/search?product=${encodeURIComponent(item.name)}&limit=6`,
          { signal: controller.signal },
        );
        const data = (await response.json()) as {
          recipes?: Recipe[];
          ingredientUsed?: string | null;
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data.error || "Recipe search failed");
        }

        const recipes = data.recipes ?? [];
        const flyerItems = sourceFlyer?.items ?? [item];
        const mapped = toMatchedRecipes(recipes, item, flyerItems);
        const localIds = new Set(localMatches.map((m) => m.recipe.id));
        const deduped = mapped.filter((m) => !localIds.has(m.recipe.id));

        setRemoteMatches(deduped);
        setRemoteStatus("ready");
        setRemoteNote(
          deduped.length
            ? `Also pulled ${deduped.length} recipe${deduped.length === 1 ? "" : "s"} from TheMealDB${
                data.ingredientUsed ? ` (ingredient: ${data.ingredientUsed})` : ""
              }.`
            : data.ingredientUsed
              ? `No TheMealDB hits for “${data.ingredientUsed}”.`
              : "No extra online recipes found for this product name.",
        );
      } catch (error) {
        if (controller.signal.aborted) return;
        setRemoteMatches([]);
        setRemoteStatus("error");
        setRemoteNote(
          error instanceof Error ? error.message : "Online recipe search failed",
        );
      }
    })();

    return () => controller.abort();
  }, [item, localMatches, sourceFlyer]);

  const matches = useMemo(
    () => [...localMatches, ...remoteMatches],
    [localMatches, remoteMatches],
  );

  function addToMealPlan(match: MatchedRecipe) {
    rememberRecipe(match.recipe);
    const dayToUse =
      mealPlan.find((day) => !day.recipeId)?.day ??
      mealPlan.find((day) => day.recipeId !== match.recipe.id)?.day ??
      mealPlan[0]?.day;
    if (!dayToUse) return;
    setMealForDay(dayToUse, match.recipe.id);
    setAddedRecipeId(match.recipe.id);
  }

  if (!ready) {
    return <p className="page-lede">Loading recipes…</p>;
  }

  if (!item) {
    return (
      <main>
        <h1 className="page-title">Product not found</h1>
        <p className="page-lede">
          That flyer item isn’t in your current deals. Load a flyer again and
          pick a product photo.
        </p>
        <Link href="/app/flyer" className="btn btn--primary btn--compact">
          Back to flyer
        </Link>
      </main>
    );
  }

  return (
    <main>
      <p className="chip-row">
        <Link href="/app/flyer" className="chip">
          ← Flyer
        </Link>
        <span className="chip chip--sale">Recipes from this deal</span>
        {localMatches.length > 0 && (
          <span className="chip">{localMatches.length} local</span>
        )}
        {remoteMatches.length > 0 && (
          <span className="chip">{remoteMatches.length} online</span>
        )}
      </p>

      <section className="product-hero panel">
        <div className="product-hero__media">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={item.name} className="product-hero__img" />
          ) : (
            <div className="flyer-item__placeholder" aria-hidden>
              <span>{item.name.slice(0, 1).toUpperCase()}</span>
            </div>
          )}
        </div>
        <div>
          <h1 className="page-title" style={{ marginTop: 0 }}>
            {item.name}
          </h1>
          <p className="page-lede" style={{ marginBottom: "0.75rem" }}>
            On sale for {formatUnitPrice(item.salePrice, item.unit)}
            {!unitLabelIsRedundant(item.unit, item.unitLabel) ? (
              <>
                {" "}
                <strong>({item.unitLabel})</strong>
              </>
            ) : null}{" "}
            at {sourceFlyer?.storeName ?? "your store"}
            {item.packageSize ? ` · package ${item.packageSize}` : ""}. We match
            your local catalog first, then fill gaps from TheMealDB.
          </p>
          <div className="chip-row">
            <span className="chip">{item.category}</span>
            <span className="chip">
              {item.unitKind === "weight"
                ? "Sold by weight"
                : item.unitKind === "pack"
                  ? "Pack price"
                  : item.unitKind === "multi"
                    ? "Multi-buy"
                    : "Each"}
            </span>
            <span className="chip chip--save">
              Was {formatUnitPrice(item.regularPrice, item.unit)}
            </span>
          </div>
        </div>
      </section>

      <section style={{ marginTop: "1.25rem" }}>
        <div className="panel__head">
          <h2 className="panel__title">
            {matches.length} recipe{matches.length === 1 ? "" : "s"} for this deal
            {remoteStatus === "loading" ? " · searching online…" : ""}
          </h2>
          <Link href="/app/meals" className="btn btn--ghost btn--compact">
            Meal plan
          </Link>
        </div>
        {remoteNote && (
          <p className="page-lede" style={{ marginTop: 0 }}>
            {remoteNote}
          </p>
        )}

        {matches.length === 0 && remoteStatus !== "loading" ? (
          <div className="empty panel">
            No recipes matched this product yet. Try another flyer item, or
            loosen diet filters under You.
          </div>
        ) : (
          <div className="recipe-grid">
            {matches.map((match) => (
              <RecipeCard
                key={match.recipe.id}
                match={match}
                action={
                  <button
                    type="button"
                    className="btn btn--primary btn--compact"
                    style={{ marginTop: "0.35rem", alignSelf: "flex-start" }}
                    onClick={() => addToMealPlan(match)}
                  >
                    {addedRecipeId === match.recipe.id
                      ? "Added to meal plan"
                      : "Add to meal plan"}
                  </button>
                }
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
