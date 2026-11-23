import { isFoodDeal } from "@/lib/flyers/foodFilter";
import type { FlyerItem, WeeklyFlyer } from "@/lib/types";

export interface ExternalDeal {
  dealId?: number | string;
  name?: string;
  merchant?: string;
  merchantId?: number | string;
  currentPrice?: number | null;
  originalPrice?: number | null;
  priceText?: string | null;
  saleStory?: string | null;
  category?: string | null;
  brand?: string | null;
  flyerId?: number | string;
  flyerName?: string | null;
  validFrom?: string | null;
  validTo?: string | null;
  discount?: number | string | null;
  imageUrl?: string | null;
}

export interface FlyerFetchResult {
  source: "live" | "sample";
  postalCode: string;
  flyers: WeeklyFlyer[];
  merchants: { id: string; name: string; itemCount: number }[];
  warning?: string;
}

const STOP_WORDS = new Set([
  "fresh",
  "organic",
  "boneless",
  "skinless",
  "large",
  "small",
  "pack",
  "pk",
  "each",
  "the",
  "and",
  "with",
  "for",
  "from",
  "extra",
  "value",
  "selected",
  "varieties",
]);

export function slugifyMerchant(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function extractUnit(priceText?: string | null): string {
  if (!priceText) return "each";
  const match = priceText.match(/\/\s*(lb|kg|g|ml|l|ea|each|pack|bag|can|bunch)/i);
  if (match) return `/${match[1].toLowerCase()}`;
  if (/\/\s*lb/i.test(priceText)) return "/lb";
  return "each";
}

function tagsFromName(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    .slice(0, 8);
}

function formatWeekLabel(from?: string | null, to?: string | null): string {
  const start = from ? new Date(from) : null;
  const end = to ? new Date(to) : null;
  if (!start || Number.isNaN(start.getTime())) return "This week";
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
  if (!end || Number.isNaN(end.getTime())) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}

export function dealsToFlyers(
  deals: ExternalDeal[],
  postalCode: string,
): WeeklyFlyer[] {
  const byMerchant = new Map<string, ExternalDeal[]>();

  for (const deal of deals) {
    const merchant = (deal.merchant || "").trim();
    if (!merchant || !deal.name) continue;
    if (deal.currentPrice == null || Number.isNaN(Number(deal.currentPrice))) {
      continue;
    }
    if (!isFoodDeal(deal)) continue;
    const key = slugifyMerchant(merchant);
    const list = byMerchant.get(key) ?? [];
    list.push(deal);
    byMerchant.set(key, list);
  }

  const flyers: WeeklyFlyer[] = [];

  for (const [storeId, merchantDeals] of byMerchant) {
    const storeName = merchantDeals[0]?.merchant?.trim() || storeId;
    const validFrom = merchantDeals.find((d) => d.validFrom)?.validFrom ?? null;
    const validTo = merchantDeals.find((d) => d.validTo)?.validTo ?? null;

    const items: FlyerItem[] = [];
    const seen = new Set<string>();

    for (const deal of merchantDeals) {
      const name = deal.name!.trim();
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const salePrice = Number(deal.currentPrice);
      const regularRaw =
        deal.originalPrice != null ? Number(deal.originalPrice) : NaN;
      const regularPrice =
        !Number.isNaN(regularRaw) && regularRaw > salePrice
          ? regularRaw
          : Number((salePrice * 1.25).toFixed(2));

      items.push({
        id: String(deal.dealId ?? `${storeId}-${items.length}`),
        name,
        category: deal.category?.split(">").pop()?.trim() || "Grocery",
        salePrice,
        regularPrice,
        unit: extractUnit(deal.priceText),
        tags: tagsFromName(name),
      });
    }

    if (items.length === 0) continue;

    flyers.push({
      id: `${storeId}-${postalCode.replace(/\s+/g, "").toLowerCase()}`,
      storeId,
      storeName,
      weekLabel: formatWeekLabel(validFrom, validTo),
      validFrom: validFrom ?? new Date().toISOString().slice(0, 10),
      validTo: validTo ?? new Date().toISOString().slice(0, 10),
      items: items.sort((a, b) => a.name.localeCompare(b.name)),
    });
  }

  return flyers.sort((a, b) => b.items.length - a.items.length);
}

export function summarizeMerchants(flyers: WeeklyFlyer[]) {
  return flyers.map((flyer) => ({
    id: flyer.storeId,
    name: flyer.storeName,
    itemCount: flyer.items.length,
  }));
}
