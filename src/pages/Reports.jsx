import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  FileDown,
  Printer,
  Search,
  TrendingDown,
  TrendingUp
} from "lucide-react";

function downloadCsv(filename, rows) {
  const process = rows.map((r) =>
    r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
  );
  const blob = new Blob([process.join("\n")], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function formatMoneyETB(v) {
  return `ETB ${Number(v || 0).toLocaleString()}`;
}

function toInputDateValue(d) {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return "";
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function Badge({ children, tone = "slate" }) {
  const tones = {
    green: "bg-green-50 text-green-700 ring-green-600/20",
    red: "bg-red-50 text-red-700 ring-red-600/20",
    orange: "bg-orange-50 text-orange-700 ring-orange-600/20",
    blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
    violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
    slate: "bg-slate-50 text-slate-700 ring-slate-600/20"
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        tones[tone] || tones.slate
      )}
    >
      {children}
    </span>
  );
}

function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-xl bg-slate-200/70", className)} />;
}

function SummaryCard({ title, value, accent = "orange", icon: Icon, trend }) {
  const accentMap = {
    green: "from-green-500/10 to-green-500/0 ring-green-600/20",
    red: "from-red-500/10 to-red-500/0 ring-red-600/20",
    orange: "from-orange-500/10 to-orange-500/0 ring-orange-600/20"
  };
  const trendUp = trend != null ? trend >= 0 : null;
  const TrendIcon = trendUp ? TrendingUp : TrendingDown;
  const trendText = trend == null ? null : `${trendUp ? "+" : ""}${Math.round(trend * 10) / 10}%`;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-inset",
        "transition-shadow hover:shadow-md",
        accentMap[accent] || accentMap.orange
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br opacity-100" />
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-slate-600">{title}</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {formatMoneyETB(value)}
            </div>
            {trendText && (
              <div className={cn("mt-2 inline-flex items-center gap-1 text-xs font-medium", trendUp ? "text-green-700" : "text-red-700")}>
                <TrendIcon className="h-4 w-4" />
                <span>{trendText}</span>
              </div>
            )}
          </div>
          <div className={cn("rounded-2xl p-3 ring-1 ring-inset", accent === "green" ? "bg-green-50 ring-green-200" : accent === "red" ? "bg-red-50 ring-red-200" : "bg-orange-50 ring-orange-200")}>
            <Icon className={cn("h-6 w-6", accent === "green" ? "text-green-700" : accent === "red" ? "text-red-700" : "text-orange-700")} />
          </div>
        </div>
      </div>
    </div>
  );
}

function normalizeSalesResponse(data) {
  const list = Array.isArray(data) ? data : data?.data ?? data?.sales ?? [];
  return Array.isArray(list) ? list : [];
}

function normalizeExpensesResponse(data) {
  const list = Array.isArray(data) ? data : data?.expenses ?? data?.data ?? [];
  return Array.isArray(list) ? list : [];
}

