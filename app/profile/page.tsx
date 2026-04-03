import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">

      {/* Profile Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
            {profile?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">
              {profile?.username ?? 'Photographer'}
            </h1>
            <p className="text-slate-400">{profile?.creative_profile ?? 'Member'}</p>
          </div>
        </div>
        <p className="text-slate-500 text-sm">
          Member since{' '}
          {profile?.created_at
            ? new Date(profile.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })
            : 'recently'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-violet-400">{samples?.length ?? 0}</p>
            <p className="text-slate-400 text-sm mt-1">Samples Shared</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-cyan-400">
              {new Set(samples?.map((s) => s.gear_id)).size ?? 0}
            </p>
            <p className="text-slate-400 text-sm mt-1">Gear Used</p>
          </CardContent>
        </Card>
      </div>

      {/* Samples Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-100">Your Submitted Samples</h2>
        <Button asChild className="bg-violet-600 hover:bg-violet-700">
          <Link href="/upload">+ Upload Sample</Link>
        </Button>
      </div>

      {/* Samples Grid */}
      {samples && samples.length > 0 ? (
        <SamplesGrid samples={samples} />
      ) : (
        <Card className="bg-slate-900 border-slate-800 border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-4xl mb-3">📷</p>
            <p className="text-slate-500">No samples yet.</p>
            <p className="text-slate-600 text-sm mt-1 mb-4">
              Upload your first photo to get started.
            </p>
            <Button asChild className="bg-violet-600 hover:bg-violet-700">
              <Link href="/upload">Upload Your First Sample</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Separate client component for delete functionality
import SamplesGrid from '@/components/samples-grid'