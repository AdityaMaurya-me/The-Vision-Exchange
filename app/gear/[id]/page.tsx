import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import GearStatus from '@/components/gear-status'

export default async function GearDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: gear } = await supabase
    .from('gear')
    .select('*')
    .eq('id', id)
    .single()

  if (!gear) notFound()

  const { data: samples } = await supabase
    .from('samples')
    .select(`*, users (username)`)
    .eq('gear_id', id)
    .order('created_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch current user's gear status if logged in
  let initialStatus = null
  if (user) {
    const { data: statusData } = await supabase
      .from('gear_status')
      .select('status')
      .eq('user_id', user.id)
      .eq('gear_id', id)
      .single()
    initialStatus = statusData?.status ?? null
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Back */}
      <Link
        href="/gear"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-8 text-sm"
      >
        ← Back to Gear Gallery
      </Link>

      {/* ============================================
          COMMUNITY PHOTOS FIRST — this is the hero
      ============================================ */}
      <div className="mb-16">

        {/* Gear identity — minimal header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">
              {gear.brand}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-3">
              {gear.model}
            </h1>
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

          {user ? (
            <Button asChild className="bg-violet-600 hover:bg-violet-700 shrink-0">
              <Link href={`/upload?gear=${gear.id}`}>
                + Upload Your Shot
              </Link>
            </Button>
          ) : (
            <p className="text-slate-500 text-sm">
              <Link href="/login" className="text-violet-400 hover:underline">
                Log in
              </Link>{' '}
              to upload a shot with this gear.
            </p>
          )}
        </div>

        {/* Community Samples — MASONRY GRID */}
        {samples && samples.length > 0 ? (
          <div>
            <h2 className="text-lg font-semibold text-slate-100 mb-4">
              Shot with this gear
              <span className="text-slate-500 font-normal text-base ml-2">
                ({samples.length})
              </span>
            </h2>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {samples.map((sample) => (
                <div
                  key={sample.id}
                  className="break-inside-avoid bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group"
                >
                  <img
                    src={sample.image_url}
                    alt="Community sample"
                    className="w-full object-cover group-hover:opacity-90 transition-opacity"
                  />
                  <div className="p-4">
                    {sample.caption && (
                      <p className="text-slate-300 text-sm italic mb-3 leading-relaxed">
                        "{sample.caption}"
                      </p>
                    )}
                    <p className="text-slate-500 text-xs mb-2">
                      by{' '}
                      <Link
                        href={`/${sample.users?.username}`}
                        className="text-slate-300 font-medium hover:text-violet-400 transition-colors"
                      >
                        {sample.users?.username ?? 'Anonymous'}
                      </Link>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-700 py-20 text-center">
            <div className="max-w-sm mx-auto">
              <p className="text-5xl mb-4">📷</p>
              <p className="text-slate-200 font-semibold text-xl mb-2">
                Be the first to show what this can do.
              </p>
              <p className="text-slate-500 text-sm mb-6">
                No sample photos yet. Upload yours and own this gear's story.
              </p>
              {user ? (
                <Button asChild className="bg-violet-600 hover:bg-violet-700">
                  <Link href={`/upload?gear=${gear.id}`}>
                    Upload the First Shot
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="border-slate-600 text-slate-300">
                  <Link href="/signup">Join to Upload</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============================================
          SPECS — pushed to the bottom
      ============================================ */}
      <div className="border-t border-slate-800 pt-12">
        <h2 className="text-slate-400 mb-6 uppercase tracking-widest text-sm font-semibold">
          Gear Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Gear image */}
          <div className="rounded-xl overflow-hidden bg-slate-800 aspect-video">
            <img
              src={gear.image_url || 'https://placehold.co/600x400/1e293b/94a3b8?text=No+Image'}
              alt={`${gear.brand} ${gear.model}`}
              className="w-full h-full object-cover opacity-80"
            />
          </div>

          {/* Specs + Gear Status */}
          <div className="flex flex-col justify-center gap-4">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Type</p>
              <p className="text-slate-200">
                {gear.type === 'body' ? 'Camera Body' : 'Lens'}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Brand</p>
              <p className="text-slate-200">{gear.brand}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">
                Estimated Price
              </p>
              <p className="text-slate-200">
                ${gear.price_estimate?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">
                Best For
              </p>
              <div className="flex flex-wrap gap-2">
                {gear.creative_tags?.map((tag: string) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-slate-700 text-slate-400 capitalize"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Gear Status — track your relationship with this gear */}
            <div className="pt-2 border-t border-slate-800">
              <GearStatus
                gearId={gear.id}
                currentUserId={user?.id ?? null}
                initialStatus={initialStatus}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}