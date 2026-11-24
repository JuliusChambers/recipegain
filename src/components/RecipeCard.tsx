import Link from "next/link";
import type { ReactNode } from "react";
import type { MatchedRecipe } from "@/lib/types";
import { formatMoney } from "@/lib/matching";

export function RecipeCard({
  match,
  compact = false,
  stack = false,
  action,
}: {
  match: MatchedRecipe;
  compact?: boolean;
  /** Full-width dish photo on top — used on the weekly meals page. */
  stack?: boolean;
  action?: ReactNode;
}) {
  const { recipe, matchedItems, estimatedSavings } = match;
  const href = `/app/recipe/${encodeURIComponent(recipe.id)}`;
  const className = [
    "recipe-card",
    compact ? "recipe-card--compact" : "",
    stack ? "recipe-card--stack" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={className}>
      <Link
        href={href}
        className="recipe-card__visual recipe-card__visual--link"
        aria-label={`Open recipe: ${recipe.title}`}
        style={
          recipe.imageUrl
            ? undefined
            : {
                background: `linear-gradient(145deg, hsl(${recipe.imageHue} 42% 42%), hsl(${(recipe.imageHue + 40) % 360} 48% 28%))`,
              }
        }
      >
        {recipe.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.imageUrl}
            alt={`${recipe.title} plated`}
            className="recipe-card__img"
            loading="lazy"
          />
        ) : null}
        <span className="recipe-card__time">{recipe.cookMinutes} min</span>
        {recipe.source === "themealdb" ? (
          <span className="recipe-card__source">TheMealDB</span>
        ) : null}
      </Link>
      <div className="recipe-card__body">
        <h3 className="recipe-card__title">
          <Link href={href} className="recipe-card__title-link">
            {recipe.title}
          </Link>
        </h3>
        {!compact && <p className="recipe-card__desc">{recipe.description}</p>}
        <div className="chip-row">
          {matchedItems.slice(0, 3).map((item) => (
            <Link
              key={item.id}
              href={`/app/flyer/product/${encodeURIComponent(item.id)}`}
              className="chip chip--sale"
            >
              {item.name.split(" ").slice(0, 2).join(" ")}
            </Link>
          ))}
          {estimatedSavings > 0 && (
            <span className="chip chip--save">Save {formatMoney(estimatedSavings)}</span>
          )}
        </div>
        {!action ? (
          <Link href={href} className="btn btn--ghost btn--compact" style={{ alignSelf: "flex-start" }}>
            View recipe
          </Link>
        ) : (
          action
        )}
      </div>
    </article>
  );
}
