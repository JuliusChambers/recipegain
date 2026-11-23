"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { LandingPostalForm } from "@/components/LandingPostalForm";
import { useAppState } from "@/context/AppState";
import type { DietPreference, GoalFocus } from "@/lib/types";

const priorities: {
  id: GoalFocus;
  label: string;
  promise: string;
}[] = [
  {
    id: "save-money",
    label: "Stretch my grocery budget",
    promise: "Meals scored to what’s actually on sale near you.",
  },
  {
    id: "eat-healthy",
    label: "Eat a bit healthier",
    promise: "Produce, lean proteins, and balanced plates get a boost.",
  },
  {
    id: "quick-weeknights",
    label: "Keep weeknights fast",
    promise: "Shorter cook times rise to the top of your matches.",
  },
  {
    id: "family-meals",
    label: "Feed the household",
    promise: "Family-friendly recipes and servings you can scale.",
  },
  {
    id: "high-protein",
    label: "Hit more protein",
    promise: "Chicken, fish, eggs, beans, and tofu deals get priority.",
  },
];

const diets: { id: DietPreference; label: string }[] = [
  { id: "omnivore", label: "I eat most things" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "pescatarian", label: "Pescatarian" },
  { id: "mediterranean", label: "Mediterranean-ish" },
  { id: "keto", label: "Lower carb / keto" },
];

const sampleMeals = [
  {
    id: "garlic-chicken-rice-bowl",
    title: "Garlic chicken rice bowl",
    deal: "Chicken + broccoli deals",
    hue: 145,
    goals: ["save-money", "high-protein", "family-meals"] as GoalFocus[],
    diets: ["omnivore", "mediterranean"] as DietPreference[],
    list: ["Chicken breast", "Broccoli", "Jasmine rice"],
  },
  {
    id: "lemon-salmon-spinach",
    title: "Lemon salmon & spinach",
    deal: "Salmon promo",
    hue: 195,
    goals: ["eat-healthy", "high-protein", "quick-weeknights"] as GoalFocus[],
    diets: ["omnivore", "pescatarian", "mediterranean", "keto"] as DietPreference[],
    list: ["Salmon fillets", "Baby spinach", "Lemon"],
  },
  {
    id: "black-bean-tomato-skillet",
    title: "Smoky black bean skillet",
    deal: "Beans + tomatoes on sale",
    hue: 25,
    goals: ["save-money", "eat-healthy", "family-meals"] as GoalFocus[],
    diets: ["omnivore", "vegetarian", "vegan", "mediterranean"] as DietPreference[],
    list: ["Black beans", "Roma tomatoes", "Onion"],
  },
  {
    id: "sweet-potato-tofu-tray",
    title: "Sweet potato tofu tray",
    deal: "Tofu + sweet potato specials",
    hue: 28,
    goals: ["eat-healthy", "high-protein", "quick-weeknights"] as GoalFocus[],
    diets: ["vegetarian", "vegan"] as DietPreference[],
    list: ["Firm tofu", "Sweet potatoes", "Bell pepper"],
  },
  {
    id: "turkey-zucchini-pasta",
    title: "Turkey & zucchini pasta",
    deal: "Ground turkey + pasta",
    hue: 35,
    goals: ["family-meals", "high-protein", "save-money"] as GoalFocus[],
    diets: ["omnivore", "mediterranean"] as DietPreference[],
    list: ["Ground turkey", "Whole wheat pasta", "Zucchini"],
  },
  {
    id: "quinoa-kale-bowl",
    title: "Warm quinoa kale bowl",
    deal: "Quinoa + greens",
    hue: 110,
    goals: ["eat-healthy", "quick-weeknights"] as GoalFocus[],
    diets: ["vegetarian", "vegan", "mediterranean"] as DietPreference[],
    list: ["Quinoa", "Kale", "Mushrooms"],
  },
];

