import { useEffect, useState } from "react";
import api from "../api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input, Select } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { EmptyState } from "../components/ui/empty-state";

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
        const { data } = await api.get("/manage/stock");

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
      catagory: form.category, // backend expects this
      quantity: Number(form.quantity || 0),
      price: Number(form.unitPrice || 0)
    };

    try {
      if (editingIndex !== null) {
        const current = products[editingIndex];
        const id =
          current._id ?? current.id ?? current.productName ?? editingIndex;

        const { data } = await api.put(`/products/${id}`, payload);

        const updated = data?.product || { ...current, ...payload };

        setProducts(prev =>
          prev.map((item, idx) => (idx === editingIndex ? updated : item))
        );
      } else {
        const { data } = await api.post("/manage/product", payload);

        const newProduct = data?.product || payload;

        setProducts(prev => [...prev, newProduct]);
      }

      setForm({ name: "", category: "", quantity: "", unitPrice: "" });
      setEditingIndex(null);
      setIsAddOpen(false);
    } catch (err) {
      const fallback =
        editingIndex !== null
          ? "Failed to update product"
          : "Failed to add product";
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
      const id = product._id ?? product.id ?? product.productName ?? index;

      await api.delete(`/products/${id}`);

      setProducts(prev => prev.filter((_, i) => i !== index));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete product");
    }
  }

  // Derived data: filter by category + search
  const filteredProducts = products.filter(p => {
    const category = p.catagory || p.category || "Uncategorized";

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
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-600">Manage stock, pricing, and categories</p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setForm({ name: "", category: "", quantity: "", unitPrice: "" });
            setAddError(null);
            setEditingIndex(null);
            setIsAddOpen(true);
          }}
        >
          + Add Product
        </Button>
      </div>
     

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 shadow-sm">
          {error}
        </p>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Filters</CardTitle>
          <div className="w-full max-w-sm">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs font-semibold text-slate-600">Category</div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full border text-sm font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-primary-50 text-primary-700 border-primary-200"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Try changing your search or category filter."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p, idx) => {
              const qty = Number(p.quantity ?? p.stock ?? 0);
              const unitPrice = Number(p.price ?? p.unitPrice ?? 0);
              const isOutOfStock = qty === 0;
              const isLowStock = qty <= lowStockThreshold && qty > 0;

              const category = p.catagory || p.category;

              return (
                <div
                  key={idx}
                  className={`border rounded-2xl p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
                    isOutOfStock
                      ? "border-red-300"
                      : isLowStock
                      ? "border-yellow-300"
                      : "border-slate-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="font-semibold text-base text-gray-900">
                        {p.productName || p.name || "Unnamed Product"}
                      </h2>

                      {isOutOfStock && (
                        <Badge tone="danger">OUT OF STOCK</Badge>
                      )}
                      {isLowStock && !isOutOfStock && (
                        <Badge tone="warning">LOW STOCK</Badge>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 mb-3">
                      Category: {category || "Uncategorized"}
                    </div>

                    <div className="space-y-1 text-sm text-gray-700">
                      <div>Qty: {qty}</div>
                      <div>Unit: ETB {unitPrice.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-4">
                    <button
                      className="text-primary-700 text-xs font-semibold hover:underline"
                      onClick={() => {
                        setForm({
                          name: p.productName || p.name || "",
                          category: category || "",
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
                      className="text-red-700 text-xs font-semibold hover:underline"
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

      {/* Modal unchanged */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl ring-1 ring-slate-200 p-6">
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
                <Input
                  placeholder="Product name"
                  value={form.name}
                  onChange={e =>
                    setForm(prev => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Category</label>
                <Select
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
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  min={0}
                  placeholder="Quantity"
                  value={form.quantity}
                  onChange={e =>
                    setForm(prev => ({ ...prev, quantity: e.target.value }))
                  }
                />

                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Unit Price"
                  value={form.unitPrice}
                  onChange={e =>
                    setForm(prev => ({ ...prev, unitPrice: e.target.value }))
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addSubmitting}
                  size="sm"
                >
                  {addSubmitting
                    ? editingIndex !== null
                      ? "Saving..."
                      : "Adding..."
                    : editingIndex !== null
                    ? "Save Changes"
                    : "Add Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}