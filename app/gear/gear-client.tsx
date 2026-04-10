'use client'

import { useState, useMemo } from 'react'
import GearCard from '@/components/gear-card'
import VibeMatcher from '@/components/vibe-matcher'

type Gear = {
  id: string
  brand: string
  model: string
  type: string
  price_estimate: number
  creative_tags: string[]
  image_url: string
}

export default function GearClient({ initialGear }: { initialGear: Gear[] }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState<'all' | 'body' | 'lens'>('all')

  const handleVibeSelect = (tags: string[]) => {
    setSelectedTags(tags)
  }

  const filteredGear = useMemo(() => {
    return initialGear.filter((item) => {
      const matchesType = typeFilter === 'all' || item.type === typeFilter
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => item.creative_tags?.includes(tag))
      return matchesType && matchesTags
    })
  }, [initialGear, selectedTags, typeFilter])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-100 mb-2">Gear Gallery</h1>
        <p className="text-slate-400">
          {initialGear.length} pieces of gear mapped to creative use cases.
        </p>
      </div>

      {/* Vibe Matcher — the only filter */}
      <div className="mb-10">
        <VibeMatcher onVibeSelect={handleVibeSelect} />
      </div>

      {/* Type Filter — minimal, just body/lens */}
      <div id="gear-grid" className="flex items-center gap-3 mb-8">
        <span className="text-slate-500 text-sm">Show:</span>
        {(['all', 'body', 'lens'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              typeFilter === type
                ? 'bg-violet-600 border-violet-500 text-white'
                : 'bg-transparent border-slate-700 text-slate-400 hover:border-violet-500 hover:text-slate-200'
            }`}
          >
            {type === 'all' ? 'All' : type === 'body' ? 'Camera Bodies' : 'Lenses'}
          </button>
        ))}

        {/* Active vibe indicator */}
        {selectedTags.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-violet-400 text-sm">
              {filteredGear.length} results for{' '}
              <span className="font-medium">
                {selectedTags.join(', ')}
              </span>
            </span>
            <button
              onClick={() => setSelectedTags([])}
              className="text-slate-500 hover:text-red-400 text-xs underline transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Gear Grid */}
      {filteredGear.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGear.map((item) => (
            <GearCard key={item.id} gear={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-slate-400 text-lg mb-2">No gear matches your vibe.</p>
          <p className="text-slate-600 text-sm">Try a different combination.</p>
          <button
            onClick={() => { setSelectedTags([]); setTypeFilter('all') }}
            className="mt-4 text-violet-400 hover:underline text-sm"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}