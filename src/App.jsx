import Hero from './components/Hero'
import QuickAdd from './components/QuickAdd'
import Dashboard from './components/Dashboard'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-100">
      <Hero />

      <main className="-mt-10 relative z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h2 className="text-xl font-semibold mb-3">Quick Add</h2>
            <QuickAdd onCreated={() => { /* Reload triggered by dashboard */ }} />
          </div>
        </div>
        <Dashboard />
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
