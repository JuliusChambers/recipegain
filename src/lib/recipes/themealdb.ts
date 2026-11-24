import type { FlyerItem, MatchedRecipe, Recipe } from "@/lib/types";

const MEALDB_BASE = "https://www.themealdb.com/api/json/v1/1";

interface MealDbSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb?: string;
}

interface MealDbDetail extends MealDbSummary {
  strInstructions?: string | null;
  strArea?: string | null;
  strCategory?: string | null;
  [key: string]: string | null | undefined;
}

/** Map flyer product wording → TheMealDB ingredient filter terms (try in order). */
const INGREDIENT_CANDIDATES: { pattern: RegExp; ingredient: string }[] = [
  { pattern: /\bchicken\b/i, ingredient: "chicken" },
  { pattern: /\bturkey\b/i, ingredient: "chicken" },
  { pattern: /\bbeef\b|\bsteak\b|\bground\s*beef\b/i, ingredient: "beef" },
  { pattern: /\bpork\b|\bchop\b/i, ingredient: "pork" },
  { pattern: /\bbacon\b/i, ingredient: "bacon" },
  { pattern: /\bsausage\b/i, ingredient: "sausages" },
  { pattern: /\bham\b/i, ingredient: "ham" },
  { pattern: /\bsalmon\b/i, ingredient: "salmon" },
  { pattern: /\bcod\b|\btilapia\b|\bhaddock\b|\bwhitefish\b/i, ingredient: "cod" },
  { pattern: /\btuna\b/i, ingredient: "tuna" },
  { pattern: /\bshrimp\b|\bprawn\b/i, ingredient: "shrimp" },
  { pattern: /\beggs?\b/i, ingredient: "eggs" },
  { pattern: /\bmilk\b/i, ingredient: "milk" },
  { pattern: /\bcheese\b|\bcheddar\b|\bmozzarella\b/i, ingredient: "cheddar cheese" },
  { pattern: /\byogurt\b|\byoghurt\b/i, ingredient: "yogurt" },
  { pattern: /\bbutter\b/i, ingredient: "butter" },
  { pattern: /\brice\b/i, ingredient: "rice" },
  { pattern: /\bpasta\b|\bspaghetti\b/i, ingredient: "spaghetti" },
  { pattern: /\boats?\b|\boatmeal\b/i, ingredient: "oats" },
  { pattern: /\bbread\b|\bbaguette\b|\bbun\b/i, ingredient: "bread" },
  { pattern: /\bpotato/i, ingredient: "potato" },
  { pattern: /\btomato/i, ingredient: "tomato" },
  { pattern: /\bonion\b/i, ingredient: "onion" },
  { pattern: /\bgarlic\b/i, ingredient: "garlic" },
  { pattern: /\bbroccoli\b/i, ingredient: "broccoli" },
  { pattern: /\bspinach\b/i, ingredient: "spinach" },
  { pattern: /\bmushroom/i, ingredient: "mushrooms" },
  { pattern: /\bcarrot/i, ingredient: "carrot" },
  { pattern: /\bcabbage\b/i, ingredient: "cabbage" },
  { pattern: /\bcorn\b/i, ingredient: "corn" },
  { pattern: /\bpepper\b|\bbell\b/i, ingredient: "pepper" },
  { pattern: /\bcucumber\b/i, ingredient: "cucumber" },
  { pattern: /\blettuce\b/i, ingredient: "lettuce" },
  { pattern: /\bcelery\b/i, ingredient: "celery" },
  { pattern: /\bapple/i, ingredient: "apple" },
  { pattern: /\bbanana/i, ingredient: "banana" },
  { pattern: /\borange/i, ingredient: "orange" },
  { pattern: /\blemon/i, ingredient: "lemon" },
  { pattern: /\bstrawberry|blueberr|raspberr|berr/i, ingredient: "strawberries" },
  { pattern: /\bpineapple/i, ingredient: "pineapple" },
  { pattern: /\bavocado/i, ingredient: "avocado" },
  { pattern: /\btofu\b/i, ingredient: "tofu" },
  { pattern: /\blentil/i, ingredient: "lentils" },
  { pattern: /\bchickpea|garbanzo/i, ingredient: "chickpeas" },
  { pattern: /\bbeans?\b/i, ingredient: "beans" },
  { pattern: /\bcauliflower\b/i, ingredient: "cauliflower" },
];

