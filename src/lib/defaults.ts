import type { UserPreferences } from "@/lib/types";

export const defaultPreferences: UserPreferences = {
  diet: "omnivore",
  allergies: [],
  goals: ["save-money", "eat-healthy"],
  servings: 2,
  storeId: "freshmart",
  postalCode: "M5V 2T6",
};

export const STORAGE_KEYS = {
  preferences: "recipegain.preferences",
  mealPlan: "recipegain.mealPlan",
  shoppingChecked: "recipegain.shoppingChecked",
} as const;
