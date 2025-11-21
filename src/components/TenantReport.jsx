import { useEffect, useMemo, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function TenantReport() {
  const [genPropertyId, setGenPropertyId] = useState('')
  const [generatedToken, setGeneratedToken] = useState('')
  const [genLoading, setGenLoading] = useState(false)

  const [form, setForm] = useState({ token: '', tenant_name: '', tenant_contact: '', description: '', priority: 'medium', photo: null })
  const [loading, setLoading] = useState(false)
  const [successId, setSuccessId] = useState('')
  const [error, setError] = useState('')

  // Read token from magic link (e.g., /tenant?token=abcd)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token')
    if (t) {
      setForm(prev => ({ ...prev, token: t }))
    }
  }, [])

  const shareLink = useMemo(() => {
    if (!generatedToken) return ''
    try {
      const origin = window.location.origin
      return `${origin}/tenant?token=${generatedToken}`
    } catch {
      return ''
    }
  }, [generatedToken])

  const generateLink = async (e) => {
    e.preventDefault()
    setGenLoading(true)
    setGeneratedToken('')
    setError('')
    try {
      const res = await fetch(`${API}/api/tenant/link?property_id=${encodeURIComponent(genPropertyId)}`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to create link')
      const data = await res.json()
      setGeneratedToken(data.token)
    } catch (err) {
      console.error(err)
      setError('Could not create link')
    } finally {
      setGenLoading(false)
    }
  }

  const submitIssue = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccessId('')
    setError('')
    if (!form.token || !form.description) {
      setError('Please provide a token and description')
      setLoading(false)
      return
    }
    try {
      const fd = new FormData()
      fd.append('token', form.token)
      fd.append('description', form.description)
      if (form.tenant_name) fd.append('tenant_name', form.tenant_name)
      if (form.tenant_contact) fd.append('tenant_contact', form.tenant_contact)
      if (form.priority) fd.append('priority', form.priority)
      if (form.photo) fd.append('photo', form.photo)

      const res = await fetch(`${API}/api/tenant/report`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Failed to submit issue')
      const data = await res.json()
      setSuccessId(data.id)
      setForm({ token: form.token, tenant_name: '', tenant_contact: '', description: '', priority: 'medium', photo: null })
    } catch (err) {
      console.error(err)
      setError('Could not submit issue')
    } finally {
      setLoading(false)
    }
  }

  const inputBase = 'bg-white text-slate-900 placeholder-slate-500 text-[16px] leading-6 px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
  const selectBase = 'bg-white text-slate-900 text-[16px] leading-6 px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8 grid md:grid-cols-2 gap-6">
      <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Generate tenant link</h3>
        <p className="text-sm text-slate-600 mb-3">Enter a property ID to create a one-time token. Share the link with the tenant so they can report an issue.</p>
        {error && (
          <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>
        )}
        <form onSubmit={generateLink} className="space-y-3">
          <input value={genPropertyId} onChange={e=>setGenPropertyId(e.target.value)} className={`w-full ${inputBase}`} placeholder="Property ID" required />
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <button disabled={genLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md disabled:opacity-50">{genLoading ? 'Creating...' : 'Create Link'}</button>
            {generatedToken && (
              <div className="text-xs text-slate-700 break-all">
                <div className="mb-1">Token: <code className="bg-slate-100 px-1 py-0.5 rounded">{generatedToken}</code></div>
                {shareLink && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Link:</span>
                    <a className="text-indigo-600 hover:underline" href={shareLink} target="_blank" rel="noreferrer">{shareLink}</a>
                    <button type="button" onClick={() => navigator.clipboard?.writeText(shareLink)} className="text-indigo-700 underline">Copy</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Tenant issue report</h3>
        {successId && (
          <div className="mb-3 text-sm text-green-800 bg-green-50 border border-green-200 rounded-md px-3 py-2">Issue submitted. Reference: {successId}</div>
        )}
        {error && (
          <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>
        )}
        <form onSubmit={submitIssue} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-700 mb-1">Token</label>
            <input value={form.token} onChange={e=>setForm(prev=>({ ...prev, token: e.target.value }))} className={`w-full ${inputBase}`} placeholder="Paste your token" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-700 mb-1">Your name</label>
              <input value={form.tenant_name} onChange={e=>setForm(prev=>({ ...prev, tenant_name: e.target.value }))} className={`w-full ${inputBase}`} placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-1">Contact</label>
              <input value={form.tenant_contact} onChange={e=>setForm(prev=>({ ...prev, tenant_contact: e.target.value }))} className={`w-full ${inputBase}`} placeholder="Phone or email (optional)" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Describe the issue</label>
            <textarea value={form.description} onChange={e=>setForm(prev=>({ ...prev, description: e.target.value }))} className={`w-full ${inputBase}`} rows={4} placeholder="What’s wrong?" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-sm text-slate-700 mb-1">Priority</label>
              <select value={form.priority} onChange={e=>setForm(prev=>({ ...prev, priority: e.target.value }))} className={`w-full ${selectBase}`}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-1">Photo</label>
              <input type="file" accept="image/*" capture="environment" onChange={e=>setForm(prev=>({ ...prev, photo: e.target.files?.[0] || null }))} className="w-full text-sm" />
              <p className="text-xs text-slate-500 mt-1">Tip: On mobile, this opens your camera.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50">{loading ? 'Submitting...' : 'Submit issue'}</button>
          </div>
        </form>
      </div>
    </section>
  )
}
