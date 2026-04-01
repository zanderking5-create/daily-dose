'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import { createClient } from '@/lib/supabase/client'
import { Debrief, DEFAULT_SUPPLEMENTS, EXERCISE_TYPES } from '@/lib/types'

interface Props {
  existing: Debrief | null
  today: string
  prevMedications: string[]
  prevSupplements: string[]
}

const SLIDER_LABELS: Record<string, string[]> = {
  mood:         ['Terrible', 'Bad', 'Low', 'Meh', 'Okay', 'Fine', 'Good', 'Great', 'Excellent', 'Amazing'],
  energy:       ['Drained', 'Exhausted', 'Low', 'Sluggish', 'Okay', 'Decent', 'Good', 'Energized', 'Pumped', 'On Fire'],
  stress:       ['Zen', 'Relaxed', 'Calm', 'Easy', 'Mild', 'Moderate', 'Tense', 'Stressed', 'Overwhelmed', 'Maxed Out'],
  gassiness:    ['None', 'Barely', 'Slight', 'Noticeable', 'Moderate', 'Active', 'Frequent', 'Lots', 'Very Gassy', 'Legendary'],
  work_score:   ['Awful', 'Rough', 'Hard', 'Tough', 'Okay', 'Decent', 'Good', 'Solid', 'Great', 'Best Day'],
  social_score: ['Isolated', 'Quiet', 'Low-key', 'Minimal', 'Okay', 'Connected', 'Social', 'Engaged', 'Vibrant', 'On Fire'],
}

function SliderField({
  label, value, onChange, min = 1, max = 10, lowLabel, highLabel, color = '#C4956A', labelKey
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  lowLabel?: string
  highLabel?: string
  color?: string
  labelKey?: string
}) {
  const descriptor = labelKey && SLIDER_LABELS[labelKey] ? SLIDER_LABELS[labelKey][value - 1] : null
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold" style={{ color: '#2D2A26' }}>{label}</label>
        <div className="flex items-center gap-2">
          {descriptor && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#FAF8F5', color: '#8B857D', border: '1px solid #E8E4DF' }}>
              {descriptor}
            </span>
          )}
          <span className="text-lg font-semibold" style={{ fontFamily: 'var(--font-fraunces)', color }}>
            {value}
          </span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <div className="flex justify-between mt-1">
          {lowLabel && <span className="text-xs" style={{ color: '#8B857D' }}>{lowLabel}</span>}
          {highLabel && <span className="text-xs" style={{ color: '#8B857D' }}>{highLabel}</span>}
        </div>
      </div>
    </div>
  )
}

const BRISTOL_DATA = [
  { type: 1, label: 'Type 1', desc: 'Separate hard lumps', emoji: '⚫' },
  { type: 2, label: 'Type 2', desc: 'Lumpy sausage', emoji: '🟤' },
  { type: 3, label: 'Type 3', desc: 'Cracked sausage', emoji: '🟫' },
  { type: 4, label: 'Type 4', desc: 'Smooth sausage', emoji: '✅' },
  { type: 5, label: 'Type 5', desc: 'Soft blobs', emoji: '🔶' },
  { type: 6, label: 'Type 6', desc: 'Fluffy pieces', emoji: '🟠' },
  { type: 7, label: 'Type 7', desc: 'Watery liquid', emoji: '🔴' },
]

function BristolPicker({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-3" style={{ color: '#2D2A26' }}>
        Bristol Stool Scale
      </label>
      <div className="grid grid-cols-7 gap-1">
        {BRISTOL_DATA.map(b => (
          <button
            key={b.type}
            type="button"
            onClick={() => onChange(b.type)}
            className="flex flex-col items-center p-2 rounded-xl transition-all"
            style={{
              backgroundColor: value === b.type ? '#7C8B6F' : '#FAF8F5',
              border: `1.5px solid ${value === b.type ? '#7C8B6F' : '#E8E4DF'}`,
            }}
            title={`${b.label}: ${b.desc}`}>
            <span className="text-lg">{b.emoji}</span>
            <span className="text-xs font-semibold mt-0.5"
              style={{ color: value === b.type ? '#FFFFFF' : '#8B857D' }}>
              {b.type}
            </span>
          </button>
        ))}
      </div>
      {value && (
        <p className="text-xs mt-2 text-center" style={{ color: '#8B857D' }}>
          {BRISTOL_DATA[value - 1].label}: {BRISTOL_DATA[value - 1].desc}
        </p>
      )}
    </div>
  )
}

