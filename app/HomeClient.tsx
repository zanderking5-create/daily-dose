'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import BriefingCard from '@/components/BriefingCard'
import BriefingSkeleton from '@/components/BriefingSkeleton'
import { Briefing, Debrief } from '@/lib/types'

interface Props {
  initialBriefing: Briefing | null
  initialDebrief: Debrief | null
  today: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function DebriefSummary({ debrief }: { debrief: Debrief }) {
  const metrics = [
    { label: 'Mood', value: debrief.mood, color: '#7C8B6F' },
    { label: 'Energy', value: debrief.energy, color: '#C4956A' },
    { label: 'Stress', value: debrief.stress, color: '#A0856D' },
    { label: 'Work', value: debrief.work_score, color: '#5B6B4F' },
    { label: 'Social', value: debrief.social_score, color: '#7C8B6F' },
  ].filter(m => m.value !== null)

  return (
    <div className="card p-5 animate-fade-in-2" style={{
      background: '#FFFFFF',
      borderRadius: '16px',
      boxShadow: '0 1px 3px rgba(45,42,38,0.06)',
      border: '1px solid #E8E4DF'
    }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2A26' }}>
          Evening Debrief
        </h2>
        <Link href="/debrief"
          className="text-xs font-medium px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: '#FAF8F5', color: '#7C8B6F', border: '1px solid #E8E4DF' }}>
          Edit
        </Link>
      </div>

      {metrics.length > 0 && (
        <div className="flex gap-4 mb-4">
          {metrics.map(m => (
            <div key={m.label} className="text-center">
              <div className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color: m.color }}>
                {m.value}
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#8B857D' }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {debrief.gratitude && (
        <div className="rounded-xl p-4" style={{ backgroundColor: '#FAF8F5' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#8B857D' }}>Gratitude</p>
          <p className="text-sm leading-relaxed" style={{ color: '#2D2A26' }}>{debrief.gratitude}</p>
        </div>
      )}
    </div>
  )
}

export default function HomeClient({ initialBriefing, initialDebrief, today }: Props) {
  const router = useRouter()
  const [briefing, setBriefing] = useState(initialBriefing)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')

  // Auto-refresh at midnight so the page resets to the new day
  useEffect(() => {
    const now = new Date()
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime()
    const timer = setTimeout(() => router.refresh(), msUntilMidnight + 1000)
    return () => clearTimeout(timer)
  }, [])

  async function handleGenerateBriefing() {
    setGenerating(true)
    setGenError('')
    try {
      const res = await fetch('/api/generate-briefing', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setBriefing(data.briefing)
    } catch (err: unknown) {
      setGenError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: '100vh' }}>
      <div className="max-w-lg mx-auto px-4 pt-8 pb-24">

        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <p className="text-sm mb-1" style={{ color: '#8B857D' }}>{formatDate(today)}</p>
          <h1 className="text-3xl" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2A26' }}>
            Good morning, Zander
          </h1>
        </div>

        {/* Briefing Section */}
        <div className="mb-5">
          {generating ? (
            <BriefingSkeleton />
          ) : briefing ? (
            <BriefingCard
              content={briefing.content}
              date={briefing.date}
              generatedAt={briefing.generated_at}
            />
          ) : (
            <div className="card p-8 text-center animate-fade-in" style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 1px 3px rgba(45,42,38,0.06)',
              border: '1px solid #E8E4DF'
            }}>
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: '#FAF8F5' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C8B6F" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                </svg>
              </div>
              <h2 className="text-lg mb-2" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2A26' }}>
                No briefing yet today
              </h2>
              <p className="text-sm mb-5" style={{ color: '#8B857D' }}>
                Your briefing is generated automatically at 6 AM. Generate one now?
              </p>
              {genError && (
                <p className="text-sm mb-4 rounded-lg px-3 py-2" style={{ backgroundColor: '#FEF0E8', color: '#C4956A' }}>
                  {genError}
                </p>
              )}
              <button
                onClick={handleGenerateBriefing}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-opacity"
                style={{ backgroundColor: '#7C8B6F', color: '#FFFFFF' }}>
                Generate Briefing
              </button>
            </div>
          )}

          {briefing && !generating && (
            <div className="text-center mt-3">
              <button
                onClick={handleGenerateBriefing}
                className="text-xs"
                style={{ color: '#8B857D' }}>
                Regenerate
              </button>
            </div>
          )}
        </div>

        {/* Debrief Section */}
        {initialDebrief ? (
          <DebriefSummary debrief={initialDebrief} />
        ) : (
          <div className="animate-fade-in-3" style={{
            borderRadius: '16px',
            border: '1.5px dashed #E8E4DF',
            padding: '28px 24px',
            textAlign: 'center'
          }}>
            <p className="text-sm mb-1 font-medium" style={{ color: '#2D2A26' }}>Evening check-in</p>
            <p className="text-sm mb-4" style={{ color: '#8B857D' }}>How's your day going? Take a moment to reflect.</p>
            <Link href="/debrief"
              className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: '#FAF8F5', color: '#7C8B6F', border: '1.5px solid #7C8B6F' }}>
              Start Debrief
            </Link>
          </div>
        )}
      </div>

      <Nav />
    </div>
  )
}
