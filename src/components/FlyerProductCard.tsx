"use client";

import Link from "next/link";
import { useState } from "react";
import type { FlyerItem } from "@/lib/types";
import { formatUnitPrice, unitLabelIsRedundant } from "@/lib/flyers/pricing";
import { savingsPercent } from "@/lib/matching";

function unitKindChip(item: FlyerItem): string {
  switch (item.unitKind) {
    case "weight":
      return "Sold by weight";
    case "volume":
      return "Sold by volume";
    case "pack":
      return "Pack price";
    case "multi":
      return "Multi-buy";
    default:
      return "Each";
  }
}

export function FlyerProductCard({ item }: { item: FlyerItem }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(item.imageUrl) && !failed;
  const href = `/app/flyer/product/${encodeURIComponent(item.id)}`;

  return (
    <article className="flyer-item flyer-item--media">
      <Link
        href={href}
        className="flyer-item__photo flyer-item__photo--link"
        aria-label={`Find recipes using ${item.name}`}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            className="flyer-item__img"
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flyer-item__placeholder" aria-hidden>
            <span>{item.name.slice(0, 1).toUpperCase()}</span>
          </div>
        )}
        <span className="flyer-item__photo-cue">Recipes</span>
      </Link>
      <div className="flyer-item__body">
        <div>
          <p className="flyer-item__name">
            <Link href={href} className="flyer-item__name-link">
              {item.name}
            </Link>
          </p>
          <p className="flyer-item__meta">
            {item.category} · {unitKindChip(item)} · save{" "}
            {savingsPercent(item.salePrice, item.regularPrice)}%
          </p>
          {item.packageSize ? (
            <p className="flyer-item__meta">Package: {item.packageSize}</p>
          ) : null}
          {item.saleStory ? (
            <p className="flyer-item__meta flyer-item__promo">{item.saleStory}</p>
          ) : null}
        </div>
        <div className="price">
          <span className="price__sale">
            {formatUnitPrice(item.salePrice, item.unit)}
          </span>
          {!unitLabelIsRedundant(item.unit, item.unitLabel) ? (
            <span className="price__unit">{item.unitLabel}</span>
          ) : null}
          <span className="price__was">
            was {formatUnitPrice(item.regularPrice, item.unit)}
          </span>
        </div>
      </div>
    </article>
  );
}
