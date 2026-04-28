import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import api from "../api/axios";

import {
  DollarSign,
  CalendarDays,
  Layers,
  Package,
  ShoppingBag,
  TrendingDown,
  TrendingUp
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const COLORS = ["#f97316", "#fb923c", "#fdba74", "#22c55e", "#6366f1"];

const formatMoney = (v) => `ETB ${Number(v || 0).toLocaleString()}`;

const Dashboard = () => {
  const [period, setPeriod] = useState("weekly");
  const [mode, setMode] = useState("product");

  const [salesData, setSalesData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [expenses, setExpenses] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  // ================= FETCH =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [dash, exp] = await Promise.all([
          api.get(`/manage/dashboard?period=${period}`),
          api.get("/manage/expenses")
        ]);

        setSalesData(dash.data.salesData || []);
        setProductData(dash.data.productData || []);

        const totalExp = (exp.data || []).reduce(
          (sum, e) => sum + Number(e.amount || 0),
          0
        );

        setExpenses(totalExp);
      } catch (err) {
        if (err.response?.status === 401) {
          await logout();
          navigate("/login");
        }
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  // ================= CALCULATIONS =================
  const totals = useMemo(() => {
    const revenue = salesData.reduce((s, d) => s + Number(d.sales || 0), 0);
    const profit = revenue - expenses;

    return {
      revenue,
      expenses,
      profit,
      orders: salesData.length,
      products: productData.length
    };
  }, [salesData, productData, expenses]);

  const bestSelling = useMemo(() => {
    const sorted = [...productData].sort((a, b) => b.value - a.value);
    const top = sorted.slice(0, 5);
    const max = top[0]?.value || 1;
    return { top, max };
  }, [productData]);

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500 text-sm">
            Overview of your business performance
          </p>
        </div>

        <div className="flex gap-2 bg-white p-1 rounded-xl shadow">
          {["product", "expense"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-xl text-sm ${
                mode === m ? "bg-orange-500 text-white" : "text-gray-600"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* FILTER */}
      <div className="flex gap-2">
        {["daily", "weekly", "monthly"].map((t) => (
          <button
            key={t}
            onClick={() => setPeriod(t)}
            className={`px-4 py-2 rounded-xl text-sm ${
              period === t
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* KPI */}
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card title="Revenue" value={formatMoney(totals.revenue)} icon={DollarSign} />
        <Card title="Expenses" value={formatMoney(totals.expenses)} icon={TrendingDown} />
        <Card title="Profit" value={formatMoney(totals.profit)} icon={TrendingUp} />
        <Card title="Orders" value={totals.orders} icon={ShoppingBag} />
        <Card title="Products" value={totals.products} icon={Package} />
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* SALES */}
        <div className="bg-white p-5 rounded-2xl shadow">
          <h2 className="font-semibold mb-4">Sales Trend</h2>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#f97316"
                fill="#fdba74"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* PIE */}
        <div className="bg-white p-5 rounded-2xl shadow">
          <h2 className="font-semibold mb-4">Product Distribution</h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={productData} dataKey="value" innerRadius={60}>
                {productData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BEST SELLING */}
      <div className="bg-white p-5 rounded-2xl shadow">
        <h2 className="font-semibold mb-4">Best Selling Products</h2>

        {bestSelling.top.map((p, i) => {
          const percent = (p.value / bestSelling.max) * 100;

          return (
            <div key={i} className="mb-4">
              <div className="flex justify-between text-sm">
                <span>{p.name}</span>
                <span>{p.value}</span>
              </div>

              <div className="h-2 bg-gray-200 rounded mt-1">
                <div
                  className="h-2 bg-orange-500 rounded"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ================= CARD COMPONENT =================
const Card = ({ title, value, icon: Icon }) => (
  <div className="bg-white p-4 rounded-2xl shadow flex justify-between items-center">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-lg font-bold">{value}</h3>
    </div>
    <Icon className="text-gray-600" />
  </div>
);

export default Dashboard;