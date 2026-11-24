import { Suspense } from "react";
import { RecipeDetailClient } from "./RecipeDetailClient";

export default function RecipeDetailPage() {
  return (
    <Suspense fallback={<p className="page-lede">Loading recipe…</p>}>
      <RecipeDetailClient />
    </Suspense>
  );
}
