# RecipeGain

Turn weekly grocery flyer promotions into personalized meals and shopping lists.

## What it does

- Loads weekly grocery flyer deals by **Canadian postal code** (Apify third-party feed)
- Falls back to sample stores when no API token is set
- Matches recipes to sale items from a **local catalog** (~40 staples)
- Fills gaps via **TheMealDB** when a tapped flyer product has few/no local matches
- Filters by diet, allergies, and wellbeing goals
- Builds a 7-day meal plan and shopping list

## Run locally

```bash
npm install
cp .env.example .env.local
# Add APIFY_TOKEN from https://console.apify.com/settings/integrations
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Live deals use the Apify actor [`gratifying_graph/canada-grocery-deals`](https://apify.com/gratifying_graph/canada-grocery-deals) (pay-per-deal). Results are cached in-memory for 1 hour per postal code.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Client-side preferences + meal plan in `localStorage`

## Next steps

- Partner with Flipp FlyerKit for official access (see `docs/flipp-outreach-email.md`)
- Pull live recipe catalogs
- Add accounts and sync across web + native mobile
