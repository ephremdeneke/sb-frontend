import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function Ingredients() {
  const [ingredients, setIngredients] = useState([])
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)

  const [i, setI] = useState({
    item: '',
    quantity: '',
    unit: '',
    unitPrice: '',
    note: ''
  })

  // =========================
  // FETCH INGREDIENTS
  // =========================
  useEffect(() => {
    async function fetchIngredients() {
      setLoading(true)
      setError(null)

      try {
        const { data } = await api.get('/manage/ingredients')

        const list = Array.isArray(data) ? data : data?.ingredients || []

        setIngredients(list)

      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load ingredients')
      } finally {
        setLoading(false)
      }
    }

    fetchIngredients()
  }, [])

  // =========================
  // ADD INGREDIENT
  // =========================
  async function addIngredient(e) {
    e.preventDefault()
    if (!i.item) return

    setSubmitting(true)
    setError(null)

    const payload = {
      ingredientName: i.item,
      unitPrice: Number(i.unitPrice || 0),
      quantity: Number(i.quantity || 0),
       unit: i.unit,
       note: i.note
    }

const localEntry = {
  ingredientName: i.item,
  quantity: Number(i.quantity || 0),
  unit: i.unit,
  unitPrice: Number(i.unitPrice || 0),
  note: i.note
}

    try {
      const { data } = await api.post('/manage/ingredient', payload)

     setIngredients(prev => [...prev, data.ingredient])

      setI({
        item: '',
        quantity: '',
        unit: '',
        unitPrice: '',
        note: ''
      })

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add ingredient')
    } finally {
      setSubmitting(false)
    }
  }

  // =========================
  // DELETE INGREDIENT
  // =========================
  async function handleDeleteIngredient(index) {
    const ingredient = ingredients[index]

    try {
      await api.delete(`/ingredients/${ingredient._id || ingredient.ingredientName || index}`)

      setIngredients(prev => prev.filter((_, idx) => idx !== index))

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete ingredient')
    }
  }

  return (
    <div className="pt-20 px-6 pb-6 space-y-8 bg-slate-50 min-h-screen">

      <h1 className="text-2xl font-bold text-center">Ingredients</h1>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      {/* =========================
          ADD INGREDIENT FORM
         ========================= */}
      <div className="bg-white border rounded-lg shadow-sm p-4">

        <div className="font-medium mb-3">Add Ingredient</div>

        <form
          onSubmit={addIngredient}
          className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3"
        >
          <input
            className="border rounded px-2 py-1"
            placeholder="Item (e.g. Flour)"
            value={i.item}
            onChange={e => setI({ ...i, item: e.target.value })}
          />

          <input
            className="border rounded px-2 py-1"
            placeholder="Quantity"
            type="number"
            value={i.quantity}
            onChange={e => setI({ ...i, quantity: e.target.value })}
          />

          <input
            className="border rounded px-2 py-1"
            placeholder="Unit (kg, g, etc)"
            value={i.unit}
            onChange={e => setI({ ...i, unit: e.target.value })}
          />

          <input
            className="border rounded px-2 py-1"
            placeholder="Unit Price"
            type="number"
            step="0.01"
            value={i.unitPrice}
            onChange={e => setI({ ...i, unitPrice: e.target.value })}
          />

          <input
            className="border rounded px-2 py-1 md:col-span-3"
            placeholder="Note"
            value={i.note}
            onChange={e => setI({ ...i, note: e.target.value })}
          />

          <button
            type="submit"
            disabled={submitting}
            className="col-span-2 md:col-span-3 bg-orange-900 text-white rounded px-3 py-2 disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add Ingredient'}
          </button>
        </form>
      </div>

      {/* =========================
          INGREDIENT TABLE
         ========================= */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">

        {loading ? (
          <div className="p-6 text-center text-sm text-gray-500">
            Loading ingredients...
          </div>
        ) : ingredients.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            No ingredients found
          </div>
        ) : (

          <table className="w-full text-sm">

            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Ingredient</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Unit Price</th>
                <th className="p-3">Total Cost</th>
                <th className="p-3">Date</th>
                <th className="p-3">Note</th>
                <th className="p-3"></th>
              </tr>
            </thead>

            <tbody className="divide-y">

              {ingredients.map((x, idx) => {

                const quantity = Number(x.quantity ?? 0)
                const unitPrice = Number(x.unitPrice ?? x.price ?? 0)
                const totalCost = quantity * unitPrice

                const unit = x.unit || ''
                const item = x.item || x.ingredientName || x.name
                const note = x.note

                const createdRaw =
                  x.createdAt ||
                  x.created_at ||
                  x.at ||
                  null

                const dateLabel = createdRaw
                  ? new Date(createdRaw).toLocaleDateString()
                  : '-'

                return (

                  <tr key={idx} className="hover:bg-gray-50">

                    <td className="p-3 font-medium">
                      {item}
                    </td>

                    <td className="p-3">
                      {quantity} {unit}
                    </td>

                    <td className="p-3">
                      ETB {unitPrice.toFixed(2)}
                    </td>

                    <td className="p-3 text-orange-600 font-semibold">
                      ETB {totalCost.toFixed(2)}
                    </td>

                    <td className="p-3 text-gray-500">
                      {dateLabel}
                    </td>

                    <td className="p-3 text-gray-500">
                      {note || '-'}
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => handleDeleteIngredient(idx)}
                        className="text-red-600 text-xs hover:underline"
                      >
                        Delete
                      </button>
                    </td>

                  </tr>

                )
              })}

            </tbody>

          </table>

        )}

      </div>
    </div>
  )
}