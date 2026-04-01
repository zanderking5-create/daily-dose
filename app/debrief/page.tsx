import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DebriefClient from './DebriefClient'

export const dynamic = 'force-dynamic'

export default async function DebriefPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })

  const { data: existing } = await supabase
    .from('debriefs')
    .select('*')
    .eq('date', today)
    .single()

  // Get previous medications/supplements for autocomplete
  const { data: prevDebriefs } = await supabase
    .from('debriefs')
    .select('medications, supplements')
    .order('created_at', { ascending: false })
    .limit(10)

  const prevMeds = new Set<string>()
  const prevSupps = new Set<string>()
  prevDebriefs?.forEach(d => {
    (d.medications || []).forEach((m: string) => prevMeds.add(m))
    ;(d.supplements || []).forEach((s: string) => prevSupps.add(s))
  })

  return (
    <DebriefClient
      existing={existing}
      today={today}
      prevMedications={Array.from(prevMeds)}
      prevSupplements={Array.from(prevSupps)}
    />
  )
}
