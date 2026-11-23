import type { ExternalDeal } from "@/lib/flyers/external";

const STANDBY_BASE =
  "https://gratifying-graph--canada-grocery-deals.apify.actor";

function normalizePostal(postalCode: string): string {
  return postalCode.replace(/\s+/g, "").toUpperCase();
}

export function hasApifyToken(): boolean {
  return Boolean(process.env.APIFY_TOKEN?.trim());
}

export async function fetchDealsByPostalCode(options: {
  postalCode: string;
  merchant?: string;
  maxItems?: number;
}): Promise<ExternalDeal[]> {
  const token = process.env.APIFY_TOKEN?.trim();
  if (!token) {
    throw new Error("APIFY_TOKEN is not configured");
  }

  const postal = normalizePostal(options.postalCode);
  if (!/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(postal)) {
    throw new Error("Enter a valid Canadian postal code (e.g. M5V 2T6)");
  }

  // Flyers mode: one grocery sweep capped for cost (~$0.002/deal + standby fee).
  const params = new URLSearchParams({
    postalCode: postal,
    mode: "flyers",
    category: "Groceries",
    locale: "en-ca",
    // Fetch extra raw items; non-food (trees, household, etc.) are filtered out.
    maxItems: String(options.maxItems ?? 220),
    onlyWithPrice: "true",
  });

  if (options.merchant) {
    params.set("merchant", options.merchant);
  }

  const url = `${STANDBY_BASE}/?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Flyer provider error (${response.status})${body ? `: ${body.slice(0, 180)}` : ""}`,
    );
  }

  const payload = (await response.json()) as {
    count?: number;
    deals?: ExternalDeal[];
  };

  return Array.isArray(payload.deals) ? payload.deals : [];
}
