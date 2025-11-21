import { useState } from 'react'
import Spline from '@splinetool/react-spline'

export default function Hero() {
  const [logoError, setLogoError] = useState(false)

  return (
    <section className="relative h-[60vh] w-full overflow-hidden">
      {/* Brand bar */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center gap-3">
          {!logoError ? (
            <img
              src="/logo.png"
              alt="Glenroe Living Limited"
              className="h-9 w-auto rounded-md shadow ring-1 ring-white/10 bg-white"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="h-9 w-9 rounded-md bg-emerald-600 text-white flex items-center justify-center font-semibold tracking-wide">
              GL
            </div>
          )}
          <div className="text-white/95">
            <div className="text-base sm:text-lg font-semibold">Glenroe Living Limited</div>
            <div className="text-xs sm:text-sm text-white/70">Property Asset Management</div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/1VHYoewWfi45VYZ5/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 h-full w-full bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-20 flex items-end">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full pb-10">
          <h1 className="text-3xl sm:text-5xl font-bold text-white drop-shadow-lg">Welcome to Glenroe Living.</h1>
          <p className="mt-3 text-slate-200/90 max-w-2xl drop-shadow">
            Helping residents and operatives keep homes in great shape.
          </p>
        </div>
      </div>
    </section>
  )
}