export function ingredientCandidatesFromProduct(name: string): string[] {
  const hits = INGREDIENT_CANDIDATES.filter((entry) => entry.pattern.test(name)).map(
    (entry) => entry.ingredient,
  );
  if (hits.length) return [...new Set(hits)];

  // Fallback: longest word over 3 chars
  const tokens = name
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 3)
    .sort((a, b) => b.length - a.length);
  return tokens.slice(0, 2);
}

function hueFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) % 360;
  return hash;
}

function parseIngredients(detail: MealDbDetail): Recipe["ingredients"] {
  const list: Recipe["ingredients"] = [];
  for (let i = 1; i <= 20; i += 1) {
    const name = detail[`strIngredient${i}`]?.trim();
    const quantity = detail[`strMeasure${i}`]?.trim() || "";
    if (!name) continue;
    list.push({ name, quantity: quantity || "to taste" });
  }
  return list;
}

function parseSteps(instructions?: string | null): string[] {
  if (!instructions?.trim()) return ["See full instructions on TheMealDB."];
  return instructions
    .split(/\r?\n+/)
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function mealDetailToRecipe(detail: MealDbDetail, keyword: string): Recipe {
  return {
    id: `mealdb-${detail.idMeal}`,
    title: detail.strMeal,
    description: [
      detail.strCategory ? `${detail.strCategory} recipe` : "Community recipe",
      detail.strArea ? `from TheMealDB (${detail.strArea})` : "from TheMealDB",
      `matched to “${keyword}”.`,
    ].join(" "),
    cookMinutes: 35,
    servings: 4,
    dietTags: ["omnivore"],
    allergyFlags: [],
    healthTags: ["themealdb"],
    ingredients: parseIngredients(detail),
    steps: parseSteps(detail.strInstructions),
    matchKeywords: [keyword],
    imageHue: hueFromId(detail.idMeal),
    imageUrl: detail.strMealThumb || undefined,
    source: "themealdb",
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) {
    throw new Error(`TheMealDB error ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function searchMealDbByIngredient(
  ingredient: string,
  limit = 6,
): Promise<MealDbSummary[]> {
  const url = `${MEALDB_BASE}/filter.php?i=${encodeURIComponent(ingredient)}`;
  const data = await fetchJson<{ meals: MealDbSummary[] | null }>(url);
  return (data.meals ?? []).slice(0, limit);
}

export async function lookupMealDb(id: string): Promise<MealDbDetail | null> {
  const url = `${MEALDB_BASE}/lookup.php?i=${encodeURIComponent(id)}`;
  const data = await fetchJson<{ meals: MealDbDetail[] | null }>(url);
  return data.meals?.[0] ?? null;
}

export async function recipesFromProductName(
  productName: string,
  options?: { limit?: number },
): Promise<{ recipes: Recipe[]; ingredientUsed: string | null }> {
  const limit = options?.limit ?? 6;
  const candidates = ingredientCandidatesFromProduct(productName);

  for (const ingredient of candidates) {
    const summaries = await searchMealDbByIngredient(ingredient, limit);
    if (!summaries.length) continue;

    const details = await Promise.all(
      summaries.map((meal) => lookupMealDb(meal.idMeal)),
    );
    const recipes = details
      .filter((detail): detail is MealDbDetail => Boolean(detail))
      .map((detail) => mealDetailToRecipe(detail, ingredient));

    if (recipes.length) {
      return { recipes, ingredientUsed: ingredient };
    }
  }

  return { recipes: [], ingredientUsed: null };
}

export function toMatchedRecipes(
  recipes: Recipe[],
  item: FlyerItem,
  flyerItems: FlyerItem[],
): MatchedRecipe[] {
  return recipes.map((recipe, index) => {
    const estimatedSavings = item.regularPrice - item.salePrice;
    const missingIngredients = recipe.ingredients
      .slice(0, 8)
      .filter(
        (ing) =>
          !flyerItems.some((flyerItem) =>
            flyerItem.name.toLowerCase().includes(ing.name.toLowerCase().split(" ")[0] ?? ""),
          ),
      )
      .map((ing) => ing.name);

    return {
      recipe,
      matchedItems: [item],
      matchScore: 20 - index,
      estimatedSavings: Number(Math.max(0, estimatedSavings).toFixed(2)),
      missingIngredients,
    };
  });
}
