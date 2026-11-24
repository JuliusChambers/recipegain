"use client";

import { useAppState } from "@/context/AppState";
import { stores } from "@/lib/data/stores";
import { formatMoney } from "@/lib/matching";

export default function ShoppingListPage() {
  const {
    shoppingList,
    toggleShoppingItem,
    removeShoppingItem,
    ready,
    preferences,
  } = useAppState();
  const storeName =
    stores.find((s) => s.id === preferences.storeId)?.name ?? preferences.storeId;

  if (!ready) return <p className="page-lede">Preparing list…</p>;

  const remaining = shoppingList.filter((item) => !item.checked);
  const onSaleCount = remaining.filter((item) => item.onSale).length;
  const saleTotal = remaining
    .filter((item) => item.onSale && item.salePrice != null)
    .reduce((sum, item) => sum + (item.salePrice ?? 0), 0);

  return (
    <main>
      <h1 className="page-title">Shopping list</h1>
      <p className="page-lede">
        Generated from your weekly meals. Sale items from your selected store
        are highlighted so you capture the flyer savings. Remove anything you
        already have — regenerating meals restores the full list.
      </p>

      <div className="stat-row">
        <div className="stat">
          <span className="stat__label">To buy</span>
          <span className="stat__value">{remaining.length}</span>
        </div>
        <div className="stat">
          <span className="stat__label">On sale</span>
          <span className="stat__value">{onSaleCount}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Sale subtotal</span>
          <span className="stat__value">{formatMoney(saleTotal)}</span>
        </div>
      </div>

      <section className="panel">
        {shoppingList.length === 0 ? (
          <div className="empty">
            Build a meal plan first — your list will appear here.
          </div>
        ) : (
          shoppingList.map((item) => (
            <div
              key={item.name}
              className={item.checked ? "list-item is-checked" : "list-item"}
            >
              <input
                className="check"
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleShoppingItem(item.name)}
                aria-label={`Mark ${item.name} as bought`}
              />
              <div>
                <p className="list-item__name">{item.name}</p>
                <p className="list-item__meta">
                  {item.quantity}
                  {item.onSale ? " · on sale" : " · pantry / regular"}
                  {item.recipeTitles.length
                    ? ` · for ${item.recipeTitles.slice(0, 2).join(", ")}`
                    : ""}
                </p>
              </div>
              <div className="list-item__aside">
                <div className="price">
                  {item.onSale && item.salePrice != null ? (
                    <>
                      <span className="price__sale">
                        {formatMoney(item.salePrice)}
                      </span>
                      <span className="list-item__meta">{storeName}</span>
                    </>
                  ) : (
                    <span className="list-item__meta">—</span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn--ghost btn--compact"
                  onClick={() => removeShoppingItem(item.name)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
