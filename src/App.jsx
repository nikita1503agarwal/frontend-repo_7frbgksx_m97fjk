import Hero from './components/Hero'
import ChatWidget from './components/ChatWidget'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-100">
      <Hero />

      <main className="-mt-10 relative z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-semibold mb-3">Welcome</h2>
            <p className="text-slate-300 max-w-2xl">Use the chat button in the corner to report a repair, tell us you are moving out, or ask something else. We will guide you step by step and can send your details straight to our team.</p>
            <p className="text-xs text-slate-400 mt-6">For tenant enquiries, email customerservices@glenroe.co.uk</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 mt-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 text-sm text-slate-400">
          Built for private landlord portfolios • Track works and compliance with ease
        </div>
      </footer>

      {/* Floating tenant assistant */}
      <ChatWidget />
    </div>
  )
}

export default App
