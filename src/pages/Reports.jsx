import { useMemo } from 'react'
import { useBmsStore } from '../store/bms'

function downloadCsv(filename, rows){
  const process = rows.map(r=> r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))
  const blob = new Blob([process.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function Reports(){
  const sales = useBmsStore(s=>s.sales)
  const expenses = useBmsStore(s=>s.expenses)
  const stats = useBmsStore(s=>s.stats())
  const salesRows = useMemo(()=>[
    ['Date','Customer','Items','Total'],
    ...sales.map(s=>[
      new Date(s.at).toLocaleString(),
      s.customer?.name || '-',
      s.items.map(i=>`${i.name} x${i.qty}`).join('; '),
      s.total
    ])
  ], [sales])
  const expenseRows = useMemo(()=>[
    ['Date','Category','Note','Amount'],
    ...expenses.map(e=>[
      new Date(e.at).toLocaleString(), e.category, e.note, e.amount
    ])
  ], [expenses])
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Reports</h1>
      <div className="grid md:grid-cols-3 gap-3">
        <div className="bg-white border rounded p-4"><div className="text-sm text-gray-500">Income</div><div className="text-2xl font-semibold">${stats.income.toFixed(2)}</div></div>
        <div className="bg-white border rounded p-4"><div className="text-sm text-gray-500">Expenses</div><div className="text-2xl font-semibold">${stats.expenses.toFixed(2)}</div></div>
        <div className="bg-white border rounded p-4"><div className="text-sm text-gray-500">Profit</div><div className="text-2xl font-semibold">${stats.profit.toFixed(2)}</div></div>
      </div>
      <div className="bg-white border rounded p-4 space-y-2">
        <div className="font-medium">Exports</div>
        <div className="flex gap-2">
          <button onClick={()=>downloadCsv('sales.csv', salesRows)} className="px-3 py-2 rounded bg-orange-900 text-white text-sm">Export Sales (CSV)</button>
          <button onClick={()=>downloadCsv('expenses.csv', expenseRows)} className="px-3 py-2 rounded bg-orange-900 text-white text-sm">Export Expenses (CSV)</button>
          <button onClick={()=>window.print()} className="px-3 py-2 rounded border text-smm hover:bg-orange-500 hover:text-white">Print PDF</button>
        </div>
      </div>
    </div>
  )
}
