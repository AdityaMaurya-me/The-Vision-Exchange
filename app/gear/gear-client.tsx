'use client'

import { useState, useMemo } from 'react'
import GearCard from '@/components/gear-card'
import TagFilter from '@/components/tag-filter'
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

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

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
          Browse {initialGear.length} pieces of gear mapped to creative use cases.
        </p>
      </div>

      {/* Vibe Matcher */}
      <div className="mb-10">
        <VibeMatcher onVibeSelect={handleVibeSelect} />
      </div>

      {/* Filters */}
      <div id="gear-grid" className="mb-6 space-y-4">
        {/* Type Filter */}
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">Type:</span>
          {(['all', 'body', 'lens'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all capitalize ${
                typeFilter === type
                  ? 'bg-violet-600 border-violet-500 text-white'
                  : 'bg-transparent border-slate-700 text-slate-400 hover:border-violet-500 hover:text-slate-200'
              }`}
            >
              {type === 'all' ? 'All Gear' : type === 'body' ? 'Camera Bodies' : 'Lenses'}
            </button>
          ))}
        </div>

        {/* Tag Filter */}
        <TagFilter
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
          onClearAll={() => setSelectedTags([])}
        />
      </div>

      {/* Results Count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-slate-500 text-sm">
          Showing{' '}
          <span className="text-slate-300 font-medium">{filteredGear.length}</span>{' '}
          of {initialGear.length} items
          {selectedTags.length > 0 && (
            <span className="text-violet-400 ml-1">
              — filtered by {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''}
            </span>
          )}
        </p>
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
          <p className="text-slate-400 text-lg mb-2">No gear matches your filters.</p>
          <p className="text-slate-600 text-sm">Try selecting different tags or clearing your filters.</p>
          <button
            onClick={() => { setSelectedTags([]); setTypeFilter('all') }}
            className="mt-4 text-violet-400 hover:underline text-sm"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}