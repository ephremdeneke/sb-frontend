import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { EmptyState } from "../components/ui/empty-state";

export default function Sales() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState({ name: '', phone: '', notes: '' })
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState(null)

  // -------- Fetch products --------
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get('/cashier/stock')

        const formattedProducts = res.data.map(p => ({
          _id: p._id,
          name: p.productName,
          price: p.price,
          stock: p.quantity
        }))

        setProducts(formattedProducts)

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load products')
      }
    }

    fetchProducts()
  }, [])

  // -------- Cart logic --------
  function addToCart(p) {
    const exists = cart.find(c => c.id === p._id)

    if (exists) {
      setCart(
        cart.map(c =>
          c.id === p._id
            ? { ...c, qty: Math.min(c.qty + 1, p.stock) }
            : c
        )
      )
    } else {
      setCart([
        ...cart,
        { id: p._id, name: p.name, price: p.price, qty: 1 }
      ])
    }
  }

  function setQty(id, qty) {
    setCart(
      cart.map(c =>
        c.id === id
          ? { ...c, qty: Math.max(1, Number(qty) || 1) }
          : c
      )
    )
  }

  function remove(id) {
    setCart(cart.filter(c => c.id !== id))
  }

  const total = cart.reduce((a, b) => a + b.price * b.qty, 0)
  const formatMoney = (v) => `ETB ${Number(v || 0).toLocaleString()}`
  const cartCount = useMemo(() => cart.reduce((s, x) => s + (x.qty || 0), 0), [cart])

  // -------- Checkout --------
  async function checkout() {
    if (cart.length === 0) return

    setCheckingOut(true)
    setError(null)

    // ✅ convert cart to backend format
    const payload = {
      cartItems: cart.map(c => ({
        productId: c.id,
        quantity: c.qty
      }))
    }

    try {
      const { data } = await api.post('/cashier/checkout', payload)

      const win = window.open('', 'receipt')

      if (win) {
        win.document.write(`<pre>${JSON.stringify({ receipt: data }, null, 2)}</pre>`)
        win.document.close()
        win.focus()
        win.print()
      }

      setCart([])
      setCustomer({ name: '', phone: '', notes: '' })

    } catch (err) {

      const isConnectionError =
        !err.response ||
        err.code === 'ERR_NETWORK' ||
        err.code === 'ECONNABORTED' ||
        err.code === 'ECONNREFUSED'

      if (isConnectionError) {

        const win = window.open('', 'receipt')

        if (win) {
          win.document.write(`<pre>${JSON.stringify({ receipt: payload }, null, 2)}</pre>`)
          win.document.close()
          win.focus()
          win.print()
        }

        setCart([])
        setCustomer({ name: '', phone: '', notes: '' })

      } else {
        setError(err.response?.data?.message || 'Checkout failed')
      }

    } finally {
      setCheckingOut(false)
    }
  }

  // -------- UI --------
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sales</h1>
        <p className="mt-1 text-sm text-slate-600">Create orders and checkout quickly</p>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 shadow-sm">
          {error}
        </p>
      )}

      <div className="grid md:grid-cols-3 gap-4">

        {/* Products */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <EmptyState title="No products available" description="Add products to start selling." />
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {products.map((p) => (
                  <button
                    key={p._id}
                    disabled={p.stock === 0}
                    onClick={() => addToCart(p)}
                    className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md hover:bg-orange-50/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {formatMoney(p.price)} • stock {p.stock}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cart</CardTitle>
            <div className="text-xs font-semibold text-slate-500">{cartCount} items</div>
          </CardHeader>
          <CardContent className="space-y-3">

          <ul className="divide-y text-sm">

            {cart.map(c => (
              <li key={c.id} className="py-2 flex items-center gap-2">

                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{c.name}</div>
                  <div className="text-slate-500">{formatMoney(c.price)}</div>
                </div>

                <Input
                  type="number"
                  className="w-20"
                  value={c.qty}
                  onChange={e => setQty(c.id, e.target.value)}
                />

                <Button variant="ghost" size="sm" onClick={() => remove(c.id)} className="text-red-700 hover:bg-red-50">
                  Remove
                </Button>

              </li>
            ))}

            {cart.length === 0 && (
              <li className="py-6 text-slate-500 text-center">Empty</li>
            )}

          </ul>

          <div className="flex justify-between">
            <span className="font-medium">Total</span>
            <span className="font-semibold text-slate-900">{formatMoney(total)}</span>
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Notes"
              value={customer.notes}
              onChange={e =>
                setCustomer({
                  ...customer,
                  notes: e.target.value
                })
              }
            />
          </div>

          <Button
            onClick={checkout}
            disabled={checkingOut}
            className="w-full"
          >
            {checkingOut ? 'Processing...' : 'Checkout'}
          </Button>

          </CardContent>
        </Card>

      </div>

    </div>
  )
}