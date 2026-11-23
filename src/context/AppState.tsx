"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultPreferences, STORAGE_KEYS } from "@/lib/defaults";
import type { FlyerFetchResult } from "@/lib/flyers/external";
import {
  buildShoppingList,
  buildWeeklyMealPlan,
  matchRecipesToFlyer,
} from "@/lib/matching";
import type {
  MealPlanDay,
  ShoppingListItem,
  UserPreferences,
  WeeklyFlyer,
} from "@/lib/types";

interface AppStateValue {
  preferences: UserPreferences;
  setPreferences: (next: UserPreferences) => void;
  updatePreferences: (partial: Partial<UserPreferences>) => void;
  mealPlan: MealPlanDay[];
  setMealForDay: (day: string, recipeId: string | null) => void;
  regeneratePlan: () => void;
  shoppingList: ShoppingListItem[];
  toggleShoppingItem: (name: string) => void;
  ready: boolean;
  flyer: WeeklyFlyer | null;
  flyers: WeeklyFlyer[];
  merchants: { id: string; name: string; itemCount: number }[];
  flyerSource: "live" | "sample" | "loading";
  flyerWarning?: string;
  refreshFlyer: () => Promise<void>;
}

const AppStateContext = createContext<AppStateValue | null>(null);

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

function normalizePostalInput(value: string): string {
  const compact = value.replace(/\s+/g, "").toUpperCase();
  if (compact.length !== 6) return value.trim().toUpperCase();
  return `${compact.slice(0, 3)} ${compact.slice(3)}`;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferencesState] =
    useState<UserPreferences>(defaultPreferences);
  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>([]);
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);
  const [flyers, setFlyers] = useState<WeeklyFlyer[]>([]);
  const [merchants, setMerchants] = useState<
    { id: string; name: string; itemCount: number }[]
  >([]);
  const [flyerSource, setFlyerSource] = useState<"live" | "sample" | "loading">(
    "loading",
  );
  const [flyerWarning, setFlyerWarning] = useState<string | undefined>();

  const loadFlyer = useCallback(
    async (
      prefs: UserPreferences,
      opts?: { keepPlan?: boolean; refresh?: boolean },
    ) => {
      setFlyerSource("loading");
      try {
        const params = new URLSearchParams({
          postalCode: prefs.postalCode || defaultPreferences.postalCode,
        });
        if (opts?.refresh) params.set("refresh", "1");
        const response = await fetch(`/api/flyers?${params.toString()}`, {
          cache: "no-store",
        });
        const data = (await response.json()) as FlyerFetchResult;
        setFlyers(data.flyers);
        setMerchants(data.merchants);
        setFlyerSource(data.source);
        setFlyerWarning(data.warning);

        const preferred =
          data.flyers.find((f) => f.storeId === prefs.storeId) ?? data.flyers[0];

        if (preferred && preferred.storeId !== prefs.storeId) {
          setPreferencesState((prev) => ({ ...prev, storeId: preferred.storeId }));
        }

        if (preferred && !opts?.keepPlan) {
          const matches = matchRecipesToFlyer(preferred, {
            ...prefs,
            storeId: preferred.storeId,
          });
          setMealPlan(buildWeeklyMealPlan(matches));
          setCheckedMap({});
        }
      } catch (error) {
        setFlyerSource("sample");
        setFlyerWarning(
          error instanceof Error ? error.message : "Could not load flyer deals",
        );
      }
    },
    [],
  );

  useEffect(() => {
    const prefs = readJson(STORAGE_KEYS.preferences, defaultPreferences);
    if (!prefs.postalCode) prefs.postalCode = defaultPreferences.postalCode;

    const savedPlan = (() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEYS.mealPlan);
        return raw ? (JSON.parse(raw) as MealPlanDay[]) : [];
      } catch {
        return [];
      }
    })();
    const checked = readJson<Record<string, boolean>>(
      STORAGE_KEYS.shoppingChecked,
      {},
    );

    setPreferencesState(prefs);
    setCheckedMap(checked);
    if (savedPlan.length === 7) setMealPlan(savedPlan);

    void loadFlyer(prefs, { keepPlan: savedPlan.length === 7 }).finally(() =>
      setReady(true),
    );
  }, [loadFlyer]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(
      STORAGE_KEYS.preferences,
      JSON.stringify(preferences),
    );
  }, [preferences, ready]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEYS.mealPlan, JSON.stringify(mealPlan));
  }, [mealPlan, ready]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(
      STORAGE_KEYS.shoppingChecked,
      JSON.stringify(checkedMap),
    );
  }, [checkedMap, ready]);

  const flyer = useMemo(
    () =>
      flyers.find((f) => f.storeId === preferences.storeId) ?? flyers[0] ?? null,
    [flyers, preferences.storeId],
  );

  const setPreferences = useCallback((next: UserPreferences) => {
    setPreferencesState(next);
  }, []);

  const updatePreferences = useCallback(
    (partial: Partial<UserPreferences>) => {
      setPreferencesState((prev) => {
        const next = {
          ...prev,
          ...partial,
          postalCode:
            partial.postalCode != null
              ? normalizePostalInput(partial.postalCode)
              : prev.postalCode,
        };

        const postalChanged =
          partial.postalCode != null &&
          normalizePostalInput(partial.postalCode) !== prev.postalCode;
        const dietChanged =
          partial.diet != null ||
          partial.allergies != null ||
          partial.goals != null;

        if (postalChanged) {
          void loadFlyer(next);
        } else if (partial.storeId && flyer) {
          const selected =
            flyers.find((f) => f.storeId === partial.storeId) ?? flyer;
          const matches = matchRecipesToFlyer(selected, next);
          setMealPlan(buildWeeklyMealPlan(matches));
          setCheckedMap({});
        } else if (dietChanged && flyer) {
          const matches = matchRecipesToFlyer(flyer, next);
          setMealPlan(buildWeeklyMealPlan(matches));
          setCheckedMap({});
        }

        return next;
      });
    },
    [flyer, flyers, loadFlyer],
  );

  const regeneratePlan = useCallback(() => {
    if (!flyer) return;
    const matches = matchRecipesToFlyer(flyer, preferences);
    setMealPlan(buildWeeklyMealPlan(matches));
    setCheckedMap({});
  }, [flyer, preferences]);

  const setMealForDay = useCallback((day: string, recipeId: string | null) => {
    setMealPlan((prev) =>
      prev.map((entry) => (entry.day === day ? { ...entry, recipeId } : entry)),
    );
  }, []);

  const shoppingList = useMemo(() => {
    if (!flyer) return [];
    const matches = matchRecipesToFlyer(flyer, preferences);
    const list = buildShoppingList(flyer, matches, mealPlan);
    return list.map((item) => ({
      ...item,
      checked: Boolean(checkedMap[item.name.toLowerCase()]),
    }));
  }, [preferences, mealPlan, checkedMap, flyer]);

  const toggleShoppingItem = useCallback((name: string) => {
    const key = name.toLowerCase();
    setCheckedMap((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const refreshFlyer = useCallback(async () => {
    await loadFlyer(preferences, { refresh: true });
  }, [loadFlyer, preferences]);

  const value = useMemo(
    () => ({
      preferences,
      setPreferences,
      updatePreferences,
      mealPlan,
      setMealForDay,
      regeneratePlan,
      shoppingList,
      toggleShoppingItem,
      ready,
      flyer,
      flyers,
      merchants,
      flyerSource,
      flyerWarning,
      refreshFlyer,
    }),
    [
      preferences,
      setPreferences,
      updatePreferences,
      mealPlan,
      setMealForDay,
      regeneratePlan,
      shoppingList,
      toggleShoppingItem,
      ready,
      flyer,
      flyers,
      merchants,
      flyerSource,
      flyerWarning,
      refreshFlyer,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
