import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function GearDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch gear item
  const { data: gear } = await supabase
    .from('gear')
    .select('*')
    .eq('id', id)
    .single()

  if (!gear) notFound()

  // Fetch community samples for this gear
  const { data: samples } = await supabase
    .from('samples')
    .select(`*, users (username)`)
    .eq('gear_id', id)
    .order('created_at', { ascending: false })

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Back Button */}
      <Link
        href="/gear"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-8 text-sm"
      >
        ← Back to Gear Gallery
      </Link>

      {/* Gear Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden bg-slate-800 aspect-video">
          <img
            src={gear.image_url || 'https://placehold.co/600x400/1e293b/94a3b8?text=No+Image'}
            alt={`${gear.brand} ${gear.model}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              className={`text-xs ${
                gear.type === 'body'
                  ? 'bg-violet-600 text-white'
                  : 'bg-cyan-700 text-white'
              }`}
            >
              {gear.type === 'body' ? 'Camera Body' : 'Lens'}
            </Badge>
          </div>

          <p className="text-slate-400 text-sm uppercase tracking-widest mb-1">
            {gear.brand}
          </p>
          <h1 className="text-4xl font-bold text-slate-100 mb-4">
            {gear.model}
          </h1>

          <p className="text-3xl font-semibold text-violet-400 mb-6">
            ${gear.price_estimate?.toLocaleString()}
          </p>

          {/* Creative Tags */}
          <div className="mb-6">
            <p className="text-slate-400 text-sm mb-2">Best for:</p>
            <div className="flex flex-wrap gap-2">
              {gear.creative_tags?.map((tag: string) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-violet-700 text-violet-300 capitalize"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Upload Sample CTA */}
          {user ? (
            <Button
              asChild
              className="w-fit bg-violet-600 hover:bg-violet-700"
            >
              <Link href={`/upload?gear=${gear.id}`}>
                + Upload Your Sample
              </Link>
            </Button>
          ) : (
            <p className="text-slate-500 text-sm">
              <Link href="/login" className="text-violet-400 hover:underline">
                Log in
              </Link>{' '}
              to upload a sample photo for this gear.
            </p>
          )}
        </div>
      </div>

      {/* Community Samples */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-6">
          Community Samples
          <span className="text-slate-500 text-lg font-normal ml-2">
            ({samples?.length ?? 0})
          </span>
        </h2>

        {samples && samples.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {samples.map((sample) => (
              <Card key={sample.id} className="bg-slate-900 border-slate-800 overflow-hidden">
                <img
                  src={sample.image_url}
                  alt="Community sample"
                  className="w-full h-56 object-cover"
                />
                <CardContent className="pt-4">
                  <p className="text-slate-400 text-sm mb-2">
                    by{' '}
                    <span className="text-slate-200 font-medium">
                      {sample.users?.username ?? 'Anonymous'}
                    </span>
                  </p>
                  <div className="flex gap-2 flex-wrap">
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
            <CardContent className="py-16 text-center">
              <p className="text-4xl mb-3">📷</p>
              <p className="text-slate-400">No samples yet for this gear.</p>
              <p className="text-slate-600 text-sm mt-1">
                Be the first to upload a photo taken with this gear.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}