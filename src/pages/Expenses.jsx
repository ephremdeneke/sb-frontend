import { useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { EmptyState } from "../components/ui/empty-state";

export default function Expenses(){

const [expenses, setExpenses] = useState([])
const [e, setE] = useState({ category:'other', amount:'', note:'' })

const [loading, setLoading] = useState(true)
const [submitting, setSubmitting] = useState(false)
const [error, setError] = useState(null)


/* FETCH EXPENSES */

useEffect(() => {

const fetchExpenses = async () => {

try {

const { data } = await api.get('/manage/expenses')

const list = Array.isArray(data) ? data : data?.expenses

if (list) setExpenses(list)

} catch (err) {

if (!err.response || err.code === 'ERR_NETWORK') {
setError('Backend offline — using local data')
} else {
setError(err.response?.data?.message || 'Failed to load expenses')
}

} finally {

setLoading(false)

}

}

fetchExpenses()

}, [])



/* AUTO FILL INGREDIENT EXPENSE */

useEffect(() => {
  const fetchIngredientTotal = async () => {
    if (e.category !== "ingredient") return;

    try {
      const { data } = await api.get("/manage/expenses/ingredient-total");
      console.log("Ingredient total fetched:", data);

      // convert number to string for controlled input
      setE(prev => ({
        ...prev,
        amount: (data?.amount ?? 0).toString()
      }));
    } catch (err) {
      console.error("Ingredient total fetch error", err);
    }
  };

  fetchIngredientTotal();
}, [e.category]);



async function submit(ev) {

ev.preventDefault()

if (!e.amount) return

setSubmitting(true)
setError(null)

const safeAmount = parseFloat(e.amount);
if (isNaN(safeAmount)) {
  setError("Amount must be a valid number");
  setSubmitting(false);
  return;
}

const payload = {
  ...e,
  amount: safeAmount
};

try {

const { data } = await api.post('/manage/expense', payload)

setExpenses(prev => [data.expense, ...prev])

setE({ category: 'other', amount: '', note: '' })

} catch (err) {

const isConnectionError =
!err.response ||
err.code === 'ERR_NETWORK'

if (isConnectionError) {

setExpenses(prev => [payload, ...prev])

setE({ category: 'other', amount: '', note: '' })

} else {

setError(err.response?.data?.message || 'Failed to add expense')

}

} finally {

setSubmitting(false)

}

}



const total = useMemo(() => expenses.reduce((a,b)=>a+Number(b.amount||0),0), [expenses])
const formatMoney = (v) => `ETB ${Number(v || 0).toLocaleString()}`

if (loading) {

return (
  <div className="space-y-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-2xl font-semibold tracking-tight text-slate-900">Expenses</div>
        <div className="mt-1 text-sm text-slate-600">Track and manage your expenses</div>
      </div>
    </div>
    <div className="grid gap-4">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-72 w-full" />
    </div>
  </div>
)

}



return (

<div className="space-y-6">

  <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Expenses</h1>
      <p className="mt-1 text-sm text-slate-600">Track and manage your expenses</p>
    </div>
  </div>

{error &&
<p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 shadow-sm">
{error}
</p>
}


<Card>
  <CardHeader>
    <CardTitle>Add expense</CardTitle>
  </CardHeader>
  <CardContent>
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div className="space-y-1">
        <div className="text-xs font-semibold text-slate-600">Category</div>
        <select
          value={e.category}
          onChange={ev=>setE({...e, category:ev.target.value})}
          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-orange-200"
        >
          <option value="ingredient">Ingredient</option>
          <option value="salary">Salary</option>
          <option value="rent">Rent</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="space-y-1">
        <div className="text-xs font-semibold text-slate-600">Amount</div>
        <Input
          placeholder="0.00"
          type="number"
          step="0.01"
          value={e.amount ?? ""}
          onChange={ev=>setE({...e, amount:ev.target.value})}
        />
      </div>

      <div className="space-y-1 md:col-span-2">
        <div className="text-xs font-semibold text-slate-600">Note</div>
        <Input
          placeholder="Optional note"
          value={e.note}
          onChange={ev=>setE({...e, note:ev.target.value})}
        />
      </div>

      <div className="md:col-span-4 flex items-center justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add Expense"}
        </Button>
      </div>
    </form>
  </CardContent>
</Card>


<Card>

<CardHeader className="flex flex-row items-center justify-between">

<CardTitle>History</CardTitle>

<span className="text-sm font-semibold text-slate-700">Total: {formatMoney(total)}</span>

</CardHeader>


<CardContent className="p-0">
  {expenses.length === 0 ? (
    <div className="p-4">
      <EmptyState
        title="No expenses yet"
        description="Add your first expense to see it here."
      />
    </div>
  ) : (
    <div className="max-h-[520px] overflow-auto">
      <table className="w-full text-sm">

<thead>

<tr className="border-b border-slate-200 bg-slate-50 text-left sticky top-0 z-10">

<th className="p-2">When</th>
<th className="p-2">Category</th>
<th className="p-2">Note</th>
<th className="p-2 text-right">Amount</th>

</tr>

</thead>

<tbody>

{expenses.map((x, i)=> (

<tr key={x._id || i} className={`${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"} border-b border-slate-100 hover:bg-orange-50/40 transition`}>

<td className="p-2">
{new Date(x.createdAt).toLocaleString()}
</td>

<td className="p-2">
  <Badge tone="primary">{x.category}</Badge>
</td>

<td className="p-2">
{x.note}
</td>

<td className="p-2 text-right font-semibold text-slate-900">
{formatMoney(x.amount)}
</td>

</tr>

))}

</tbody>
</table>
    </div>
  )}
</CardContent>

</Card>   {/* ✅ CLOSE THE CARD */}

</div>

)

}