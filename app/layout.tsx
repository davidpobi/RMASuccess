import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _inter = Inter({ subsets: ["latin"] });
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'RMASuccess',
  description: 'Submit a Return Merchandise Authorization request for medical devices quickly and accurately.',
  generator: 'v0.app',
  metadataBase: new URL('https://rmasuccess.vercel.app'),
  openGraph: {
    type: 'website',
    title: 'RMASuccess — Medical Device RMA Portal',
    description: 'Submit a Return Merchandise Authorization request for medical devices quickly and accurately.',
    siteName: 'RMASuccess',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RMASuccess — Medical Device Return Merchandise Authorization Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RMASuccess — Medical Device RMA Portal',
    description: 'Submit a Return Merchandise Authorization request for medical devices quickly and accurately.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
