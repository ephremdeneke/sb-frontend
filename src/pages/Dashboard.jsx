import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import api from "../api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const DEFAULT_SALES_DATA = [
  { name: "Mon", sales: 4200 },
  { name: "Tue", sales: 3800 },
  { name: "Wed", sales: 4600 },
  { name: "Thu", sales: 5200 },
  { name: "Fri", sales: 6100 },
  { name: "Sat", sales: 7500 },
  { name: "Sun", sales: 6800 },
];

const DEFAULT_PRODUCT_DATA = [
  { name: "Croissants", value: 30 },
  { name: "Cakes", value: 25 },
  { name: "Bread", value: 20 },
  { name: "Cookies", value: 15 },
  { name: "Others", value: 10 },
];

const DEFAULT_STATS = [
  { key: "totalRevenue", value: "$45,231", change: "+12.5%", trend: "up", icon: DollarSign, color: "text-green-600" },
  { key: "totalSales", value: "2,345", change: "+8.2%", trend: "up", icon: ShoppingCart, color: "text-primary-600" },
  { key: "productsSold", value: "5,678", change: "-3.1%", trend: "down", icon: Package, color: "text-amber-600" },
  { key: "customers", value: "892", change: "+15.3%", trend: "up", icon: Users, color: "text-cyan-600" },
];

const ICON_MAP = { DollarSign, ShoppingCart, Package, Users };

const Dashboard = () => {
  const { t } = useTranslation();
  const [salesData, setSalesData] = useState(DEFAULT_SALES_DATA);
  const [productData, setProductData] = useState(DEFAULT_PRODUCT_DATA);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get("/dashboard");
        if (data.salesData?.length) setSalesData(data.salesData);
        if (data.productData?.length) setProductData(data.productData);
        if (data.stats?.length) {
          setStats(
            data.stats.map((s) => ({
              ...s,
              icon: ICON_MAP[s.icon] || DEFAULT_STATS.find((d) => d.key === s.key)?.icon || DollarSign,
            }))
          );
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const COLORS = [
    "#f97316", // primary-500 (orange)
    "#ea580c", // primary-600 (darker orange)
    "#fb923c", // primary-400 (lighter orange)
    "#fed7aa", // primary-200 (very light orange)
    "#fdba74", // primary-300 (light orange)
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">{t("dashboard.loading") || "Loading dashboard..."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Dashboard Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="bg-white border border-orange-200 rounded-lg p-6 mb-6 shadow-sm">
          <h1 className="text-2xl font-semibold mb-2 text-orange-900">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-600">
            {t('dashboard.welcome')}
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {stats.map((stat) => (
            <Card
              key={stat.key}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {t(`dashboard.stats.${stat.key}`)}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      stat.trend === "up"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500">
                    {t('dashboard.stats.fromLastWeek')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          {/* Weekly Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.weeklySales')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ fill: "#f97316", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Product Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.productDistribution')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Best Selling Products Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Best Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

