"use client";

import Link from "next/link";
import { RecipeCard } from "@/components/RecipeCard";
import { useAppState } from "@/context/AppState";
import { recipes } from "@/lib/data/recipes";
import {
  dealRankScore,
  formatMoney,
  matchRecipesToFlyer,
  savingsPercent,
} from "@/lib/matching";

export default function WeekOverviewPage() {
  const {
    preferences,
    mealPlan,
    shoppingList,
    ready,
    regeneratePlan,
    flyer,
    flyerSource,
    flyerWarning,
  } = useAppState();

  if (!ready) {
    return <p className="page-lede">Loading your week…</p>;
  }

  const matches = flyer ? matchRecipesToFlyer(flyer, preferences) : [];
  const topMatches = matches.slice(0, 4);
  const saleCount = flyer?.items.length ?? 0;
  const listSavings = shoppingList
    .filter((item) => item.onSale && item.salePrice != null)
    .reduce((sum, item) => sum + (item.salePrice ?? 0), 0);
  const plannedTitles = mealPlan
    .map((day) => recipes.find((r) => r.id === day.recipeId)?.title)
    .filter(Boolean)
    .slice(0, 3);

  return (
    <main>
      <p className="chip-row">
        <span className={flyerSource === "live" ? "chip chip--sale" : "chip"}>
          {flyerSource === "live" ? "Live deals" : "Sample deals"} ·{" "}
          {preferences.postalCode}
        </span>
        {flyer && (
          <span className="chip">
            {flyer.weekLabel} · {flyer.storeName}
          </span>
        )}
      </p>
      <h1 className="page-title">Your flyer-powered week</h1>
      <p className="page-lede">
        Recipes matched to promotions near {preferences.postalCode}, tuned for
        your health preferences — then rolled into meals and a shopping list.
      </p>
      {flyerWarning && (
        <p className="page-lede" style={{ marginTop: "-0.75rem" }}>
          {flyerWarning}
        </p>
      )}

      <div className="stat-row">
        <div className="stat">
          <span className="stat__label">Flyer items</span>
          <span className="stat__value">{saleCount}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Recipe matches</span>
          <span className="stat__value">{matches.length}</span>
        </div>
        <div className="stat">
          <span className="stat__label">List on sale</span>
          <span className="stat__value">{formatMoney(listSavings)}</span>
        </div>
      </div>

      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">This week’s meals</h2>
          <button
            type="button"
            className="btn btn--ghost btn--compact"
            onClick={regeneratePlan}
          >
            Refresh plan
          </button>
        </div>
        <p className="page-lede" style={{ marginBottom: "0.75rem" }}>
          {plannedTitles.length
            ? `Starting with ${plannedTitles.join(", ")}${mealPlan.length > 3 ? "…" : "."}`
            : "Generate a plan from your flyer matches."}
        </p>
        <Link href="/app/meals" className="btn btn--primary btn--compact">
          Open meal plan
        </Link>
      </section>

      <section style={{ marginTop: "1.25rem" }}>
        <div className="panel__head">
          <h2 className="panel__title">Top matches from the flyer</h2>
          <Link href="/app/flyer" className="btn btn--ghost btn--compact">
            View flyer
          </Link>
        </div>
        {topMatches.length === 0 ? (
          <div className="empty panel">
            No matches for your current preferences. Try adjusting diet or
            allergies, or load deals for another postal code.
          </div>
        ) : (
          <div className="recipe-grid">
            {topMatches.map((match) => (
              <RecipeCard key={match.recipe.id} match={match} />
            ))}
          </div>
        )}
      </section>

      {flyer && (
        <section className="panel" style={{ marginTop: "1.25rem" }}>
          <h2 className="panel__title">Biggest deals right now</h2>
          <div className="flyer-grid" style={{ marginTop: "0.85rem" }}>
            {[...flyer.items]
              .sort(
                (a, b) =>
                  dealRankScore(b.salePrice, b.regularPrice) -
                  dealRankScore(a.salePrice, a.regularPrice),
              )
              .slice(0, 4)
              .map((item) => (
                <div key={item.id} className="flyer-item">
                  <div>
                    <p className="flyer-item__name">{item.name}</p>
                    <p className="flyer-item__meta">
                      {item.category} ·{" "}
                      {savingsPercent(item.salePrice, item.regularPrice)}% off
                    </p>
                  </div>
                  <div className="price">
                    <span className="price__sale">
                      {formatMoney(item.salePrice)}
                      <small style={{ fontSize: "0.7rem" }}>{item.unit}</small>
                    </span>
                    <span className="price__was">
                      {formatMoney(item.regularPrice)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}
    </main>
  );
}
