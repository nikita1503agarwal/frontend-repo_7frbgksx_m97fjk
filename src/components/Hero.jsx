import Spline from '@splinetool/react-spline'

export default function Hero() {
  return (
    <section className="relative h-[60vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/1VHYoewWfi45VYZ5/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 h-full w-full bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-20 flex items-end">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full pb-10">
          <h1 className="text-3xl sm:text-5xl font-bold text-white drop-shadow-lg">Property Asset Management</h1>
          <p className="mt-3 text-slate-200/90 max-w-2xl drop-shadow">Record works, manage landlords and properties, and track compliance certificates like Gas Safety and EICR.</p>
        </div>
      </div>
    </section>
  )
}
