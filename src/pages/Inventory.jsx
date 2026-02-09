import { useState } from 'react'
import api from '../api/axios'

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [error, setError] = useState(null)
  const [submittingP, setSubmittingP] = useState(false)
  const [submittingI, setSubmittingI] = useState(false)

  const [p, setP] = useState({ name: '', price: '', stock: '' })
  const [i, setI] = useState({ name: '', qty: '', expiresAt: '' })

  const lowStockThreshold = 5 // default threshold for highlighting

  // -------- ADD PRODUCT --------
  async function addP(e) {
    e.preventDefault()
    if (!p.name) return
    setSubmittingP(true)
    setError(null)

    const payload = {
      productName: p.name,
      price: Number(p.price || 0),
      quantity: Number(p.stock || 0)
    }

    try {
      const { data } = await api.post('/manage/product', payload)
      setProducts(prev => [...prev, data || payload])
      setP({ name: '', price: '', stock: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product')
    } finally {
      setSubmittingP(false)
    }
  }

  // -------- ADD INGREDIENT --------
  async function addI(e) {
    e.preventDefault()
    if (!i.name) return
    setSubmittingI(true)
    setError(null)

    const payload = { 
      ingredientName: i.name, 
      price: Number(i.qty || 0), 
      quantity: Number(i.qty || 0), 
      expiresAt: i.expiresAt || undefined 
    }

    try {
      const { data } = await api.post('/manage/ingredient', payload)
      setIngredients(prev => [...prev, data || payload])
      setI({ name: '', qty: '', expiresAt: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add ingredient')
    } finally {
      setSubmittingI(false)
    }
  }

  // -------- DELETE HANDLERS --------
  async function handleDeleteProduct(index) {
    const product = products[index]
    try {
      await api.delete(`/products/${product.productName || index}`)
      setProducts(prev => prev.filter((_, idx) => idx !== index))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product')
    }
  }

  async function handleDeleteIngredient(index) {
    const ingredient = ingredients[index]
    try {
      await api.delete(`/ingredients/${ingredient.ingredientName || index}`)
      setIngredients(prev => prev.filter((_, idx) => idx !== index))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete ingredient')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Inventory</h1>

      {error && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-4">

        {/* ---------------- PRODUCTS ---------------- */}
        <div className="bg-white border rounded p-4">
          <div className="font-medium mb-3">Products</div>
          <form onSubmit={addP} className="grid grid-cols-4 gap-2 mb-3">
            <input className="border rounded px-2 py-1 col-span-2" placeholder="Name" value={p.name} onChange={e => setP({ ...p, name: e.target.value })} />
            <input className="border rounded px-2 py-1" placeholder="Price" type="number" step="0.01" value={p.price} onChange={e => setP({ ...p, price: e.target.value })} />
            <input className="border rounded px-2 py-1" placeholder="Qty" type="number" value={p.stock} onChange={e => setP({ ...p, stock: e.target.value })} />
            <button type="submit" disabled={submittingP} className="col-span-4 bg-orange-900 text-white rounded px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {submittingP ? 'Adding...' : 'Add Product'}
            </button>
          </form>

          <ul className="divide-y text-sm">
            {products.map((x, idx) => {
              const isLowStock = x.quantity <= lowStockThreshold && x.quantity > 0
              const isOutOfStock = x.quantity === 0
              return (
                <li key={idx} className={`py-2 flex items-center justify-between ${isOutOfStock ? 'bg-red-50' : isLowStock ? 'bg-yellow-50' : ''}`}>
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {x.productName || x.name}
                      {isOutOfStock && <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded">OUT OF STOCK</span>}
                      {isLowStock && !isOutOfStock && <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">LOW STOCK</span>}
                    </div>
                    <div className={`${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-orange-500'}`}>
                      ${x.price} • stock {x.quantity || x.stock}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteProduct(idx)} className="px-2 py-1 text-red-600">Delete</button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* ---------------- INGREDIENTS ---------------- */}
        <div className="bg-white border rounded p-4">
          <div className="font-medium mb-3">Ingredients</div>
          <form onSubmit={addI} className="grid grid-cols-3 gap-2 mb-3">
            <input className="border rounded px-2 py-1" placeholder="Name" value={i.name} onChange={e => setI({ ...i, name: e.target.value })} />
            <input className="border rounded px-2 py-1" placeholder="Qty" type="number" value={i.qty} onChange={e => setI({ ...i, qty: e.target.value })} />
            <input className="border rounded px-2 py-1" placeholder="Expires" type="date" value={i.expiresAt} onChange={e => setI({ ...i, expiresAt: e.target.value })} />
            <button type="submit" disabled={submittingI} className="col-span-3 bg-orange-900 text-white rounded px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {submittingI ? 'Adding...' : 'Add Ingredient'}
            </button>
          </form>

          <ul className="divide-y text-sm">
            {ingredients.map((x, idx) => (
              <li key={idx} className="py-2 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{x.ingredientName || x.name}</div>
                  <div className="text-orange-500">qty {x.quantity || x.qty} • exp {x.expiresAt}</div>
                </div>
                <button onClick={() => handleDeleteIngredient(idx)} className="px-2 py-1 text-red-600">Delete</button>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  )
}
