'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  sampleId: string
  currentUserId: string | null
  initialLiked: boolean
  initialCount: number
}

export default function LikeButton({ sampleId, currentUserId, initialLiked, initialCount }: Props) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleToggle = async () => {
    if (!currentUserId) return
    setLoading(true)
    if (liked) {
      await supabase
        .from('likes')
        .delete()
        .eq('user_id', currentUserId)
        .eq('sample_id', sampleId)
      setLiked(false)
      setCount(c => c - 1)
    } else {
      await supabase
        .from('likes')
        .insert({ user_id: currentUserId, sample_id: sampleId })
      setLiked(true)
      setCount(c => c + 1)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading || !currentUserId}
      className={`flex items-center gap-1.5 text-sm transition-colors ${
        liked
          ? 'text-rose-400'
          : 'text-slate-500 hover:text-rose-400'
      } disabled:opacity-40`}
      title={currentUserId ? (liked ? 'Unlike' : 'Like') : 'Log in to like'}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      <span>{count > 0 ? count : ''}</span>
    </button>
  )
}