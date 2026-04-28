import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStockStore } from "../store/stock";
import { useAuthStore } from "../store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

function toDateOnlyInput(d) {
  const x = new Date(d);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseDateOnly(dateStr) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function StockDashboard() {
  const role = useAuthStore((s) => s.role);
  const navigate = useNavigate();

  const ingredients = useStockStore((s) => s.ingredients);
  const movements = useStockStore((s) => s.movements);

  const [days] = useState(30);

  const summary = useMemo(() => {
    const totalIngredients = ingredients.length;
    const low = ingredients.filter((x) => {
      const threshold = Number(x.minThreshold ?? 0);
      if (!threshold) return false;
      return Number(x.stock ?? 0) < threshold;
    });
    const totalStock = ingredients.reduce((sum, x) => sum + Number(x.stock ?? 0), 0);
    return { totalIngredients, lowCount: low.length, totalStock };
  }, [ingredients]);

  const chartData = useMemo(() => {
    const now = new Date();
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      dates.push(toDateOnlyInput(d));
    }

    const outMap = new Map();
    for (const m of movements) {
      if (m.type !== "OUT") continue;
      const d = parseDateOnly(m.date);
      if (!d) continue;
      const label = toDateOnlyInput(d);
      // only last N days
      if (!dates.includes(label)) continue;
      outMap.set(label, (outMap.get(label) ?? 0) + Number(m.quantity ?? 0));
    }

    return dates.map((date) => ({
      date,
      out: Math.round((outMap.get(date) ?? 0) * 100) / 100,
    }));
  }, [movements, days]);

  const topUsed = useMemo(() => {
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));

    const byIng = new Map();
    for (const m of movements) {
      if (m.type !== "OUT") continue;
      const d = parseDateOnly(m.date);
      if (!d) continue;
      if (d < new Date(from.toDateString())) continue;
      const key = m.ingredientName ?? m.ingredientId;
      byIng.set(key, (byIng.get(key) ?? 0) + Number(m.quantity ?? 0));
    }

    return Array.from(byIng.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [movements, days]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Stock Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Real-time inventory summary and usage trends ({days} days)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/stock/movements")}>
            Add Stock In / Out
          </Button>
          <div className="text-xs text-slate-500 hidden sm:block">
            Role: <span className="font-semibold">{role}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{summary.lowCount}</div>
            <div className="mt-1 text-sm text-slate-600">Ingredients below their threshold</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{summary.totalIngredients}</div>
            <div className="mt-1 text-sm text-slate-600">Tracked inventory items</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{summary.totalStock}</div>
            <div className="mt-1 text-sm text-slate-600">Sum of all ingredient quantities</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usage Trend (Stock Out)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={20} />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="out" stroke="#f97316" fill="#fdba74" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Ingredients Used</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topUsed.length === 0 ? (
              <div className="text-sm text-slate-600">No stock-out movements in the selected window.</div>
            ) : (
              topUsed.map((x) => (
                <div key={x.name} className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-slate-900 truncate">{x.name}</div>
                  <Badge tone="warning">{x.qty}</Badge>
                </div>
              ))
            )}
            <div className="pt-2 text-xs text-slate-500">
              Tip: record Stock Out transactions to populate usage data.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Low Stock List</CardTitle>
        </CardHeader>
        <CardContent>
          {ingredients.length === 0 ? null : ingredients.filter((x) => {
            const threshold = Number(x.minThreshold ?? 0);
            if (!threshold) return false;
            return Number(x.stock ?? 0) < threshold;
          }).length === 0 ? (
            <div className="text-sm text-slate-600">All ingredients are above their minimum threshold.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {ingredients
                .filter((x) => {
                  const threshold = Number(x.minThreshold ?? 0);
                  if (!threshold) return false;
                  return Number(x.stock ?? 0) < threshold;
                })
                .map((x) => (
                  <div key={x.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="font-semibold text-slate-900">{x.name}</div>
                    <div className="mt-2 text-sm text-slate-700">
                      Stock: {x.stock} {x.unit}
                    </div>
                    <div className="text-xs text-slate-600">Threshold: {x.minThreshold}</div>
                    <div className="mt-3">
                      <Badge tone="warning">LOW</Badge>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

