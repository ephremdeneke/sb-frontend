import { useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import { useBmsStore } from "../store/bms";

const DEFAULT_DATA = [
  { id: 1, product: "Bread", qty: 2, price: 30, time: "09:12", note: "No sugar" },
  { id: 2, product: "Cake", qty: 1, price: 120, time: "10:05", note: "Extra icing" },
  { id: 3, product: "Donut", qty: 5, price: 50, time: "11:40", note: "un paid" },
  { id: 4, product: "Coffee", qty: 3, price: 45, time: "12:10", note: "null" },
];

export default function History() {
  const sales = useBmsStore((s) => s.sales);
  const products = useBmsStore((s) => s.products);

  const [salesData, setSalesData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get("/history");
        const list = Array.isArray(data) ? data : data?.history ?? data?.sales;
        if (list?.length) setSalesData(list);
      } catch (err) {
        const isConnectionError =
          !err.response ||
          err.code === "ERR_NETWORK" ||
          err.code === "ECONNABORTED" ||
          err.code === "ECONNREFUSED";
        if (isConnectionError) {
          const flat = sales.flatMap((sale) =>
            (sale.items || []).map((item, idx) => {
              const product = products.find((p) => p.id === item.id);
              return {
                id: `${sale.id}-${idx}`,
                product: product?.name ?? item.name ?? item.id,
                qty: item.qty,
                price: (item.price ?? 0) * (item.qty ?? 1),
                time: new Date(sale.at || sale.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                note: sale.customer?.name ?? sale.note ?? "",
              };
            })
          );
          if (flat.length) setSalesData(flat);
          setError("Backend offline — using local data");
        } else {
          setError(err.response?.data?.message || "Failed to load history");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [sales, products]);

  const totalAmount = useMemo(
    () => salesData.reduce((sum, s) => sum + (s.price ?? 0), 0),
    [salesData]
  );
  const totalOrders = salesData.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="p-12 m space-y-6 ">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Cashier Daily Sales History</h1>
        <p className="text-gray-500">
          Today’s activity report
        </p>
        {error && (
          <p className="mt-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2 inline-block">
            {error}
          </p>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white shadow rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-xl font-semibold">{totalOrders}</p>
        </div>

        <div className="bg-white shadow rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-xl font-semibold">{totalAmount} ETB</p>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Product</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Price</th>
              <th className="p-3">Time</th>
              <th className="p-3">Note</th>

            </tr>
          </thead>

          <tbody>
            {salesData.map((sale, i) => (
              <tr key={sale.id || i} className="border-t">
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{sale.product}</td>
                <td className="p-3">{sale.qty}</td>
                <td className="p-3">{sale.price} ETB</td>
                <td className="p-3">
                  {sale.time ?? (sale.at || sale.createdAt
                    ? new Date(sale.at || sale.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "-")}
                </td>
                <td className="p-3">{sale.note}</td>


              </tr>
            ))}
            {salesData.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No sales history yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
