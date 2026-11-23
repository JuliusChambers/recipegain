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

export interface FlyerItem {
  id: string;
  name: string;
  category: string;
  salePrice: number;
  regularPrice: number;
  unit: string;
  tags: string[];
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
