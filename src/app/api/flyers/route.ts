import { NextRequest, NextResponse } from "next/server";
import { weeklyFlyers } from "@/lib/data/flyers";
import { fetchDealsByPostalCode, hasApifyToken } from "@/lib/flyers/apify";
import {
  dealsToFlyers,
  summarizeMerchants,
  type FlyerFetchResult,
} from "@/lib/flyers/external";

const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map<string, { expires: number; payload: FlyerFetchResult }>();

function cacheKey(postalCode: string, merchant?: string) {
  return `${postalCode.replace(/\s+/g, "").toUpperCase()}::${merchant ?? ""}`;
}

export async function GET(request: NextRequest) {
  const postalCode =
    request.nextUrl.searchParams.get("postalCode")?.trim() || "M5V 2T6";
  const merchant =
    request.nextUrl.searchParams.get("merchant")?.trim() || undefined;
  const bust = request.nextUrl.searchParams.get("refresh") === "1";

  try {
    if (!hasApifyToken()) {
      const sample: FlyerFetchResult = {
        source: "sample",
        postalCode,
        flyers: weeklyFlyers,
        merchants: summarizeMerchants(weeklyFlyers),
        warning:
          "Live flyer feed is offline until APIFY_TOKEN is set. Showing sample stores.",
      };
      return NextResponse.json(sample);
    }

    const key = cacheKey(postalCode, merchant);
    const cached = cache.get(key);
    if (!bust && cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.payload);
    }

    const deals = await fetchDealsByPostalCode({ postalCode, merchant });
    const flyers = dealsToFlyers(deals, postalCode);

    if (flyers.length === 0) {
      return NextResponse.json({
        source: "live",
        postalCode,
        flyers: [],
        merchants: [],
        warning: `No priced grocery deals found near ${postalCode}. Try another postal code.`,
      } satisfies FlyerFetchResult);
    }

    const result: FlyerFetchResult = {
      source: "live",
      postalCode,
      flyers,
      merchants: summarizeMerchants(flyers),
    };
    cache.set(key, { expires: Date.now() + CACHE_TTL_MS, payload: result });
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load flyer deals";
    return NextResponse.json(
      {
        source: "sample",
        postalCode,
        flyers: weeklyFlyers,
        merchants: summarizeMerchants(weeklyFlyers),
        warning: message,
      } satisfies FlyerFetchResult,
      { status: 200 },
    );
  }
}
