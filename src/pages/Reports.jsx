import { useState, useEffect, useMemo } from 'react'
import { useBmsStore } from '../store/bms'
import api from '../api/axios'

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
  const products = useBmsStore(s=>s.products)
  const storeStats = useBmsStore(s=>s.stats())

  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await api.get('/reports')
        setReportData(data)
      } catch (err) {
        const isConnectionError = !err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED' || err.code === 'ECONNREFUSED'
        if (isConnectionError) setError('Backend offline — using local data')
        else setError(err.response?.data?.message || 'Failed to load reports')
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  const stats = useMemo(() => {
    if (reportData && (reportData.income != null || reportData.profit != null)) {
      return {
        income: reportData.income ?? 0,
        expenses: reportData.expenses ?? 0,
        profit: reportData.profit ?? (reportData.income ?? 0) - (reportData.expenses ?? 0),
      }
    }
    return storeStats
  }, [reportData, storeStats])

  const salesForExport = reportData?.sales ?? sales
  const expensesForExport = reportData?.expenses ?? expenses

  const salesRows = useMemo(()=>[
    ['Date','Customer','Items','Total'],
    ...salesForExport.map(s=>{
      const itemsStr = (s.items || []).map(i=>{
        const name = i.name ?? products.find(p=>p.id===i.id)?.name ?? i.id
        return `${name} x${i.qty ?? 1}`
      }).join('; ')
      return [
        new Date(s.at || s.createdAt).toLocaleString(),
        s.customer?.name || '-',
        itemsStr,
        s.total ?? 0
      ]
    })
  ], [salesForExport, products])

  const expenseRows = useMemo(()=>[
    ['Date','Category','Note','Amount'],
    ...expensesForExport.map(e=>[
      new Date(e.at || e.createdAt).toLocaleString(),
      e.category,
      e.note ?? '',
      e.amount ?? 0
    ])
  ], [expensesForExport])
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">Loading reports...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Reports</h1>
      {error && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          {error}
        </p>
      )}
      <div className="grid md:grid-cols-3 gap-3">
        <div className="bg-white border rounded p-4"><div className="text-sm text-gray-500">Income</div><div className="text-2xl font-semibold">${(stats.income ?? 0).toFixed(2)}</div></div>
        <div className="bg-white border rounded p-4"><div className="text-sm text-gray-500">Expenses</div><div className="text-2xl font-semibold">${(stats.expenses ?? 0).toFixed(2)}</div></div>
        <div className="bg-white border rounded p-4"><div className="text-sm text-gray-500">Profit</div><div className="text-2xl font-semibold">${(stats.profit ?? 0).toFixed(2)}</div></div>
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
