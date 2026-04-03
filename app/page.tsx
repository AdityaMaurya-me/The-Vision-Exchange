import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] text-center px-4">
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
        The{' '}
        <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-cyan-400">
          Vision Exchange
        </span>
      </h1>
      <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-8">
        Discover camera gear mapped to creative use cases. Browse by vibe, not
        just specs. Built by photographers, for photographers.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Button asChild size="lg" className="bg-violet-600 hover:bg-violet-700">
          <Link href="/gear">Browse Gear</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
          <Link href="/signup">Join the Community</Link>
        </Button>
      </div>
    </div>
  )
  }