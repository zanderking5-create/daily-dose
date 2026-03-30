'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#FAF8F5' }}>

      {/* Logo/Brand */}
      <div className="text-center mb-10 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: '#7C8B6F' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </div>
        <h1 className="text-3xl mb-1" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2A26' }}>
          Daily Dose
        </h1>
        <p className="text-sm" style={{ color: '#8B857D' }}>Your personal morning companion</p>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm animate-fade-in-1">
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E8E4DF',
          boxShadow: '0 4px 20px rgba(45,42,38,0.06)',
          padding: '28px 24px'
        }}>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#2D2A26' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  backgroundColor: '#FAF8F5',
                  border: '1.5px solid #E8E4DF',
                  color: '#2D2A26',
                  fontFamily: 'var(--font-jakarta)',
                }}
                onFocus={e => e.target.style.borderColor = '#7C8B6F'}
                onBlur={e => e.target.style.borderColor = '#E8E4DF'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#2D2A26' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  backgroundColor: '#FAF8F5',
                  border: '1.5px solid #E8E4DF',
                  color: '#2D2A26',
                  fontFamily: 'var(--font-jakarta)',
                }}
                onFocus={e => e.target.style.borderColor = '#7C8B6F'}
                onBlur={e => e.target.style.borderColor = '#E8E4DF'}
              />
            </div>

            {error && (
              <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: '#FEF0E8', color: '#C4956A' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity"
              style={{
                backgroundColor: '#7C8B6F',
                color: '#FFFFFF',
                opacity: loading ? 0.7 : 1,
                fontFamily: 'var(--font-jakarta)',
              }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>

      <p className="mt-8 text-xs text-center" style={{ color: '#8B857D' }}>
        Daily Dose · Private access only
      </p>
    </div>
  )
}
