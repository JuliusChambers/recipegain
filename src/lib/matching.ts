import { recipes } from "@/lib/data/recipes";
import type {
  FlyerItem,
  MatchedRecipe,
  MealPlanDay,
  Recipe,
  ShoppingListItem,
  UserPreferences,
  WeeklyFlyer,
} from "@/lib/types";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").trim();
}

function itemMatchesKeyword(item: FlyerItem, keyword: string): boolean {
  const key = normalize(keyword);
  const haystack = normalize(
    [item.name, item.category, ...item.tags].join(" "),
  );
  return haystack.includes(key) || key.split(/\s+/).every((part) => haystack.includes(part));
}

function recipeFitsPreferences(recipe: Recipe, prefs: UserPreferences): boolean {
  if (prefs.diet !== "omnivore" && !recipe.dietTags.includes(prefs.diet)) {
    // Omnivore recipes can still work for many diets if tagged; strict diets need a match
    if (prefs.diet === "vegan" || prefs.diet === "vegetarian" || prefs.diet === "pescatarian" || prefs.diet === "keto") {
      return false;
    }
  }

  if (prefs.allergies.some((allergy) => recipe.allergyFlags.includes(allergy))) {
    return false;
  }

  return true;
}

function goalBoost(recipe: Recipe, prefs: UserPreferences): number {
  let boost = 0;
  for (const goal of prefs.goals) {
    if (goal === "save-money" && recipe.healthTags.includes("budget")) boost += 1.5;
    if (goal === "eat-healthy" && (recipe.healthTags.includes("heart-healthy") || recipe.healthTags.includes("balanced") || recipe.healthTags.includes("superfood"))) {
      boost += 1.5;
    }
    if (goal === "family-meals" && recipe.healthTags.includes("family")) boost += 1.5;
    if (goal === "quick-weeknights" && (recipe.cookMinutes <= 25 || recipe.healthTags.includes("quick"))) {
      boost += 1.5;
    }
    if (goal === "high-protein" && recipe.healthTags.includes("high-protein")) boost += 1.5;
  }
  return boost;
}

function recipeUsesFlyerItem(recipe: Recipe, item: FlyerItem): boolean {
  if (recipe.matchKeywords.some((keyword) => itemMatchesKeyword(item, keyword))) {
    return true;
  }
  if (
    recipe.ingredients.some(
      (ing) => itemMatchesKeyword(item, ing.name) || itemMatchesKeyword(item, normalize(ing.name)),
    )
  ) {
    return true;
  }

  const recipeText = normalize(
    [recipe.title, ...recipe.matchKeywords, ...recipe.ingredients.map((i) => i.name)].join(" "),
  );
  const tokens = normalize([item.name, ...item.tags].join(" "))
    .split(/\s+/)
    .filter((token) => token.length > 3);

  return tokens.some((token) => recipeText.includes(token));
}

function scoreRecipeMatch(
  recipe: Recipe,
  matchedItems: FlyerItem[],
  flyerItems: FlyerItem[],
  prefs: UserPreferences,
): MatchedRecipe {
  const estimatedSavings = matchedItems.reduce(
    (sum, item) => sum + (item.regularPrice - item.salePrice),
    0,
  );

  const missingIngredients = recipe.ingredients
    .filter((ing) => !ing.optional)
    .filter(
      (ing) =>
        !matchedItems.some((item) => itemMatchesKeyword(item, ing.name)) &&
        !flyerItems.some((item) => itemMatchesKeyword(item, ing.name)),
    )
    .map((ing) => ing.name);

  const coverage =
    recipe.matchKeywords.length > 0
      ? matchedItems.length / recipe.matchKeywords.length
      : 0;
  const matchScore =
    coverage * 10 +
    matchedItems.length * 2 +
    estimatedSavings +
    goalBoost(recipe, prefs) -
    missingIngredients.length * 0.5;

  return {
    recipe,
    matchedItems,
    matchScore,
    estimatedSavings: Number(estimatedSavings.toFixed(2)),
    missingIngredients,
  };
}

