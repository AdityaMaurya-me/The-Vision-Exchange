import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UploadClient from './upload-client'

type Props = {
  searchParams: Promise<{ gear?: string }>
}

export default async function UploadPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const params = await searchParams
  const gearId = params?.gear ?? null

  const { data: gearList } = await supabase
    .from('gear')
    .select('id, brand, model')
    .order('brand', { ascending: true })

  return (
    <UploadClient
      gearList={gearList ?? []}
      preselectedGearId={gearId}
      userId={user.id}
    />
  )
}