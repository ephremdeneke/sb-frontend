import { create } from 'zustand' // 
import { persist } from 'zustand/middleware'
import { addDays, format } from 'date-fns'
import { useNotificationStore } from './notifications'

const seed = () => ({
  products: [
    { id: 'p1', name: 'Sourdough Loaf', price: 5, stock: 20 },
    { id: 'p2', name: 'Croissant', price: 2.5, stock: 50 },
    { id: 'p3', name: 'Chocolate Cake', price: 20, stock: 5 },
  ],
  ingredients: [
    { id: 'i1', name: 'Flour (kg)', qty: 50, expiresAt: format(addDays(new Date(), 20), 'yyyy-MM-dd') },
    { id: 'i2', name: 'Butter (kg)', qty: 10, expiresAt: format(addDays(new Date(), 10), 'yyyy-MM-dd') },
  ],
  customers: [],
  sales: [],
  expenses: [],
  activities: [],
  settings: {
    currencySymbol: '$',
    lowStockThreshold: 5,
    language: 'en',
    theme: 'system',
    dateFormat: 'yyyy-MM-dd',
  },
})

export const useBmsStore = create(persist((set,get)=>({
  ...seed(),
  setProducts: (list)=> set({ products: list }),
  setIngredients: (list)=> set({ ingredients: list }),
  addProduct: (p)=> {
    const newProduct = { ...p, id: crypto.randomUUID() }
    const updated = [...get().products, newProduct]
    // Check stock levels for new product
    checkStockLevels([newProduct], get().settings.lowStockThreshold || 5)
    set({ products: updated, activities: [...get().activities, { type:'add_product', at: Date.now(), payload:p }] })
  },
  updateProduct: (id, patch)=> {
    const updated = get().products.map(x=> x.id===id? { ...x, ...patch }: x)
    const product = updated.find(x => x.id === id)
    // Check stock levels after update
    if (product && 'stock' in patch) {
      checkStockLevels([product], get().settings.lowStockThreshold)
    }
    set({ products: updated, activities: [...get().activities, { type:'update_product', at: Date.now(), payload:{id,patch} }] })
  },
  deleteProduct: (id)=> set({ products: get().products.filter(x=>x.id!==id), activities: [...get().activities, { type:'delete_product', at: Date.now(), payload:{id} }] }),

  addIngredient: (ing)=> set({ ingredients: [...get().ingredients, { ...ing, id: crypto.randomUUID() }], activities: [...get().activities, { type:'add_ingredient', at: Date.now(), payload:ing }] }),
  updateIngredient: (id, patch)=> set({ ingredients: get().ingredients.map(x=> x.id===id? { ...x, ...patch }: x), activities: [...get().activities, { type:'update_ingredient', at: Date.now(), payload:{id,patch} }] }),
  deleteIngredient: (id)=> set({ ingredients: get().ingredients.filter(x=>x.id!==id), activities: [...get().activities, { type:'delete_ingredient', at: Date.now(), payload:{id} }] }),

  recordSale: ({ items, customer })=>{
    const total = items.reduce((a,b)=> a + b.price*b.qty, 0)
    const sale = { id: crypto.randomUUID(), items, customer, total, at: Date.now() }
    const updated = get().products.map(p=>{
      const s = items.find(i=>i.id===p.id)
      if(!s) return p
      return { ...p, stock: Math.max(0, p.stock - s.qty) }
    })
    
    // Check stock levels after sale
    const threshold = get().settings.lowStockThreshold || 5
    const affectedProducts = updated.filter(p => items.some(i => i.id === p.id))
    checkStockLevels(affectedProducts, threshold)
    
    set({
      products: updated,
      sales: [...get().sales, sale],
      customers: customer && customer.name ? [...get().customers.filter(c=>c.phone!==customer.phone), { ...customer }]: get().customers,
      activities: [...get().activities, { type:'record_sale', at: Date.now(), payload:sale }]
    })
    return sale
  },

  addExpense: (e)=> set({ expenses: [...get().expenses, { ...e, id: crypto.randomUUID(), at: Date.now() }], activities: [...get().activities, { type:'add_expense', at: Date.now(), payload:e }] }),
  setExpenses: (list)=> set({ expenses: list }),

  updateSettings: (patch)=> set({ settings: { ...((get().settings)||{}), ...patch } }),

  stats: ()=>{
    const sales = get().sales
    const income = sales.reduce((a,b)=>a+b.total,0)
    const expenses = get().expenses.reduce((a,b)=>a+b.amount,0)
    const profit = income - expenses
    const productTotals = {}
    sales.forEach(s=> s.items.forEach(i=>{ productTotals[i.name]=(productTotals[i.name]||0)+i.qty }))
    const best = Object.entries(productTotals).sort((a,b)=>b[1]-a[1])[0]?.[0] || null
    const worst = Object.entries(productTotals).sort((a,b)=>a[1]-b[1])[0]?.[0] || null
    return { income, expenses, profit, best, worst }
  }
}), { name: 'bms-storage' }))

// Helper function to check stock levels and trigger notifications
function checkStockLevels(products, threshold) {
  // Use setTimeout to avoid calling store during render
  setTimeout(() => {
    const notificationStore = useNotificationStore.getState()
    products.forEach(product => {
      if (product.stock === 0) {
        notificationStore.notifyOutOfStock(product.name)
      } else if (product.stock <= threshold) {
        notificationStore.notifyLowStock(product.name, product.stock, threshold)
      }
    })
  }, 0)
}
