'use client'

import { BriefingContent } from '@/lib/types'

interface Props {
  content: BriefingContent
  date: string
  generatedAt: string
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-4" style={{ borderBottom: '1px solid #E8E4DF' }}>
      <h3 className="text-xs font-semibold uppercase tracking-widest mb-3"
        style={{ color: '#8B857D', fontFamily: 'var(--font-jakarta)' }}>{title}</h3>
      {children}
    </div>
  )
}

export default function BriefingCard({ content, date, generatedAt }: Props) {
  const genTime = new Date(generatedAt).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true
  })

  return (
    <div className="card p-5 animate-fade-in" style={{
      background: '#FFFFFF',
      borderRadius: '16px',
      boxShadow: '0 1px 3px rgba(45,42,38,0.06), 0 4px 12px rgba(45,42,38,0.04)',
      border: '1px solid #E8E4DF'
    }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2A26' }}>
          Morning Briefing
        </h2>
        <span className="text-xs" style={{ color: '#8B857D' }}>Generated {genTime}</span>
      </div>

      {/* Markets */}
      <Section title="Markets">
        <p className="text-sm leading-relaxed mb-2" style={{ color: '#2D2A26' }}>{content.markets.summary}</p>
        <ul className="space-y-1">
          {content.markets.bullets.map((b, i) => (
            <li key={i} className="text-sm flex gap-2" style={{ color: '#5B6B4F' }}>
              <span style={{ color: '#C4956A' }}>•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Tech & AI */}
      <Section title="Tech & AI">
        <p className="text-sm leading-relaxed mb-2" style={{ color: '#2D2A26' }}>{content.tech_ai.summary}</p>
        <ul className="space-y-1">
          {content.tech_ai.bullets.map((b, i) => (
            <li key={i} className="text-sm flex gap-2" style={{ color: '#5B6B4F' }}>
              <span style={{ color: '#C4956A' }}>•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* News */}
      <Section title="News">
        <p className="text-sm font-semibold mb-1" style={{ color: '#2D2A26' }}>{content.news.headline}</p>
        <p className="text-sm leading-relaxed" style={{ color: '#5B6B4F' }}>{content.news.summary}</p>
      </Section>

      {/* Two columns: Fun Fact + Joke */}
      <div className="grid grid-cols-1 gap-3 py-4" style={{ borderBottom: '1px solid #E8E4DF' }}>
        <div className="rounded-xl p-4" style={{ backgroundColor: '#FAF8F5' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#8B857D' }}>Fun Fact</p>
          <p className="text-sm leading-relaxed" style={{ color: '#2D2A26' }}>{content.fun_fact}</p>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: '#FAF8F5' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#8B857D' }}>Today's Joke</p>
          <p className="text-sm leading-relaxed" style={{ color: '#2D2A26' }}>{content.joke}</p>
        </div>
      </div>

      {/* Stoic Quote */}
      <div className="py-4" style={{ borderBottom: '1px solid #E8E4DF' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#8B857D' }}>Stoic Thought</p>
        <blockquote className="text-base italic leading-relaxed mb-2"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2A26' }}>
          "{content.stoic.quote}"
        </blockquote>
        <p className="text-xs font-semibold mb-2" style={{ color: '#7C8B6F' }}>— {content.stoic.author}</p>
        <p className="text-sm leading-relaxed" style={{ color: '#5B6B4F' }}>{content.stoic.tie_in}</p>
      </div>

      {/* Reach Out */}
      <div className="pt-4">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#8B857D' }}>Reach Out Today</p>
        <div className="flex items-start gap-3 rounded-xl p-4" style={{ backgroundColor: '#F0DCC8' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#C4956A' }}>
            <span className="text-white text-sm font-semibold">
              {content.reach_out.person[0]}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#2D2A26' }}>{content.reach_out.person}</p>
            <p className="text-sm" style={{ color: '#5B6B4F' }}>{content.reach_out.reason}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
