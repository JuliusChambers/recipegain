import { NextRequest, NextResponse } from "next/server";
import { recipesFromProductName } from "@/lib/recipes/themealdb";

export async function GET(request: NextRequest) {
  const product =
    request.nextUrl.searchParams.get("product")?.trim() ||
    request.nextUrl.searchParams.get("q")?.trim() ||
    "";

  if (!product) {
    return NextResponse.json(
      { error: "Pass ?product= or ?q= with a flyer item name" },
      { status: 400 },
    );
  }

  try {
    const limit = Number(request.nextUrl.searchParams.get("limit") || 6);
    const { recipes, ingredientUsed } = await recipesFromProductName(product, {
      limit: Number.isFinite(limit) ? Math.min(limit, 10) : 6,
    });

    return NextResponse.json({
      source: "themealdb",
      product,
      ingredientUsed,
      count: recipes.length,
      recipes,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Recipe search failed";
    return NextResponse.json({ error: message, recipes: [] }, { status: 502 });
  }
}
