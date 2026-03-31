export interface BriefingContent {
  markets: {
    summary: string
    bullets: string[]
  }
  tech_ai: {
    summary: string
    bullets: string[]
  }
  news: {
    headline: string
    summary: string
  }
  fun_fact: string
  joke: string
  stoic: {
    quote: string
    author: string
    tie_in: string
  }
  reach_out: {
    person: string
    reason: string
  }
}

export interface Briefing {
  id: string
  user_id: string
  date: string
  content: BriefingContent
  html_content: string | null
  generated_at: string
  created_at: string
}

export interface Debrief {
  id: string
  user_id: string
  date: string
  mood: number | null
  energy: number | null
  stress: number | null
  gassiness: number | null
  work_score: number | null
  social_score: number | null
  bristol_stool: number | null
  exercise_type: string | null
  exercise_duration: number | null
  water_glasses: number
  medications: string[]
  supplements: string[]
  gratitude: string | null
  tomorrow_intentions: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ReachOutLog {
  id: string
  date: string
  person: string
  created_at: string
}

export const REACH_OUT_PEOPLE = [
  'Linds', 'Thad', 'Quinn', 'Abi', 'Mia', 'Tyler', 'Jay', 'Kelly',
  'Gray', 'Joc', 'Caleb', 'Lobey', 'Essie', 'CJ', 'Will', 'Lma', 'Bobby'
]

export const DEFAULT_SUPPLEMENTS = [
  'Vitamin D', 'Magnesium', 'Probiotics', 'Fish Oil', 'Multivitamin'
]

export const EXERCISE_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'run', label: 'Run' },
  { value: 'lift', label: 'Lift' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'walk', label: 'Walk' },
  { value: 'bike', label: 'Bike' },
  { value: 'swim', label: 'Swim' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'other', label: 'Other' },
]
