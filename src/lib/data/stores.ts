export const stores = [
  {
    id: "freshmart",
    name: "FreshMart",
    region: "Greater Toronto",
  },
  {
    id: "valuefoods",
    name: "Value Foods",
    region: "GTA East",
  },
  {
    id: "greenaisle",
    name: "Green Aisle",
    region: "Downtown",
  },
] as const;

export type StoreId = (typeof stores)[number]["id"];
