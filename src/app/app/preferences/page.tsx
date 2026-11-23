"use client";

import { useEffect, useState } from "react";
import { useAppState } from "@/context/AppState";
import type { Allergy, DietPreference, GoalFocus } from "@/lib/types";

const diets: { id: DietPreference; label: string }[] = [
  { id: "omnivore", label: "Omnivore" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "pescatarian", label: "Pescatarian" },
  { id: "keto", label: "Keto" },
  { id: "mediterranean", label: "Mediterranean" },
];

const allergies: { id: Allergy; label: string }[] = [
  { id: "dairy", label: "Dairy" },
  { id: "gluten", label: "Gluten" },
  { id: "nuts", label: "Nuts" },
  { id: "shellfish", label: "Shellfish" },
  { id: "eggs", label: "Eggs" },
  { id: "soy", label: "Soy" },
];

const goals: { id: GoalFocus; label: string }[] = [
  { id: "save-money", label: "Save money" },
  { id: "eat-healthy", label: "Eat healthier" },
  { id: "family-meals", label: "Family meals" },
  { id: "quick-weeknights", label: "Quick weeknights" },
  { id: "high-protein", label: "High protein" },
];

function toggleInList<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function PreferencesPage() {
  const {
    preferences,
    updatePreferences,
    ready,
    merchants,
    flyerSource,
    flyerWarning,
  } = useAppState();
  const [postalDraft, setPostalDraft] = useState(preferences.postalCode);

  useEffect(() => {
    setPostalDraft(preferences.postalCode);
  }, [preferences.postalCode]);

  if (!ready) return <p className="page-lede">Loading preferences…</p>;

  return (
    <main>
      <h1 className="page-title">Your preferences</h1>
      <p className="page-lede">
        Set your postal code to load local flyer deals, then tune diet and goals
        so RecipeGain personalizes the week for you.
      </p>

      <form className="panel form-grid" onSubmit={(e) => e.preventDefault()}>
        <div className="field">
          <label htmlFor="postal">Postal code</label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <input
              id="postal"
              value={postalDraft}
              onChange={(e) => setPostalDraft(e.target.value.toUpperCase())}
              placeholder="M5V 2T6"
              maxLength={7}
              style={{ flex: 1, minWidth: "8rem" }}
            />
            <button
              type="button"
              className="btn btn--primary btn--compact"
              onClick={() => updatePreferences({ postalCode: postalDraft })}
            >
              Update location
            </button>
          </div>
          <p className="list-item__meta" style={{ marginTop: "0.45rem" }}>
            {flyerSource === "live"
              ? "Using live third-party flyer deals for this area."
              : flyerWarning || "Sample flyers until a live API token is configured."}
          </p>
        </div>

        <div className="field">
          <label htmlFor="pref-store">Preferred store</label>
          <select
            id="pref-store"
            value={preferences.storeId}
            onChange={(e) => updatePreferences({ storeId: e.target.value })}
            disabled={merchants.length === 0}
          >
            {merchants.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name} ({store.itemCount} deals)
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Diet</label>
          <div className="option-grid">
            {diets.map((diet) => (
              <button
                key={diet.id}
                type="button"
                className={
                  preferences.diet === diet.id ? "option is-selected" : "option"
                }
                onClick={() => updatePreferences({ diet: diet.id })}
              >
                {diet.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Allergies to avoid</label>
          <div className="option-grid">
            {allergies.map((allergy) => (
              <button
                key={allergy.id}
                type="button"
                className={
                  preferences.allergies.includes(allergy.id)
                    ? "option is-selected"
                    : "option"
                }
                onClick={() =>
                  updatePreferences({
                    allergies: toggleInList(preferences.allergies, allergy.id),
                  })
                }
              >
                {allergy.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Goals</label>
          <div className="option-grid">
            {goals.map((goal) => (
              <button
                key={goal.id}
                type="button"
                className={
                  preferences.goals.includes(goal.id)
                    ? "option is-selected"
                    : "option"
                }
                onClick={() =>
                  updatePreferences({
                    goals: toggleInList(preferences.goals, goal.id),
                  })
                }
              >
                {goal.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="servings">Household servings</label>
          <input
            id="servings"
            type="number"
            min={1}
            max={12}
            value={preferences.servings}
            onChange={(e) =>
              updatePreferences({
                servings: Math.max(1, Number(e.target.value) || 1),
              })
            }
          />
        </div>
      </form>
    </main>
  );
}
