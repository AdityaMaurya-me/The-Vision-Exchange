import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'The Vision Exchange',
  description: 'A creative marketplace for camera gear',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen relative`}>

        {/* Background image — fades top to bottom */}
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Top: semi-transparent to show image */}
          {/* Bottom: fully opaque slate-950 to fade out */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(2,6,23,0.75) 0%, rgba(2,6,23,0.92) 40%, rgba(2,6,23,1) 75%)',
            }}
          />
        </div>

        {/* All page content sits above the background */}
        <div className="relative z-10">
          <Navbar />
          <main>{children}</main>
        </div>

      </body>
    </html>
  )
}