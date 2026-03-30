import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HistoryClient from './HistoryClient'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: briefingDates } = await supabase
    .from('briefings')
    .select('date')
    .order('date', { ascending: false })

  const { data: debriefDates } = await supabase
    .from('debriefs')
    .select('date')
    .order('date', { ascending: false })

  return (
    <HistoryClient
      briefingDates={(briefingDates || []).map(b => b.date)}
      debriefDates={(debriefDates || []).map(d => d.date)}
    />
  )
}
