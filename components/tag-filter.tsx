'use client'

import { Badge } from '@/components/ui/badge'

const ALL_TAGS = [
  'cinematic',
  'low-light',
  'portrait',
  'street',
  'vlogging',
  'film-look',
  'sports',
  'wildlife',
  'travel',
]

type Props = {
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  onClearAll: () => void
}

export default function TagFilter({ selectedTags, onTagToggle, onClearAll }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-slate-400 text-sm mr-1">Filter by vibe:</span>

      {ALL_TAGS.map((tag) => {
        const isSelected = selectedTags.includes(tag)
        return (
          <button
            key={tag}
            onClick={() => onTagToggle(tag)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-all duration-150 capitalize ${
              isSelected
                ? 'bg-violet-600 border-violet-500 text-white'
                : 'bg-transparent border-slate-700 text-slate-400 hover:border-violet-500 hover:text-slate-200'
            }`}
          >
            {tag}
          </button>
        )
      })}

      {selectedTags.length > 0 && (
        <button
          onClick={onClearAll}
          className="ml-2 text-xs text-slate-500 hover:text-red-400 transition-colors underline"
        >
          Clear all
        </button>
      )}
    </div>
  )
}