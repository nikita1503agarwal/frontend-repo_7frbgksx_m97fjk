import { Link } from 'react-router-dom'
import Hero from './components/Hero'
import FrontChatbot from './components/FrontChatbot'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-100">
      <Hero />

      <main className="-mt-10 relative z-30 space-y-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-2">What would you like to do today?</h2>
            <p className="text-slate-300 mb-5">Choose an option below or chat with us.</p>

            {/* Tenant chatbot on the front page */}
            <FrontChatbot />

            {/* Tenant quick actions (labels simplified; remove the word "Tenant") */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link
                to="/tenant?action=report-repair"
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 font-medium shadow transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Report a repair
              </Link>
              <Link
                to="/tenant?action=moving-out"
                className="inline-flex items-center justify-center rounded-lg bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 font-medium shadow transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Moving out
              </Link>
              <Link
                to="/tenant?action=other"
                className="inline-flex items-center justify-center rounded-lg bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 font-medium shadow transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Other enquiry
              </Link>
            </div>

            {/* No operative tab on this front end */}
            <p className="text-xs text-slate-400 mt-6">For tenant enquiries, email customerservices@glenroe.co.uk</p>
          </div>
        </div>

        {/* Remove the lower half properties dashboard from the front page as requested */}
        {/* Intentionally omitted <Dashboard /> to focus on backend reporting entry points */}
      </main>

      <footer className="border-t border-slate-800 mt-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 text-sm text-slate-400">
          Built for private landlord portfolios • Track works and compliance with ease
        </div>
      </footer>
    </div>
  )
}

export default App
