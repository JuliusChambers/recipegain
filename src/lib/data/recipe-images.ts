/**
 * Plated dish photos for local recipes.
 * Prefer TheMealDB when the meal is a close match; otherwise use Unsplash/Pexels
 * photos chosen to match the dish (not just a shared ingredient).
 */
export const RECIPE_IMAGE_URLS: Record<string, string> = {
  "garlic-chicken-rice-bowl":
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&h=600&fit=crop",
  "lemon-salmon-spinach":
    "https://www.themealdb.com/images/media/meals/1548772327.jpg",
  "avocado-egg-toast-bowl":
    "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&h=600&fit=crop",
  "black-bean-tomato-skillet":
    "https://www.themealdb.com/images/media/meals/81ahfr1784394567.jpg",
  "turkey-zucchini-pasta":
    "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop",
  "chickpea-pepper-stew":
    "https://www.themealdb.com/images/media/meals/xvnx8j1763287209.jpg",
  "sweet-potato-tofu-tray":
    "https://www.themealdb.com/images/media/meals/minfsc1763766806.jpg",
  "overnight-oats-yogurt":
    "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=800",
  "quinoa-kale-bowl":
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
  "red-lentil-soup":
    "https://www.themealdb.com/images/media/meals/vwwspt1487394060.jpg",
  "herb-cod-vegetables":
    "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&h=600&fit=crop",
  "hummus-veggie-plate":
    "https://www.themealdb.com/images/media/meals/gpon5u1763801180.jpg",
  "skillet-beef-potato":
    "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&h=600&fit=crop",
  "garlic-butter-shrimp":
    "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&h=600&fit=crop",
  "honey-garlic-pork":
    "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&h=600&fit=crop",
  "bacon-egg-breakfast-hash":
    "https://www.themealdb.com/images/media/meals/khpso71779732715.jpg",
  "ham-cheese-frittata":
    "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&h=600&fit=crop",
  "sausage-pepper-skillet":
    "https://www.themealdb.com/images/media/meals/st1ifa1583267248.jpg",
  "cheesy-broccoli-bake":
    "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=800&h=600&fit=crop",
  "tomato-basil-soup":
    "https://www.themealdb.com/images/media/meals/stpuws1511191310.jpg",
  "crispy-potato-wedges":
    "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=800&h=600&fit=crop",
  "carrot-ginger-soup":
    "https://www.themealdb.com/images/media/meals/jcr46d1614763831.jpg",
  "cabbage-stir-fry":
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop",
  "corn-chowder":
    "https://www.themealdb.com/images/media/meals/rvtvuw1511190488.jpg",
  "banana-oat-pancakes":
    "https://www.themealdb.com/images/media/meals/sywswr1511383814.jpg",
  "baked-apple-cinnamon":
    "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&h=600&fit=crop",
  "orange-yogurt-parfait":
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=600&fit=crop",
  "strawberry-spinach-salad":
    "https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=800",
  "blueberry-muffin-bake":
    "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=800&h=600&fit=crop",
  "garlic-bread-caprese":
    "https://images.pexels.com/photos/23996593/pexels-photo-23996593.jpeg?auto=compress&cs=tinysrgb&w=800",
  "tuna-melt":
    "https://www.themealdb.com/images/media/meals/xutquv1505330523.jpg",
  "tilapia-lemon-asparagus":
    "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&h=600&fit=crop",
  "ground-chicken-lettuce-cups":
    "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop",
  "beef-stir-fry-broccoli":
    "https://www.themealdb.com/images/media/meals/m0p0j81765568742.jpg",
  "mushroom-risotto":
    "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&h=600&fit=crop",
  "cucumber-tomato-salad":
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop",
  "celery-chicken-soup":
    "https://www.themealdb.com/images/media/meals/lx1kkj1593349302.jpg",
  "pear-walnut-salad":
    "https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=800",
  "pineapple-chicken-skewers":
    "https://www.themealdb.com/images/media/meals/3um6il1763794322.jpg",
  "cauliflower-rice-bowl":
    "https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg?auto=compress&cs=tinysrgb&w=800",
  "green-bean-almondine":
    "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=800&h=600&fit=crop",
  "milk-rice-pudding":
    "https://www.themealdb.com/images/media/meals/jp09191782856005.jpg",
};

export function withRecipeImage<T extends { id: string; imageUrl?: string }>(
  recipe: T,
): T {
  if (recipe.imageUrl) return recipe;
  const imageUrl = RECIPE_IMAGE_URLS[recipe.id];
  return imageUrl ? { ...recipe, imageUrl } : recipe;
}
