import React, { useState, useEffect } from "react";
import api from "../api/axios";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package
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
  Cell
} from "recharts";

const ICON_MAP = { DollarSign, ShoppingCart, Package };

const COLORS = ["#f97316", "#ea580c", "#fb923c", "#fed7aa", "#fdba74"];

const Dashboard = () => {

  const [period, setPeriod] = useState("weekly");

  const [salesData, setSalesData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [stats, setStats] = useState([]);

  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH DASHBOARD
  // =========================

  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        setLoading(true);

        const { data } = await api.get(`/manage/dashboard?period=${period}`);

        setSalesData(data.salesData || []);
        setProductData(data.productData || []);

        if (Array.isArray(data.stats)) {
          setStats(
            data.stats.map((s) => ({
              ...s,
              icon: ICON_MAP[s.icon] || DollarSign
            }))
          );
        }

      } catch (error) {
        console.error("Dashboard error", error);
      }

      setLoading(false);

    };

    fetchDashboard();

  }, [period]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      {/* PERIOD SELECTOR */}

      <div className="flex gap-2">

        <button
          onClick={() => setPeriod("daily")}
          className={`px-4 py-2 rounded ${
            period === "daily" ? "bg-orange-500 text-white" : "bg-gray-200"
          }`}
        >
          Daily
        </button>

        <button
          onClick={() => setPeriod("weekly")}
          className={`px-4 py-2 rounded ${
            period === "weekly" ? "bg-orange-500 text-white" : "bg-gray-200"
          }`}
        >
          Weekly
        </button>

        <button
          onClick={() => setPeriod("monthly")}
          className={`px-4 py-2 rounded ${
            period === "monthly" ? "bg-orange-500 text-white" : "bg-gray-200"
          }`}
        >
          Monthly
        </button>

      </div>

      {/* STATS */}

      <div className="grid gap-6 md:grid-cols-3">

        {stats.map((stat) => {

          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;

          return (

            <Card key={stat.key}>

              <CardHeader className="flex justify-between">

                <CardTitle className="text-sm text-gray-600">
                  {stat.key}
                </CardTitle>

                <stat.icon className="h-5 w-5 text-gray-600" />

              </CardHeader>

              <CardContent>

                <div className="text-2xl font-bold">
                  {stat.value}
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500">

                  <TrendIcon className="h-4 w-4" />

                  {stat.change}

                </div>

              </CardContent>

            </Card>

          );
        })}

      </div>

      {/* CHARTS */}

      <div className="grid lg:grid-cols-2 gap-6">

        {/* SALES CHART */}

        <Card>

          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>

          <CardContent>

            <ResponsiveContainer width="100%" height={300}>

              <LineChart data={salesData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#f97316"
                  strokeWidth={2}
                />

              </LineChart>

            </ResponsiveContainer>

          </CardContent>

        </Card>

        {/* PRODUCT PIE */}

        <Card>

          <CardHeader>
            <CardTitle>Product Distribution</CardTitle>
          </CardHeader>

          <CardContent>

            <ResponsiveContainer width="100%" height={300}>

              <PieChart>

                <Pie
                  data={productData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                >

                  {productData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </CardContent>

        </Card>

      </div>

      {/* BEST SELLING */}

      <Card>

        <CardHeader>
          <CardTitle>Best Selling Products</CardTitle>
        </CardHeader>

        <CardContent>

          <ResponsiveContainer width="100%" height={250}>

            <BarChart data={productData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="value"
                fill="#f97316"
                radius={[8, 8, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </CardContent>

      </Card>

    </div>
  );
};

export default Dashboard;