import type { ExternalDeal } from "@/lib/flyers/external";
import type { PriceUnitKind } from "@/lib/types";

export interface InferredPricing {
  unit: string;
  unitKind: PriceUnitKind;
  unitLabel: string;
  packageSize?: string;
  saleStory?: string;
}

function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function parsePackageSize(text: string): string | undefined {
  const patterns = [
    /(\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?\s*(?:kg|g|lb|oz|ml|l))\b/i,
    /(\d+(?:\.\d+)?\s*(?:kg|g|lb|oz|ml|l))\b/i,
    /(\d+\s*(?:pk|pack|ct|count|pcs|pieces?))\b/i,
    /(\d+\s*x\s*\d+(?:\.\d+)?\s*(?:kg|g|ml|l|oz))\b/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return clean(match[1]);
  }
  return undefined;
}

function fromPriceText(priceText: string): InferredPricing | null {
  const text = priceText.toLowerCase();

  const multi = text.match(/(\d+)\s*(?:for|\/)\s*\$?\s*(\d+(?:\.\d+)?)/i);
  if (multi) {
    return {
      unit: `${multi[1]}/${multi[2]}`,
      unitKind: "multi",
      unitLabel: `${multi[1]} for $${multi[2]}`,
      saleStory: clean(priceText),
    };
  }

  if (/\/\s*lb|per\s*lb|\blb\b/.test(text)) {
    return { unit: "/lb", unitKind: "weight", unitLabel: "per lb" };
  }
  if (/\/\s*kg|per\s*kg|\bkg\b/.test(text)) {
    return { unit: "/kg", unitKind: "weight", unitLabel: "per kg" };
  }
  if (/\/\s*100\s*g|per\s*100\s*g/.test(text)) {
    return { unit: "/100g", unitKind: "weight", unitLabel: "per 100 g" };
  }
  if (/\/\s*oz|per\s*oz/.test(text)) {
    return { unit: "/oz", unitKind: "weight", unitLabel: "per oz" };
  }
  if (/\/\s*l\b|per\s*l\b|\/\s*litre/.test(text)) {
    return { unit: "/L", unitKind: "volume", unitLabel: "per L" };
  }
  if (/\/\s*100\s*ml|per\s*100\s*ml/.test(text)) {
    return { unit: "/100ml", unitKind: "volume", unitLabel: "per 100 ml" };
  }
  if (/\bea\b|each|\/\s*ea/.test(text)) {
    return { unit: "ea", unitKind: "each", unitLabel: "each" };
  }
  if (/pack|bag|can|bunch|pkg|carton/.test(text)) {
    return { unit: "pack", unitKind: "pack", unitLabel: "per pack" };
  }

  return null;
}

