import React, { useMemo, useState } from 'react'
import { useBmsStore } from '../store/bms'

export default function Settings() {
  const settings = useBmsStore((s) => s.settings)
  const updateSettings = useBmsStore((s) => s.updateSettings)

  const [local, setLocal] = useState(() => ({
    currencySymbol: settings?.currencySymbol || '$',
    lowStockThreshold: settings?.lowStockThreshold ?? 5,
    language: settings?.language || 'en',
    theme: settings?.theme || 'system',
    dateFormat: settings?.dateFormat || 'yyyy-MM-dd',
  }))

  const languages = useMemo(() => ([
    { value: 'en', label: 'English' },
    { value: 'am', label: 'Amharic' },
  ]), [])

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ]

  const dateFormats = [
    'yyyy-MM-dd',
    'dd/MM/yyyy',
    'MM/dd/yyyy',
  ]

  const onChange = (e) => {
    const { name, value } = e.target
    setLocal((s) => ({
      ...s,
      [name]: name === 'lowStockThreshold' ? Number(value) : value,
    }))
  }

  const onSave = (e) => {
    e.preventDefault()
    updateSettings(local)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
      <form onSubmit={onSave} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              name="language"
              value={local.language}
              onChange={onChange}
              className="w-full rounded-md border-gray-300 focus:ring-primary-500 focus:border-primary-500"
            >
              {languages.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
            <select
              name="theme"
              value={local.theme}
              onChange={onChange}
              className="w-full rounded-md border-gray-300 focus:ring-primary-500 focus:border-primary-500"
            >
              {themes.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
            <input
              type="text"
              name="currencySymbol"
              value={local.currencySymbol}
              onChange={onChange}
              className="w-full rounded-md border-gray-300 focus:ring-primary-500 focus:border-primary-500"
              maxLength={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
            <input
              type="number"
              name="lowStockThreshold"
              value={local.lowStockThreshold}
              onChange={onChange}
              min={0}
              className="w-full rounded-md border-gray-300 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
            <select
              name="dateFormat"
              value={local.dateFormat}
              onChange={onChange}
              className="w-full rounded-md border-gray-300 focus:ring-primary-500 focus:border-primary-500"
            >
              {dateFormats.map((fmt) => (
                <option key={fmt} value={fmt}>{fmt}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
