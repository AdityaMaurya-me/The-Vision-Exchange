'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let ignore = false

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!ignore) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      ignore = true
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="font-bold text-xl tracking-tight">
            <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-cyan-400">
              VisionX
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <Link href="/gear" className="hover:text-slate-100 transition-colors">
              Gear Gallery
            </Link>
            <Link href="/gear#vibe-matcher" className="hover:text-slate-100 transition-colors">
              Vibe Matcher
            </Link>
            {!loading && user && (
              <Link href="/profile" className="hover:text-slate-100 transition-colors">
                My Profile
              </Link>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3 min-w-35 justify-end">
            {loading ? (
              // Loading skeleton — prevents layout shift
              <>
                <div className="w-16 h-8 bg-slate-800 rounded-md animate-pulse" />
                <div className="w-20 h-8 bg-slate-800 rounded-md animate-pulse" />
              </>
            ) : user ? (
              // Logged in state
              <>
                <span className="text-slate-400 text-sm hidden md:block truncate max-w-37.5">
                  {user.email}
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Log Out
                </Button>
              </>
            ) : (
              // Logged out state
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 hover:text-white"
                >
                  <Link href="/login">Log In</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  )
}