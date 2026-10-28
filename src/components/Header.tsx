'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ORG_ACRONYM } from '@/lib/branding'

export default function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="site-header">
      <nav className={`navbar navbar-expand-lg navbar-light bg-white shadow-sm ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container">
          <Link href="/" className="navbar-brand d-flex align-items-center">
            <img
              src="/brand/rala-horizontal-header.png"
              alt="Redstone Area Lakes Association — home"
              className="navbar-logo"
              width={273}
              height={112}
            />
          </Link>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            onClick={() => setIsNavOpen(!isNavOpen)}
            aria-controls="navbarNav" 
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  About {ORG_ACRONYM}
                </a>
                <ul className="dropdown-menu">
                  <li><Link href="/about" className="dropdown-item">About the Association</Link></li>
                  <li><Link href="/membership" className="dropdown-item">Membership</Link></li>
                  <li><Link href="/board-members" className="dropdown-item">Board Members</Link></li>
                  <li><Link href="/volunteers" className="dropdown-item">Volunteers</Link></li>
                  <li><Link href="/governance" className="dropdown-item">Governing Documents</Link></li>
                  <li><Link href="/agm" className="dropdown-item">Annual General Meeting</Link></li>
                  <li><Link href="/newsletters" className="dropdown-item">Newsletters</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><Link href="/contact" className="dropdown-item">Contact Us</Link></li>
                </ul>
              </li>
              <li className="nav-item">
                <Link href="/lake-health" className="nav-link">Water Level & Quality</Link>
              </li>
              <li className="nav-item">
                <Link href="/news" className="nav-link">News & Events</Link>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Community
                </a>
                <ul className="dropdown-menu">
                  <li><Link href="/galleries" className="dropdown-item">Photo Galleries</Link></li>
                  <li><Link href="/contests" className="dropdown-item">Contests</Link></li>
                  <li><Link href="/business-directory" className="dropdown-item">Sponsors &amp; Directory</Link></li>
                  <li><Link href="/municipal-bylaws" className="dropdown-item">Municipal By-Laws</Link></li>
                  <li><Link href="/initiatives" className="dropdown-item">Initiatives</Link></li>
                  <li><Link href="/private-buoys" className="dropdown-item">Private Hazard Buoys</Link></li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Lake Protection
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link href="/#essential-lake-protection" className="dropdown-item">How to Protect Your Lake</Link></li>
                  <li><Link href="/lake-health" className="dropdown-item">Lake Health Data</Link></li>
                  <li><Link href="/lake-map" className="dropdown-item">Lake Map</Link></li>
                  <li><Link href="/water-quality-program" className="dropdown-item">Water Quality Program</Link></li>
                  <li><Link href="/watch-your-wake" className="dropdown-item">Watch Your Wake</Link></li>
                  <li><Link href="/healthy-shoreline" className="dropdown-item">Healthy Shoreline</Link></li>
                  <li><Link href="/septic-systems" className="dropdown-item">Septic Systems</Link></li>
                  <li><Link href="/get-the-lead-out" className="dropdown-item">Get the Lead Out</Link></li>
                  <li><Link href="/new-cottager-guide" className="dropdown-item">New Cottager Guide</Link></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  )
}
