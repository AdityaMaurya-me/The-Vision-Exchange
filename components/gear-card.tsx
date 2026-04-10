import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

type Gear = {
  id: string
  brand: string
  model: string
  type: string
  price_estimate: number
  creative_tags: string[]
  image_url: string
}

export default function GearCard({ gear }: { gear: Gear }) {
  return (
    <Link href={`/gear/${gear.id}`}>
      <Card className="bg-slate-900 border-slate-800 hover:border-violet-500 transition-all duration-200 overflow-hidden group cursor-pointer h-full">

        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-slate-800">
          <img
            src={gear.image_url || 'https://placehold.co/600x400/1e293b/94a3b8?text=No+Image'}
            alt={`${gear.brand} ${gear.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <Badge
              className={`text-xs font-medium ${
                gear.type === 'body'
                  ? 'bg-violet-600 text-white'
                  : 'bg-cyan-700 text-white'
              }`}
            >
              {gear.type === 'body' ? 'Camera Body' : 'Lens'}
            </Badge>
          </div>
        </div>

        {/* Info */}
        <CardContent className="pt-4 pb-5">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">
            {gear.brand}
          </p>
          <h3 className="text-slate-100 font-semibold text-lg leading-tight mb-3">
            {gear.model}
          </h3>

          {/* Creative Tags — the hero, not price */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {gear.creative_tags?.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-slate-700 text-slate-400 text-xs capitalize"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Price — subtle, not dominant */}
          <p className="text-slate-500 text-xs mt-auto">
            est. ${gear.price_estimate?.toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}