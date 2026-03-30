'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Today', icon: SunIcon },
  { href: '/debrief', label: 'Debrief', icon: MoonIcon },
  { href: '/history', label: 'History', icon: CalIcon },
]

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}
function CalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:relative md:bottom-auto"
      style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E8E4DF' }}>
      <div className="max-w-lg mx-auto px-4 flex items-center justify-between" style={{ height: '64px' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors"
              style={{ color: active ? '#7C8B6F' : '#8B857D' }}>
              <Icon />
              <span className="text-xs font-medium" style={{ fontFamily: 'var(--font-jakarta)' }}>{label}</span>
            </Link>
          )
        })}
        <button onClick={handleSignOut}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors"
          style={{ color: '#8B857D' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span className="text-xs font-medium">Out</span>
        </button>
      </div>
    </nav>
  )
}
