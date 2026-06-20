import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TripForm from '../components/TripForm'
import axios from 'axios'
import heroBg from '../assets/front-page.jpeg'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(formData) {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post('http://localhost:4000/api/trip/generate', formData)
      navigate('/results', { state: { plan: res.data.data, inputs: formData } })
    } catch (err) {
      setError('Something went wrong generating your trip. Check that your backend is running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm">
          <div className="text-6xl mb-6 animate-bounce">⛷️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Planning your trip...</h2>
          <p className="text-slate-400 text-sm mb-8">Claude is finding the best resorts, flights, and lodging for you</p>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-blue-400"
                style={{ animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Hero section with background image */}
      <div
        className="relative min-h-[420px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/50 to-slate-900" />

        {/* Hero content */}
        <div className="relative z-10 max-w-2xl mx-auto px-6 pt-16 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm text-blue-200 mb-6">
            <span>✨</span> AI-powered ski trip planning
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
            Your perfect ski trip,<br />
            <span className="text-blue-400">planned in seconds</span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed drop-shadow">
            Tell us your budget, dates, and skill level — we'll handle the rest.
            Resorts, flights, lodging, and lift tickets, all in one plan.
          </p>
        </div>
      </div>

      {/* Form section */}
      <div className="max-w-2xl mx-auto px-6 pb-24 -mt-8 relative z-10">
        {error && (
          <div className="mb-5 p-4 bg-red-900/40 border border-red-700/50 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Glassmorphism form card */}
        <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
          <TripForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </div>
  )
}