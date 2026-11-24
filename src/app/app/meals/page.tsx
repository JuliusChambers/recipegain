"use client";

import { RecipeCard } from "@/components/RecipeCard";
import { useAppState } from "@/context/AppState";
import { matchRecipesToFlyer } from "@/lib/matching";

export default function MealsPage() {
  const {
    preferences,
    mealPlan,
    setMealForDay,
    regeneratePlan,
    ready,
    flyer,
    getRecipe,
  } = useAppState();

  if (!ready) return <p className="page-lede">Building meals…</p>;

  const matches = flyer ? matchRecipesToFlyer(flyer, preferences) : [];
  const matchById = new Map(matches.map((m) => [m.recipe.id, m]));

  return (
    <main>
      <div className="panel__head" style={{ alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Weekly meals</h1>
          <p className="page-lede">
            Seven days of flyer-backed recipes near {preferences.postalCode}.
            Swap any day to keep variety — and stay aligned with your wellbeing
            preferences.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--ghost btn--compact"
          onClick={regeneratePlan}
        >
          Regenerate
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="empty panel">
          No recipes match this flyer with your current preferences. Load deals
          for your postal code on the Flyer tab, or relax diet filters.
        </div>
      ) : (
        <div className="meal-grid">
          {mealPlan.map((day) => {
            const match =
              (day.recipeId && matchById.get(day.recipeId)) || null;
            const fallbackRecipe = day.recipeId
              ? getRecipe(day.recipeId)
              : undefined;

            return (
              <section key={day.day} className="meal-day">
                <div className="meal-day__head">
                  <span className="meal-day__label">{day.day}</span>
                  {day.recipeId ? (
                    <button
                      type="button"
                      className="btn btn--ghost btn--compact"
                      onClick={() => setMealForDay(day.day, null)}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <label className="field">
                  <span className="visually-hidden">
                    Choose recipe for {day.day}
                  </span>
                  <select
                    value={day.recipeId ?? ""}
                    onChange={(e) =>
                      setMealForDay(day.day, e.target.value || null)
                    }
                  >
                    <option value="">No recipe</option>
                    {matches.map((m) => (
                      <option key={m.recipe.id} value={m.recipe.id}>
                        {m.recipe.title}
                      </option>
                    ))}
                    {day.recipeId &&
                      !matchById.has(day.recipeId) &&
                      fallbackRecipe && (
                        <option value={fallbackRecipe.id}>
                          {fallbackRecipe.title}
                        </option>
                      )}
                  </select>
                </label>
                {match ? (
                  <RecipeCard match={match} stack />
                ) : fallbackRecipe ? (
                  <RecipeCard
                    stack
                    match={{
                      recipe: fallbackRecipe,
                      matchedItems: [],
                      matchScore: 0,
                      estimatedSavings: 0,
                      missingIngredients: [],
                    }}
                  />
                ) : (
                  <p className="page-lede" style={{ margin: 0 }}>
                    Pick a matched recipe for this day.
                  </p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
