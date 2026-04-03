'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

type Gear = {
  id: string
  brand: string
  model: string
}

type Props = {
  gearList: Gear[]
  preselectedGearId: string | null
  userId: string
}

export default function UploadClient({ gearList, preselectedGearId, userId }: Props) {
  const [selectedGearId, setSelectedGearId] = useState(preselectedGearId ?? '')
  const [aperture, setAperture] = useState('')
  const [shutter, setShutter] = useState('')
  const [iso, setIso] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.')
      return
    }
    setImageFile(file)
    setError(null)
    setPreview(URL.createObjectURL(file))
  }

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const sigResponse = await fetch('/api/sign-cloudinary', { method: 'POST' })
    if (!sigResponse.ok) throw new Error('Failed to get upload signature')
    const { cloudName } = await sigResponse.json()

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'vision_exchange')

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    )
    if (!uploadResponse.ok) throw new Error('Failed to upload to Cloudinary')

    const data = await uploadResponse.json()
    return data.secure_url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!imageFile) {
      setError('Please select an image.')
      setLoading(false)
      return
    }
    if (!selectedGearId) {
      setError('Please select the gear you used.')
      setLoading(false)
      return
    }

    try {
      const imageUrl = await uploadToCloudinary(imageFile)
      const { error: dbError } = await supabase.from('samples').insert({
        user_id: userId,
        gear_id: selectedGearId,
        image_url: imageUrl,
        settings_aperture: aperture || null,
        settings_shutter: shutter || null,
        settings_iso: iso || null,
      })
      if (dbError) throw new Error(dbError.message)
      setSuccess(true)
      setTimeout(() => router.push('/profile'), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[90vh]">
        <div className="text-center">
          <p className="text-6xl mb-4">🎉</p>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Sample Uploaded!</h2>
          <p className="text-slate-400">Redirecting to your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-100 mb-2">Upload a Sample</h1>
      <p className="text-slate-400 mb-8">Share a photo and the gear you used.</p>

      <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 border border-slate-800 rounded-xl p-6">

        {/* FILE INPUT — plain HTML, no wrappers */}
        <div className="space-y-2">
          <Label className="text-slate-300 block mb-2">
            Photo (JPG, PNG, WEBP — max 10MB)
          </Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-slate-300 text-sm
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-violet-600 file:text-white
              hover:file:bg-violet-700
              file:cursor-pointer cursor-pointer"
          />
        </div>

        {/* Preview */}
        {preview && (
          <div className="space-y-2">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 rounded-lg object-contain border border-slate-700"
            />
            <button
              type="button"
              onClick={() => {
                setPreview(null)
                setImageFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Remove photo
            </button>
          </div>
        )}

        {/* Gear Selection */}
        <div className="space-y-2">
          <Label className="text-slate-300">Gear Used</Label>
          <select
            value={selectedGearId}
            onChange={(e) => setSelectedGearId(e.target.value)}
            required
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Select gear...</option>
            {gearList.map((gear) => (
              <option key={gear.id} value={gear.id}>
                {gear.brand} {gear.model}
              </option>
            ))}
          </select>
        </div>

        {/* Camera Settings */}
        <div className="space-y-2">
          <Label className="text-slate-300">
            Camera Settings <span className="text-slate-500 font-normal">(optional)</span>
          </Label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-slate-500 text-xs mb-1">Aperture</p>
              <Input
                placeholder="e.g. 1.8"
                value={aperture}
                onChange={(e) => setAperture(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-600"
              />
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Shutter Speed</p>
              <Input
                placeholder="e.g. 1/500"
                value={shutter}
                onChange={(e) => setShutter(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-600"
              />
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">ISO</p>
              <Input
                placeholder="e.g. 800"
                value={iso}
                onChange={(e) => setIso(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm p-3 rounded-md bg-red-950 text-red-400 border border-red-800">
            {error}
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading || !imageFile || !selectedGearId}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading...
            </span>
          ) : (
            'Upload Sample'
          )}
        </Button>

      </form>
    </div>
  )
}