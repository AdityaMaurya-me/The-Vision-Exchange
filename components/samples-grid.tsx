'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

type Sample = {
  id: string
  image_url: string
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

    const { error } = await supabase
      .from('samples')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Failed to delete sample.')
      setDeletingId(null)
      return
    }

    // Remove from UI instantly
    setItems((prev) => prev.filter((s) => s.id !== id))
    setDeletingId(null)
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((sample) => (
        <Card
          key={sample.id}
          className="bg-slate-900 border-slate-800 overflow-hidden group relative"
        >
          {/* Delete Button — appears on hover like Pinterest */}
          <button
            onClick={() => handleDelete(sample.id)}
            disabled={deletingId === sample.id}
            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center disabled:opacity-50"
            title="Delete sample"
          >
            {deletingId === sample.id ? (
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              '✕'
            )}
          </button>

          <img
            src={sample.image_url}
            alt="Sample photo"
            className="w-full h-48 object-cover"
          />
          <CardContent className="pt-4">
            <p className="font-medium text-slate-100">
              {sample.gear?.brand} {sample.gear?.model}
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {sample.settings_aperture && (
                <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
                  f/{sample.settings_aperture}
                </Badge>
              )}
              {sample.settings_shutter && (
                <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
                  {sample.settings_shutter}s
                </Badge>
              )}
              {sample.settings_iso && (
                <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
                  ISO {sample.settings_iso}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}