function inferFromNameAndCategory(
  name: string,
  category: string,
): InferredPricing {
  const hay = `${name} ${category}`;
  const packageSize = parsePackageSize(hay);

  if (packageSize) {
    const normalized = packageSize.toLowerCase();
    if (/(kg|g|lb|oz)\b/.test(normalized) && !/pk|pack|ct|count/.test(normalized)) {
      // Named weight usually means that package sells at a total price.
      return {
        unit: "pack",
        unitKind: "pack",
        unitLabel: `per ${packageSize} pack`,
        packageSize,
      };
    }
    if (/(ml|l)\b/.test(normalized)) {
      return {
        unit: "pack",
        unitKind: "pack",
        unitLabel: `per ${packageSize}`,
        packageSize,
      };
    }
    return {
      unit: "pack",
      unitKind: "pack",
      unitLabel: `per ${packageSize}`,
      packageSize,
    };
  }

  // Loose meat / seafood without a package size is almost always sold by weight.
  if (
    /\b(beef|pork|lamb|veal|chicken|turkey|salmon|cod|tilapia|shrimp|prawn|fish|steak|roast|loin|brisket|ground|fillet|cutlet|wing|thigh|drumstick|sausage|salami|bologna|shawarma|kebab|kebbeh)\b/i.test(
      name,
    ) ||
    /\b(meat|seafood|poultry|deli)\b/i.test(category)
  ) {
    // Deli sliced meats sometimes sell /100g or /lb; default /lb for CA flyers.
    if (/\b(salami|bologna|mortadella|prosciutto|shaved|sliced)\b/i.test(name)) {
      return {
        unit: "/100g",
        unitKind: "weight",
        unitLabel: "per 100 g (typical deli)",
      };
    }
    return { unit: "/lb", unitKind: "weight", unitLabel: "per lb" };
  }

  if (
    /\b(apple|banana|orange|potato|onion|tomato|carrot|pepper|avocado|lemon|lime|garlic|ginger)\b/i.test(
      name,
    ) ||
    /\bproduce\b/i.test(category)
  ) {
    // Many produce items are per lb; bagged/count items fall through to each.
    if (/\b(bag|bunch|pint|quart|pack|pk)\b/i.test(name)) {
      return { unit: "pack", unitKind: "pack", unitLabel: "per pack" };
    }
    if (
      /\b(banana|avocado|pineapple|lettuce|cabbage|cauliflower|broccoli|celery)\b/i.test(
        name,
      )
    ) {
      return { unit: "ea", unitKind: "each", unitLabel: "each" };
    }
    return { unit: "/lb", unitKind: "weight", unitLabel: "per lb" };
  }

  return { unit: "ea", unitKind: "each", unitLabel: "each" };
}

/**
 * Infer how a flyer deal is priced. Prefers explicit flyer price text,
 * then sale story, then product name / category cues.
 */
export function inferPricing(deal: ExternalDeal): InferredPricing {
  const name = deal.name || "";
  const category = deal.category || "";
  const saleStory = deal.saleStory?.trim() || undefined;

  if (deal.priceText?.trim()) {
    const fromText = fromPriceText(deal.priceText);
    if (fromText) {
      const packageSize = parsePackageSize(`${name} ${deal.priceText}`);
      return {
        ...fromText,
        packageSize: packageSize || fromText.packageSize,
        saleStory: saleStory || fromText.saleStory,
      };
    }
  }

  if (saleStory) {
    const fromStory = fromPriceText(saleStory);
    if (fromStory) {
      return {
        ...fromStory,
        packageSize: parsePackageSize(`${name} ${saleStory}`),
        saleStory,
      };
    }
  }

  const inferred = inferFromNameAndCategory(name, category);
  return {
    ...inferred,
    saleStory,
  };
}

export function formatUnitPrice(amount: number, unit: string): string {
  const money = `$${amount.toFixed(2)}`;
  if (!unit || unit === "ea" || unit === "each") return `${money} ea`;
  if (unit.startsWith("/")) return `${money}${unit}`;
  if (unit.includes("/")) return `${money} (${unit})`;
  return `${money} ${unit}`;
}

/**
 * True when unitLabel only repeats what formatUnitPrice already shows
 * (e.g. "$9.99/lb" + "per lb"). Keep labels that add pack size or multi-buy detail.
 */
export function unitLabelIsRedundant(unit: string, unitLabel: string): boolean {
  const label = unitLabel.trim().toLowerCase();
  if (!label) return true;

  if (unit.startsWith("/")) {
    const suffix = unit.slice(1).toLowerCase().replace(/\s+/g, "");
    const compact = label.replace(/\s+/g, "");
    // "per lb", "per lb.", "/lb" ↔ unit "/lb"
    if (compact === `per${suffix}` || compact === suffix || compact === `/${suffix}`) {
      return true;
    }
  }

  if (unit === "ea" || unit === "each") {
    return label === "each" || label === "ea" || label === "per each";
  }

  if (unit === "pack" && (label === "per pack" || label === "pack")) {
    return true;
  }

  return false;
}
