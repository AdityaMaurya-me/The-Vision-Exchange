'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Status = 'owned' | 'dreaming' | 'shot_with' | null

type Props = {
  gearId: string
  currentUserId: string | null
  initialStatus: Status
}

const OPTIONS: { value: Status; label: string; emoji: string; color: string }[] = [
  { value: 'owned',     label: 'I Own This',    emoji: '✓', color: 'bg-teal-600 border-teal-500 text-white' },
  { value: 'dreaming',  label: 'Dreaming Of It', emoji: '★', color: 'bg-amber-600 border-amber-500 text-white' },
  { value: 'shot_with', label: 'Shot With This', emoji: '◉', color: 'bg-violet-600 border-violet-500 text-white' },
]

const INACTIVE = 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'

export default function GearStatus({ gearId, currentUserId, initialStatus }: Props) {
  const [status, setStatus] = useState<Status>(initialStatus)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  if (!currentUserId) {
    return (
      <p className="text-slate-600 text-xs">
        Log in to track this gear
      </p>
    )
  }

  const handleSelect = async (value: Status) => {
    setLoading(true)
    if (status === value) {
      await supabase
        .from('gear_status')
        .delete()
        .eq('user_id', currentUserId)
        .eq('gear_id', gearId)
      setStatus(null)
    } else {
      await supabase
        .from('gear_status')
        .upsert({
          user_id: currentUserId,
          gear_id: gearId,
          status: value,
        }, { onConflict: 'user_id,gear_id' })
      setStatus(value)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-2">
      <p className="text-slate-500 text-xs uppercase tracking-widest">
        Your relationship with this gear
      </p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            disabled={loading}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              status === opt.value ? opt.color : INACTIVE
            }`}
          >
            {opt.emoji} {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}