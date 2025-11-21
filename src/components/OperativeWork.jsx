import { useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function OperativeWork() {
  const [form, setForm] = useState({ property_id: '', title: '', description: '', category: 'repair', cost: '', photo: null })
  const [loading, setLoading] = useState(false)
  const [successId, setSuccessId] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccessId('')
    try {
      const fd = new FormData()
      fd.append('property_id', form.property_id)
      fd.append('title', form.title)
      if (form.description) fd.append('description', form.description)
      if (form.category) fd.append('category', form.category)
      if (form.cost) fd.append('cost', String(form.cost))
      if (form.photo) fd.append('photo', form.photo)

      const res = await fetch(`${API}/api/operative/work`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Failed to create work order')
      const data = await res.json()
      setSuccessId(data.id)
      setForm({ property_id: form.property_id, title: '', description: '', category: 'repair', cost: '', photo: null })
    } catch (err) {
      console.error(err)
      alert('Could not submit work')
    } finally {
      setLoading(false)
    }
  }

  const inputBase = 'bg-white text-slate-900 placeholder-slate-500 text-[16px] leading-6 px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
  const selectBase = 'bg-white text-slate-900 text-[16px] leading-6 px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
      <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Operative work log</h3>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-slate-700 mb-1">Property ID</label>
              <input value={form.property_id} onChange={e=>setForm(prev=>({ ...prev, property_id: e.target.value }))} className={`w-full ${inputBase}`} placeholder="Property ID" required />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-1">Title</label>
              <input value={form.title} onChange={e=>setForm(prev=>({ ...prev, title: e.target.value }))} className={`w-full ${inputBase}`} placeholder="e.g., Replaced tap" required />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-1">Category</label>
              <select value={form.category} onChange={e=>setForm(prev=>({ ...prev, category: e.target.value }))} className={`w-full ${selectBase}`}>
                <option value="repair">Repair</option>
                <option value="maintenance">Maintenance</option>
                <option value="inspection">Inspection</option>
                <option value="compliance">Compliance</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-700 mb-1">Description</label>
              <textarea value={form.description} onChange={e=>setForm(prev=>({ ...prev, description: e.target.value }))} className={`w-full ${inputBase}`} rows={4} placeholder="What did you do?" />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-1">Cost</label>
              <input type="number" step="0.01" value={form.cost} onChange={e=>setForm(prev=>({ ...prev, cost: e.target.value }))} className={`w-full ${inputBase}`} placeholder="0.00" />
              <label className="block text-sm text-slate-700 mb-1 mt-3">Photo</label>
              <input type="file" accept="image/*" capture="environment" onChange={e=>setForm(prev=>({ ...prev, photo: e.target.files?.[0] || null }))} className="w-full text-sm" />
              <p className="text-xs text-slate-500 mt-1">Tip: On mobile, this opens your camera.</p>
            </div>
          </div>
          <div className="flex justify-end">
            <button disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md disabled:opacity-50">{loading ? 'Saving...' : 'Save work'}</button>
          </div>
          {successId && (
            <p className="text-green-700 text-sm">Work recorded. Reference: {successId}</p>
          )}
        </form>
      </div>
    </section>
  )
}