function toggleValue<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function LandingJourney() {
  const router = useRouter();
  const { preferences, updatePreferences } = useAppState();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [pinnedMeals, setPinnedMeals] = useState<string[]>([
    "garlic-chicken-rice-bowl",
    "lemon-salmon-spinach",
  ]);

  const suggestedMeals = useMemo(() => {
    const scored = sampleMeals.map((meal) => {
      const goalHits = meal.goals.filter((g) =>
        preferences.goals.includes(g),
      ).length;
      const dietHit = meal.diets.includes(preferences.diet) ? 2 : 0;
      return { meal, score: goalHits + dietHit };
    });
    return scored
      .sort((a, b) => b.score - a.score)
      .map((s) => s.meal);
  }, [preferences.diet, preferences.goals]);

  const listItems = useMemo(() => {
    const items = new Map<string, string>();
    for (const meal of sampleMeals) {
      if (!pinnedMeals.includes(meal.id)) continue;
      for (const name of meal.list) {
        items.set(name.toLowerCase(), name);
      }
    }
    return Array.from(items.values());
  }, [pinnedMeals]);

  const prioritySummary =
    preferences.goals.length === 0
      ? "Pick what matters — we’ll shape your week around it."
      : `We’ll prioritize: ${priorities
          .filter((p) => preferences.goals.includes(p.id))
          .map((p) => p.label.toLowerCase())
          .join(", ")}.`;

  function setGoals(next: GoalFocus[]) {
    updatePreferences({ goals: next });
  }

  function setDiet(diet: DietPreference) {
    updatePreferences({ diet });
  }

  function toggleMeal(id: string) {
    setPinnedMeals((prev) => toggleValue(prev, id));
  }

  function continueToDeals() {
    const el = document.getElementById("ready");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openLiveWeek() {
    router.push("/app");
  }

  return (
    <div className="journey">
      <section
        id="priorities"
        className="section journey-section"
        aria-labelledby="priorities-title"
      >
        <p className="journey-kicker">Step 1 of 4</p>
        <h2 id="priorities-title" className="section__title">
          What should this week do for you?
        </h2>
        <p className="section__lede">
          Tap what matters. This isn’t brochure copy — it changes which meals
          and deals we push first.
        </p>
        <div className="choice-grid" role="group" aria-label="Weekly priorities">
          {priorities.map((item) => {
            const selected = preferences.goals.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                className={selected ? "choice is-selected" : "choice"}
                aria-pressed={selected}
                onClick={() => setGoals(toggleValue(preferences.goals, item.id))}
              >
                <span className="choice__label">{item.label}</span>
                <span className="choice__promise">{item.promise}</span>
              </button>
            );
          })}
        </div>
        <div className="journey-footer">
          <p className="journey-status">{prioritySummary}</p>
          <a href="#diet" className="btn btn--primary btn--compact">
            Next: how you eat
          </a>
        </div>
      </section>

      <section
        id="diet"
        className="section journey-section"
        aria-labelledby="diet-title"
      >
        <p className="journey-kicker">Step 2 of 4</p>
        <h2 id="diet-title" className="section__title">
          How do you usually eat?
        </h2>
        <p className="section__lede">
          One tap filters the sample week below — and your live matches later.
        </p>
        <div className="pill-row" role="group" aria-label="Diet">
          {diets.map((diet) => (
            <button
              key={diet.id}
              type="button"
              className={
                preferences.diet === diet.id ? "pill is-selected" : "pill"
              }
              aria-pressed={preferences.diet === diet.id}
              onClick={() => setDiet(diet.id)}
            >
              {diet.label}
            </button>
          ))}
        </div>
        <div className="journey-footer">
          <p className="journey-status">
            Showing meals that fit{" "}
            <strong>{diets.find((d) => d.id === preferences.diet)?.label}</strong>
            .
          </p>
          <a href="#sample-week" className="btn btn--primary btn--compact">
            Build a sample week
          </a>
        </div>
      </section>

      <section
        id="sample-week"
        className="preview-band journey-preview"
        aria-labelledby="sample-title"
      >
        <div className="preview-band__inner">
          <p className="journey-kicker">Step 3 of 4</p>
          <h2 id="sample-title" className="section__title">
            Pin meals you’d actually cook
          </h2>
          <p className="section__lede">
            These reshuffle from your priorities. Tap to pin — pinned meals fill
            your practice shopping list next.
          </p>
          <div className="preview-rail" role="list">
            {suggestedMeals.map((meal) => {
              const pinned = pinnedMeals.includes(meal.id);
              return (
                <button
                  key={meal.id}
                  type="button"
                  role="listitem"
                  className={
                    pinned ? "preview-meal preview-meal--pick is-pinned" : "preview-meal preview-meal--pick"
                  }
                  style={{ ["--meal-hue" as string]: meal.hue }}
                  aria-pressed={pinned}
                  onClick={() => toggleMeal(meal.id)}
                >
                  <span className="preview-meal__day">
                    {pinned ? "Pinned" : "Tap to pin"}
                  </span>
                  <h3>{meal.title}</h3>
                  <p>{meal.deal}</p>
                </button>
              );
            })}
          </div>
          <div className="journey-footer">
            <p className="journey-status">
              {pinnedMeals.length === 0
                ? "Pin at least one meal to build a list."
                : `${pinnedMeals.length} meal${pinnedMeals.length === 1 ? "" : "s"} pinned for your list.`}
            </p>
            <a href="#aisle-practice" className="btn btn--primary btn--compact">
              Practice the aisle list
            </a>
          </div>
        </div>
      </section>

      <section
        id="aisle-practice"
        className="section journey-section"
        aria-labelledby="aisle-title"
      >
        <p className="journey-kicker">Step 4 of 4</p>
        <h2 id="aisle-title" className="section__title">
          Cross it off like you’re in the aisle
        </h2>
        <p className="section__lede">
          This is the phone moment — sale-minded items from the meals you pinned.
          Try checking a few off.
        </p>

        {listItems.length === 0 ? (
          <div className="journey-empty">
            <p>No items yet — pin a meal above first.</p>
            <a href="#sample-week" className="btn btn--ghost btn--compact">
              Back to meals
            </a>
          </div>
        ) : (
          <ul className="practice-list">
            {listItems.map((item) => (
              <li key={item}>
                <label className={checked[item] ? "practice-item is-checked" : "practice-item"}>
                  <input
                    type="checkbox"
                    className="check"
                    checked={Boolean(checked[item])}
                    onChange={() =>
                      setChecked((prev) => ({
                        ...prev,
                        [item]: !prev[item],
                      }))
                    }
                  />
                  <span>
                    <strong>{item}</strong>
                    <em>From your pinned meals · on-sale style</em>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}

        <div className="journey-footer">
          <p className="journey-status">
            Ready for real flyer prices near you?
          </p>
          <button type="button" className="btn btn--primary btn--compact" onClick={continueToDeals}>
            Use my postal code
          </button>
        </div>
      </section>

      <section id="ready" className="closing-cta" aria-labelledby="ready-title">
        <div className="closing-cta__inner">
          <h2 id="ready-title" className="section__title">
            Turn this into your live week
          </h2>
          <p className="section__lede">
            We’ve saved your priorities
            {preferences.goals.length ? ` (${preferences.goals.length})` : ""} and
            diet. Enter your postal code to load this week’s food deals and swap
            the sample for real matches.
          </p>
          <LandingPostalForm id="closing" variant="footer" />
          <button
            type="button"
            className="btn btn--ghost"
            style={{ marginTop: "1rem" }}
            onClick={openLiveWeek}
          >
            Skip to app with current settings
          </button>
        </div>
      </section>
    </div>
  );
}
