import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import EmailCopyToast from '@/components/EmailCopyToast'
import Script from 'next/script'
import { ORG_NAME } from '@/lib/branding'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: ORG_NAME,
  description: 'Protecting our lakes today and for future generations – Bitter, Burdock, Coleman, Little Redstone, Long (Tedious), Pelaw and Redstone Lakes.',
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
