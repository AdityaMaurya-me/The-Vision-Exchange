import { createClient } from '@/lib/supabase/server'
import GearClient from './gear-client'

export default async function GearPage() {
  const supabase = await createClient()

  const { data: gear, error } = await supabase
    .from('gear')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-red-400">Failed to load gear. Please try again.</p>
      </div>
    )
  }

  return <GearClient initialGear={gear ?? []} />
}