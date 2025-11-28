import { useMemo, useState } from 'react'
import { useBmsStore } from '../store/bms'

export default function Customers(){
  const sales = useBmsStore(s=>s.sales)
  const customers = useMemo(()=>{
    const map = {}
    sales.forEach(s=>{
      if(s.customer && s.customer.phone){
        const k = s.customer.phone
        if(!map[k]) map[k] = { ...s.customer, total:0, purchases:0 }
        map[k].total += s.total
        map[k].purchases += 1
      }
    })
    return Object.values(map).sort((a,b)=>b.total-a.total)
  }, [sales])
  const [q, setQ] = useState('')
  const list = customers.filter(c=> c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q))
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Customers</h1>
      <input className="border rounded px-2 py-1" placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} />
      <div className="bg-white border rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="p-2">Name</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Purchases</th>
              <th className="p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {list.map(c=> (
              <tr key={c.phone} className="border-b">
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.phone}</td>
                <td className="p-2">{c.purchases}</td>
                <td className="p-2">${c.total.toFixed(2)}</td>
              </tr>
            ))}
            {list.length===0 && (
              <tr><td className="p-3 text-gray-500" colSpan="4">No customers yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

