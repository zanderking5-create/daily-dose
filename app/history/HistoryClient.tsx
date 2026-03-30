'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import { createClient } from '@/lib/supabase/client'
import { Briefing, Debrief } from '@/lib/types'
import BriefingCard from '@/components/BriefingCard'

interface Props {
  briefingDates: string[]
  debriefDates: string[]
}

function chevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}
function chevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function HistoryClient({ briefingDates, debriefDates }: Props) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [briefing, setBriefing] = useState<Briefing | null>(null)
  const [debrief, setDebrief] = useState<Debrief | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const bSet = new Set(briefingDates)
  const dSet = new Set(debriefDates)

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  async function selectDate(dateStr: string) {
    if (!bSet.has(dateStr) && !dSet.has(dateStr)) return
    setSelectedDate(dateStr)
    setLoading(true)
    setBriefing(null)
    setDebrief(null)

    const [bRes, dRes] = await Promise.all([
      supabase.from('briefings').select('*').eq('date', dateStr).single(),
      supabase.from('debriefs').select('*').eq('date', dateStr).single(),
    ])
    setBriefing(bRes.data)
    setDebrief(dRes.data)
    setLoading(false)
  }

  const todayStr = today.toISOString().split('T')[0]

  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: '100vh' }}>
      <div className="max-w-lg mx-auto px-4 pt-8 pb-28">

        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2A26' }}>
            History
          </h1>
        </div>

        {/* Calendar */}
        <div className="mb-5 animate-fade-in-1" style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E8E4DF',
          boxShadow: '0 1px 3px rgba(45,42,38,0.06)',
          padding: '20px',
        }}>
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-lg" style={{ color: '#8B857D' }}>
              {chevronLeft()}
            </button>
            <span className="font-semibold" style={{ color: '#2D2A26', fontFamily: 'var(--font-fraunces)' }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} className="p-2 rounded-lg" style={{ color: '#8B857D' }}>
              {chevronRight()}
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: '#8B857D' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const hasBriefing = bSet.has(dateStr)
              const hasDebrief = dSet.has(dateStr)
              const isToday = dateStr === todayStr
              const isSelected = dateStr === selectedDate
              const hasAny = hasBriefing || hasDebrief

              return (
                <button
                  key={day}
                  onClick={() => selectDate(dateStr)}
                  disabled={!hasAny}
                  className="relative flex flex-col items-center py-1.5 rounded-xl transition-all"
                  style={{
                    backgroundColor: isSelected ? '#7C8B6F' : isToday ? '#FAF8F5' : 'transparent',
                    cursor: hasAny ? 'pointer' : 'default',
                  }}>
                  <span className="text-sm" style={{
                    color: isSelected ? '#FFFFFF' : isToday ? '#7C8B6F' : hasAny ? '#2D2A26' : '#C8C3BC',
                    fontWeight: isToday || isSelected ? 600 : 400,
                  }}>
                    {day}
                  </span>
                  {/* Dots */}
                  <div className="flex gap-0.5 mt-0.5 h-1.5">
                    {hasBriefing && (
                      <div className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: isSelected ? '#FFFFFF' : '#7C8B6F' }} />
                    )}
                    {hasDebrief && (
                      <div className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: isSelected ? '#F0DCC8' : '#C4956A' }} />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 pt-3" style={{ borderTop: '1px solid #E8E4DF' }}>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#7C8B6F' }} />
              <span className="text-xs" style={{ color: '#8B857D' }}>Briefing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#C4956A' }} />
              <span className="text-xs" style={{ color: '#8B857D' }}>Debrief</span>
            </div>
          </div>
        </div>

        {/* Day detail */}
        {selectedDate && (
          <div className="animate-fade-in">
            <h2 className="text-lg mb-4" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2A26' }}>
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric'
              })}
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="skeleton h-16 w-full rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {briefing && (
                  <BriefingCard content={briefing.content} date={briefing.date} generatedAt={briefing.generated_at} />
                )}
                {debrief && <DebriefDetail debrief={debrief} />}
              </div>
            )}
          </div>
        )}
      </div>
      <Nav />
    </div>
  )
}

function DebriefDetail({ debrief }: { debrief: Debrief }) {
  const metrics = [
    { label: 'Mood', value: debrief.mood, color: '#7C8B6F' },
    { label: 'Energy', value: debrief.energy, color: '#C4956A' },
    { label: 'Stress', value: debrief.stress, color: '#A0856D' },
    { label: 'Gas', value: debrief.gassiness, color: '#8B857D' },
  ].filter(m => m.value !== null)

  return (
    <div style={{
      backgroundColor: '#FFFFFF', borderRadius: '16px',
      border: '1px solid #E8E4DF', boxShadow: '0 1px 3px rgba(45,42,38,0.06)',
      padding: '20px',
    }}>
      <h3 className="text-xl mb-4" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2A26' }}>
        Evening Debrief
      </h3>

      {metrics.length > 0 && (
        <div className="flex gap-5 mb-4">
          {metrics.map(m => (
            <div key={m.label}>
              <div className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: m.color }}>
                {m.value}
              </div>
              <div className="text-xs" style={{ color: '#8B857D' }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {debrief.exercise_type && debrief.exercise_type !== 'none' && (
        <p className="text-sm mb-3" style={{ color: '#5B6B4F' }}>
          <span className="font-medium">Exercise:</span> {debrief.exercise_type}
          {debrief.exercise_duration ? ` · ${debrief.exercise_duration} min` : ''}
        </p>
      )}

      {debrief.water_glasses > 0 && (
        <p className="text-sm mb-3" style={{ color: '#5B6B4F' }}>
          <span className="font-medium">Water:</span> {debrief.water_glasses} glasses
        </p>
      )}

      {debrief.gratitude && (
        <div className="rounded-xl p-4 mb-3" style={{ backgroundColor: '#FAF8F5' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#8B857D' }}>Gratitude</p>
          <p className="text-sm leading-relaxed" style={{ color: '#2D2A26' }}>{debrief.gratitude}</p>
        </div>
      )}

      {debrief.tomorrow_intentions && (
        <div className="rounded-xl p-4" style={{ backgroundColor: '#FAF8F5' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#8B857D' }}>Intentions</p>
          <p className="text-sm leading-relaxed" style={{ color: '#2D2A26' }}>{debrief.tomorrow_intentions}</p>
        </div>
      )}
    </div>
  )
}
