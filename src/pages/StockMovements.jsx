import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../store/auth";
import { useStockStore } from "../store/stock";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input, Select } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

function toDateInputValue(d) {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return "";
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function StockMovements() {
  const role = useAuthStore((s) => s.role);
  const userLabel = useAuthStore((s) => s.userLabel) ?? role;

  const ingredients = useStockStore((s) => s.ingredients);
  const stockIn = useStockStore((s) => s.stockIn);
  const stockOut = useStockStore((s) => s.stockOut);

  const defaultIngredientId = ingredients[0]?.id ?? "";

  const [inForm, setInForm] = useState({
    ingredientId: defaultIngredientId,
    quantity: "",
    date: toDateInputValue(Date.now()),
    supplier: "",
  });

  const [outForm, setOutForm] = useState({
    ingredientId: defaultIngredientId,
    quantity: "",
    date: toDateInputValue(Date.now()),
    reason: "",
  });

  const [inError, setInError] = useState(null);
  const [outError, setOutError] = useState(null);

  const inIngredient = useMemo(
    () => ingredients.find((x) => x.id === inForm.ingredientId) ?? null,
    [ingredients, inForm.ingredientId]
  );
  const outIngredient = useMemo(
    () => ingredients.find((x) => x.id === outForm.ingredientId) ?? null,
    [ingredients, outForm.ingredientId]
  );

  // Keep selects valid if ingredients are added/removed.
  useEffect(() => {
    const inValid = ingredients.some((x) => x.id === inForm.ingredientId);
    const outValid = ingredients.some((x) => x.id === outForm.ingredientId);
    if (!inValid) setInForm((p) => ({ ...p, ingredientId: defaultIngredientId }));
    if (!outValid) setOutForm((p) => ({ ...p, ingredientId: defaultIngredientId }));
  }, [ingredients, defaultIngredientId, inForm.ingredientId, outForm.ingredientId]);

  function onSubmitStockIn(e) {
    e.preventDefault();
    setInError(null);

    const quantity = inForm.quantity;
    if (!inForm.ingredientId) return setInError("Select an ingredient");
    if (!quantity) return setInError("Quantity is required");

    stockIn({
      ingredientId: inForm.ingredientId,
      quantity,
      date: inForm.date,
      supplier: inForm.supplier,
      userLabel,
    })
      .then(() => {
        setInForm((p) => ({ ...p, quantity: "", supplier: "" }));
      })
      .catch((err) => setInError(err?.message || "Failed to record stock in"));
  }

  function onSubmitStockOut(e) {
    e.preventDefault();
    setOutError(null);

    const quantity = outForm.quantity;
    if (!outForm.ingredientId) return setOutError("Select an ingredient");
    if (!quantity) return setOutError("Quantity is required");
    if (!outForm.reason.trim()) return setOutError("Reason is required (production, waste, etc.)");

    stockOut({
      ingredientId: outForm.ingredientId,
      quantity,
      date: outForm.date,
      reason: outForm.reason,
      userLabel,
    })
      .then(() => {
        setOutForm((p) => ({ ...p, quantity: "", reason: "" }));
      })
      .catch((err) => setOutError(err?.message || "Failed to record stock out"));
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Stock In / Stock Out
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Update ingredient inventory with movement transactions and validation
        </p>
      </div>

      {ingredients.length === 0 ? (
        <Card>
          <CardContent className="text-sm text-slate-600 p-6">
            No ingredients available. Add an ingredient first.
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stock In</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {inError && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {inError}
                </p>
              )}

              <form onSubmit={onSubmitStockIn} className="space-y-4 text-sm">
                <div>
                  <label className="block text-gray-700 mb-1">Ingredient</label>
                  <Select
                    value={inForm.ingredientId}
                    onChange={(e) => setInForm((p) => ({ ...p, ingredientId: e.target.value }))}
                  >
                    {ingredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  {inIngredient ? (
                    <>
                      <Badge tone="primary">Current: {inIngredient.stock}</Badge>
                      <span className="text-xs text-slate-500">({inIngredient.unit})</span>
                    </>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 mb-1">Quantity</label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={inForm.quantity}
                      onChange={(e) => setInForm((p) => ({ ...p, quantity: e.target.value }))}
                      placeholder="e.g. 25"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Date</label>
                    <Input type="date" value={inForm.date} onChange={(e) => setInForm((p) => ({ ...p, date: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Supplier (optional)</label>
                  <Input
                    value={inForm.supplier}
                    onChange={(e) => setInForm((p) => ({ ...p, supplier: e.target.value }))}
                    placeholder="e.g. ABC Supplies"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit">Record Stock In</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stock Out</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {outError && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {outError}
                </p>
              )}

              <form onSubmit={onSubmitStockOut} className="space-y-4 text-sm">
                <div>
                  <label className="block text-gray-700 mb-1">Ingredient</label>
                  <Select
                    value={outForm.ingredientId}
                    onChange={(e) => setOutForm((p) => ({ ...p, ingredientId: e.target.value }))}
                  >
                    {ingredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  {outIngredient ? (
                    <>
                      <Badge tone="primary">Current: {outIngredient.stock}</Badge>
                      <span className="text-xs text-slate-500">({outIngredient.unit})</span>
                    </>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 mb-1">Quantity</label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={outForm.quantity}
                      onChange={(e) => setOutForm((p) => ({ ...p, quantity: e.target.value }))}
                      placeholder="e.g. 12"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Date</label>
                    <Input type="date" value={outForm.date} onChange={(e) => setOutForm((p) => ({ ...p, date: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Reason (required)</label>
                  <Input
                    value={outForm.reason}
                    onChange={(e) => setOutForm((p) => ({ ...p, reason: e.target.value }))}
                    placeholder="production, waste, etc."
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="outline">
                    Record Stock Out
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

