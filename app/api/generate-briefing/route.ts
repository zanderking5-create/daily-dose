import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { REACH_OUT_PEOPLE } from '@/lib/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  // Auth: either authenticated user session or cron secret
  const cronSecret = req.headers.get('x-cron-secret')
  let useServiceRole = false

  if (cronSecret) {
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    useServiceRole = true
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const db = useServiceRole ? createServiceClient() : await createClient()
  const today = new Date().toISOString().split('T')[0]

  // Check for existing briefing
  const { data: existing } = await db
    .from('briefings')
    .select('id')
    .eq('date', today)
    .single()

  // Pick reach-out person (avoid recent repeats)
  const { data: recentReachOuts } = await db
    .from('reach_out_log')
    .select('person')
    .order('created_at', { ascending: false })
    .limit(5)

  const recentPeople = new Set((recentReachOuts || []).map((r: { person: string }) => r.person))
  const available = REACH_OUT_PEOPLE.filter(p => !recentPeople.has(p))
  const reachOutPerson = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : REACH_OUT_PEOPLE[Math.floor(Math.random() * REACH_OUT_PEOPLE.length)]

  const prompt = `Today is ${today}. You are generating a personalized morning briefing for Zander — a VC professional based in Maryland who values conciseness, genuine wit, and practical insight.

Generate a structured morning briefing. Use web search to get FRESH, CURRENT data for today's markets and news. Do not fabricate specific numbers or headlines — search for them.

The briefing MUST include:
1. **Markets**: A 1-2 sentence summary of today's market conditions (major indices, notable moves). Include 2-3 specific bullet points.
2. **Tech & AI**: What's happening in tech and AI today — notable releases, funding rounds, industry moves. 1-2 sentence summary + 2-3 bullets.
3. **News**: One significant world news headline + 2-3 sentence summary.
4. **Fun Fact**: One genuinely interesting, surprising, or counterintuitive fact. Not generic trivia — aim for "huh, I never knew that."
5. **Joke**: A good joke. Rotate across diverse styles: wordplay, absurdist, observational, dark humor, science, history, pop culture references. DO NOT default to VC/finance/tech. The bar is genuine surprise and wit — if it would make a dad groan, try again.
6. **Stoic Quote**: A quote from Stoic philosophy. Draw from a broad range of thinkers (Marcus Aurelius, Epictetus, Seneca, Musonius Rufus, Chrysippus, Zeno, Cleanthes). Avoid the most overused quotes. Include author and a 1-2 sentence fresh connection to something current.
7. **Reach Out**: Today's reach-out person is **${reachOutPerson}**. Give a specific, genuine reason to reach out to them (not generic like "check in" — make it personal, curious, or specific).

Return ONLY valid JSON in this exact format, no markdown, no code blocks:
{
  "markets": { "summary": "...", "bullets": ["...", "...", "..."] },
  "tech_ai": { "summary": "...", "bullets": ["...", "...", "..."] },
  "news": { "headline": "...", "summary": "..." },
  "fun_fact": "...",
  "joke": "...",
  "stoic": { "quote": "...", "author": "...", "tie_in": "..." },
  "reach_out": { "person": "${reachOutPerson}", "reason": "..." }
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      tools: [{ type: 'web_search_20250305' as const, name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }],
    })

    // Extract text content from response
    let rawContent = ''
    for (const block of message.content) {
      if (block.type === 'text') {
        rawContent += block.text
      }
    }

    // Strip web search citation tags before parsing
    rawContent = rawContent.replace(/<cite[^>]*>|<\/cite>/g, '')

    // Parse JSON from response
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response')
    }

    const content = JSON.parse(jsonMatch[0])

    // Validate required fields
    if (!content.markets || !content.tech_ai || !content.news || !content.stoic || !content.reach_out) {
      throw new Error('Incomplete briefing content')
    }

    // Save to database
    let briefing
    if (existing) {
      const { data } = await db
        .from('briefings')
        .update({ content, generated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      briefing = data
    } else {
      const { data } = await db
        .from('briefings')
        .insert({ date: today, content })
        .select()
        .single()
      briefing = data
    }

    // Log reach-out
    await db.from('reach_out_log').insert({ date: today, person: reachOutPerson })

    return NextResponse.json({ briefing, success: true })
  } catch (err: unknown) {
    console.error('Briefing generation error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
