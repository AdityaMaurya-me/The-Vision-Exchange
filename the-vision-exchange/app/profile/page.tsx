import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
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
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'recently'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-violet-400">
              {samples?.length ?? 0}
            </p>
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

      {/* Submitted Samples */}
      <div>
        <h2 className="text-xl font-semibold text-slate-100 mb-4">
          Your Submitted Samples
        </h2>

        {samples && samples.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {samples.map((sample) => (
              <Card key={sample.id} className="bg-slate-900 border-slate-800 overflow-hidden">
                <img
                  src={sample.image_url}
                  alt="Sample photo"
                  className="w-full h-48 object-cover"
                />
                <CardContent className="pt-4">
                  <p className="font-medium text-slate-100">
                    {sample.gear?.brand} {sample.gear?.model}
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {sample.settings_aperture && (
                      <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
                        f/{sample.settings_aperture}
                      </Badge>
                    )}
                    {sample.settings_shutter && (
                      <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
                        {sample.settings_shutter}s
                      </Badge>
                    )}
                    {sample.settings_iso && (
                      <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
                        ISO {sample.settings_iso}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-900 border-slate-800 border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">No samples yet.</p>
              <p className="text-slate-600 text-sm mt-1">
                Upload your first photo in the Gear Gallery.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}