import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import SamplesGrid from '@/components/samples-grid'

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: samples } = await supabase
    .from('samples')
    .select(`*, gear (brand, model, type)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: followersData } = await supabase
    .from('follows')
    .select('id')
    .eq('following_id', user.id)

  const { data: followingData } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)

  const followerCount = followersData?.length ?? 0
  const followingCount = followingData?.length ?? 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row md:items-start gap-6 mb-10">

        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white shrink-0">
          {profile?.username?.[0]?.toUpperCase() ?? '?'}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                {profile?.username ?? 'Photographer'}
              </h1>
              {profile?.creative_style && (
                <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium bg-violet-600/20 text-violet-300 border border-violet-700">
                  {profile.creative_style}
                </span>
              )}
            </div>
            <Button asChild className="bg-violet-600 hover:bg-violet-700">
              <Link href="/upload">+ Upload Shot</Link>
            </Button>
          </div>

          {/* Stats row */}
          <div className="flex gap-6 mt-4 text-sm">
            <div className="text-center">
              <p className="text-xl font-bold text-slate-100">{samples?.length ?? 0}</p>
              <p className="text-slate-500 text-xs">Shots</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-slate-100">{followerCount}</p>
              <p className="text-slate-500 text-xs">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-slate-100">{followingCount}</p>
              <p className="text-slate-500 text-xs">Following</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-slate-100">
                {new Set(samples?.map(s => s.gear_id)).size ?? 0}
              </p>
              <p className="text-slate-500 text-xs">Gear Used</p>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      {samples && samples.length > 0 ? (
        <SamplesGrid samples={samples} />
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-slate-800 py-20 text-center">
          <p className="text-4xl mb-3">📷</p>
          <p className="text-slate-400 font-medium mb-1">No shots yet</p>
          <p className="text-slate-600 text-sm mb-6">
            Upload your first photo to start your portfolio.
          </p>
          <Button asChild className="bg-violet-600 hover:bg-violet-700">
            <Link href="/upload">Upload Your First Shot</Link>
          </Button>
        </div>
      )}
    </div>
  )
}