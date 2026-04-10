import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function FeedPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get list of people this user follows
  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const followingIds = following?.map(f => f.following_id) ?? []

  // Get samples from followed users
  const { data: samples } = followingIds.length > 0
    ? await supabase
        .from('samples')
        .select(`*, users (username, creative_style), gear (brand, model)`)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(50)
    : { data: [] }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-1">Your Feed</h1>
        <p className="text-slate-400 text-sm">
          Latest shots from photographers you follow.
        </p>
      </div>

      {samples && samples.length > 0 ? (
        <div className="space-y-6">
          {samples.map((sample) => (
            <div
              key={sample.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
            >
              {/* User header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                  {sample.users?.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-slate-200 text-sm font-medium">
                    {sample.users?.username}
                  </p>
                  {sample.users?.creative_style && (
                    <p className="text-slate-500 text-xs">
                      {sample.users.creative_style}
                    </p>
                  )}
                </div>
                <span className="ml-auto text-slate-600 text-xs">
                  {new Date(sample.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric'
                  })}
                </span>
              </div>

              {/* Photo */}
              <img
                src={sample.image_url}
                alt="Community sample"
                className="w-full object-cover"
              />

              {/* Details */}
              <div className="px-4 py-4">
                {sample.caption && (
                  <p className="text-slate-300 text-sm italic mb-3">
                    "{sample.caption}"
                  </p>
                )}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-slate-500 text-xs">
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
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl">
          <p className="text-4xl mb-4">👥</p>
          <p className="text-slate-300 font-medium mb-2">Your feed is empty</p>
          <p className="text-slate-500 text-sm mb-6">
            Follow other photographers to see their shots here.
          </p>
          <Button asChild className="bg-violet-600 hover:bg-violet-700">
            <Link href="/gear">Discover Photographers</Link>
          </Button>
        </div>
      )}
    </div>
  )
}