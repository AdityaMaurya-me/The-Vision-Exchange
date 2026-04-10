import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import FollowButton from '@/components/follow-button'
import Link from 'next/link'

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: samples } = await supabase
    .from('samples')
    .select(`*, gear (brand, model)`)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  const { data: followersData } = await supabase
    .from('follows')
    .select('id')
    .eq('following_id', profile.id)

  const { data: followingData } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', profile.id)

  // Check if current user follows this profile
  let isFollowing = false
  if (currentUser) {
    const { data: followCheck } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', profile.id)
      .single()
    isFollowing = !!followCheck
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row md:items-start gap-6 mb-10">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white shrink-0">
          {profile.username?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                {profile.username}
              </h1>
              {profile.creative_style && (
                <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium bg-violet-600/20 text-violet-300 border border-violet-700">
                  {profile.creative_style}
                </span>
              )}
            </div>
            <FollowButton
              targetUserId={profile.id}
              currentUserId={currentUser?.id ?? null}
              initialFollowing={isFollowing}
            />
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-4 text-sm">
            <div className="text-center">
              <p className="text-xl font-bold text-slate-100">{samples?.length ?? 0}</p>
              <p className="text-slate-500 text-xs">Shots</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-slate-100">{followersData?.length ?? 0}</p>
              <p className="text-slate-500 text-xs">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-slate-100">{followingData?.length ?? 0}</p>
              <p className="text-slate-500 text-xs">Following</p>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      {samples && samples.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {samples.map((sample) => (
            <div
              key={sample.id}
              className="break-inside-avoid bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
            >
              <img
                src={sample.image_url}
                alt="Sample"
                className="w-full object-cover"
              />
              <div className="p-3">
                {sample.caption && (
                  <p className="text-slate-400 text-xs italic mb-2">"{sample.caption}"</p>
                )}
                <p className="text-slate-500 text-xs">
                  {sample.gear?.brand} {sample.gear?.model}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl">
          <p className="text-4xl mb-3">📷</p>
          <p className="text-slate-500">No shots uploaded yet.</p>
        </div>
      )}
    </div>
  )
}