import { useMemo, useState } from "react";
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

function downloadCsv(filename, rows) {
  const process = rows.map((r) =>
    r
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(",")
  );
  const blob = new Blob([process.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function parseDateOnly(dateStr) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export default function StockHistory() {
  const role = useAuthStore((s) => s.role);
  const userLabel = useAuthStore((s) => s.userLabel) ?? role;

  const ingredients = useStockStore((s) => s.ingredients);
  const movements = useStockStore((s) => s.movements);

  const [ingredientId, setIngredientId] = useState("all");
  const [type, setType] = useState("all"); // all | IN | OUT
  const [dateFrom, setDateFrom] = useState(() => toDateInputValue(Date.now() - 86400000 * 30));
  const [dateTo, setDateTo] = useState(() => toDateInputValue(Date.now()));
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 20;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = parseDateOnly(dateFrom);
    const to = parseDateOnly(dateTo);
    const end = to ? new Date(to.getTime() + 86400000 - 1) : null;

    return movements
      .filter((m) => {
        if (ingredientId !== "all" && m.ingredientId !== ingredientId) return false;
        if (type !== "all" && m.type !== type) return false;

        const d = parseDateOnly(m.date);
        if (from && d && d < from) return false;
        if (end && d && d > end) return false;

        if (q) {
          const hay = `${m.ingredientName} ${m.type} ${m.quantity} ${m.supplier} ${m.reason} ${m.userLabel}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [movements, ingredientId, type, dateFrom, dateTo, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = useMemo(() => {
    const p = Math.min(Math.max(1, page), totalPages);
    const start = (p - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, totalPages]);

  const exportCsv = () => {
    const rows = [
      ["Date", "Ingredient", "Type", "Quantity", "Supplier", "Reason", "User"],
      ...filtered.map((m) => [
        m.date,
        m.ingredientName,
        m.type,
        m.quantity,
        m.supplier ?? "",
        m.reason ?? "",
        m.userLabel ?? "",
      ]),
    ];
    downloadCsv("stock-history.csv", rows);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Stock History
          </h1>
          <p className="mt-1 text-sm text-slate-600">All stock movements with filters and CSV export</p>
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2">
              <label className="block text-gray-700 mb-1">Ingredient</label>
              <Select value={ingredientId} onChange={(e) => setIngredientId(e.target.value)}>
                <option value="all">All ingredients</option>
                {ingredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Type</label>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="all">All</option>
                <option value="IN">IN</option>
                <option value="OUT">OUT</option>
              </Select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">From</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">To</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Search</label>
            <Input
              placeholder="Search ingredient, supplier, reason, user..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Movements</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6 text-sm text-slate-600">No stock movements match your filters.</div>
          ) : (
            <div className="max-h-[640px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-white border-b border-slate-200">
                  <tr className="text-left">
                    <th className="p-3 font-semibold text-slate-700">Date</th>
                    <th className="p-3 font-semibold text-slate-700">Ingredient</th>
                    <th className="p-3 font-semibold text-slate-700">Type</th>
                    <th className="p-3 font-semibold text-slate-700">Quantity</th>
                    <th className="p-3 font-semibold text-slate-700">Supplier</th>
                    <th className="p-3 font-semibold text-slate-700">Reason</th>
                    <th className="p-3 font-semibold text-slate-700">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageRows.map((m) => (
                    <tr key={m.id} className="hover:bg-orange-50/40 transition">
                      <td className="p-3 text-slate-700">{m.date}</td>
                      <td className="p-3 font-semibold text-slate-900">{m.ingredientName}</td>
                      <td className="p-3">
                        {m.type === "IN" ? (
                          <Badge tone="success">IN</Badge>
                        ) : (
                          <Badge tone="danger">OUT</Badge>
                        )}
                      </td>
                      <td className="p-3 text-slate-700">
                        {m.quantity} {m.unit}
                      </td>
                      <td className="p-3 text-slate-700">{m.supplier || "—"}</td>
                      <td className="p-3 text-slate-700">{m.reason || "—"}</td>
                      <td className="p-3 text-slate-700">{m.userLabel || userLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min((page - 1) * pageSize + 1, filtered.length)}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(page * pageSize, filtered.length)}
                </span>{" "}
                of <span className="font-semibold text-slate-700">{filtered.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                <div className="text-sm font-semibold text-slate-700">
                  Page {Math.min(page, totalPages)} / {totalPages}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

