'use client'

import { useEffect, useState } from 'react'

// Sitewide: clicking an email address copies it and shows a toast, instead of
// launching whatever mail app the OS thinks the visitor has (often none —
// a member reported mailto links "not working" for exactly this reason).
// The toast still offers the real mailto for people with a mail app.
export default function EmailCopyToast() {
  const [toast, setToast] = useState<{ email: string; href: string } | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.('a[href^="mailto:"]') as HTMLAnchorElement | null
      if (!target) return
      // modifier-click keeps native behaviour
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      const href = target.getAttribute('href') || ''
      const email = decodeURIComponent(href.replace(/^mailto:/, '').split('?')[0])
      navigator.clipboard?.writeText(email).catch(() => {})
      setToast({ email, href })
      clearTimeout(timer)
      timer = setTimeout(() => setToast(null), 5000)
    }
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('click', onClick)
      clearTimeout(timer)
    }
  }, [])

  if (!toast) return null
  return (
    <div
      role="status"
      className="position-fixed start-50 translate-middle-x d-flex align-items-center gap-3 px-3 py-2"
      style={{
        bottom: '24px',
        zIndex: 2000,
        background: '#0f172a',
        color: '#fff',
        borderRadius: '10px',
        boxShadow: '0 8px 30px rgba(15,23,42,0.35)',
        maxWidth: 'calc(100vw - 32px)',
      }}
    >
      <span className="small" style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
        📋 Copied <strong>{toast.email}</strong>
      </span>
      <a
        href={toast.href}
        className="small fw-semibold flex-shrink-0"
        style={{ color: '#7dd3fc' }}
        onClick={() => setToast(null)}
      >
        Open mail app
      </a>
      <button
        type="button"
        className="btn-close btn-close-white flex-shrink-0"
        style={{ fontSize: '0.6rem' }}
        aria-label="Dismiss"
        onClick={() => setToast(null)}
      />
    </div>
  )
}
