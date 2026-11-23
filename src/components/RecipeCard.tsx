import type { ReactNode } from "react";
import type { MatchedRecipe } from "@/lib/types";
import { formatMoney } from "@/lib/matching";

export function RecipeCard({
  match,
  compact = false,
  action,
}: {
  match: MatchedRecipe;
  compact?: boolean;
  action?: ReactNode;
}) {
  const { recipe, matchedItems, estimatedSavings } = match;

  return (
    <article className={compact ? "recipe-card recipe-card--compact" : "recipe-card"}>
      <div
        className="recipe-card__visual"
        style={{
          background: `linear-gradient(145deg, hsl(${recipe.imageHue} 42% 42%), hsl(${(recipe.imageHue + 40) % 360} 48% 28%))`,
        }}
      >
        <span className="recipe-card__time">{recipe.cookMinutes} min</span>
      </div>
      <div className="recipe-card__body">
        <h3 className="recipe-card__title">{recipe.title}</h3>
        {!compact && <p className="recipe-card__desc">{recipe.description}</p>}
        <div className="chip-row">
          {matchedItems.slice(0, 3).map((item) => (
            <span key={item.id} className="chip chip--sale">
              {item.name.split(" ").slice(0, 2).join(" ")}
            </span>
          ))}
          {estimatedSavings > 0 && (
            <span className="chip chip--save">Save {formatMoney(estimatedSavings)}</span>
          )}
        </div>
        {action}
      </div>
    </article>
  );
}
