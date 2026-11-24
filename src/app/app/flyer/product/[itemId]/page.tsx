import { Suspense } from "react";
import { ProductRecipesClient } from "./ProductRecipesClient";

export default function FlyerProductRecipesPage() {
  return (
    <Suspense fallback={<p className="page-lede">Loading recipes…</p>}>
      <ProductRecipesClient />
    </Suspense>
  );
}
