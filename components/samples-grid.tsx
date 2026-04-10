'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

type Sample = {
  id: string
  image_url: string
  caption?: string | null
  settings_aperture: string | null
  settings_shutter: string | null
  settings_iso: string | null
  gear: {
    brand: string
    model: string
    type: string
  } | null
}

export default function SamplesGrid({ samples }: { samples: Sample[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [items, setItems] = useState(samples)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this sample? This cannot be undone.')) return
    setDeletingId(id)
    const { error } = await supabase.from('samples').delete().eq('id', id)
    if (error) { alert('Failed to delete.'); setDeletingId(null); return }
    setItems(prev => prev.filter(s => s.id !== id))
    setDeletingId(null)
    router.refresh()
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
      {items.map((sample) => (
        <div
          key={sample.id}
          className="break-inside-avoid bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group relative"
        >
          {/* Delete button */}
          <button
            onClick={() => handleDelete(sample.id)}
            disabled={deletingId === sample.id}
            className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            {deletingId === sample.id ? (
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : '✕'}
          </button>

          <img
            src={sample.image_url}
            alt="Sample photo"
            className="w-full object-cover"
          />

          <div className="p-4">
            {sample.caption && (
              <p className="text-slate-300 text-sm italic mb-3 leading-relaxed">
                "{sample.caption}"
              </p>
            )}
            <p className="text-slate-400 text-xs font-medium mb-2">
              {sample.gear?.brand} {sample.gear?.model}
            </p>
            <div className="flex gap-2 flex-wrap">
              {sample.settings_aperture && (
                <Badge variant="outline" className="border-slate-700 text-slate-500 text-xs">
                  f/{sample.settings_aperture}
                </Badge>
              )}
              {sample.settings_shutter && (
                <Badge variant="outline" className="border-slate-700 text-slate-500 text-xs">
                  {sample.settings_shutter}s
                </Badge>
              )}
              {sample.settings_iso && (
                <Badge variant="outline" className="border-slate-700 text-slate-500 text-xs">
                  ISO {sample.settings_iso}
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}