function WaterCounter({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-semibold" style={{ color: '#2D2A26' }}>Water Intake</label>
        <span className="text-sm" style={{ color: '#8B857D' }}>{value} {value === 1 ? 'glass' : 'glasses'}</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {Array.from({ length: Math.max(8, value + 2) }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n === value ? 0 : n)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all"
            style={{
              backgroundColor: n <= value ? '#7C8B6F' : '#FAF8F5',
              border: `1.5px solid ${n <= value ? '#7C8B6F' : '#E8E4DF'}`,
              color: n <= value ? '#FFFFFF' : '#8B857D',
            }}>
            {n <= value ? '💧' : n}
          </button>
        ))}
      </div>
    </div>
  )
}

function ChecklistField({
  label, options, selected, onToggle, onAdd
}: {
  label: string
  options: string[]
  selected: string[]
  onToggle: (item: string) => void
  onAdd: (item: string) => void
}) {
  const [newItem, setNewItem] = useState('')
  const allOptions = Array.from(new Set([...options, ...selected]))

  return (
    <div>
      <label className="block text-sm font-semibold mb-3" style={{ color: '#2D2A26' }}>{label}</label>
      <div className="flex flex-wrap gap-2 mb-3">
        {allOptions.map(item => (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(item)}
            className="px-3 py-1.5 rounded-full text-sm transition-all"
            style={{
              backgroundColor: selected.includes(item) ? '#7C8B6F' : '#FAF8F5',
              color: selected.includes(item) ? '#FFFFFF' : '#5B6B4F',
              border: `1.5px solid ${selected.includes(item) ? '#7C8B6F' : '#E8E4DF'}`,
            }}>
            {item}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder={`Add ${label.toLowerCase()}...`}
          className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
          style={{ backgroundColor: '#FAF8F5', border: '1.5px solid #E8E4DF', color: '#2D2A26' }}
          onKeyDown={e => {
            if (e.key === 'Enter' && newItem.trim()) {
              e.preventDefault()
              onAdd(newItem.trim())
              setNewItem('')
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (newItem.trim()) { onAdd(newItem.trim()); setNewItem('') }
          }}
          className="px-3 py-2 rounded-xl text-sm font-medium"
          style={{ backgroundColor: '#FAF8F5', color: '#7C8B6F', border: '1.5px solid #E8E4DF' }}>
          Add
        </button>
      </div>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4" style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      border: '1px solid #E8E4DF',
      boxShadow: '0 1px 3px rgba(45,42,38,0.06)',
      padding: '20px',
    }}>
      <h3 className="text-xs font-semibold uppercase tracking-widest mb-4"
        style={{ color: '#8B857D', fontFamily: 'var(--font-jakarta)' }}>{title}</h3>
      {children}
    </div>
  )
}

export default function DebriefClient({ existing, today, prevMedications, prevSupplements }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [mood, setMood] = useState(existing?.mood ?? 7)
  const [energy, setEnergy] = useState(existing?.energy ?? 7)
  const [stress, setStress] = useState(existing?.stress ?? 4)
  const [gassiness, setGassiness] = useState(existing?.gassiness ?? 3)
  const [workScore, setWorkScore] = useState(existing?.work_score ?? 7)
  const [socialScore, setSocialScore] = useState(existing?.social_score ?? 7)
  const [bristol, setBristol] = useState<number | null>(existing?.bristol_stool ?? null)
  const [exerciseType, setExerciseType] = useState(existing?.exercise_type ?? 'none')
  const [exerciseDuration, setExerciseDuration] = useState(existing?.exercise_duration ?? 0)
  const [water, setWater] = useState(existing?.water_glasses ?? 0)
  const [medications, setMedications] = useState<string[]>(existing?.medications ?? [])
  const [supplements, setSupplements] = useState<string[]>(existing?.supplements ?? [])
  const [gratitude, setGratitude] = useState(existing?.gratitude ?? '')
  const [intentions, setIntentions] = useState(existing?.tomorrow_intentions ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [showNotes, setShowNotes] = useState(!!existing?.notes)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  function handleStartFresh() {
    if (!confirmReset) { setConfirmReset(true); return }
    setMood(7); setEnergy(7); setStress(4); setGassiness(3)
    setWorkScore(7); setSocialScore(7); setBristol(null)
    setExerciseType('none'); setExerciseDuration(0); setWater(0)
    setMedications([]); setSupplements([])
    setGratitude(''); setIntentions(''); setNotes(''); setShowNotes(false)
    setConfirmReset(false)
  }

  const allMedOptions = Array.from(new Set([...prevMedications]))
  const allSuppOptions = Array.from(new Set([...DEFAULT_SUPPLEMENTS, ...prevSupplements]))

  function toggleItem(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item])
  }

  function addItem(list: string[], setList: (v: string[]) => void, item: string) {
    if (!list.includes(item)) setList([...list, item])
    else toggleItem(list, setList, item)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      date: today,
      mood, energy, stress, gassiness,
      work_score: workScore,
      social_score: socialScore,
      bristol_stool: bristol,
      exercise_type: exerciseType,
      exercise_duration: exerciseType === 'none' ? null : exerciseDuration,
      water_glasses: water,
      medications,
      supplements,
      gratitude: gratitude || null,
      tomorrow_intentions: intentions || null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    }

    let err
    if (existing) {
      const result = await supabase
        .from('debriefs')
        .update(payload)
        .eq('id', existing.id)
      err = result.error
    } else {
      const result = await supabase
        .from('debriefs')
        .insert(payload)
      err = result.error
    }

    if (err) {
      setError(err.message)
      setSaving(false)
    } else {
      setSaved(true)
      setSaving(false)
      setTimeout(() => router.push('/'), 1200)
    }
  }

  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: '100vh' }}>
      <div className="max-w-lg mx-auto px-4 pt-8 pb-28">

        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <p className="text-sm mb-1" style={{ color: '#8B857D' }}>
            {new Date(today + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <div className="flex items-end justify-between">
            <h1 className="text-3xl" style={{ fontFamily: 'var(--font-fraunces)', color: '#2D2A26' }}>
              {existing ? 'Edit your debrief' : 'Evening debrief'}
            </h1>
            {existing && (
              <button
                type="button"
                onClick={handleStartFresh}
                className="text-xs font-medium px-3 py-1.5 rounded-lg mb-1 transition-colors"
                style={{
                  backgroundColor: confirmReset ? '#FEF0E8' : '#FAF8F5',
                  color: confirmReset ? '#C4956A' : '#8B857D',
                  border: `1px solid ${confirmReset ? '#C4956A' : '#E8E4DF'}`,
                }}>
                {confirmReset ? 'Tap again to confirm' : 'Start fresh'}
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">

          {/* Wellbeing */}
          <SectionCard title="How are you feeling?">
            <SliderField label="Mood" value={mood} onChange={setMood}
              color="#7C8B6F" labelKey="mood" />
            <SliderField label="Energy" value={energy} onChange={setEnergy}
              color="#C4956A" labelKey="energy" />
            <SliderField label="Stress" value={stress} onChange={setStress}
              color="#A0856D" labelKey="stress" />
            <SliderField label="Gassiness" value={gassiness} onChange={setGassiness}
              color="#8B857D" labelKey="gassiness" />
          </SectionCard>

          {/* Work & Social */}
          <SectionCard title="Work & Social">
            <SliderField label="Work Day" value={workScore} onChange={setWorkScore}
              color="#5B6B4F" labelKey="work_score" />
            <SliderField label="Social" value={socialScore} onChange={setSocialScore}
              color="#7C8B6F" labelKey="social_score" />
          </SectionCard>

          {/* Gut check */}
          <SectionCard title="Gut Check">
            <BristolPicker value={bristol} onChange={setBristol} />
          </SectionCard>

          {/* Exercise */}
          <SectionCard title="Movement">
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2D2A26' }}>Type</label>
              <div className="flex flex-wrap gap-2">
                {EXERCISE_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setExerciseType(value)}
                    className="px-3 py-1.5 rounded-full text-sm transition-all"
                    style={{
                      backgroundColor: exerciseType === value ? '#7C8B6F' : '#FAF8F5',
                      color: exerciseType === value ? '#FFFFFF' : '#5B6B4F',
                      border: `1.5px solid ${exerciseType === value ? '#7C8B6F' : '#E8E4DF'}`,
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {exerciseType !== 'none' && (
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#2D2A26' }}>
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min={0}
                  max={300}
                  value={exerciseDuration || ''}
                  onChange={e => setExerciseDuration(Number(e.target.value))}
                  placeholder="45"
                  className="w-28 px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: '#FAF8F5', border: '1.5px solid #E8E4DF', color: '#2D2A26' }}
                />
              </div>
            )}
          </SectionCard>

          {/* Water */}
          <SectionCard title="Hydration">
            <WaterCounter value={water} onChange={setWater} />
          </SectionCard>

          {/* Meds & Supplements */}
          <SectionCard title="Medications & Supplements">
            <div className="mb-5">
              <ChecklistField
                label="Medications"
                options={allMedOptions}
                selected={medications}
                onToggle={item => toggleItem(medications, setMedications, item)}
                onAdd={item => addItem(medications, setMedications, item)}
              />
            </div>
            <ChecklistField
              label="Supplements"
              options={allSuppOptions}
              selected={supplements}
              onToggle={item => toggleItem(supplements, setSupplements, item)}
              onAdd={item => addItem(supplements, setSupplements, item)}
            />
          </SectionCard>

          {/* Reflection */}
          <SectionCard title="Reflection">
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2D2A26' }}>
                Gratitude
              </label>
              <textarea
                value={gratitude}
                onChange={e => setGratitude(e.target.value)}
                rows={3}
                placeholder="What are you grateful for today?"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={{ backgroundColor: '#FAF8F5', border: '1.5px solid #E8E4DF', color: '#2D2A26', lineHeight: '1.6' }}
                onFocus={e => e.target.style.borderColor = '#7C8B6F'}
                onBlur={e => e.target.style.borderColor = '#E8E4DF'}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2D2A26' }}>
                Tomorrow's intentions
              </label>
              <textarea
                value={intentions}
                onChange={e => setIntentions(e.target.value)}
                rows={3}
                placeholder="What do you want to focus on tomorrow?"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={{ backgroundColor: '#FAF8F5', border: '1.5px solid #E8E4DF', color: '#2D2A26', lineHeight: '1.6' }}
                onFocus={e => e.target.style.borderColor = '#7C8B6F'}
                onBlur={e => e.target.style.borderColor = '#E8E4DF'}
              />
            </div>
          </SectionCard>

          {/* Notes */}
          <div>
            {!showNotes ? (
              <button
                type="button"
                onClick={() => setShowNotes(true)}
                className="text-sm"
                style={{ color: '#8B857D' }}>
                + Add notes
              </button>
            ) : (
              <SectionCard title="Notes">
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Anything else on your mind..."
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{ backgroundColor: '#FAF8F5', border: '1.5px solid #E8E4DF', color: '#2D2A26', lineHeight: '1.6' }}
                />
              </SectionCard>
            )}
          </div>

          {error && (
            <p className="text-sm rounded-xl px-4 py-3" style={{ backgroundColor: '#FEF0E8', color: '#C4956A' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving || saved}
            className="w-full py-4 rounded-2xl text-base font-semibold transition-all"
            style={{
              backgroundColor: saved ? '#7C8B6F' : '#5B6B4F',
              color: '#FFFFFF',
              opacity: saving ? 0.7 : 1,
              fontFamily: 'var(--font-jakarta)',
            }}>
            {saved ? 'Saved! Redirecting...' : saving ? 'Saving...' : existing ? 'Update Debrief' : 'Save Debrief'}
          </button>
        </form>
      </div>

      <Nav />
    </div>
  )
}
