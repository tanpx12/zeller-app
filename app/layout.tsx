import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Geist, Geist_Mono } from 'next/font/google'
import { cn } from '@/lib/utils'
import { Providers } from '@/components/providers'
import { TopBar } from '@/components/dashboard/TopBar'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  weight: ['400', '500', '600'],
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'perps-dashboard',
  description: 'Dashboard for the perps_model trading system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={cn(geistSans.variable, geistMono.variable, 'font-sans')}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <TopBar />
          <main className="mx-auto max-w-[1280px] px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
