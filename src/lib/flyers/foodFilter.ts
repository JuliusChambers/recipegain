import type { ExternalDeal } from "@/lib/flyers/external";

/** Non-food / seasonal / household patterns that show up in grocery flyers. */
const NON_FOOD_PATTERN =
  /\b(christmas|xmas|balsam|fir\s*tree|trees?|wreath|garland|ornament|poinsettia|halloween|easter\s*basket|gift\s*card|electronics?|batter(?:y|ies)|phone|charger|headphones?|speaker|tv\b|laptop|diapers?|pull[\s-]?ups|laundry|detergent|fabric\s*softener|bleach|disinfectant|cleaner|cleaning|toilet|paper\s*towel|tissue|napkin|trash|garbage|bin\s*liner|light\s*bulb|bulb|extension\s*cord|propane|charcoal|lighter|fluid|motor\s*oil|antifreeze|socks?|underwear|apparel|clothing|shoes?|toys?|lego|puzzle|book\b|magazine|dvd|blu[\s-]?ray|shampoo|conditioner|toothpaste|toothbrush|deodorant|soap|body\s*wash|lotion|razor|pads?|tampons?|cat\s*litter|dog\s*food|cat\s*food|pet\s*food|bird\s*seed|aquarium|fertilizer|soil|mulch|plant\s*pot|hose\b|shovel|rake|grill|bbq\s*tool|foil\s*pan|aluminum\s*foil|plastic\s*wrap|ziploc|storage\s*bag|freezer\s*bag|parchment|wax\s*paper|cling\s*wrap|sandwich\s*bag|food\s*wrap|container\s*set|tupperware|cookware|bakeware|utensil|cutlery|plate|bowl|mug|glassware|candle|air\s*freshener|insect|pesticide|weed|hardware|tool\s*set|duct\s*tape|glue|paint|nail\s*polish|makeup|cosmetic|perfume|jewelry|watch\b|wallet|backpack|luggage|suitcase)\b/i;

const FOOD_CATEGORY_PATTERN =
  /\b(food|beverage|grocery|groceries|produce|meat|seafood|poultry|dairy|bakery|deli|frozen|pantry|snack|fruit|vegetable|drink|alcohol|beer|wine|spirits|condiment|sauce|spice|cereal|pasta|rice|bean|legume|egg|cheese|yogurt|milk|bread|dessert|candy|chocolate|coffee|tea|juice|water|soup|oil|vinegar|nut|seed|tofu|plant[\s-]?based)\b/i;

const FOOD_NAME_PATTERN =
  /\b(chicken|turkey|beef|pork|lamb|veal|salmon|tuna|cod|shrimp|fish|meat|steak|sausage|bacon|ham|tofu|tempeh|egg|eggs|milk|cream|butter|cheese|yogurt|kefir|bread|bagel|bun|tortilla|pita|rice|pasta|noodle|quinoa|oat|cereal|flour|sugar|salt|pepper|spice|herb|garlic|onion|tomato|potato|carrot|broccoli|spinach|kale|lettuce|salad|avocado|pepper|zucchini|mushroom|bean|lentil|chickpea|hummus|apple|banana|berry|berries|orange|lemon|lime|grape|fruit|vegetable|produce|juice|soda|water|coffee|tea|wine|beer|sauce|salsa|soup|broth|stock|oil|vinegar|honey|maple|jam|peanut|almond|walnut|nut|seed|granola|cracker|chip|pretzel|chocolate|cookie|cake|pie|ice\s*cream|frozen|pizza|dumpling|wonton|sushi|shawarma|falafel|burger|hot\s*dog|deli|roast|ground|fillet|loin|breast|thigh|wing|rib|chop)\b/i;

function haystack(deal: ExternalDeal): string {
  return [deal.name, deal.category, deal.brand, deal.flyerName, deal.saleStory]
    .filter(Boolean)
    .join(" ");
}

/**
 * Keep only edible / drinkable grocery items useful for meal planning.
 */
export function isFoodDeal(deal: ExternalDeal): boolean {
  const name = (deal.name || "").trim();
  if (!name) return false;

  const text = haystack(deal);
  if (NON_FOOD_PATTERN.test(text)) return false;

  const category = deal.category || "";
  if (FOOD_CATEGORY_PATTERN.test(category)) return true;
  if (FOOD_NAME_PATTERN.test(name)) return true;

  // Flipp often nests food under "Food, Beverages & Tobacco > Food Items"
  if (/food\s*items/i.test(category)) return true;
  if (/beverages?/i.test(category)) return true;

  return false;
}

export function filterFoodDeals(deals: ExternalDeal[]): ExternalDeal[] {
  return deals.filter(isFoodDeal);
}
