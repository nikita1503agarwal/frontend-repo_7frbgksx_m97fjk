import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import FrontChatbot from './FrontChatbot'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-[92vw] sm:w-[380px] bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-sm font-semibold">Tenant Assistant</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300" aria-label="Close assistant">
              <X size={16} />
            </button>
          </div>
          <div className="p-3">
            <FrontChatbot />
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-2 rounded-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        <MessageCircle size={18} />
        <span className="font-medium">Chat to us</span>
      </button>
    </div>
  )
}
