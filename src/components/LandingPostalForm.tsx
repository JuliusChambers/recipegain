"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAppState } from "@/context/AppState";

function normalizePostal(value: string): string {
  const compact = value.replace(/\s+/g, "").toUpperCase();
  if (compact.length !== 6) return value.trim().toUpperCase();
  return `${compact.slice(0, 3)} ${compact.slice(3)}`;
}

export function LandingPostalForm({
  variant = "hero",
  id,
}: {
  variant?: "hero" | "footer";
  id?: string;
}) {
  const router = useRouter();
  const { preferences, updatePreferences } = useAppState();
  const [postal, setPostal] = useState(preferences.postalCode || "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (preferences.postalCode) setPostal(preferences.postalCode);
  }, [preferences.postalCode]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = normalizePostal(postal);
    const compact = next.replace(/\s+/g, "");
    if (!/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(compact)) {
      setError("Enter a Canadian postal code like M5V 2T6");
      return;
    }
    setError(null);
    setPending(true);
    updatePreferences({ postalCode: next });
    router.push("/app");
  }

  return (
    <form
      id={id}
      className={
        variant === "hero" ? "postal-cta postal-cta--hero" : "postal-cta postal-cta--footer"
      }
      onSubmit={onSubmit}
    >
      <label className="postal-cta__label" htmlFor={id ? `${id}-input` : "postal-start"}>
        Your postal code
      </label>
      <div className="postal-cta__row">
        <input
          id={id ? `${id}-input` : "postal-start"}
          name="postalCode"
          value={postal}
          onChange={(e) => setPostal(e.target.value.toUpperCase())}
          placeholder="M5V 2T6"
          maxLength={7}
          autoComplete="postal-code"
          inputMode="text"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "postal-error" : undefined}
        />
        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? "Loading…" : "Get my deals"}
        </button>
      </div>
      {error ? (
        <p id="postal-error" className="postal-cta__error" role="alert">
          {error}
        </p>
      ) : (
        <p className="postal-cta__hint">
          We’ll pull this week’s flyer promotions near you.
        </p>
      )}
    </form>
  );
}
