import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HomeClient from './HomeClient'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const today = new Date().toISOString().split('T')[0]

  const { data: briefing } = await supabase
    .from('briefings')
    .select('*')
    .eq('date', today)
    .single()

  const { data: debrief } = await supabase
    .from('debriefs')
    .select('*')
    .eq('date', today)
    .single()

  return <HomeClient initialBriefing={briefing} initialDebrief={debrief} today={today} />
}
