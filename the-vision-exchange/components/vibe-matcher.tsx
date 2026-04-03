'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const VIBES = [
  { label: 'Cinematic Films', tag: 'cinematic', emoji: '🎬' },
  { label: 'Low Light & Night', tag: 'low-light', emoji: '🌙' },
  { label: 'Portrait Sessions', tag: 'portrait', emoji: '🎭' },
  { label: 'Street Photography', tag: 'street', emoji: '🏙️' },
  { label: 'Vlogging & Content', tag: 'vlogging', emoji: '📱' },
  { label: 'Film Aesthetic', tag: 'film-look', emoji: '🎞️' },
  { label: 'Sports & Action', tag: 'sports', emoji: '⚡' },
  { label: 'Travel Photography', tag: 'travel', emoji: '✈️' },
]

type Props = {
  onVibeSelect: (tags: string[]) => void
}

export default function VibeMatcher({ onVibeSelect }: Props) {
  const [selected, setSelected] = useState<string[]>([])

  const toggleVibe = (tag: string) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleFind = () => {
    onVibeSelect(selected)
    // Scroll to gear grid
    document.getElementById('gear-grid')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleReset = () => {
    setSelected([])
    onVibeSelect([])
  }

  return (
    <div id="vibe-matcher" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-1">
          🎯 Vibe Matcher
        </h2>
        <p className="text-slate-400 text-sm">
          Select your creative goals and we'll find the best gear for you.
        </p>
      </div>

      {/* Vibe Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {VIBES.map((vibe) => {
          const isSelected = selected.includes(vibe.tag)
          return (
            <button
              key={vibe.tag}
              onClick={() => toggleVibe(vibe.tag)}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border text-center transition-all duration-150 ${
                isSelected
                  ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
              }`}
            >
              <span className="text-2xl">{vibe.emoji}</span>
              <span className="text-xs font-medium leading-tight">{vibe.label}</span>
            </button>
          )
        })}
      </div>

      {/* Selected Tags Preview */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {selected.map((tag) => (
            <Badge key={tag} className="bg-violet-600 text-white capitalize text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleFind}
          disabled={selected.length === 0}
          className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40"
        >
          Find My Gear
        </Button>
        {selected.length > 0 && (
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-slate-700 text-slate-400 hover:bg-slate-800"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  )
}
