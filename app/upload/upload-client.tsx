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

const APERTURE_REGEX = /^\d+(\.\d+)?$/
const SHUTTER_REGEX = /^(1\/\d+|\d+(\.\d+)?)$/
const ISO_REGEX = /^\d+$/

export default function UploadClient({ gearList, preselectedGearId, userId }: Props) {
  const [selectedGearId, setSelectedGearId] = useState(preselectedGearId ?? '')
  const [caption, setCaption] = useState('')
  const [aperture, setAperture] = useState('')
  const [shutter, setShutter] = useState('')
  const [iso, setIso] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    aperture?: string; shutter?: string; iso?: string
  }>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const validateFields = () => {
    const errors: { aperture?: string; shutter?: string; iso?: string } = {}
    if (aperture && !APERTURE_REGEX.test(aperture)) errors.aperture = 'Format: 1.8 or 2.8'
    if (shutter && !SHUTTER_REGEX.test(shutter)) errors.shutter = 'Format: 1/500 or 2'
    if (iso && !ISO_REGEX.test(iso)) errors.iso = 'Whole number: 800'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return }
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10MB.'); return }
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
    if (!validateFields()) return
    setLoading(true)
    setError(null)

    if (!imageFile) { setError('Please select an image.'); setLoading(false); return }
    if (!selectedGearId) { setError('Please select the gear you used.'); setLoading(false); return }

    try {
      const imageUrl = await uploadToCloudinary(imageFile)
      setUploadedUrl(imageUrl)

      const { error: dbError } = await supabase.from('samples').insert({
        user_id: userId,
        gear_id: selectedGearId,
        image_url: imageUrl,
        caption: caption || null,
        settings_aperture: aperture || null,
        settings_shutter: shutter || null,
        settings_iso: iso || null,
      })
      if (dbError) throw new Error(dbError.message)
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const selectedGear = gearList.find(g => g.id === selectedGearId)

  // ============================================
  // SUCCESS SCREEN — portfolio moment, not a form
  // ============================================
  if (success && uploadedUrl) {
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg text-center">

          {/* Big photo display */}
          <div className="relative mb-6 rounded-2xl overflow-hidden shadow-2xl shadow-violet-900/20 border border-slate-700">
            <img
              src={uploadedUrl}
              alt="Your uploaded shot"
              className="w-full object-cover max-h-[500px]"
            />
            {/* Caption overlay if exists */}
            {caption && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <p className="text-white text-sm italic">"{caption}"</p>
              </div>
            )}
          </div>

          {/* Gear tag */}
          {selectedGear && (
            <p className="text-slate-400 text-sm mb-1">
              Shot with{' '}
              <span className="text-slate-200 font-medium">
                {selectedGear.brand} {selectedGear.model}
              </span>
            </p>
          )}

          {/* Settings row */}
          {(aperture || shutter || iso) && (
            <div className="flex justify-center gap-3 mb-6 mt-2 flex-wrap">
              {aperture && <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">f/{aperture}</span>}
              {shutter && <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">{shutter}s</span>}
              {iso && <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">ISO {iso}</span>}
            </div>
          )}

          <h2 className="text-2xl font-bold text-slate-100 mb-2">Your shot is live.</h2>
          <p className="text-slate-400 text-sm mb-8">
            It's now part of the community gallery for this gear.
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <Button
              asChild
              className="bg-violet-600 hover:bg-violet-700"
            >
              <a href={selectedGearId ? `/gear/${selectedGearId}` : '/gear'}>
                See it in the gallery
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <a href="/upload">Upload another</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // UPLOAD FORM
  // ============================================
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-100 mb-2">Share a Shot</h1>
      <p className="text-slate-400 mb-8">
        Upload a photo, tell us what you were trying to capture, and tag the gear you used.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 border border-slate-800 rounded-xl p-6">

        {/* File Input */}
        <div className="space-y-2">
          <Label className="text-slate-300 block mb-2">
            Your photo <span className="text-slate-500 font-normal">(JPG, PNG, WEBP — max 10MB)</span>
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

        {/* Preview with remove */}
        {preview && (
          <div className="relative group w-fit">
            <img
              src={preview}
              alt="Preview"
              className="max-h-72 rounded-xl object-contain border border-slate-700"
            />
            <button
              type="button"
              onClick={() => {
                setPreview(null)
                setImageFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        )}

        {/* Caption — the soul field */}
        <div className="space-y-2">
          <Label className="text-slate-300">
            What were you trying to capture?{' '}
            <span className="text-slate-500 font-normal">(optional)</span>
          </Label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="e.g. The moment the light hit just right at golden hour..."
            maxLength={200}
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
          <p className="text-slate-600 text-xs text-right">{caption.length}/200</p>
        </div>

        {/* Gear Selection */}
        <div className="space-y-2">
          <Label className="text-slate-300">Gear used</Label>
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
            Camera settings{' '}
            <span className="text-slate-500 font-normal">(optional)</span>
          </Label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-slate-500 text-xs mb-1">Aperture</p>
              <Input
                placeholder="e.g. 1.8"
                value={aperture}
                onChange={(e) => { setAperture(e.target.value); setFieldErrors(p => ({ ...p, aperture: undefined })) }}
                className={`bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-600 ${fieldErrors.aperture ? 'border-red-500' : ''}`}
              />
              {fieldErrors.aperture && <p className="text-red-400 text-xs mt-1">{fieldErrors.aperture}</p>}
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Shutter speed</p>
              <Input
                placeholder="e.g. 1/500"
                value={shutter}
                onChange={(e) => { setShutter(e.target.value); setFieldErrors(p => ({ ...p, shutter: undefined })) }}
                className={`bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-600 ${fieldErrors.shutter ? 'border-red-500' : ''}`}
              />
              {fieldErrors.shutter && <p className="text-red-400 text-xs mt-1">{fieldErrors.shutter}</p>}
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">ISO</p>
              <Input
                placeholder="e.g. 800"
                value={iso}
                onChange={(e) => { setIso(e.target.value); setFieldErrors(p => ({ ...p, iso: undefined })) }}
                className={`bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-600 ${fieldErrors.iso ? 'border-red-500' : ''}`}
              />
              {fieldErrors.iso && <p className="text-red-400 text-xs mt-1">{fieldErrors.iso}</p>}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-500 space-y-1">
            <p>📐 Aperture: <span className="text-slate-400">1.8 / 2.8 / 11</span></p>
            <p>⏱ Shutter: <span className="text-slate-400">1/500 / 1/60 / 2</span></p>
            <p>🔆 ISO: <span className="text-slate-400">100 / 800 / 3200</span></p>
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
            'Share this shot'
          )}
        </Button>

      </form>
    </div>
  )
}