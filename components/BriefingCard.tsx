'use client'

import { BriefingContent } from '@/lib/types'

interface Props {
  content: BriefingContent
  date: string
  generatedAt: string
}

interface SectionProps {
  title: string
  children: React.ReactNode
  accent?: string
  last?: boolean
}

function Section({ title, children, accent, last }: SectionProps) {
  return (
    <div className="py-4" style={{ borderBottom: last ? 'none' : '1px solid #E8E4DF' }}>
      <div className="flex items-center gap-2 mb-3">
        {accent && (
          <div style={{
            width: '3px',
            height: '13px',
            borderRadius: '2px',
            backgroundColor: accent,
            flexShrink: 0,
          }} />
        )}
        <h3
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: '#8B857D', fontFamily: 'var(--font-jakarta)' }}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

export default function BriefingCard({ content, date, generatedAt }: Props) {
  const genTime = new Date(generatedAt).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true
  })

  return (
    <div className="card animate-fade-in" style={{
      background: '#FFFFFF',
      borderRadius: '16px',
      boxShadow: '0 1px 3px rgba(45,42,38,0.06), 0 4px 12px rgba(45,42,38,0.04)',
      border: '1px solid #E8E4DF',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: '1px solid #E8E4DF' }}>
        <h2 className="text-xl" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2A26' }}>
          Morning Briefing
        </h2>
        <span className="text-xs" style={{ color: '#8B857D' }}>Generated {genTime}</span>
      </div>

      <div className="px-5">
        {/* Markets — sage green accent */}
        <Section title="Markets" accent="#7C8B6F">
          <p className="text-base leading-relaxed mb-2.5" style={{ color: '#2D2A26' }}>{content.markets.summary}</p>
          <ul className="space-y-1.5">
            {content.markets.bullets.map((b, i) => (
              <li key={i} className="text-sm flex gap-2.5" style={{ color: '#4A5E3F' }}>
                <span style={{ color: '#7C8B6F', fontWeight: 700, flexShrink: 0 }}>↑</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Tech & AI — warm amber accent */}
        <Section title="Tech & AI" accent="#B8956A">
          <p className="text-base leading-relaxed mb-2.5" style={{ color: '#2D2A26' }}>{content.tech_ai.summary}</p>
          <ul className="space-y-1.5">
            {content.tech_ai.bullets.map((b, i) => (
              <li key={i} className="text-sm flex gap-2.5" style={{ color: '#4A5E3F' }}>
                <span style={{ color: '#B8956A', fontWeight: 700, flexShrink: 0 }}>›</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* News — terracotta inset block */}
        <Section title="News">
          <div className="rounded-lg px-4 py-3" style={{ backgroundColor: '#FAF8F5', borderLeft: '3px solid #C4956A' }}>
            <p className="text-base font-semibold mb-1.5" style={{ color: '#2D2A26' }}>{content.news.headline}</p>
            <p className="text-sm leading-relaxed" style={{ color: '#5B6B4F' }}>{content.news.summary}</p>
          </div>
        </Section>

        {/* Fun Fact + Joke — side-by-side tinted cards */}
        <div className="py-4" style={{ borderBottom: '1px solid #E8E4DF' }}>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3.5" style={{ backgroundColor: '#F0F2EE' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7C8B6F' }}>✦ Fact</p>
              <p className="text-sm leading-relaxed" style={{ color: '#2D2A26' }}>{content.fun_fact}</p>
            </div>
            <div className="rounded-xl p-3.5" style={{ backgroundColor: '#FAF0E8' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#B8956A' }}>ha Joke</p>
              <p className="text-sm leading-relaxed" style={{ color: '#2D2A26' }}>{content.joke}</p>
            </div>
          </div>
        </div>

        {/* Stoic Quote — decorative treatment */}
        <div className="py-5" style={{ borderBottom: '1px solid #E8E4DF', position: 'relative' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#8B857D' }}>Stoic Thought</p>
          <div style={{ position: 'relative', paddingLeft: '20px' }}>
            <span style={{
              position: 'absolute',
              left: '-6px',
              top: '-22px',
              fontFamily: 'var(--font-fraunces)',
              fontSize: '88px',
              lineHeight: 1,
              color: '#7C8B6F',
              opacity: 0.18,
              userSelect: 'none',
              pointerEvents: 'none',
            }}>&ldquo;</span>
            <blockquote
              className="text-base italic leading-relaxed mb-3"
              style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2A26' }}
            >
              {content.stoic.quote}
            </blockquote>
            <p className="text-xs font-semibold mb-2.5" style={{ color: '#7C8B6F', letterSpacing: '0.04em' }}>
              — {content.stoic.author}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#5B6B4F' }}>{content.stoic.tie_in}</p>
          </div>
        </div>

        {/* Reach Out */}
        <div className="py-4">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#8B857D' }}>Reach Out Today</p>
          <div className="flex items-start gap-3 rounded-xl p-4" style={{ backgroundColor: '#F5EAD8', border: '1px solid rgba(196,149,106,0.2)' }}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold"
              style={{ backgroundColor: '#C4956A', fontFamily: 'var(--font-fraunces)' }}
            >
              {content.reach_out.person[0]}
            </div>
            <div>
              <p className="text-base font-semibold mb-0.5" style={{ color: '#2D2A26' }}>{content.reach_out.person}</p>
              <p className="text-sm" style={{ color: '#5B6B4F' }}>{content.reach_out.reason}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
