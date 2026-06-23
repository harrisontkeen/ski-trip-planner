const DAY_TYPES = {
  travel:    { dot: 'bg-blue-500',   badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',     label: 'Travel' },
  ski:       { dot: 'bg-cyan-500',   badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',     label: 'Ski Day' },
  rest:      { dot: 'bg-amber-500',  badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',  label: 'Rest' },
  explore:   { dot: 'bg-purple-500', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30', label: 'Explore' },
  departure: { dot: 'bg-slate-400',  badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30',  label: 'Departure' },
}

// Fallback for days with no (or an unknown) type — keeps the original numbered
// blue node so trips saved before day-types existed still render cleanly.
const DEFAULT_STYLE = { dot: 'bg-blue-600', badge: '', label: '' }

function TypeIcon({ type }) {
  const cls = 'w-3.5 h-3.5'
  if (type === 'travel' || type === 'departure') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
      </svg>
    )
  }
  if (type === 'rest') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    )
  }
  if (type === 'explore') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    )
  }
  // ski — mountain
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 20L9 8l3.5 6L15 10l6 10H3z" />
    </svg>
  )
}

// Claude is asked for plain strings, but defend against object activities.
function renderActivity(act) {
  if (typeof act === 'string') return act
  if (act && typeof act === 'object') {
    if (act.time && act.activity) return `${act.time}: ${act.activity}`
    return Object.values(act).filter(v => typeof v === 'string').join(' — ')
  }
  return String(act ?? '')
}

export default function Itinerary({ itinerary }) {
  if (!Array.isArray(itinerary) || itinerary.length === 0) return null

  return (
    <ol className="relative space-y-4">
      {itinerary.map((day, i) => {
        const known = DAY_TYPES[day?.type]
        const style = known ?? DEFAULT_STYLE
        const activities = Array.isArray(day?.activities) ? day.activities : []
        const isLast = i === itinerary.length - 1

        return (
          <li key={i} className="relative pl-12">
            {/* Vertical connector to the next day */}
            {!isLast && (
              <span className="absolute left-[17px] top-10 -bottom-4 w-px bg-slate-700/70" aria-hidden="true" />
            )}

            {/* Timeline node — type icon when known, otherwise the day number */}
            <span className={`absolute left-0 top-1 w-9 h-9 rounded-full ${style.dot} ring-4 ring-slate-900 flex items-center justify-center text-white shadow-md`}>
              {known
                ? <TypeIcon type={day.type} />
                : <span className="text-sm font-bold">{day?.day ?? i + 1}</span>}
            </span>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between gap-3 mb-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Day {day?.day ?? i + 1}
                </span>
                {known && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide ${style.badge}`}>
                    {style.label}
                  </span>
                )}
              </div>

              <h4 className="text-base font-semibold text-white leading-tight mb-1">
                {day?.title || `Day ${day?.day ?? i + 1}`}
              </h4>
              {day?.description && (
                <p className="text-sm text-slate-400 leading-relaxed mb-3">{day.description}</p>
              )}

              {activities.length > 0 && (
                <ul className="space-y-1.5 mt-2">
                  {activities.map((act, j) => (
                    <li key={j} className="text-sm text-slate-300 flex gap-2.5 leading-relaxed">
                      <span className={`shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      <span>{renderActivity(act)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
