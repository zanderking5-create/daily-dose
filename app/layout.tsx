import type { Metadata, Viewport } from 'next'
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Daily Dose',
  description: "Zander's personal daily companion",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Daily Dose',
  },
}

export const viewport: Viewport = {
  themeColor: '#7C8B6F',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plusJakarta.variable}`}>
      <body className="font-jakarta antialiased" style={{ backgroundColor: '#FAF8F5', color: '#2D2A26' }}>
        {children}
      </body>
    </html>
  )
}
