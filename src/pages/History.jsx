import { useMemo } from "react";

// mock data — replace later with Zustand store or API data
const salesData = [
  { id: 1, product: "Bread", qty: 2, price: 30, time: "09:12", note: "No sugar" },
  { id: 2, product: "Cake", qty: 1, price: 120, time: "10:05" , note: "Extra icing"},
  { id: 3, product: "Donut", qty: 5, price: 50, time: "11:40", note: "un paid"},
  { id: 4, product: "Coffee", qty: 3, price: 45, time: "12:10", note: "null"},
];

export default function History() {
  // calculate totals
  const totalAmount = useMemo(
    () => salesData.reduce((sum, s) => sum + s.price, 0),
    []
  );

  const totalOrders = salesData.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Cashier Daily Sales History</h1>
        <p className="text-gray-500">
          Today’s activity report
        </p>
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
              <tr key={sale.id} className="border-t">
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{sale.product}</td>
                <td className="p-3">{sale.qty}</td>
                <td className="p-3">{sale.price} ETB</td>
                <td className="p-3">{sale.time}</td>
                <td className="p-3">{sale.note}</td>


              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
