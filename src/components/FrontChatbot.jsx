import { useMemo, useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Conversational assistant for tenants. Guides with follow-up questions
// and can prefill the tenant form.
export default function FrontChatbot() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi, I can help with repairs, moving out, or general questions. What do you need today?" },
  ])
  const [input, setInput] = useState('')
  const endRef = useRef(null)

  const [intent, setIntent] = useState('') // 'report-repair' | 'moving-out' | 'other'
  const [prefill, setPrefill] = useState({
    name: '',
    contact: '',
    address: '',
    details: '',
    priority: '', // low | medium | high | urgent
  })

  // Flow control for confirmation
  const [awaitingConfirm, setAwaitingConfirm] = useState(false)
  const [summaryShown, setSummaryShown] = useState(false)

  const email = 'customerservices@glenroe.co.uk'

  const scrollToEnd = () => {
    try { endRef.current?.scrollIntoView({ behavior: 'smooth' }) } catch {}
  }

  const addMessage = (role, text) => {
    setMessages(prev => [...prev, { role, text }])
    setTimeout(scrollToEnd, 10)
  }

  const setAndAsk = (updates, nextQuestion) => {
    setPrefill(prev => ({ ...prev, ...updates }))
    if (nextQuestion) addMessage('assistant', nextQuestion)
  }

  const detectIntent = (text) => {
    const t = text.toLowerCase()
    if (t.includes('repair') || t.includes('fix') || t.includes('broken') || t.includes('leak') || t.includes('heating')) return 'report-repair'
    if (t.includes('move') || t.includes('moving') || t.includes('leave') || t.includes('notice')) return 'moving-out'
    return 'other'
  }

  const detectPriority = (text) => {
    const t = text.toLowerCase()
    if (/(danger|gas|carbon|monoxide|sparks|fire|flood|burst)/.test(t)) return 'urgent'
    if (/(leak|no heat|no heating|no hot water|electrics)/.test(t)) return 'high'
    if (/(soon|asap|priority)/.test(t)) return 'high'
    return ''
  }

  const nextRepairQuestion = (state) => {
    if (!state.address) return 'What is the property address?'
    if (!state.details) return 'Please describe the issue (what happened, where, and since when).'
    if (!state.priority) return 'How urgent is it? (urgent, high, medium, or low)'
    if (!state.name) return 'What is your name?'
    if (!state.contact) return 'What is the best way to contact you (phone or email)?'
    return ''
  }

  const nextMoveOutQuestion = (state) => {
    if (!state.name) return 'What is your name?'
    if (!state.contact) return 'What is the best way to contact you (phone or email)?'
    if (!state.address) return 'What is the property address?'
    if (!state.details) return 'Please share your intended move-out date and any details.'
    return ''
  }

  const nextOtherQuestion = (state) => {
    if (!state.name) return 'What is your name?'
    if (!state.contact) return 'What is the best way to contact you (phone or email)?'
    if (!state.details) return 'How can we help? Please share a few details.'
    return ''
  }

  const buildSummary = () => {
    const name = prefill.name || '—'
    const contact = prefill.contact || '—'
    const address = prefill.address || '—'
    const details = prefill.details || '—'
    const priority = prefill.priority || '—'

    if (intent === 'report-repair') {
      return `Summary of your repair request: • Address: ${address} • Issue: ${details} • Priority: ${priority} • Name: ${name} • Contact: ${contact}. Is everything correct? (yes/no)`
    }
    if (intent === 'moving-out') {
      return `Summary of your moving-out notice: • Name: ${name} • Contact: ${contact} • Address: ${address} • Details: ${details}. Is everything correct? (yes/no)`
    }
    return `Summary of your message: • Name: ${name} • Contact: ${contact} • Details: ${details}. Is everything correct? (yes/no)`
  }

  const showSummaryAndAsk = () => {
    if (summaryShown) return
    addMessage('assistant', buildSummary())
    setAwaitingConfirm(true)
    setSummaryShown(true)
  }

  const proposeContinue = () => {
    if (intent === 'report-repair') {
      addMessage('assistant', 'Thanks. Next, please open the repair form. When you have filled everything in, tap Submit and we will send the email to Customer Services on your behalf.')
    } else if (intent === 'moving-out') {
      addMessage('assistant', 'Thanks. Next, please open the moving-out form. When you complete it, tap Submit and we will send the email to Customer Services on your behalf.')
    } else {
      addMessage('assistant', `You can continue here or email us at ${email}.`)
    }
  }

  const handleUserText = (text) => {
    const t = text.trim()

    // Handle confirmation step first if active
    if (awaitingConfirm) {
      const ans = t.toLowerCase()
      setAwaitingConfirm(false)
      if (ans === 'yes' || ans === 'y' || /correct|looks good|confirm/.test(ans)) {
        if (intent === 'report-repair') {
          addMessage('assistant', 'Thanks for confirming. I will email this to Customer Services after you submit the form. They will be in touch to make an appointment for an engineer.')
        } else if (intent === 'moving-out') {
          addMessage('assistant', 'Thanks for confirming. I will email this to Customer Services after you submit the form and they will be in touch to confirm next steps.')
        } else {
          addMessage('assistant', 'Thanks for confirming. I will email this to Customer Services and they will get back to you.')
        }
        proposeContinue()
        return
      }
      // If not confirmed, ask what to change
      addMessage('assistant', 'No problem. What would you like to change? You can retype any field such as address, issue details, priority, name, or contact.')
      setSummaryShown(false)
      return
    }

    // If intent is unknown, detect and ask the next question
    if (!intent) {
      const i = detectIntent(t)
      setIntent(i)
      if (i === 'report-repair') {
        addMessage('assistant', 'Great — a repair. I will ask a few quick questions to help triage.')
        const nq = nextRepairQuestion(prefill)
        if (nq) addMessage('assistant', nq)
      } else if (i === 'moving-out') {
        addMessage('assistant', 'Okay — moving out. I will ask a couple of things to notify the team.')
        const nq = nextMoveOutQuestion(prefill)
        if (nq) addMessage('assistant', nq)
      } else {
        addMessage('assistant', 'No problem. I can take a short note and pass it on.')
        const nq = nextOtherQuestion(prefill)
        if (nq) addMessage('assistant', nq)
      }
      return
    }

    // If intent is set, fill fields progressively in order of the next question
    if (intent === 'report-repair') {
      if (!prefill.address) return setAndAsk({ address: t }, nextRepairQuestion({ ...prefill, address: t }))
      if (!prefill.details) {
        const pr = detectPriority(t) || prefill.priority
        return setAndAsk({ details: t, priority: pr }, nextRepairQuestion({ ...prefill, details: t, priority: pr }))
      }
      if (!prefill.priority) {
        const pr = (/urgent|emergency/.test(t.toLowerCase()) ? 'urgent' : (/high/.test(t.toLowerCase()) ? 'high' : (/low/.test(t.toLowerCase()) ? 'low' : 'medium')))
        return setAndAsk({ priority: pr }, nextRepairQuestion({ ...prefill, priority: pr }))
      }
      if (!prefill.name) return setAndAsk({ name: t }, nextRepairQuestion({ ...prefill, name: t }))
      if (!prefill.contact) {
        setAndAsk({ contact: t }, '')
        // All info gathered — show summary and confirmation step
        showSummaryAndAsk()
        return
      }
      // Already complete — ensure summary is shown at least once
      showSummaryAndAsk()
      return
    }

    if (intent === 'moving-out') {
      if (!prefill.name) return setAndAsk({ name: t }, nextMoveOutQuestion({ ...prefill, name: t }))
      if (!prefill.contact) return setAndAsk({ contact: t }, nextMoveOutQuestion({ ...prefill, contact: t }))
      if (!prefill.address) return setAndAsk({ address: t }, nextMoveOutQuestion({ ...prefill, address: t }))
      if (!prefill.details) {
        setAndAsk({ details: t }, '')
        showSummaryAndAsk()
        return
      }
      showSummaryAndAsk()
      return
    }

    if (intent === 'other') {
      if (!prefill.name) return setAndAsk({ name: t }, nextOtherQuestion({ ...prefill, name: t }))
      if (!prefill.contact) return setAndAsk({ contact: t }, nextOtherQuestion({ ...prefill, contact: t }))
      if (!prefill.details) {
        setAndAsk({ details: t }, '')
        showSummaryAndAsk()
        return
      }
      showSummaryAndAsk()
      return
    }
  }

  const send = (e) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text) return
    addMessage('user', text)
    setInput('')
    handleUserText(text)
  }

  const quickReply = (key) => {
    if (key === 'report-repair') {
      setIntent('report-repair')
      addMessage('user', 'Report a repair')
      addMessage('assistant', 'Great — I will ask a few questions.')
      addMessage('assistant', nextRepairQuestion(prefill))
    } else if (key === 'moving-out') {
      setIntent('moving-out')
      addMessage('user', 'Moving out')
      addMessage('assistant', 'Okay — a couple of quick questions.')
      addMessage('assistant', nextMoveOutQuestion(prefill))
    } else {
      setIntent('other')
      addMessage('user', 'Other')
      addMessage('assistant', 'Sure — what would you like to discuss?')
      const nq = nextOtherQuestion(prefill)
      if (nq) addMessage('assistant', nq)
    }
  }

  const openPrefilled = (target) => {
    // Save prefill so the form can read it
    try {
      sessionStorage.setItem('tenant_prefill', JSON.stringify({ ...prefill, intent }))
    } catch {}
    if (target === 'repair') navigate('/tenant?action=report-repair')
    if (target === 'moving') navigate('/tenant?action=moving-out')
    if (target === 'other') navigate('/tenant?action=other')
  }

  const mailtoHref = useMemo(() => {
    const subject = 'Tenant enquiry'
    const body = messages
      .map(m => `${m.role === 'assistant' ? 'Glenroe' : 'Me'}: ${m.text}`)
      .join('\n')
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }, [messages])

  const readyForRepair = intent === 'report-repair' && prefill.address && prefill.details && prefill.priority && prefill.name && prefill.contact
  const readyForMoving = intent === 'moving-out' && prefill.name && prefill.contact && prefill.address && prefill.details
  const readyForOther = intent === 'other' && prefill.name && prefill.contact && prefill.details

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
          placeholder={awaitingConfirm ? 'Type yes to confirm or no to edit…' : 'Type a message...'}
        />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md">Send</button>
      </form>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button onClick={() => openPrefilled('repair')} disabled={!readyForRepair} className={`px-3 py-2 rounded-md ${readyForRepair ? 'bg-emerald-700 hover:bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 cursor-not-allowed'}`}>Open repair form</button>
        <button onClick={() => openPrefilled('moving')} disabled={!readyForMoving} className={`px-3 py-2 rounded-md ${readyForMoving ? 'bg-amber-700 hover:bg-amber-600 text-white' : 'bg-slate-700 text-slate-300 cursor-not-allowed'}`}>Open moving-out form</button>
        <button onClick={() => openPrefilled('other')} disabled={!readyForOther} className={`px-3 py-2 rounded-md ${readyForOther ? 'bg-sky-700 hover:bg-sky-600 text-white' : 'bg-slate-700 text-slate-300 cursor-not-allowed'}`}>Open general form</button>
      </div>
    </div>
  )
}
