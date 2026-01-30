import { useState } from 'react'
import { useBmsStore } from '../store/bms'

export default function Inventory(){
  const { products, ingredients, addProduct, deleteProduct, addIngredient, deleteIngredient, settings } = useBmsStore(s=>({
    products: s.products,
    ingredients: s.ingredients,
    addProduct: s.addProduct,
    deleteProduct: s.deleteProduct,
    addIngredient: s.addIngredient,
    deleteIngredient: s.deleteIngredient,
    settings: s.settings,
  }))
  const lowStockThreshold = settings?.lowStockThreshold || 5
  const [p, setP] = useState({ name:'', price:'', stock:'' })
  const [i, setI] = useState({ name:'', qty:'', expiresAt:'' })
  function addP(e){ e.preventDefault(); if(!p.name) return; addProduct({ name:p.name, price:Number(p.price||0), stock:Number(p.stock||0) }); setP({ name:'', price:'', stock:'' }) }
  function addI(e){ e.preventDefault(); if(!i.name) return; addIngredient({ name:i.name, qty:Number(i.qty||0), expiresAt:i.expiresAt }); setI({ name:'', qty:'', expiresAt:'' }) }
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Inventory</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border rounded p-4">
          <div className="font-medium mb-3">Products</div>
          <form onSubmit={addP} className="grid grid-cols-4 gap-2 mb-3">
            <input className="border rounded px-2 py-1 col-span-2" placeholder="Name" value={p.name} onChange={e=>setP({...p,name:e.target.value})} />
            <input className="border rounded px-2 py-1" placeholder="Price" type="number" step="0.01" value={p.price} onChange={e=>setP({...p,price:e.target.value})} />
            <input className="border rounded px-2 py-1" placeholder="Qty" type="number" value={p.stock} onChange={e=>setP({...p,stock:e.target.value})} />
           <input className="border rounded px-2 py-1" type="date" value={i.expiresAt} onChange={e=>setI({...i,expiresAt:e.target.value})} />

            <button className="col-span-4 bg-orange-900 text-white rounded px-3 py-2">Add Product</button>
          </form>
          <ul className="divide-y text-sm">
            {products.map(x=> {
              const isLowStock = x.stock <= lowStockThreshold && x.stock > 0
              const isOutOfStock = x.stock === 0
              return (
                <li key={x.id} className={`py-2 flex items-center justify-between ${isOutOfStock ? 'bg-red-50' : isLowStock ? 'bg-yellow-50' : ''}`}>
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {x.name}
                      {isOutOfStock && <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded">OUT OF STOCK</span>}
                      {isLowStock && !isOutOfStock && <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">LOW STOCK</span>}
                    </div>
                    <div className={`${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-orange-500'}`}>
                      ${x.price} • stock {x.stock}
                    </div>
                  </div>
                  <button onClick={()=>deleteProduct(x.id)} className="px-2 py-1 text-red-600">Delete</button>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="bg-white border rounded p-4">
          <div className="font-medium mb-3">Ingredients</div>
          <form onSubmit={addI} className="grid grid-cols-3 gap-2 mb-3">
            <input className="border rounded px-2 py-1" placeholder="Name" value={i.name} onChange={e=>setI({...i,name:e.target.value})} />
            <input className="border rounded px-2 py-1" placeholder="Price" type="number" step="0.01" value={p.price} onChange={e=>setP({...p,price:e.target.value})} />
            <input className="border rounded px-2 py-1" placeholder="Qty" type="number" value={i.qty} onChange={e=>setI({...i,qty:e.target.value})} />
            <input className="border rounded px-2 py-1" type="date" value={i.expiresAt} onChange={e=>setI({...i,expiresAt:e.target.value})} />
            <button className="col-span-3 bg-orange-900 text-white rounded px-3 py-2">Add Ingredient</button>
          </form>
          <ul className="divide-y text-sm">
            {ingredients.map(x=> (
              <li key={x.id} className="py-2 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{x.name}</div>
                  <div className="text-orange-500">qty {x.qty} • exp {x.expiresAt}</div>
                </div>
                <button onClick={()=>deleteIngredient(x.id)} className="px-2 py-1 text-red-600">Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

