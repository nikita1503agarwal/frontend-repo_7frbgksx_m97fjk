import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Stat({ label, value }) {
  return (
    <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-xl p-4">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({ landlords: 0, properties: 0, workorders: 0, certificates: 0 })
  const [items, setItems] = useState({ properties: [], workorders: [], certificates: [] })

  const load = async () => {
    const [ls, ps, ws, cs] = await Promise.all([
      fetch(`${API}/api/landlords`).then(r=>r.json()),
      fetch(`${API}/api/properties`).then(r=>r.json()),
      fetch(`${API}/api/workorders?limit=10`).then(r=>r.json()),
      fetch(`${API}/api/certificates?limit=10`).then(r=>r.json())
    ])
    setStats({ landlords: ls.length, properties: ps.length, workorders: ws.length, certificates: cs.length })
    setItems({ properties: ps.slice(0,5), workorders: ws.slice(0,5), certificates: cs.slice(0,5) })
  }

  useEffect(()=>{ load() }, [])

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Landlords" value={stats.landlords} />
        <Stat label="Properties" value={stats.properties} />
        <Stat label="Work Orders" value={stats.workorders} />
        <Stat label="Certificates" value={stats.certificates} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900 mb-3">Recent Work</h3>
          <ul className="space-y-2">
            {items.workorders.map(w => (
              <li key={w.id} className="flex justify-between text-sm">
                <span className="text-slate-700 truncate">{w.title || 'Untitled'} • {w.category}</span>
                <span className="text-slate-500">{w.status}</span>
              </li>
            ))}
            {items.workorders.length === 0 && <p className="text-slate-500 text-sm">No work orders yet.</p>}
          </ul>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900 mb-3">Properties</h3>
          <ul className="space-y-2">
            {items.properties.map(p => (
              <li key={p.id} className="text-sm text-slate-700 truncate">{p.address_line1}, {p.city} {p.postcode}</li>
            ))}
            {items.properties.length === 0 && <p className="text-slate-500 text-sm">No properties yet.</p>}
          </ul>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900 mb-3">Certificates</h3>
          <ul className="space-y-2">
            {items.certificates.map(c => (
              <li key={c.id} className="text-sm text-slate-700 truncate">{c.type.replace('_',' ').toUpperCase()} • {c.certificate_number || 'N/A'}</li>
            ))}
            {items.certificates.length === 0 && <p className="text-slate-500 text-sm">No certificates yet.</p>}
          </ul>
        </div>
      </div>
    </section>
  )
}
