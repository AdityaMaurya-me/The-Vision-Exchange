'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

type Props = {
  targetUserId: string
  currentUserId: string | null
  initialFollowing: boolean
}

export default function FollowButton({ targetUserId, currentUserId, initialFollowing }: Props) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  if (!currentUserId || currentUserId === targetUserId) return null

  const handleToggle = async () => {
    setLoading(true)
    if (following) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
      setFollowing(false)
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: targetUserId })
      setFollowing(true)
    }
    setLoading(false)
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={loading}
      size="sm"
      variant={following ? 'outline' : 'default'}
      className={following
        ? 'border-slate-600 text-slate-300 hover:border-red-500 hover:text-red-400'
        : 'bg-violet-600 hover:bg-violet-700 text-white'
      }
    >
      {loading ? '...' : following ? 'Following' : 'Follow'}
    </Button>
  )
}