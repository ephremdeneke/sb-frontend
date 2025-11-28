import { useState } from 'react'
import { useBmsStore } from '../store/bms'

export default function Sales(){
  const { products, recordSale } = useBmsStore(s=>({ products: s.products, recordSale: s.recordSale }))
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState({ name:'', phone:'', notes:'' })
  function addToCart(p){
    const exists = cart.find(c=>c.id===p.id)
    if(exists){ setCart(cart.map(c=> c.id===p.id? { ...c, qty: Math.min(c.qty+1, p.stock) }: c)) }
    else setCart([...cart, { id:p.id, name:p.name, price:p.price, qty:1 }])
  }
  function setQty(id, qty){ setCart(cart.map(c=> c.id===id? { ...c, qty: Math.max(1, Number(qty)||1) }: c)) }
  function remove(id){ setCart(cart.filter(c=>c.id!==id)) }
  const total = cart.reduce((a,b)=> a + b.price*b.qty, 0)
  function checkout(){
    if(cart.length===0) return
    const sale = recordSale({ items: cart, customer })
    const win = window.open('', 'receipt')
    if(win){
      win.document.write(`<pre>${JSON.stringify({ receipt: sale }, null, 2)}</pre>`)
      win.document.close()
      win.focus()
      win.print()
    }
    setCart([])
    setCustomer({ name:'', phone:'', notes:'' })
  }
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-orange-500">Sales</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white border rounded p-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {products.map(p=> (
              <button key={p.id} onClick={()=>addToCart(p)} className="border rounded p-3 text-left hover:bg-orange-50">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-500">${p.price} • stock {p.stock}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white border rounded p-4 space-y-3">
          <div className="font-medium">Cart</div>
          <ul className="divide-y text-sm">
            {cart.map(c=> (
              <li key={c.id} className="py-2 flex items-center gap-2">
                <div className="flex-1">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-gray-500">${c.price}</div>
                </div>
                <input type="number" className="border rounded px-2 py-1 w-20" value={c.qty} onChange={e=>setQty(c.id, e.target.value)} />
                <button onClick={()=>remove(c.id)} className="px-2 py-1 text-red-600">Remove</button>
              </li>
            ))}
            {cart.length===0 && <li className="py-2 text-gray-500">Empty</li>}
          </ul>
          <div className="flex justify-between"><span className="font-medium">Total</span><span className="font-semibold">${total.toFixed(2)}</span></div>
          <div className="space-y-2">
            <input className="w-full border rounded px-2 py-1" placeholder="Customer name" value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})} />
            <input className="w-full border rounded px-2 py-1" placeholder="Phone" value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})} />
            <input className="w-full border rounded px-2 py-1" placeholder="Notes" value={customer.notes} onChange={e=>setCustomer({...customer,notes:e.target.value})} />
          </div>
          <button onClick={checkout} className="w-full bg-gray-900 text-white rounded px-3 py-2">Checkout</button>
        </div>
      </div>
    </div>
  )
}
