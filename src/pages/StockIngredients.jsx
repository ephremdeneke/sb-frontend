import { useMemo, useState } from "react";
import { useAuthStore } from "../store/auth";
import { useStockStore } from "../store/stock";
import RoleProtectedRoute from "../components/RoleProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input, Select } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

const UNITS = ["kg", "liter", "pcs"];

function formatUnit(unit) {
  const u = String(unit || "").trim().toLowerCase();
  if (!u) return "-";
  return u;
}

export default function StockIngredients() {
  const role = useAuthStore((s) => s.role); // "manager" | "stockman"
  const userLabel = useAuthStore((s) => s.userLabel);

  const ingredients = useStockStore((s) => s.ingredients);
  const updateIngredientMeta = useStockStore((s) => s.updateIngredientMeta);
  const upsertIngredient = useStockStore((s) => s.upsertIngredient);
  const deleteIngredient = useStockStore((s) => s.deleteIngredient);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const editing = useMemo(() => ingredients.find((x) => x.id === editingId) ?? null, [ingredients, editingId]);

  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    unit: "kg",
    initialStock: "",
    minThreshold: "",
  });

  function openAdd() {
    setEditingId(null);
    setError(null);
    setForm({
      name: "",
      unit: "kg",
      initialStock: "",
      minThreshold: "",
    });
    setModalOpen(true);
  }

  function openEdit(ing) {
    setEditingId(ing.id);
    setError(null);
    setForm({
      name: ing.name,
      unit: ing.unit,
      initialStock: String(ing.stock), // kept for internal use; UI will treat as read-only
      minThreshold: String(ing.minThreshold ?? 0),
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setError(null);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    const name = form.name.trim();
    if (!name) return setError("Name is required");

    const minThreshold = form.minThreshold === "" ? 0 : form.minThreshold;
    const unit = form.unit;

    try {
      if (!editing) {
        const initialStock = form.initialStock === "" ? 0 : form.initialStock;
        upsertIngredient({
          id: null,
          name,
          unit,
          initialStock,
          minThreshold,
        });
      } else {
        updateIngredientMeta({
          id: editing.id,
          name,
          unit,
          minThreshold,
        });
      }

      closeModal();
    } catch (err) {
      setError(err?.message || "Failed to save ingredient");
    }
  }

  const lowItems = useMemo(() => {
    return ingredients.filter((x) => {
      const threshold = Number(x.minThreshold ?? 0);
      if (!threshold) return false;
      return Number(x.stock ?? 0) < threshold;
    });
  }, [ingredients]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Ingredient Stock Management
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage inventory with real-time stock updates and movement logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-600">
            Low stock: <span className="font-semibold">{lowItems.length}</span>
          </div>
          <Button type="button" onClick={openAdd}>
            + Add Ingredient
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ingredients</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {ingredients.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">No ingredients yet.</div>
          ) : (
            <div className="max-h-[620px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-white border-b border-slate-200">
                  <tr className="text-left">
                    <th className="p-3 font-semibold text-slate-700">Ingredient</th>
                    <th className="p-3 font-semibold text-slate-700">Unit</th>
                    <th className="p-3 font-semibold text-slate-700">Stock</th>
                    <th className="p-3 font-semibold text-slate-700">Min Threshold</th>
                    <th className="p-3 font-semibold text-slate-700">Status</th>
                    <th className="p-3 font-semibold text-slate-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ingredients.map((ing) => {
                    const stock = Number(ing.stock ?? 0);
                    const threshold = Number(ing.minThreshold ?? 0);
                    const isOut = stock === 0 && threshold > 0;
                    const isLow = !isOut && threshold > 0 && stock < threshold;

                    return (
                      <tr key={ing.id} className="hover:bg-orange-50/40 transition">
                        <td className="p-3 font-semibold text-slate-900">{ing.name}</td>
                        <td className="p-3 text-slate-700">{formatUnit(ing.unit)}</td>
                        <td className="p-3 text-slate-700">
                          {stock} {formatUnit(ing.unit)}
                        </td>
                        <td className="p-3 text-slate-700">{threshold}</td>
                        <td className="p-3">
                          {isOut ? (
                            <Badge tone="danger">OUT</Badge>
                          ) : isLow ? (
                            <Badge tone="warning">LOW</Badge>
                          ) : (
                            <Badge tone="success">OK</Badge>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(ing)}
                          >
                            Edit
                          </Button>

                          <RoleProtectedRoute roles={["manager"]}>
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              className="ml-2"
                              onClick={() => {
                                // simple confirm to avoid accidental delete
                                const ok = window.confirm(
                                  `Delete ingredient "${ing.name}"? This removes it from the ingredient list (history remains).`
                                );
                                if (!ok) return;
                                deleteIngredient(ing.id);
                              }}
                            >
                              Delete
                            </Button>
                          </RoleProtectedRoute>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl ring-1 ring-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                {editing ? "Edit Ingredient" : "Add Ingredient"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-sm"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                {error}
              </p>
            )}

            <form onSubmit={onSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-700 mb-1">Name</label>
                <Input
                  placeholder="e.g. Flour"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Unit</label>
                  <Select value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}>
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Min Threshold</label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.minThreshold}
                    onChange={(e) => setForm((p) => ({ ...p, minThreshold: e.target.value }))}
                    placeholder="e.g. 20"
                  />
                </div>
              </div>

              {!editing ? (
                <div>
                  <label className="block text-gray-700 mb-1">Initial Stock</label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.initialStock}
                    onChange={(e) => setForm((p) => ({ ...p, initialStock: e.target.value }))}
                    placeholder="e.g. 100"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-gray-700 mb-1">Current Stock</label>
                  <div className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 flex items-center text-slate-700">
                    {editing ? `${editing.stock} ${formatUnit(editing.unit)}` : ""}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Adjust stock using the Stock In / Out page.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save
                </Button>
              </div>
            </form>

            {/* Using userLabel to avoid unused var warning if you extend auditing later */}
            <div className="hidden" aria-hidden="true">
              {userLabel ?? ""}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

