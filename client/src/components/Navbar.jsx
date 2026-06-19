import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="w-full px-8 py-4 flex items-center justify-between border-b border-white/10 backdrop-blur-sm bg-slate-900/80 sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-2xl">⛷️</span>
        <span className="text-xl font-bold tracking-tight text-white">
          Ski<span className="text-blue-400">Planner</span>
        </span>
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/trips" className="text-sm text-slate-400 hover:text-white transition">
          My Trips
        </Link>
        <Link to="/" className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition">
          + New Trip
        </Link>
      </div>
    </nav>
  )
}
