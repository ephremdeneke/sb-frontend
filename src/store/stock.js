import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useNotificationStore } from "./notifications";

function formatISODateOnly(d) {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return "";
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function ensurePositiveNumber(v, fieldName) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`${fieldName} must be a positive number`);
  }
  return n;
}

function ensureNonNegativeNumber(v, fieldName) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`${fieldName} must be a non-negative number`);
  }
  return n;
}

const seedIngredients = [
  { id: "ing-flour", name: "Flour", unit: "kg", stock: 100, minThreshold: 20 },
  { id: "ing-sugar", name: "Sugar", unit: "kg", stock: 35, minThreshold: 15 },
  { id: "ing-oil", name: "Oil", unit: "liter", stock: 12, minThreshold: 5 },
];

const seedMovements = [
  {
    id: "mov-1",
    ingredientId: "ing-flour",
    ingredientName: "Flour",
    unit: "kg",
    type: "IN",
    quantity: 50,
    date: formatISODateOnly(Date.now() - 86400000 * 10),
    supplier: "Default Supplier",
    reason: "",
    userLabel: "system",
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: "mov-2",
    ingredientId: "ing-sugar",
    ingredientName: "Sugar",
    unit: "kg",
    type: "OUT",
    quantity: 10,
    date: formatISODateOnly(Date.now() - 86400000 * 7),
    supplier: "",
    reason: "Production",
    userLabel: "system",
    createdAt: Date.now() - 86400000 * 7,
  },
];

export const useStockStore = create(
  persist(
    (set, get) => ({
      ingredients: seedIngredients,
      movements: seedMovements,

      lowStockThresholdFor: (ingredientId) => {
        const ing = get().ingredients.find((x) => x.id === ingredientId);
        return ing?.minThreshold ?? 0;
      },

      upsertIngredient: ({ id, name, unit, initialStock, minThreshold }) => {
        const stock = ensureNonNegativeNumber(initialStock ?? 0, "initialStock");
        const threshold = ensureNonNegativeNumber(minThreshold ?? 0, "minThreshold");
        const normalizedUnit = String(unit).trim().toLowerCase();

        if (!id) {
          const newId = crypto.randomUUID();
          set((prev) => ({
            ingredients: [
              ...prev.ingredients,
              { id: newId, name: name.trim(), unit: normalizedUnit, stock, minThreshold: threshold },
            ],
          }));
          useNotificationStore.getState().notifySuccess(
            "Ingredient added",
            `${name.trim()} added with stock ${stock}`
          );
          return;
        }

        set((prev) => ({
          ingredients: prev.ingredients.map((x) =>
            x.id === id ? { ...x, name: name.trim(), unit: normalizedUnit, stock, minThreshold: threshold } : x
          ),
        }));

        useNotificationStore.getState().notifySuccess("Ingredient updated", `${name.trim()} updated`);
      },

      updateIngredientMeta: ({ id, name, unit, minThreshold }) => {
        const threshold = ensureNonNegativeNumber(minThreshold ?? 0, "minThreshold");
        const normalizedUnit = String(unit).trim().toLowerCase();
        set((prev) => ({
          ingredients: prev.ingredients.map((x) =>
            x.id === id ? { ...x, name: name.trim(), unit: normalizedUnit, minThreshold: threshold } : x
          ),
        }));
      },

      deleteIngredient: (id) => {
        set((prev) => ({ ingredients: prev.ingredients.filter((x) => x.id !== id) }));
      },

      stockIn: ({ ingredientId, quantity, date, supplier, userLabel }) => {
        const qty = ensurePositiveNumber(quantity, "quantity");
        const dateOnly = date ? formatISODateOnly(date) : formatISODateOnly(Date.now());

        const ing = get().ingredients.find((x) => x.id === ingredientId);
        if (!ing) throw new Error("Ingredient not found");

        const movement = {
          id: crypto.randomUUID(),
          ingredientId: ing.id,
          ingredientName: ing.name,
          unit: ing.unit,
          type: "IN",
          quantity: qty,
          date: dateOnly,
          supplier: supplier ?? "",
          reason: "",
          userLabel: userLabel ?? "",
          createdAt: Date.now(),
        };

        set((prev) => ({
          ingredients: prev.ingredients.map((x) =>
            x.id === ingredientId ? { ...x, stock: x.stock + qty } : x
          ),
          movements: [movement, ...prev.movements],
        }));

        useNotificationStore.getState().notifySuccess("Stock in recorded", `${ing.name} +${qty} ${ing.unit}`);
        return movement;
      },

      stockOut: ({ ingredientId, quantity, date, reason, userLabel }) => {
        const qty = ensurePositiveNumber(quantity, "quantity");
        const dateOnly = date ? formatISODateOnly(date) : formatISODateOnly(Date.now());

        const ing = get().ingredients.find((x) => x.id === ingredientId);
        if (!ing) throw new Error("Ingredient not found");

        if (ing.stock - qty < 0) {
          throw new Error(`Insufficient stock. Available: ${ing.stock} ${ing.unit}`);
        }

        const movement = {
          id: crypto.randomUUID(),
          ingredientId: ing.id,
          ingredientName: ing.name,
          unit: ing.unit,
          type: "OUT",
          quantity: qty,
          date: dateOnly,
          supplier: "",
          reason: reason ?? "",
          userLabel: userLabel ?? "",
          createdAt: Date.now(),
        };

        set((prev) => ({
          ingredients: prev.ingredients.map((x) =>
            x.id === ingredientId ? { ...x, stock: x.stock - qty } : x
          ),
          movements: [movement, ...prev.movements],
        }));

        const nextStock = ing.stock - qty;
        const threshold = ing.minThreshold ?? 0;
        if (nextStock === 0) {
          useNotificationStore.getState().notifyError("Out of stock", `${ing.name} is out of stock`);
        } else if (nextStock <= threshold) {
          useNotificationStore.getState().notifyLowStock(ing.name, nextStock, threshold);
        }

        useNotificationStore.getState().notifySuccess("Stock out recorded", `${ing.name} -${qty} ${ing.unit}`);
        return movement;
      },
    }),
    { name: "bms-stock-storage" }
  )
);

