import { useState } from 'react'
import api from '../api/axios'

export default function Ingredients() {
  const [ingredients, setIngredients] = useState([])
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [i, setI] = useState({
    item: '',
    quantity: '',
    unit: '',
    unitPrice: '',
    note: ''
  })

  // addIngredient is the function that is called when the user clicks 
  // the add ingredient button
  async function addIngredient(e) {
    e.preventDefault()
    if (!i.item) return
    setSubmitting(true)
    setError(null)

// payload is the data that is sent to the backend to add an ingredient

    const payload = {
      ingredientName: i.item,
      price: Number(i.unitPrice || 0),
      quantity: Number(i.quantity || 0)
    }

    // localEntry is the data that is stored in the local state to display
    //  the ingredient in the UI without the backend data like createdAt, updatedAt, etc. 
    const localEntry = {
      ...payload,
      item: i.item,
      unit: i.unit,
      unitPrice: Number(i.unitPrice || 0),
      note: i.note
    }

    try {
      const { data } = await api.post('/manage/ingredient', payload)
      setIngredients(prev => [...prev, data ? { ...localEntry, ...data } : localEntry])// add the ingredient to the local state
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
      <h1 className="text-xl font-semibold">Ingredients</h1>

      {error && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="bg-white border rounded p-4">
        <div className="font-medium mb-3">Ingredients</div>

        <div className="text-xs text-gray-600 mb-1">
          Category: <span className="font-semibold">Ingredients</span>
        </div>

        <form onSubmit={addIngredient} className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
          <input
            className="border rounded px-2 py-1"
            placeholder="Item (e.g. Flour)"
            value={i.item}
            onChange={e => setI({ ...i, item: e.target.value })}
          />
          <input
            className="border rounded px-2 py-1"
            placeholder="Quantity (e.g. 50)"
            type="number"
            value={i.quantity}
            onChange={e => setI({ ...i, quantity: e.target.value })}
          />
          <input
            className="border rounded px-2 py-1"
            placeholder="Unit (e.g. kg)"
            value={i.unit}
            onChange={e => setI({ ...i, unit: e.target.value })}
          />
          <input
            className="border rounded px-2 py-1"
            placeholder="Unit Price (ETB)"
            type="number"
            step="0.01"
            value={i.unitPrice}
            onChange={e => setI({ ...i, unitPrice: e.target.value })}
          />
          <input
            className="border rounded px-2 py-1 md:col-span-3"
            placeholder="Note (e.g. Bread production)"
            value={i.note}
            onChange={e => setI({ ...i, note: e.target.value })}
          />
          <button
            type="submit"
            disabled={submitting}
            className="col-span-2 md:col-span-3 bg-orange-900 text-white rounded px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Adding...' : 'Add Ingredient'}
          </button>
        </form>

        <ul className="divide-y text-sm">
          {ingredients.map((x, idx) => {
            const quantity = Number(x.quantity ?? x.qty ?? 0)
            const unitPrice = Number(x.unitPrice ?? x.price ?? 0)
            const totalCost = unitPrice * quantity
            const unit = x.unit || 'unit'
            const item = x.item || x.ingredientName || x.name
            const note = x.note

            const createdRaw =
              x.createdAt ||
              x.created_at ||
              x.at ||
              null
            const dateLabel = createdRaw
              ? new Date(createdRaw).toLocaleDateString()
              : null

            return (
              <li key={idx} className="py-2 flex items-center justify-between">
                <div className="flex-1 space-y-0.5">
                  <div className="font-medium">Item: {item}</div>
                  <div className="text-xs text-gray-600">
                    Quantity: {quantity} {unit}
                  </div>
                  <div className="text-xs text-gray-600">
                    Unit Price: ETB {unitPrice.toFixed(2)}
                  </div>
                  <div className="text-xs text-orange-600 font-semibold">
                    Total Cost: ETB {totalCost.toFixed(2)}
                  </div>
                  {dateLabel && (
                    <div className="text-[11px] text-gray-400">
                      Date: {dateLabel}
                    </div>
                  )}
                  {note && (
                    <div className="text-[11px] text-gray-500">
                      Note: {note}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteIngredient(idx)}
                  className="px-2 py-1 text-red-600"
                >
                  Delete
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

