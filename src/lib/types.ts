export type DietPreference =
  | "omnivore"
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "keto"
  | "mediterranean";

export type Allergy =
  | "dairy"
  | "gluten"
  | "nuts"
  | "shellfish"
  | "eggs"
  | "soy";

export type GoalFocus =
  | "save-money"
  | "eat-healthy"
  | "family-meals"
  | "quick-weeknights"
  | "high-protein";

export interface UserPreferences {
  diet: DietPreference;
  allergies: Allergy[];
  goals: GoalFocus[];
  servings: number;
  storeId: string;
  postalCode: string;
}

export type PriceUnitKind =
  | "weight"
  | "volume"
  | "each"
  | "pack"
  | "multi";

export interface FlyerItem {
  id: string;
  name: string;
  category: string;
  salePrice: number;
  regularPrice: number;
  /** Short unit suffix for display, e.g. "/lb", "ea", "/kg", "pack". */
  unit: string;
  /** How the sale price is sold (weight vs pack vs each). */
  unitKind: PriceUnitKind;
  /** Human label shown under the price, e.g. "per lb", "per 150-170 g pack". */
  unitLabel: string;
  /** Optional size parsed from the product name (e.g. "2kg", "540ml"). */
  packageSize?: string;
  /** Promo line from the flyer when available (e.g. "2 for $5"). */
  saleStory?: string;
  tags: string[];
  /** Product photo from the flyer feed when available. */
  imageUrl?: string;
}

export interface WeeklyFlyer {
  id: string;
  storeId: string;
  storeName: string;
  weekLabel: string;
  validFrom: string;
  validTo: string;
  items: FlyerItem[];
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cookMinutes: number;
  servings: number;
  dietTags: DietPreference[];
  allergyFlags: Allergy[];
  healthTags: string[];
  ingredients: { name: string; quantity: string; optional?: boolean }[];
  steps: string[];
  matchKeywords: string[];
  imageHue: number;
  /** Optional photo (e.g. TheMealDB). */
  imageUrl?: string;
  source?: "local" | "themealdb";
}

export interface MatchedRecipe {
  recipe: Recipe;
  matchedItems: FlyerItem[];
  matchScore: number;
  estimatedSavings: number;
  missingIngredients: string[];
}

export interface MealPlanDay {
  day: string;
  recipeId: string | null;
}

export interface ShoppingListItem {
  name: string;
  quantity: string;
  onSale: boolean;
  salePrice?: number;
  storeName?: string;
  recipeTitles: string[];
  checked: boolean;
}
