import { useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function QuickAdd({ onCreated }) {
  const [form, setForm] = useState({
    landlord: { name: '' },
    property: { address_line1: '', city: '', postcode: '' },
    work: { title: '', category: 'maintenance' },
    certificate: { type: 'gas_safety' }
  })
  const [loading, setLoading] = useState(false)

  const create = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Create landlord (if name provided)
      let landlordId = null
      if (form.landlord.name.trim()) {
        const resL = await fetch(`${API}/api/landlords`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form.landlord)
        })
        landlordId = (await resL.json()).id
      }

      // Create property
      const propertyPayload = { ...form.property, landlord_id: landlordId || 'unassigned' }
      const resP = await fetch(`${API}/api/properties`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyPayload)
      })
      const propertyId = (await resP.json()).id

      // Optionally create work
      if (form.work.title.trim()) {
        await fetch(`${API}/api/workorders`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form.work, property_id: propertyId })
        })
      }

      // Optionally create certificate
      if (form.certificate.type) {
        await fetch(`${API}/api/certificates`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form.certificate, property_id: propertyId })
        })
      }

      onCreated?.()
      setForm({ landlord: { name: '' }, property: { address_line1: '', city: '', postcode: '' }, work: { title: '', category: 'maintenance' }, certificate: { type: 'gas_safety' } })
    } catch (e) {
      console.error(e)
      alert('Failed to create records')
    } finally {
      setLoading(false)
    }
  }

  const update = (section, key, value) => {
    setForm(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }))
  }

  return (
    <form onSubmit={create} className="bg-white/80 backdrop-blur rounded-xl shadow-sm border border-slate-200 p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Landlord</label>
        <input value={form.landlord.name} onChange={e=>update('landlord','name',e.target.value)} className="w-full rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="Name (optional)" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Property</label>
        <div className="flex gap-2">
          <input value={form.property.address_line1} onChange={e=>update('property','address_line1',e.target.value)} className="flex-1 rounded-md border-slate-300" placeholder="Address line 1" />
          <input value={form.property.city} onChange={e=>update('property','city',e.target.value)} className="w-32 rounded-md border-slate-300" placeholder="City" />
          <input value={form.property.postcode} onChange={e=>update('property','postcode',e.target.value)} className="w-28 rounded-md border-slate-300" placeholder="Postcode" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Work</label>
        <div className="flex gap-2">
          <input value={form.work.title} onChange={e=>update('work','title',e.target.value)} className="flex-1 rounded-md border-slate-300" placeholder="Title (optional)" />
          <select value={form.work.category} onChange={e=>update('work','category',e.target.value)} className="w-40 rounded-md border-slate-300">
            <option value="maintenance">Maintenance</option>
            <option value="repair">Repair</option>
            <option value="compliance">Compliance</option>
            <option value="inspection">Inspection</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Certificate</label>
        <select value={form.certificate.type} onChange={e=>update('certificate','type',e.target.value)} className="w-full rounded-md border-slate-300">
          <option value="gas_safety">Gas Safety</option>
          <option value="eicr">EICR</option>
          <option value="epc">EPC</option>
          <option value="boiler_service">Boiler Service</option>
          <option value="smoke_alarm">Smoke Alarm</option>
        </select>
      </div>
      <div className="md:col-span-4 flex justify-end">
        <button disabled={loading} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50">
          {loading ? 'Saving...' : 'Quick Add'}
        </button>
      </div>
    </form>
  )
}
