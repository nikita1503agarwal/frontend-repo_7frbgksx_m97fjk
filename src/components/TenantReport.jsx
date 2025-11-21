import { useEffect, useMemo, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const intents = [
  { key: 'report-repair', label: 'Report a Repair', color: 'emerald' },
  { key: 'moving-out', label: 'Moving out', color: 'amber' },
  { key: 'other', label: 'Other', color: 'sky' },
]

export default function TenantReport() {
  const [intent, setIntent] = useState('report-repair')

  // Chat-style form state
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [address, setAddress] = useState('')
  const [matter, setMatter] = useState('')

  // Extra for repair intent
  const [priority, setPriority] = useState('medium')
  const [photo, setPhoto] = useState(null)
  const [token, setToken] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successId, setSuccessId] = useState('')

  // Read action from URL or prefill from chat (sessionStorage)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const actionParam = params.get('action')
    const t = params.get('token')

    // Prefill from chat assistant if available
    try {
      const raw = sessionStorage.getItem('tenant_prefill')
      if (raw) {
        const p = JSON.parse(raw)
        if (p.intent && intents.find(i => i.key === p.intent)) setIntent(p.intent)
        if (p.name) setName(p.name)
        if (p.contact) setContact(p.contact)
        if (p.address) setAddress(p.address)
        if (p.details) setMatter(p.details)
        if (p.priority) setPriority(p.priority)
        // Clear after applying so it doesn't override later entries
        sessionStorage.removeItem('tenant_prefill')
      }
    } catch {}

    if (actionParam && intents.find(i => i.key === actionParam)) setIntent(prev => prev || actionParam)
    if (t) setToken(t)
  }, [])

  const summary = useMemo(() => {
    return (
      `Name: ${name || '-'}\n` +
      `Contact: ${contact || '-'}\n` +
      `Address: ${address || '-'}\n` +
      `Topic: ${intent}\n` +
      `Details: ${matter || '-'}\n`
    )
  }, [name, contact, address, intent, matter])

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary)
    } catch {}
  }

  const resetForm = () => {
    setName('')
    setContact('')
    setAddress('')
    setMatter('')
    setPriority('medium')
    setPhoto(null)
    // keep token if it came from a magic link
  }

  const submitRepair = async (e) => {
    e?.preventDefault()
    setError('')
    setSuccessId('')

    if (!token) {
      setError('A valid token is required. Use the link you received from us or paste your token.')
      return
    }
    if (!matter) {
      setError('Please describe the issue.')
      return
    }

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('token', token)
      fd.append('description', matter)
      if (name) fd.append('tenant_name', name)
      if (contact) fd.append('tenant_contact', contact)
      if (priority) fd.append('priority', priority)
      if (photo) fd.append('photo', photo)

      const res = await fetch(`${API}/api/tenant/report`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Failed to submit')
      const data = await res.json()
      setSuccessId(data.id)
      resetForm()
    } catch (err) {
      console.error(err)
      setError('Could not submit your repair request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const chipClass = (active, color) => `inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
    active
      ? `bg-${color}-600 border-${color}-500 text-white shadow`
      : `bg-slate-900/40 border-slate-700 text-slate-200 hover:bg-slate-800/60`
  }`

  const inputBase = 'bg-white text-slate-900 placeholder-slate-500 text-[16px] leading-6 px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
  const selectBase = 'bg-white text-slate-900 text-[16px] leading-6 px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'

  return (
    <section className="max-w-4xl mx-auto px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-3">What would you like to do today?</h2>
        <div className="flex flex-wrap gap-2">
          {intents.map(({ key, label, color }) => (
            <button key={key} onClick={() => setIntent(key)} className={chipClass(intent === key, color)}>
              {label}
            </button>
          ))}
        </div>
        <p className="text-slate-300 mt-3 text-sm">We'll ask a few quick questions to help us help you.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-700 mb-1">Your name</label>
              <input className={`w-full ${inputBase}`} value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-1">How can we contact you?</label>
              <input className={`w-full ${inputBase}`} value={contact} onChange={e=>setContact(e.target.value)} placeholder="Phone or email" />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-1">Your address</label>
              <input className={`w-full ${inputBase}`} value={address} onChange={e=>setAddress(e.target.value)} placeholder="Flat/House, Street, Postcode" />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-1">Tell us about it</label>
              <textarea className={`w-full ${inputBase}`} rows={4} value={matter} onChange={e=>setMatter(e.target.value)} placeholder={intent === 'report-repair' ? 'Describe the repair needed' : (intent === 'moving-out' ? 'Share your intended move-out date and any details' : 'What would you like to discuss?')} />
            </div>

            {intent === 'report-repair' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Priority</label>
                  <select className={`w-full ${selectBase}`} value={priority} onChange={e=>setPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Photo (optional)</label>
                  <input type="file" accept="image/*" capture="environment" onChange={e=>setPhoto(e.target.files?.[0] || null)} className="w-full text-sm" />
                  <p className="text-xs text-slate-500 mt-1">Tip: On mobile, this opens your camera.</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-700 mb-1">Token</label>
                  <input className={`w-full ${inputBase}`} value={token} onChange={e=>setToken(e.target.value)} placeholder="Paste your token from the link we sent" />
                  <p className="text-xs text-slate-500 mt-1">If you followed a magic link, this will be filled in automatically.</p>
                </div>
              </div>
            )}

            {successId && (
              <div className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-md px-3 py-2">Thanks – your reference is {successId}.</div>
            )}
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>
            )}

            <div className="flex justify-end gap-2">
              {intent === 'report-repair' ? (
                <button onClick={submitRepair} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  {submitting ? 'Submitting…' : 'Submit repair'}
                </button>
              ) : (
                <button onClick={copySummary} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400">
                  Copy summary
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-5">
          <h4 className="font-semibold mb-2">What happens next?</h4>
          {intent === 'report-repair' ? (
            <ul className="text-sm text-slate-300 space-y-2 list-disc pl-5">
              <li>We'll log your repair and assign the right operative.</li>
              <li>Use the token from your magic link so we can verify your address.</li>
              <li>You can attach a photo to help us triage.</li>
            </ul>
          ) : intent === 'moving-out' ? (
            <ul className="text-sm text-slate-300 space-y-2 list-disc pl-5">
              <li>Share your intended move-out date and any questions.</li>
              <li>Copy your summary and send it to us via email or chat.</li>
            </ul>
          ) : (
            <ul className="text-sm text-slate-300 space-y-2 list-disc pl-5">
              <li>Tell us what you'd like to discuss.</li>
              <li>Copy your summary and we'll get back to you.</li>
            </ul>
          )}
          {intent !== 'report-repair' && (
            <div className="mt-4 text-sm text-slate-300">
              <p className="mb-2">Email: <a className="text-sky-400 hover:underline" href={`mailto:customerservices@glenroe.co.uk?subject=${encodeURIComponent('Tenant enquiry: ' + intent)}&body=${encodeURIComponent(summary)}`}>customerservices@glenroe.co.uk</a></p>
              <p>Or paste your summary into your usual chat with us.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
