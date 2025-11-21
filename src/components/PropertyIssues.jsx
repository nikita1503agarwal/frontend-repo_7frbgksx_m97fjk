import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function PropertyIssues() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API}/api/properties/${id}`)
        if (!res.ok) throw new Error('Failed to load')
        const json = await res.json()
        setData(json)
      } catch (e) {
        setError('Could not load property details')
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  if (loading) {
    return <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 text-slate-200">Loading…</div>
  }
  if (error) {
    return <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 text-red-200">{error}</div>
  }
  if (!data) {
    return null
  }

  const { property, issues = [] } = data

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold mb-2">Issues</h1>
        <p className="text-slate-400 mb-6">{property?.address_line1}, {property?.city} {property?.postcode}</p>

        {issues.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">No issues reported yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issues.map((issue) => (
              <div key={issue.id} className="bg-white/90 text-slate-900 rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 capitalize">{issue.priority || 'medium'}</span>
                    <span className="text-xs text-slate-500">{new Date(issue.created_at).toLocaleString?.() || ''}</span>
                  </div>
                  <p className="text-slate-800 whitespace-pre-wrap">{issue.description}</p>
                </div>
                {Array.isArray(issue.photos) && issue.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-1 p-2 bg-slate-50 border-t border-slate-200">
                    {issue.photos.map((src, idx) => (
                      <a key={idx} href={API + src} target="_blank" rel="noreferrer" className="block aspect-video bg-slate-200 overflow-hidden rounded">
                        <img src={API + src} alt="Issue photo" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
