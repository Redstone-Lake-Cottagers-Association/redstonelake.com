import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import EmailCopyToast from '@/components/EmailCopyToast'
import Script from 'next/script'
import { ORG_NAME } from '@/lib/branding'

const inter = Inter({ subsets: ['latin'] })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redstonelake.com'
const DESCRIPTION = 'Protecting our lakes today and for future generations – Bitter, Burdock, Coleman, Little Redstone, Long (Tedious), Pelaw and Redstone Lakes.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: ORG_NAME,
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: ORG_NAME,
    locale: 'en_CA',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630, alt: 'Redstone Lake in Haliburton' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer />
        <EmailCopyToast />
        <Script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