export function matchRecipesToFlyer(
  flyer: WeeklyFlyer,
  prefs: UserPreferences,
): MatchedRecipe[] {
  const matches: MatchedRecipe[] = [];

  for (const recipe of recipes) {
    if (!recipeFitsPreferences(recipe, prefs)) continue;

    const matchedItems: FlyerItem[] = [];
    for (const keyword of recipe.matchKeywords) {
      for (const item of flyer.items) {
        if (itemMatchesKeyword(item, keyword) && !matchedItems.some((m) => m.id === item.id)) {
          matchedItems.push(item);
        }
      }
    }

    if (matchedItems.length === 0) continue;
    matches.push(scoreRecipeMatch(recipe, matchedItems, flyer.items, prefs));
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/** Recipes that can use a specific sale item the shopper tapped. */
export function matchRecipesToFlyerItem(
  item: FlyerItem,
  prefs: UserPreferences,
  flyer?: WeeklyFlyer | null,
): MatchedRecipe[] {
  const flyerItems = flyer?.items ?? [item];
  const matches: MatchedRecipe[] = [];

  for (const recipe of recipes) {
    if (!recipeFitsPreferences(recipe, prefs)) continue;
    if (!recipeUsesFlyerItem(recipe, item)) continue;

    const matchedItems: FlyerItem[] = [item];
    for (const keyword of recipe.matchKeywords) {
      for (const other of flyerItems) {
        if (
          other.id !== item.id &&
          itemMatchesKeyword(other, keyword) &&
          !matchedItems.some((m) => m.id === other.id)
        ) {
          matchedItems.push(other);
        }
      }
    }

    matches.push(scoreRecipeMatch(recipe, matchedItems, flyerItems, prefs));
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

export function buildWeeklyMealPlan(matches: MatchedRecipe[]): MealPlanDay[] {
  const selected: MatchedRecipe[] = [];
  const usedIds = new Set<string>();

  for (const match of matches) {
    if (selected.length >= 7) break;
    if (usedIds.has(match.recipe.id)) continue;
    selected.push(match);
    usedIds.add(match.recipe.id);
  }

  // If fewer than 7 unique matches, cycle top recipes
  let i = 0;
  while (selected.length < 7 && matches.length > 0) {
    selected.push(matches[i % matches.length]);
    i += 1;
  }

  return DAYS.map((day, index) => ({
    day,
    recipeId: selected[index]?.recipe.id ?? null,
  }));
}

export function buildShoppingList(
  flyer: WeeklyFlyer,
  matches: MatchedRecipe[],
  mealPlan: MealPlanDay[],
): ShoppingListItem[] {
  const plannedIds = new Set(
    mealPlan.map((d) => d.recipeId).filter((id): id is string => Boolean(id)),
  );
  const plannedMatches = matches.filter((m) => plannedIds.has(m.recipe.id));

  const list = new Map<string, ShoppingListItem>();

  for (const match of plannedMatches) {
    for (const ingredient of match.recipe.ingredients) {
      const key = normalize(ingredient.name);
      const saleItem =
        match.matchedItems.find((item) => itemMatchesKeyword(item, ingredient.name)) ??
        flyer.items.find((item) => itemMatchesKeyword(item, ingredient.name));

      const existing = list.get(key);
      if (existing) {
        if (!existing.recipeTitles.includes(match.recipe.title)) {
          existing.recipeTitles.push(match.recipe.title);
        }
        continue;
      }

      list.set(key, {
        name: saleItem?.name ?? ingredient.name,
        quantity: ingredient.quantity,
        onSale: Boolean(saleItem),
        salePrice: saleItem?.salePrice,
        storeName: saleItem ? flyer.storeName : undefined,
        recipeTitles: [match.recipe.title],
        checked: false,
      });
    }
  }

  return Array.from(list.values()).sort((a, b) => {
    if (a.onSale !== b.onSale) return a.onSale ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function savingsPercent(sale: number, regular: number): number {
  if (regular <= 0) return 0;
  return Math.round(((regular - sale) / regular) * 100);
}

/** Prefer real dollar savings, then percent — used for “biggest deals”. */
export function dealRankScore(sale: number, regular: number): number {
  const dollars = Math.max(0, regular - sale);
  const percent = savingsPercent(sale, regular);
  return dollars * 10 + percent;
}
