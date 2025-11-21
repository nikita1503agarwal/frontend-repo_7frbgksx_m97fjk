import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Simple, client-side helper chatbot for tenants on the front page.
// Guides users to the right flow and offers email handoff.
export default function FrontChatbot() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi, how can we help today? You can report a repair, tell us you\'re moving out, or ask something else.' },
  ])
  const [input, setInput] = useState('')
  const endRef = useRef(null)

  const email = 'customerservices@glenroe.co.uk'

  const scrollToEnd = () => {
    try { endRef.current?.scrollIntoView({ behavior: 'smooth' }) } catch {}
  }

  const addMessage = (role, text) => {
    setMessages(prev => [...prev, { role, text }])
    setTimeout(scrollToEnd, 10)
  }

  const quickReply = (key) => {
    if (key === 'report-repair') {
      addMessage('user', 'Report a repair')
      addMessage('assistant', 'Great. I can guide you to our repair form. If you\'ve received a magic link, have it handy to auto-fill your token.')
    } else if (key === 'moving-out') {
      addMessage('user', 'Moving out')
      addMessage('assistant', 'Thanks for letting us know. We\'ll ask a couple of questions to get this started.')
    } else {
      addMessage('user', 'Other')
      addMessage('assistant', 'No problem. You can send us a quick note here, or email us and we\'ll get back to you.')
    }
  }

  const startFlow = (key) => {
    if (key === 'report-repair') navigate('/tenant?action=report-repair')
    if (key === 'moving-out') navigate('/tenant?action=moving-out')
    if (key === 'other') navigate('/tenant?action=other')
  }

  const mailtoHref = useMemo(() => {
    const subject = 'Tenant enquiry'
    const body = messages
      .map(m => `${m.role === 'assistant' ? 'Glenroe' : 'Me'}: ${m.text}`)
      .join('\n')
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }, [messages])

  const send = (e) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text) return
    addMessage('user', text)
    setInput('')
    // Lightweight keyword routing for convenience
    const t = text.toLowerCase()
    if (t.includes('repair') || t.includes('fix') || t.includes('broken')) {
      addMessage('assistant', 'It sounds like a repair. Tap “Start repair report” below to continue.')
    } else if (t.includes('move') || t.includes('leaving') || t.includes('notice')) {
      addMessage('assistant', 'Got it — moving out. Tap “Start moving out” to continue.')
    } else {
      addMessage('assistant', 'Thanks. You can continue here, or email us and we\'ll follow up.')
    }
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base sm:text-lg font-semibold">Tenant Assistant</h3>
        <a href={mailtoHref} className="text-sm text-sky-400 hover:underline">Email {email}</a>
      </div>

      <div className="h-64 sm:h-72 overflow-y-auto bg-slate-950/30 border border-slate-800 rounded-lg p-3 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'assistant' ? 'flex' : 'flex justify-end'}>
            <div className={m.role === 'assistant'
              ? 'max-w-[85%] bg-slate-800 text-slate-100 px-3 py-2 rounded-lg rounded-tl-sm'
              : 'max-w-[85%] bg-emerald-600 text-white px-3 py-2 rounded-lg rounded-tr-sm'}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button onClick={() => quickReply('report-repair')} className="text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-md">Report a repair</button>
        <button onClick={() => quickReply('moving-out')} className="text-xs sm:text-sm bg-amber-600 hover:bg-amber-500 text-white px-3 py-2 rounded-md">Moving out</button>
        <button onClick={() => quickReply('other')} className="text-xs sm:text-sm bg-sky-600 hover:bg-sky-500 text-white px-3 py-2 rounded-md">Other</button>
      </div>

      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          className="flex-1 bg-white text-slate-900 placeholder-slate-500 text-[16px] leading-6 px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md">Send</button>
      </form>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button onClick={() => startFlow('report-repair')} className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-2 rounded-md">Start repair report</button>
        <button onClick={() => startFlow('moving-out')} className="bg-amber-700 hover:bg-amber-600 text-white px-3 py-2 rounded-md">Start moving out</button>
        <button onClick={() => startFlow('other')} className="bg-sky-700 hover:bg-sky-600 text-white px-3 py-2 rounded-md">Ask about something else</button>
      </div>
    </div>
  )
}
