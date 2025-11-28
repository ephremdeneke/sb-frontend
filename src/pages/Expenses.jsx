import { useState } from 'react'
import { useBmsStore } from '../store/bms'

export default function Expenses(){
  const expenses = useBmsStore(s=>s.expenses)
  const addExpense = useBmsStore(s=>s.addExpense)
  const [e, setE] = useState({ category:'Utilities', amount:'', note:'' })
  function submit(ev){ ev.preventDefault(); if(!e.amount) return; addExpense({ ...e, amount:Number(e.amount) }); setE({ category:'Utilities', amount:'', note:'' }) }
  const total = expenses.reduce((a,b)=>a+b.amount,0)
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Expenses</h1>
      <form onSubmit={submit} className="bg-white border rounded p-4 grid md:grid-cols-4 gap-2">
        <select className="border rounded px-2 py-1" value={e.category} onChange={ev=>setE({...e, category:ev.target.value})}>
          <option>Utilities</option>
          <option>Ingredients</option>
          <option>Salaries</option>
          <option>Rent</option>
          <option>Other</option>
        </select>
        <input className="border rounded px-2 py-1" placeholder="Amount" type="number" step="0.01" value={e.amount} onChange={ev=>setE({...e, amount:ev.target.value})} />
        <input className="border rounded px-2 py-1 md:col-span-2" placeholder="Note" value={e.note} onChange={ev=>setE({...e, note:ev.target.value})} />
        <button className="bg-orange-900 text-white rounded px-3 py-2 md:col-span-4">Add Expense</button>
      </form>
      <div className="bg-white border rounded">
        <div className="p-3 font-medium border-b flex justify-between"><span>History</span><span>Total: ${total.toFixed(2)}</span></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-orange-50 text-left">
              <th className="p-2">When</th>
              <th className="p-2">Category</th>
              <th className="p-2">Note</th>
              <th className="p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(x=> (
              <tr key={x.id} className="border-b">
                <td className="p-2">{new Date(x.at).toLocaleString()}</td>
                <td className="p-2">{x.category}</td>
                <td className="p-2">{x.note}</td>
                <td className="p-2">${x.amount.toFixed(2)}</td>
              </tr>
            ))}
            {expenses.length===0 && <tr><td className="p-3 text-orange-500" colSpan="4">No expenses yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