function toDate(v) {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeExpenseCategory(raw) {
  const s = String(raw ?? "").trim().toLowerCase();
  if (!s) return { key: "other", label: "Other" };
  if (s === "ingredient" || s === "ingredients" || s.startsWith("ingre")) {
    return { key: "ingredient", label: "Ingredient" };
  }
  if (s === "salary" || s === "salaries" || s.startsWith("sal")) {
    return { key: "salary", label: "Salary" };
  }
  if (s === "rent" || s.startsWith("ren")) {
    return { key: "rent", label: "Rent" };
  }
  return { key: s, label: raw ? String(raw) : "Other" };
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function Reports() {
  const [tab, setTab] = useState("expenses"); // expenses | sales
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return toInputDateValue(d);
  });
  const [endDate, setEndDate] = useState(() => toInputDateValue(new Date()));
  const [category, setCategory] = useState("all"); // all | salary | rent | ingredient
  const [pendingFilters, setPendingFilters] = useState({
    startDate: null,
    endDate: null,
    category: "all"
  });

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "date", dir: "desc" }); // key, dir: asc|desc
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [salesRes, expenseRes] = await Promise.all([
          api.get("/manage/sales"),
          api.get("/manage/expenses")
        ]);
        setSales(normalizeSalesResponse(salesRes.data));
        setExpenses(normalizeExpensesResponse(expenseRes.data));
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
          await logout();
          navigate("/login", { replace: true });
          return;
        }
        const isConnectionError =
          !err.response ||
          err.code === "ERR_NETWORK" ||
          err.code === "ECONNABORTED" ||
          err.code === "ECONNREFUSED";
        if (isConnectionError) setError("Backend offline — cannot load reports");
        else setError(err.response?.data?.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [logout, navigate]);

  useEffect(() => {
    // keep pending state synced on first render
    setPendingFilters({ startDate, endDate, category });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const salesNormalized = useMemo(() => {
    return sales
      .map((s) => {
        const dt = toDate(s.date || s.createdAt || s.at);
        return dt
          ? {
              ...s,
              _dt: dt,
              product: s.product ?? s.productName ?? s.name ?? "Unknown",
              quantity: Number(s.quantity ?? s.qty ?? 0),
              totalPrice: Number(s.totalPrice ?? s.total ?? 0)
            }
          : null;
      })
      .filter(Boolean);
  }, [sales]);

  const expensesNormalized = useMemo(() => {
    return expenses
      .map((e) => {
        const dt = toDate(e.createdAt || e.date || e.at);
        const cat = normalizeExpenseCategory(e.category);
        return dt
          ? {
              ...e,
              _dt: dt,
              categoryKey: cat.key,
              categoryLabel: cat.label,
              note: e.note ?? "",
              amount: Number(e.amount ?? 0)
            }
          : null;
      })
      .filter(Boolean);
  }, [expenses]);

  const range = useMemo(() => {
    const sd = toDate(startDate);
    const ed = toDate(endDate);
    const end = ed ? startOfDay(ed) : startOfDay(new Date());
    const start = sd ? startOfDay(sd) : (() => {
      const d = new Date(end);
      d.setDate(d.getDate() - 30);
      return d;
    })();
    // include end day fully
    const endInclusive = new Date(end);
    endInclusive.setHours(23, 59, 59, 999);
    return { start, end: endInclusive };
  }, [startDate, endDate]);

  const salesInRange = useMemo(() => {
    return salesNormalized.filter((s) => s._dt >= range.start && s._dt <= range.end);
  }, [salesNormalized, range]);

  const expensesInRange = useMemo(() => {
    return expensesNormalized.filter((e) => e._dt >= range.start && e._dt <= range.end);
  }, [expensesNormalized, range]);

  const expensesFiltered = useMemo(() => {
    const cat = category;
    const q = search.trim().toLowerCase();
    let rows = expensesInRange;
    if (cat !== "all") rows = rows.filter((e) => e.categoryKey === cat);
    if (q) {
      rows = rows.filter((e) => {
        const s =
          `${e.categoryLabel} ${e.categoryKey} ${e.note} ${e.amount} ${e._dt.toISOString()}`.toLowerCase();
        return s.includes(q);
      });
    }
    return rows;
  }, [expensesInRange, category, search]);

  const salesFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = salesInRange;
    if (q) {
      rows = rows.filter((s) => {
        const str = `${s.product} ${s.quantity} ${s.totalPrice} ${s._dt.toISOString()}`.toLowerCase();
        return str.includes(q);
      });
    }
    return rows;
  }, [salesInRange, search]);

  const kpis = useMemo(() => {
    const income = salesInRange.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
    const totalExpenses = expensesInRange.reduce((sum, e) => sum + (e.amount || 0), 0);
    return { income, expenses: totalExpenses, profit: income - totalExpenses };
  }, [salesInRange, expensesInRange]);

  const kpiTrends = useMemo(() => {
    // Compare to previous equal-length window for trend percent.
    const days = Math.max(1, Math.round((range.end - range.start) / (1000 * 60 * 60 * 24)));
    const prevEnd = new Date(range.start);
    prevEnd.setMilliseconds(prevEnd.getMilliseconds() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - days);

    const prevSales = salesNormalized.filter((s) => s._dt >= prevStart && s._dt <= prevEnd);
    const prevExp = expensesNormalized.filter((e) => e._dt >= prevStart && e._dt <= prevEnd);
    const prevIncome = prevSales.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
    const prevExpenses = prevExp.reduce((sum, e) => sum + (e.amount || 0), 0);
    const prevProfit = prevIncome - prevExpenses;

    const pct = (cur, prev) => {
      if (!prev) return null;
      return ((cur - prev) / Math.abs(prev)) * 100;
    };

    return {
      income: pct(kpis.income, prevIncome),
      expenses: pct(kpis.expenses, prevExpenses),
      profit: pct(kpis.profit, prevProfit)
    };
  }, [range, salesNormalized, expensesNormalized, kpis]);

  const expenseByCategory = useMemo(() => {
    const map = new Map();
    for (const e of expensesInRange) {
      const key = String(e.category || "other");
      map.set(key, (map.get(key) || 0) + (e.amount || 0));
    }
    return Array.from(map.entries())
      .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => b.amount - a.amount);
  }, [expensesInRange]);

  const salesRows = useMemo(() => {
    return [
      ["Date", "Product", "Quantity", "TotalPrice"],
      ...salesFiltered.map((s) => [
        s._dt.toLocaleString(),
        s.product,
        s.quantity,
        s.totalPrice
      ])
    ];
  }, [salesFiltered]);

  const expenseRows = useMemo(() => {
    return [
      ["Date", "Category", "Note", "Amount"],
      ...expensesFiltered.map((e) => [
        e._dt.toLocaleString(),
        e.categoryLabel ?? e.categoryKey,
        e.note ?? "",
        e.amount
      ])
    ];
  }, [expensesFiltered]);

  const expenseCategoryTone = (catRaw) => {
    const cat = String(catRaw || "").toLowerCase();
    if (cat === "ingredient") return "orange";
    if (cat === "salary") return "violet";
    if (cat === "rent") return "blue";
    if (cat === "utilities") return "slate";
    if (cat === "transport") return "slate";
    if (cat === "maintenance") return "slate";
    return "slate";
  };

  const sortedRows = useMemo(() => {
    const rows = tab === "expenses" ? expensesFiltered : salesFiltered;
    const dir = sort.dir === "asc" ? 1 : -1;
    const key = sort.key;
    const get = (r) => {
      if (tab === "expenses") {
        if (key === "date") return r._dt?.getTime?.() ?? 0;
        if (key === "category") return String(r.category ?? "");
        if (key === "note") return String(r.note ?? "");
        if (key === "amount") return Number(r.amount ?? 0);
      } else {
        if (key === "date") return r._dt?.getTime?.() ?? 0;
        if (key === "product") return String(r.product ?? "");
        if (key === "quantity") return Number(r.quantity ?? 0);
        if (key === "totalPrice") return Number(r.totalPrice ?? 0);
      }
      return 0;
    };
    return [...rows].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [tab, expensesFiltered, salesFiltered, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const pageRows = useMemo(() => {
    const p = Math.min(Math.max(1, page), totalPages);
    const start = (p - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [tab, search, category, startDate, endDate]);

  const onToggleSort = (key) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: "asc" };
      return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
    });
  };

  const SortIcon = ({ active, dir }) => {
    if (!active) return <ArrowUpDown className="h-4 w-4 text-slate-400" />;
    return dir === "asc" ? (
      <ArrowUp className="h-4 w-4 text-orange-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-orange-600" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] pt-20 px-4 sm:px-6 pb-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-44" />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-44" />
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>

          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4">
            <Skeleton className="h-10 w-full" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] pt-20 px-4 sm:px-6 pb-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Reports Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">Detailed Business Analysis</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition active:scale-[0.99] hover:shadow-md"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              onClick={() => downloadCsv("sales.csv", salesRows)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#f97316] px-3 py-2 text-sm font-medium text-white shadow-sm transition active:scale-[0.99] hover:shadow-md hover:brightness-95"
            >
              <Download className="h-4 w-4" />
              Export Sales
            </button>
            <button
              onClick={() => downloadCsv("expenses.csv", expenseRows)}
              className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700 shadow-sm transition active:scale-[0.99] hover:shadow-md"
            >
              <FileDown className="h-4 w-4" />
              Export Expenses
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 shadow-sm">
            {error}
          </div>
        )}

        {/* FILTER BAR */}
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-600">Start Date</div>
              <input
                type="date"
                value={pendingFilters.startDate ?? startDate}
                onChange={(e) =>
                  setPendingFilters((p) => ({ ...p, startDate: e.target.value }))
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-600">End Date</div>
              <input
                type="date"
                value={pendingFilters.endDate ?? endDate}
                onChange={(e) =>
                  setPendingFilters((p) => ({ ...p, endDate: e.target.value }))
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-600">Category</div>
              <select
                value={pendingFilters.category ?? category}
                onChange={(e) =>
                  setPendingFilters((p) => ({ ...p, category: e.target.value }))
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="all">All</option>
                <option value="salary">Salary</option>
                <option value="rent">Rent</option>
                <option value="ingredient">Ingredient</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <div className="text-xs font-medium text-slate-600"> </div>
              <button
                onClick={() => {
                  setStartDate(pendingFilters.startDate ?? startDate);
                  setEndDate(pendingFilters.endDate ?? endDate);
                  setCategory(pendingFilters.category ?? category);
                }}
                className="h-10 w-full rounded-xl bg-[#f97316] px-4 text-sm font-medium text-white shadow-sm transition active:scale-[0.99] hover:shadow-md hover:brightness-95"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SummaryCard
            title="Revenue"
            value={kpis.income}
            accent="green"
            icon={TrendingUp}
            trend={kpiTrends.income}
          />
          <SummaryCard
            title="Expenses"
            value={kpis.expenses}
            accent="red"
            icon={TrendingDown}
            trend={kpiTrends.expenses}
          />
          <SummaryCard
            title="Profit"
            value={kpis.profit}
            accent={kpis.profit >= 0 ? "green" : "red"}
            icon={kpis.profit >= 0 ? TrendingUp : TrendingDown}
            trend={kpiTrends.profit}
          />
        </div>

        {/* TABS */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-6">
              {[
                { id: "expenses", label: "Expenses" },
                { id: "sales", label: "Sales" }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "relative pb-2 text-sm font-semibold transition",
                    tab === t.id ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {t.label}
                  {tab === t.id && (
                    <span className="absolute left-0 right-0 -bottom-[13px] h-0.5 rounded bg-[#f97316]" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="h-10 w-64 max-w-[70vw] rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
            </div>
          </div>

          {/* TABLE (desktop) */}
          <div className="hidden sm:block">
            <div className="max-h-[520px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {tab === "expenses" ? (
                      <>
                        <th
                          className="px-4 py-3 cursor-pointer select-none"
                          onClick={() => onToggleSort("date")}
                        >
                          <div className="inline-flex items-center gap-2">
                            Date <SortIcon active={sort.key === "date"} dir={sort.dir} />
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 cursor-pointer select-none"
                          onClick={() => onToggleSort("category")}
                        >
                          <div className="inline-flex items-center gap-2">
                            Category{" "}
                            <SortIcon active={sort.key === "category"} dir={sort.dir} />
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 cursor-pointer select-none"
                          onClick={() => onToggleSort("note")}
                        >
                          <div className="inline-flex items-center gap-2">
                            Description{" "}
                            <SortIcon active={sort.key === "note"} dir={sort.dir} />
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 cursor-pointer select-none text-right"
                          onClick={() => onToggleSort("amount")}
                        >
                          <div className="inline-flex items-center gap-2">
                            Amount <SortIcon active={sort.key === "amount"} dir={sort.dir} />
                          </div>
                        </th>
                      </>
                    ) : (
                      <>
                        <th
                          className="px-4 py-3 cursor-pointer select-none"
                          onClick={() => onToggleSort("date")}
                        >
                          <div className="inline-flex items-center gap-2">
                            Date <SortIcon active={sort.key === "date"} dir={sort.dir} />
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 cursor-pointer select-none"
                          onClick={() => onToggleSort("product")}
                        >
                          <div className="inline-flex items-center gap-2">
                            Product{" "}
                            <SortIcon active={sort.key === "product"} dir={sort.dir} />
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 cursor-pointer select-none text-right"
                          onClick={() => onToggleSort("quantity")}
                        >
                          <div className="inline-flex items-center gap-2">
                            Qty <SortIcon active={sort.key === "quantity"} dir={sort.dir} />
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 cursor-pointer select-none text-right"
                          onClick={() => onToggleSort("totalPrice")}
                        >
                          <div className="inline-flex items-center gap-2">
                            Total{" "}
                            <SortIcon active={sort.key === "totalPrice"} dir={sort.dir} />
                          </div>
                        </th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={tab === "expenses" ? 4 : 4} className="px-4 py-10">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                            <Search className="h-5 w-5 text-slate-400" />
                          </div>
                          <div className="mt-3 text-sm font-semibold text-slate-900">
                            No data found
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            Try adjusting filters or search.
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((r, idx) => {
                      const zebra = idx % 2 === 0 ? "bg-white" : "bg-slate-50/50";
                      if (tab === "expenses") {
                        return (
                          <tr
                            key={r._id || `${r.categoryKey}-${r._dt?.toISOString?.() || idx}`}
                            className={cn(
                              zebra,
                              "transition hover:bg-orange-50/40"
                            )}
                          >
                            <td className="px-4 py-3 text-slate-700">
                              {r._dt.toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <Badge tone={expenseCategoryTone(r.categoryKey)}>
                                {String(r.categoryLabel || r.categoryKey || "other")}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {r.note || <span className="text-slate-400">—</span>}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-slate-900">
                              {formatMoneyETB(r.amount)}
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr
                          key={r._id || `${r.product}-${r._dt?.toISOString?.() || idx}`}
                          className={cn(zebra, "transition hover:bg-orange-50/40")}
                        >
                          <td className="px-4 py-3 text-slate-700">
                            {r._dt.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-slate-900 font-medium">{r.product}</td>
                          <td className="px-4 py-3 text-right text-slate-700">{r.quantity}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-900">
                            {formatMoneyETB(r.totalPrice)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {sortedRows.length === 0 ? 0 : (Math.min((page - 1) * pageSize + 1, sortedRows.length))}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(page * pageSize, sortedRows.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">{sortedRows.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 active:scale-[0.99]"
                >
                  Prev
                </button>
                <div className="text-sm font-medium text-slate-700">
                  Page {Math.min(page, totalPages)} / {totalPages}
                </div>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 active:scale-[0.99]"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden px-4 py-4 space-y-3">
            {pageRows.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto w-fit rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-900">No data found</div>
                <div className="mt-1 text-xs text-slate-500">Try adjusting filters or search.</div>
              </div>
            ) : (
              pageRows.map((r, idx) => (
                <div
                  key={r._id || idx}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="text-xs text-slate-500">{r._dt?.toLocaleString?.() ?? ""}</div>
                  {tab === "expenses" ? (
                    <>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <Badge tone={expenseCategoryTone(r.categoryKey)}>
                          {r.categoryLabel || r.categoryKey}
                        </Badge>
                        <div className="text-sm font-semibold text-slate-900">
                          {formatMoneyETB(r.amount)}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-slate-700">
                        {r.note || <span className="text-slate-400">No description</span>}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mt-2 text-sm font-semibold text-slate-900">{r.product}</div>
                      <div className="mt-2 flex items-center justify-between gap-3 text-sm text-slate-700">
                        <span>Qty: {r.quantity}</span>
                        <span className="font-semibold text-slate-900">
                          {formatMoneyETB(r.totalPrice)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                Prev
              </button>
              <div className="text-sm font-medium text-slate-700">
                {Math.min(page, totalPages)} / {totalPages}
              </div>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                Next
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
