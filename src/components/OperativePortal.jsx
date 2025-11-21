import { useEffect, useMemo, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useOperativeAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('operative_token') || '')
  const [operativeId, setOperativeId] = useState(() => localStorage.getItem('operative_id') || '')
  const headers = useMemo(() => token ? { 'X-Operative-Token': token } : {}, [token])
  return { token, setToken, operativeId, setOperativeId, headers }
}

function useGeo() {
  const [coords, setCoords] = useState(null)
  const [error, setError] = useState(null)

  const request = () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  return { coords, error, request }
}

function JobCard({ job, onStart, onComplete, starting, completing }) {
  const started = job.status === 'in_progress'
  const completed = job.status === 'completed'
  return (
    <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Property #{job.property_id}</p>
          <h4 className="text-lg font-semibold text-white">{job.title}</h4>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${completed ? 'bg-emerald-800 text-emerald-100' : started ? 'bg-amber-800 text-amber-100' : 'bg-slate-700 text-slate-100'}`}>
          {job.status?.replace('_',' ') || 'new'}
        </span>
      </div>
      {job.description && <p className="mt-2 text-slate-300 text-sm">{job.description}</p>}
      <div className="mt-3 flex items-center gap-2">
        {!started && !completed && (
          <button onClick={onStart} disabled={starting} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-md disabled:opacity-50">{starting ? 'Starting…' : 'Start'}</button>
        )}
        {started && !completed && (
          <button onClick={onComplete} disabled={completing} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-md disabled:opacity-50">{completing ? 'Completing…' : 'Complete'}</button>
        )}
      </div>
    </div>
  )
}

export default function OperativePortal() {
  const { token, setToken, operativeId, headers } = useOperativeAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')
  const geo = useGeo()

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (operativeId) params.set('operative_id', operativeId)
      // Show both new and in_progress assigned to this operative
      // If backend supports multiple statuses, we can call twice and merge
      const urlBase = `${API}/api/workorders`

      let list = []
      // First: in_progress for you
      {
        const p = new URLSearchParams(params)
        p.set('status', 'in_progress')
        const res = await fetch(`${urlBase}?${p.toString()}`)
        const data = await res.json()
        if (Array.isArray(data)) list = list.concat(data)
      }
      // Second: new but assigned to you
      {
        const p = new URLSearchParams(params)
        p.set('status', 'new')
        const res = await fetch(`${urlBase}?${p.toString()}`)
        const data = await res.json()
        if (Array.isArray(data)) list = list.concat(data)
      }
      // Deduplicate by id
      const byId = new Map()
      list.forEach(w => byId.set(w.id || w._id, w))
      setJobs(Array.from(byId.values()))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [operativeId])

  const startJob = async (id) => {
    const location = geo.coords ? { lat: geo.coords.lat, lng: geo.coords.lng } : undefined
    try {
      const res = await fetch(`${API}/api/operative/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ workorder_id: id, location })
      })
      if (!res.ok) throw new Error('Start failed')
      await fetchJobs()
    } catch (e) {
      alert('Could not start job')
    }
  }

  const completeJob = async (id) => {
    const location = geo.coords ? { lat: geo.coords.lat, lng: geo.coords.lng } : undefined
    try {
      const res = await fetch(`${API}/api/operative/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ workorder_id: id, location, notes: note || undefined })
      })
      if (!res.ok) throw new Error('Complete failed')
      setNote('')
      await fetchJobs()
    } catch (e) {
      alert('Could not complete job')
    }
  }

  if (!token) {
    const onAuthed = (t) => {
      // token and operative details were saved during login
      fetchJobs()
    }
    const Lazy = require('./OperativeLogin').default
    return <Lazy onAuthed={onAuthed} />
  }

  return (
    <section className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-white">Your jobs</h2>
        <div className="flex items-center gap-2">
          <button onClick={geo.request} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-md text-sm">Share location</button>
          <button onClick={() => { localStorage.removeItem('operative_token'); localStorage.removeItem('operative_id'); localStorage.removeItem('operative_email'); window.location.reload() }} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-md text-sm">Sign out</button>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <input value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Completion note (optional)" className="flex-1 bg-white text-slate-900 placeholder-slate-500 text-[16px] leading-6 px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          <button onClick={fetchJobs} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-md">Refresh</button>
        </div>

        {loading ? (
          <p className="text-slate-300">Loading jobs…</p>
        ) : jobs.length === 0 ? (
          <p className="text-slate-400">No assigned jobs right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onStart={() => startJob(job.id)}
                onComplete={() => completeJob(job.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
