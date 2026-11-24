"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppState } from "@/context/AppState";
import { matchRecipesToFlyer } from "@/lib/matching";

export function RecipeDetailClient() {
  const params = useParams<{ recipeId: string }>();
  const recipeId = decodeURIComponent(params.recipeId ?? "");
  const { ready, getRecipe, flyer, preferences, mealPlan, setMealForDay } =
    useAppState();

  const recipe = getRecipe(recipeId);
  const flyerMatch =
    flyer && recipe
      ? matchRecipesToFlyer(flyer, preferences).find(
          (match) => match.recipe.id === recipe.id,
        )
      : undefined;

  if (!ready) return <p className="page-lede">Loading recipe…</p>;

  if (!recipe) {
    return (
      <main>
        <h1 className="page-title">Recipe not found</h1>
        <p className="page-lede">
          That recipe isn’t in your catalog or saved library. Add one from a
          flyer product, or open Weekly meals again.
        </p>
        <Link href="/app/meals" className="btn btn--primary btn--compact">
          Back to meals
        </Link>
      </main>
    );
  }

  function addToPlan() {
    const dayToUse =
      mealPlan.find((day) => !day.recipeId)?.day ??
      mealPlan.find((day) => day.recipeId !== recipe!.id)?.day ??
      mealPlan[0]?.day;
    if (!dayToUse) return;
    setMealForDay(dayToUse, recipe!.id);
  }

  return (
    <main>
      <p className="chip-row">
        <Link href="/app/meals" className="chip">
          ← Meals
        </Link>
        <Link href="/app/flyer" className="chip">
          Flyer
        </Link>
        {recipe.source === "themealdb" ? (
          <span className="chip">TheMealDB</span>
        ) : (
          <span className="chip">Local recipe</span>
        )}
      </p>

      <section className="recipe-detail panel">
        <div className="recipe-detail__media">
          {recipe.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="recipe-detail__img"
            />
          ) : (
            <div
              className="recipe-detail__placeholder"
              style={{
                background: `linear-gradient(145deg, hsl(${recipe.imageHue} 42% 42%), hsl(${(recipe.imageHue + 40) % 360} 48% 28%))`,
              }}
            />
          )}
        </div>

        <div>
          <h1 className="page-title" style={{ marginTop: 0 }}>
            {recipe.title}
          </h1>
          <p className="page-lede">{recipe.description}</p>
          <div className="chip-row">
            <span className="chip">{recipe.cookMinutes} min</span>
            <span className="chip">{recipe.servings} servings</span>
            {recipe.dietTags.slice(0, 3).map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>
          <button
            type="button"
            className="btn btn--primary btn--compact"
            style={{ marginTop: "1rem" }}
            onClick={addToPlan}
          >
            Add to meal plan
          </button>
        </div>
      </section>

      {flyerMatch && flyerMatch.matchedItems.length > 0 && (
        <section className="panel" style={{ marginTop: "1rem" }}>
          <h2 className="panel__title">Sale items this uses</h2>
          <div className="chip-row" style={{ marginTop: "0.65rem" }}>
            {flyerMatch.matchedItems.map((item) => (
              <Link
                key={item.id}
                href={`/app/flyer/product/${encodeURIComponent(item.id)}`}
                className="chip chip--sale"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="panel" style={{ marginTop: "1rem" }}>
        <h2 className="panel__title">Ingredients</h2>
        <ul className="recipe-detail__list">
          {recipe.ingredients.map((ing) => (
            <li key={`${ing.name}-${ing.quantity}`}>
              <strong>{ing.quantity}</strong> {ing.name}
              {ing.optional ? " (optional)" : ""}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel" style={{ marginTop: "1rem" }}>
        <h2 className="panel__title">Steps</h2>
        <ol className="recipe-detail__steps">
          {recipe.steps.map((step, index) => (
            <li key={`${index}-${step.slice(0, 24)}`}>
              <span className="recipe-detail__step-n">{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
