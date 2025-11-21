import { useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function OperativeLogin({ onAuthed }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/operative/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (!res.ok) throw new Error('Login failed')
      const data = await res.json()
      if (data?.token) {
        localStorage.setItem('operative_token', data.token)
      }
      if (data?.operative_id) {
        localStorage.setItem('operative_id', data.operative_id)
      }
      if (data?.email) {
        localStorage.setItem('operative_email', data.email)
      } else {
        localStorage.setItem('operative_email', email)
      }
      onAuthed?.(data.token)
    } catch (err) {
      console.error(err)
      alert('Could not sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-2 text-white">Operative sign in</h2>
        <p className="text-slate-300 text-sm mb-4">Enter your work email to get started.</p>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Work email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="w-full bg-white text-slate-900 placeholder-slate-500 text-[16px] leading-6 px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="you@company.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
      </div>
    </div>
  )
}
