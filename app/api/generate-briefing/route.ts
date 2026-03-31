import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { REACH_OUT_PEOPLE } from '@/lib/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Curated stoic quotes — diverse authors, avoiding the overused ones
const STOIC_QUOTES = [
  { quote: "He is a wise man who does not grieve for the things which he has not, but rejoices for those which he has.", author: "Epictetus" },
  { quote: "It is not that I'm so smart. But I stay with the questions much longer.", author: "Musonius Rufus" },
  { quote: "Begin at once to live, and count each separate day as a separate life.", author: "Seneca" },
  { quote: "Nothing is enough for the man to whom enough is too little.", author: "Epicurus (via Seneca)" },
  { quote: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
  { quote: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
  { quote: "A gem cannot be polished without friction, nor a man perfected without trials.", author: "Seneca" },
  { quote: "We suffer more often in imagination than in reality.", author: "Seneca" },
  { quote: "Seek not the good in external things; seek it in yourself.", author: "Epictetus" },
  { quote: "He who fears death will never do anything worthy of a living man.", author: "Seneca" },
  { quote: "Make the best use of what is in your power, and take the rest as it happens.", author: "Epictetus" },
  { quote: "It never ceases to amaze me: we all love ourselves more than other people, but care more about their opinion than our own.", author: "Marcus Aurelius" },
  { quote: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" },
  { quote: "Waste no more time arguing what a good man should be. Be one.", author: "Marcus Aurelius" },
  { quote: "If it is not right, do not do it; if it is not true, do not say it.", author: "Marcus Aurelius" },
  { quote: "You have power over your mind, not outside events. Realize this and you will find strength.", author: "Marcus Aurelius" },
  { quote: "Associate with people who are likely to improve you.", author: "Seneca" },
  { quote: "Difficulties strengthen the mind, as labor does the body.", author: "Seneca" },
  { quote: "Retire into yourself as much as possible.", author: "Seneca" },
  { quote: "No man was ever wise by chance.", author: "Seneca" },
  { quote: "Luck is what happens when preparation meets opportunity.", author: "Seneca" },
  { quote: "Man is not worried by real problems so much as by his imagined anxieties about real problems.", author: "Epictetus" },
  { quote: "Freedom is the only worthy goal in life. It is won by disregarding things that lie beyond our control.", author: "Epictetus" },
  { quote: "Do not seek to have events happen as you want them to, but instead want them to happen as they do happen, and your life will go well.", author: "Epictetus" },
  { quote: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus" },
  { quote: "There is only one way to happiness and that is to cease worrying about things which are beyond the power of our will.", author: "Epictetus" },
  { quote: "The object of life is not to be on the side of the majority, but to escape finding oneself in the ranks of the insane.", author: "Marcus Aurelius" },
  { quote: "Never esteem anything as of advantage to you that will make you break your word or lose your self-respect.", author: "Marcus Aurelius" },
  { quote: "The best revenge is to be unlike him who performed the injury.", author: "Marcus Aurelius" },
  { quote: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.", author: "Marcus Aurelius" },
]

async function fetchMarketData(): Promise<string> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  if (!apiKey) return 'Market data unavailable (no API key configured).'

  try {
    const symbols = ['SPY', 'QQQ', 'DIA']
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
        const res = await fetch(url, { next: { revalidate: 0 } })
        const data = await res.json()
        const quote = data['Global Quote']
        if (!quote || !quote['05. price']) return null
        return {
          symbol,
          price: parseFloat(quote['05. price']).toFixed(2),
          change: parseFloat(quote['09. change']).toFixed(2),
          changePct: quote['10. change percent']?.replace('%', '') || '0',
        }
      })
    )

    const valid = results.filter(Boolean)
    if (!valid.length) return 'Market data temporarily unavailable.'

    return valid.map(q =>
      `${q!.symbol}: $${q!.price} (${parseFloat(q!.changePct) >= 0 ? '+' : ''}${parseFloat(q!.changePct).toFixed(2)}%)`
    ).join(', ')
  } catch {
    return 'Market data temporarily unavailable.'
  }
}

async function fetchNewsHeadlines(): Promise<{ general: string[], tech: string[] }> {
  const apiKey = process.env.NEWS_API_KEY
  if (!apiKey) return { general: [], tech: [] }

  try {
    const [generalRes, techRes] = await Promise.all([
      fetch(`https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=${apiKey}`, { next: { revalidate: 0 } }),
      fetch(`https://newsapi.org/v2/top-headlines?category=technology&pageSize=5&apiKey=${apiKey}`, { next: { revalidate: 0 } }),
    ])

    const [generalData, techData] = await Promise.all([generalRes.json(), techRes.json()])

    const general = (generalData.articles || [])
      .filter((a: { title?: string }) => a.title && !a.title.includes('[Removed]'))
      .slice(0, 5)
      .map((a: { title: string; description?: string }) => `- ${a.title}${a.description ? ': ' + a.description : ''}`)

    const tech = (techData.articles || [])
      .filter((a: { title?: string }) => a.title && !a.title.includes('[Removed]'))
      .slice(0, 5)
      .map((a: { title: string; description?: string }) => `- ${a.title}${a.description ? ': ' + a.description : ''}`)

    return { general, tech }
  } catch {
    return { general: [], tech: [] }
  }
}

export async function POST(req: NextRequest) {
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
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })

  const { data: existing } = await db
    .from('briefings')
    .select('id')
    .eq('date', today)
    .single()

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

  // Pick a random stoic quote
  const stoicQuote = STOIC_QUOTES[Math.floor(Math.random() * STOIC_QUOTES.length)]

  // Fetch live data in parallel — free APIs, no Claude search needed
  const [marketData, headlines] = await Promise.all([
    fetchMarketData(),
    fetchNewsHeadlines(),
  ])

  const hasNews = headlines.general.length > 0
  const hasTech = headlines.tech.length > 0

  const prompt = `Today is ${today}. You are generating a morning briefing for Zander — a VC professional in Maryland who values conciseness and genuine wit.

Here is the LIVE DATA fetched for you. Use it directly — do not search for more.

MARKET DATA (live):
${marketData}

TOP NEWS HEADLINES (live):
${hasNews ? headlines.general.join('\n') : 'No headlines available — use your knowledge of recent events.'}

TECH/AI HEADLINES (live):
${hasTech ? headlines.tech.join('\n') : 'No tech headlines available — use your knowledge of recent events.'}

STOIC QUOTE (pre-selected):
"${stoicQuote.quote}" — ${stoicQuote.author}

REACH OUT PERSON TODAY: ${reachOutPerson}
IMPORTANT: ${reachOutPerson} is a personal friend of Zander's, NOT a startup founder or professional contact. Do NOT invent career details, companies, or professional context. Instead write a warm, specific reason to reach out based on friendship — like catching up, sharing something they'd enjoy, a memory, or just checking in with personality.

Your job:
1. Use the market data to write a 1-2 sentence markets summary + 2-3 specific bullet points
2. Use the tech headlines to write a 1-2 sentence tech/AI summary + 2-3 bullets
3. Pick the most interesting general headline and write a 2-3 sentence summary
4. Write one genuinely surprising fun fact (not from the headlines — something counterintuitive or little-known)
5. Write one good joke. Rotate styles: wordplay, absurdist, observational, dark humor, science, history, pop culture. NOT VC/finance/tech. Genuine wit only.
6. Write a 1-2 sentence fresh connection between the stoic quote and something relevant to today
7. Give ${reachOutPerson} a specific, personal reason to reach out — not generic "check in"

Return ONLY valid JSON, no markdown, no code blocks:
{
  "markets": { "summary": "...", "bullets": ["...", "...", "..."] },
  "tech_ai": { "summary": "...", "bullets": ["...", "...", "..."] },
  "news": { "headline": "...", "summary": "..." },
  "fun_fact": "...",
  "joke": "...",
  "stoic": { "quote": "${stoicQuote.quote}", "author": "${stoicQuote.author}", "tie_in": "..." },
  "reach_out": { "person": "${reachOutPerson}", "reason": "..." }
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
    const rawContent = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

    const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No valid JSON found in response')

    const content = JSON.parse(jsonMatch[0])
    if (!content.markets || !content.tech_ai || !content.news || !content.stoic || !content.reach_out) {
      throw new Error('Incomplete briefing content')
    }

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
