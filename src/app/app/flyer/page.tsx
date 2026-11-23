"use client";

import { useEffect, useState } from "react";
import { useAppState } from "@/context/AppState";
import { formatMoney, matchRecipesToFlyer, savingsPercent } from "@/lib/matching";

export default function FlyerPage() {
  const {
    preferences,
    updatePreferences,
    ready,
    flyer,
    merchants,
    flyerSource,
    flyerWarning,
    refreshFlyer,
  } = useAppState();
  const [postalDraft, setPostalDraft] = useState(preferences.postalCode);

  useEffect(() => {
    setPostalDraft(preferences.postalCode);
  }, [preferences.postalCode]);

  if (!ready) return <p className="page-lede">Loading flyer…</p>;

  const matches = flyer ? matchRecipesToFlyer(flyer, preferences) : [];

  return (
    <main>
      <h1 className="page-title">Weekly flyer</h1>
      <p className="page-lede">
        Live promotions near your postal code from Canadian grocery chains.
        RecipeGain matches these items to meals and your shopping list.
      </p>

      <form
        className="panel form-grid"
        onSubmit={(e) => {
          e.preventDefault();
          updatePreferences({ postalCode: postalDraft });
        }}
      >
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
            <button type="submit" className="btn btn--primary btn--compact">
              Load deals
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--compact"
              onClick={() => void refreshFlyer()}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="field">
          <label htmlFor="store">Store</label>
          <select
            id="store"
            value={preferences.storeId}
            onChange={(e) => updatePreferences({ storeId: e.target.value })}
            disabled={merchants.length === 0}
          >
            {merchants.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name} ({store.itemCount} items)
              </option>
            ))}
          </select>
        </div>

        <p className="chip-row" style={{ margin: 0 }}>
          <span className={flyerSource === "live" ? "chip chip--sale" : "chip"}>
            {flyerSource === "loading"
              ? "Loading…"
              : flyerSource === "live"
                ? "Live postal deals"
                : "Sample data"}
          </span>
          {flyer && (
            <span className="chip">
              {flyer.weekLabel} · {matches.length} recipes matched
            </span>
          )}
        </p>
        {flyerWarning && (
          <p className="page-lede" style={{ margin: 0 }}>
            {flyerWarning}
          </p>
        )}
      </form>

      {!flyer ? (
        <div className="empty panel" style={{ marginTop: "1rem" }}>
          No flyer found for this postal code yet.
        </div>
      ) : (
        <div className="flyer-grid" style={{ marginTop: "1.25rem" }}>
          {flyer.items.map((item) => (
            <article key={item.id} className="flyer-item">
              <div>
                <p className="flyer-item__name">{item.name}</p>
                <p className="flyer-item__meta">
                  {item.category} · save{" "}
                  {savingsPercent(item.salePrice, item.regularPrice)}%
                </p>
              </div>
              <div className="price">
                <span className="price__sale">
                  {formatMoney(item.salePrice)}
                  <small style={{ fontSize: "0.7rem" }}> {item.unit}</small>
                </span>
                <span className="price__was">{formatMoney(item.regularPrice)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
