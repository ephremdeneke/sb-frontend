import { useEffect, useState } from "react";
import api from "../api/axios";

const CATEGORIES = ["All", "Bread", "Cake", "Engera", "Kukis"];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: "",
    unitPrice: ""
  });

  const lowStockThreshold = 5;

  // Load products from backend
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get("/products");
        // Adjust this mapping to match your backend response shape
        const list = Array.isArray(data) ? data : data?.products || [];
        setProducts(list);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Add / edit product
  async function handleAddProduct(e) {
    e.preventDefault();
    if (!form.name || !form.category) return;

    setAddSubmitting(true);
    setError(null);
    setAddError(null);

    const payload = {
      productName: form.name,
      category: form.category,
      quantity: Number(form.quantity || 0),
      price: Number(form.unitPrice || 0)
    };

    try {
      if (editingIndex !== null) {
        const current = products[editingIndex];
        const id =
          current.id ?? current.productName ?? current.name ?? editingIndex;

        const { data } = await api.put(`/products/${id}`, payload);
        const updated = data || { ...current, ...payload };

        setProducts(prev =>
          prev.map((item, idx) => (idx === editingIndex ? updated : item))
        );
      } else {
        const { data } = await api.post("/manage/product", payload);
        const newProduct = data || payload;
        setProducts(prev => [...prev, newProduct]);
      }

      setForm({ name: "", category: "", quantity: "", unitPrice: "" });
      setEditingIndex(null);
      setIsAddOpen(false);
    } catch (err) {
      const fallback =
        editingIndex !== null ? "Failed to update product" : "Failed to add product";
      const message = err?.response?.data?.message || fallback;
      setError(message);
      setAddError(message);
    } finally {
      setAddSubmitting(false);
    }
  }

  // Delete product
  async function handleDeleteProduct(product, index) {
    setError(null);
    try {
      // Adjust identifier to match your backend (id, productName, etc.)
      const id = product.id ?? product.productName ?? product.name ?? index;
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter((_, i) => i !== index));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete product");
    }
  }

  // Derived data: filter by category + search
  const filteredProducts = products.filter(p => {
    const category = p.category || "Uncategorized";
    const matchesCategory =
      selectedCategory === "All" || category === selectedCategory;

    const term = searchTerm.trim().toLowerCase();
    if (!term) return matchesCategory;

    const name = (p.productName || p.name || "").toLowerCase();
    const categoryStr = category.toLowerCase();

    const matchesSearch =
      name.includes(term) || categoryStr.includes(term);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-20 px-6 pb-6 space-y-8 bg-slate-50 min-h-screen">
      {/* Page title */}
      <h1 className="text-2xl font-bold mb-2 text-center ">Products</h1>

      {/* Header: search + Add Product button */}
      <div className="bg-white border rounded-lg px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
        <input
          type="text"
          placeholder="Search Product..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
        />
        <button
          type="button"
          onClick={() => {
            setForm({ name: "", category: "", quantity: "", unitPrice: "" });
            setAddError(null);
            setEditingIndex(null);
            setIsAddOpen(true);
          }}
          className="whitespace-nowrap inline-flex items-center gap-2 bg-orange-900 text-white text-sm font-medium rounded-md px-4 py-2 shadow-sm hover:bg-orange-800"
        >
          + Add Product
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      {/* Category bar */}
      <div className="bg-white border rounded-lg shadow-sm px-4 py-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold text-gray-800">Category</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full border transition-colors ${
                  selectedCategory === cat
                    ? "bg-orange-900 text-white border-orange-900"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid below category bar */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-sm text-gray-500">Loading products...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex items-center justify-center h-60">
            <div className="bg-white border border-dashed border-gray-200 rounded-xl px-8 py-6 text-center max-w-md shadow-sm">
              <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-700 text-lg font-semibold">
                P
              </div>
              <p className="text-sm font-medium text-gray-900">
                No products match the current filters
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Try choosing a different category or clearing the search text,
                or add a new product to the inventory.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchTerm("");
                  }}
                  className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Clear filters
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  className="px-3 py-1.5 rounded-md bg-orange-900 text-white hover:bg-orange-800"
                >
                  + Add Product
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p, idx) => {
              const qty = Number(p.quantity ?? p.stock ?? 0);
              const unitPrice = Number(p.price ?? p.unitPrice ?? 0);
              const isOutOfStock = qty === 0;
              const isLowStock = qty <= lowStockThreshold && qty > 0;

              return (
                <div
                  key={idx}
                  className={`border rounded-xl p-4 bg-white shadow-sm hover:shadow-lg transition-shadow flex flex-col justify-between ${
                    isOutOfStock
                      ? "border-red-300"
                      : isLowStock
                      ? "border-yellow-300"
                      : "border-gray-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="font-semibold text-base text-gray-900">
                        {p.productName || p.name || "Unnamed Product"}
                      </h2>

                      {/* Stock badges */}
                      {isOutOfStock && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                          OUT OF STOCK
                        </span>
                      )}
                      {isLowStock && !isOutOfStock && (
                        <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full uppercase tracking-wide">
                          LOW STOCK
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 mb-3">
                      Category: {p.category || "Uncategorized"}
                    </div>

                    <div className="space-y-1 text-sm text-gray-700">
                      <div>Qty: {qty}</div>
                      <div>Unit: ETB {unitPrice.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 mt-4">
                    <button
                      className="text-blue-600 text-xs font-medium hover:underline"
                      onClick={() => {
                        setForm({
                          name: p.productName || p.name || "",
                          category: p.category || "",
                          quantity: String(p.quantity ?? p.stock ?? ""),
                          unitPrice: String(p.price ?? p.unitPrice ?? "")
                        });
                        setAddError(null);
                        setEditingIndex(idx);
                        setIsAddOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p, idx)}
                      className="text-red-600 text-xs font-medium hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Product Modal / Popup Card */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                {editingIndex !== null ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-sm">
              {addError && (
                <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {addError}
                </div>
              )}
              <div>
                <label className="block text-gray-700 mb-1">Name</label>
                <input
                  className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                  placeholder="Product name"
                  value={form.name}
                  onChange={e =>
                    setForm(prev => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Category</label>
                <select
                  className="w-full border border-gray-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                  value={form.category}
                  onChange={e =>
                    setForm(prev => ({ ...prev, category: e.target.value }))
                  }
                >
                  <option value="">Select category</option>
                  {CATEGORIES.filter(c => c !== "All").map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                    placeholder="0"
                    value={form.quantity}
                    onChange={e =>
                      setForm(prev => ({ ...prev, quantity: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">
                    Unit Price (ETB)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                    placeholder="0.00"
                    value={form.unitPrice}
                    onChange={e =>
                      setForm(prev => ({ ...prev, unitPrice: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSubmitting}
                  className="px-4 py-2 text-xs font-medium bg-orange-900 text-white rounded-md hover:bg-orange-800 disabled:opacity-60"
                >
                  {addSubmitting
                    ? editingIndex !== null
                      ? "Saving..."
                      : "Adding..."
                    : editingIndex !== null
                    ? "Save Changes"
                    : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}