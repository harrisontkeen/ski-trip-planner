import { useLocation, Link } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import ResortCard from '../components/ResortCard'
import BudgetBreakdown from '../components/BudgetBreakdown'
import LinksList from '../components/LinksList'
import MapView from '../components/MapView'

export default function Results() {
  const location = useLocation()
  const { plan, inputs } = location.state || {}
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const tripName = `${inputs?.preferredRegion?.join(', ') || 'Trip'} — ${inputs?.startDate || ''}`
      await axios.post('http://localhost:4000/api/trip/save', {
        inputs,
        plan,
        tripName
      })
      setSaved(true)
    } catch (err) {
      setSaveError('Failed to save trip. Try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <p className="text-slate-400 mb-4">No trip plan found. Try generating a new one.</p>
        <Link to="/" className="text-blue-400 hover:text-blue-300 font-medium">
          ← Back to planner
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">

      {/* Hero banner */}
      <div className="relative bg-gradient-to-r from-blue-900/80 via-slate-800 to-slate-900 border-b border-slate-700/50 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 40%)'
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <Link to="/" className="text-sm text-slate-400 hover:text-white transition inline-flex items-center gap-1 mb-3">
                ← New search
              </Link>
              <h1 className="text-3xl font-bold text-white mb-1">
                Your Trip Plan 🏔️
              </h1>
              <p className="text-slate-300 text-sm">
                {plan.topResorts?.length} resorts recommended
                {plan.budgetBreakdown?.total && ` · $${plan.budgetBreakdown.total.toLocaleString()} estimated total`}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-6">
              {saveError && (
                <span className="text-xs text-red-400">{saveError}</span>
              )}
              {saved ? (
                <span className="text-sm text-green-400 font-medium flex items-center gap-1.5">
                  ✓ Saved to trip log
                </span>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition"
                >
                  {saving ? 'Saving...' : '💾 Save Trip'}
                </button>
              )}
              <Link
                to="/trips"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition"
              >
                My Trips
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Warning banner */}
        {plan.importantWarning && (
          <div className="mb-6 p-4 bg-amber-900/30 border border-amber-700/40 rounded-xl text-amber-200 text-sm leading-relaxed">
            {plan.importantWarning}
          </div>
        )}

        {/* Summary */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Trip Summary</h2>
          <p className="text-slate-300 leading-relaxed">{plan.summary}</p>
        </div>

        {/* Map */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Resort Locations</h2>
          <MapView resorts={plan.topResorts} flightSuggestions={plan.flightSuggestions} />
        </div>

        {/* Resorts */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Recommended Resorts</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {plan.topResorts?.map((resort, i) => (
              <ResortCard key={i} resort={resort} />
            ))}
          </div>
        </div>

        {/* Two column: budget + links */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <BudgetBreakdown budget={plan.budgetBreakdown} />
          <div className="space-y-6">
            <LinksList
              title="Flights"
              items={plan.flightSuggestions}
              urlKey="searchUrl"
              labelKey="nearestAirport"
            />
            <LinksList
              title="Rental Car"
              items={plan.rentalCarUrl ? [{ searchUrl: plan.rentalCarUrl, label: 'Search rental cars' }] : []}
              urlKey="searchUrl"
              labelKey="label"
            />
          </div>
        </div>

        {/* Lodging */}
        <div className="mb-8">
          <LinksList
            title="Lodging Options"
            items={plan.lodgingSuggestions}
            urlKey="searchUrl"
            labelKey="type"
            descKey="description"
          />
        </div>

        {/* Best time to book */}
        {plan.bestTimeToBook && (
          <div className="mb-8 bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">
              Booking Strategy
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">{plan.bestTimeToBook}</p>
          </div>
        )}

        {/* Packing tips */}
        {plan.packingTips && (
          <div className="mb-8 bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">
              Packing Tips
            </h3>
            <ul className="space-y-2">
              {plan.packingTips.map((tip, i) => (
                <li key={i} className="text-sm text-slate-300 flex gap-2">
                  <span className="text-blue-400">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  )
}