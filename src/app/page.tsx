'use client'

import Link from 'next/link'
import { useState } from 'react'
import LakeInfo from '@/components/LakeInfo'
import LakeDataPreview from '@/components/LakeDataPreview'
import HeroMap from '@/components/HeroMap'
import newsIndex from '@/data/news-index.json'
import NewsCard from '@/components/NewsCard'
import NewsletterStrip from '@/components/NewsletterStrip'
import sponsorData from '@/data/sponsors.json'
import eventsData from '@/data/events.json'
import { ORG_NAME, ORG_ACRONYM } from '@/lib/branding'

// Sponsors sort and size by sponsorship level (amounts from Donna, July 2026)
const sponsors = [...sponsorData.sponsors].sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))
const TIER_SIZE: Record<string, { h: number; w: number }> = {
  premier: { h: 72, w: 220 },
  gold: { h: 58, w: 180 },
  standard: { h: 46, w: 150 },
}

const latestPosts = newsIndex.slice(0, 6)

interface Event {
  id: number;
  title: string;
  date: string;
  day: string;
  month: string;
  type: string;
  status: 'upcoming' | 'past';
  icon: string;
  color: string;
  description: string;
  details: string;
  monthName?: string;
}

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showMoreMonths, setShowMoreMonths] = useState(false)
  const [hasClickedShowMore, setHasClickedShowMore] = useState(false)

  const events: Event[] = eventsData as Event[]

  // Filter and group events by month and year
  const getFilteredAndGroupedEvents = (events: Event[], showMore: boolean) => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear
    
    // Calculate previous month for limiting past events
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear

    // Filter events based on display options
    const filtered = events.filter(event => {
      const eventDate = new Date(event.date)
      const eventMonth = eventDate.getMonth()
      const eventYear = eventDate.getFullYear()
      
      // Always show the 3-month window: previous, current, next
      const inThreeMonthWindow = (eventYear === prevYear && eventMonth === prevMonth) ||
                                (eventYear === currentYear && eventMonth === currentMonth) ||
                                (eventYear === nextYear && eventMonth === nextMonth)
      
      if (inThreeMonthWindow) {
        return true
      }
      
      // If showing more months, include future events up to 6 months ahead (but keep past events limited to previous month only)
      if (showMore) {
        const sixMonthsAhead = new Date(currentYear, currentMonth + 6, 31)
        // For future events, expand to 6 months ahead
        if (eventDate > new Date(nextYear, nextMonth, 31)) {
          return eventDate <= sixMonthsAhead
        }
      }
      

      
      return false
    })

    // Sort chronologically
    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateA.getTime() - dateB.getTime()
    })

    // Group by month
    const grouped: { [key: string]: Event[] } = {}
    
    sorted.forEach(event => {
      const date = new Date(event.date)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = []
      }
      grouped[monthYear].push({ ...event, monthName })
    })
    
    return grouped
  }

  const groupedEvents = getFilteredAndGroupedEvents(events, showMoreMonths)
  


  // Check if there are more future months beyond the 3-month window
  const hasMoreMonths = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear
    
    return events.some(event => {
      const eventDate = new Date(event.date)
      
      // Check if there are future events beyond next month (within 6 months)
      const sixMonthsAhead = new Date(currentYear, currentMonth + 6, 31)
      return eventDate > new Date(nextYear, nextMonth, 31) && eventDate <= sixMonthsAhead
    })
  }

  const openEventModal = (event: Event) => {
    setSelectedEvent(event)
    setShowModal(true)
  }
  return (
    <>
      <style jsx>{`
        .hover-lift {
          transition: transform 0.2s ease-in-out;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-start">
            <div className="col-lg-8">
              <div>
                <h1 className="display-2 fw-bold mb-4" style={{lineHeight: '1.1', minHeight: '3.5rem'}}>
                  Where <span style={{
                    fontWeight: '900',
                    textShadow: '0 0 30px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.8)',
                    letterSpacing: '0.02em'
                  }}>community</span> meets <span style={{
                    fontWeight: '900',
                    textShadow: '0 0 30px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.8)',
                    letterSpacing: '0.02em'
                  }}>conservation</span>
                </h1>
                <p className="lead mb-4 fs-3" style={{maxWidth: '600px', fontWeight: '400', lineHeight: '1.5', minHeight: '4.5rem'}}>
                  Over 60 years of protecting lakes and building community in the Redstone River Watershed, Haliburton.
                </p>
                <div className="d-flex flex-column flex-sm-row gap-3">
                  <Link href="/membership" className="btn btn-lake-primary btn-lg" style={{fontSize: '1.1rem', padding: '1rem 2rem'}}>
                    Join Our Community
                  </Link>
                </div>
      </div>
            </div>
            <div className="col-lg-4">
              <LakeInfo />
            </div>
          </div>
        </div>
      </section>

      {/* Lakes Overview Map Section */}
      <section id="our-protected-lakes" className="py-5 bg-light">
        <div className="container">
        <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="text-center mb-5">
                <h2 className="display-5 mb-4">About the {ORG_NAME}</h2>
                <p className="lead text-muted mb-4">
                  For over 60 years, the {ORG_ACRONYM} has been the dedicated guardian of the lakes nestled in the heart of Haliburton's wilderness. Our volunteer-driven community is united by a shared commitment to preserving these natural treasures for current and future generations.
                </p>
                
              </div>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="text-center mb-4">
                <h2 className="h4 mb-2 text-primary">Our Protected Lakes</h2>
                <p className="lead text-muted">
                  From Redstone Lake to Little Redstone, Pelaw, Bitter, Tedious (Long), Burdock, and Coleman Lakes, our stewardship extends across seven interconnected waters that form a remarkable ecosystem in the heart of Haliburton's wilderness.
                </p>
              </div>
              <HeroMap />
              <div className="text-center mt-3">
                <Link href="/lake-map" className="btn btn-outline-primary btn-sm">
                  Explore the Interactive Lake Map — depths, parcels &amp; more →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About RLCA Section */}
      <section className="py-6">
        <div className="container">
         

          <div className="text-center mb-5">
            <h3 className="h4 mb-3 text-primary">Our Mission in Action</h3>
            <p className="lead text-muted">Three pillars that drive our conservation efforts</p>
          </div>

          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card lake-card h-100">
                <img src="/images/pages/media-galleries/Fishing_Buddies-1024x576.png" alt="Members showing off their catch on Redstone Lake" className="card-img-top" style={{ objectFit: 'cover' }} />
                <div className="card-body d-flex flex-column">
                  <h4 className="card-title">Making a Difference</h4>
                  <p className="card-text text-muted mb-4">
                    Every volunteer hour, every conservation initiative, and every community action contributes to our lakes' protection. From organizing lake cleanups to advocating for environmental policies, our members actively shape the future of these waters.
                  </p>
                  <p className="card-text mb-4">
                    <strong className="text-primary">Join a community that believes individual actions create collective impact.</strong>
                  </p>
                  <div className="mt-auto">
                    <Link href="/membership" className="btn btn-lake-primary">
                      Get Involved
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card lake-card h-100">
                <img src="/images/pages/media-galleries/IMG_6482-1024x768.jpeg" alt="Morning mist over the lake" className="card-img-top" style={{ objectFit: 'cover' }} />
                <div className="card-body d-flex flex-column">
                  <h4 className="card-title">Water Quality Excellence</h4>
                  <p className="card-text text-muted mb-4">
                    Our comprehensive monitoring program tracks the health of all seven lakes through regular testing, scientific analysis, and collaboration with environmental experts. We measure everything from phosphorus levels to invasive species presence.
                  </p>
                  <p className="card-text mb-4">
                    <strong className="text-primary">Transparency and science guide our conservation decisions.</strong>
                  </p>
                  <div className="mt-auto">
                    <Link href="/water-quality" className="btn btn-lake-primary">
                      View Reports
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card lake-card h-100">
                <img src="/images/pages/media-galleries/20210703_162424_resized-1024x768.jpg" alt="Kayakers and boats gathered on Redstone Lake" className="card-img-top" style={{ objectFit: 'cover' }} />
                <div className="card-body d-flex flex-column">
                  <h4 className="card-title">Welcoming New Cottagers</h4>
                  <p className="card-text text-muted mb-4">
                    New to lake life? We're here to help you become an environmental steward from day one. Our comprehensive guide covers everything from septic system care to invasive species prevention, ensuring you can enjoy and protect these waters.
                  </p>
                  <p className="card-text mb-4">
                    <strong className="text-primary">Every new cottager is a potential lake champion.</strong>
                  </p>
                  <div className="mt-auto">
                    <Link href="/new-cottager-guide" className="btn btn-lake-primary">
                      Get Started
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Water Level & Lake Health Preview Section */}
      <section id="water-level-monitor" className="py-6 bg-light">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="display-5 mb-3">Water Level &amp; Lake Health</h2>
            <p className="lead text-muted">
              Live conditions and nearly 30 years of water quality data for our seven lakes
            </p>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <LakeDataPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Important Environmental Guidelines */}
      <section id="essential-lake-protection" className="py-6 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 mb-3">Essential Lake Protection Guidelines</h2>
            <p className="lead text-muted">Critical information every lake user should know</p>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="mb-4">
                <div className="d-flex align-items-start p-4 bg-white rounded-3 shadow-sm border-start border-4" style={{borderColor: 'var(--warm-orange) !important', borderWidth: '4px !important'}}>
                  <div className="me-4">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                      width: '60px', 
                      height: '60px', 
                      backgroundColor: 'rgba(249, 115, 22, 0.15)',
                      border: '2px solid rgba(249, 115, 22, 0.3)'
                    }}>
                      <span style={{fontSize: '1.5rem'}}>🚤</span>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h4 className="text-primary mb-3 fw-bold">CLEAN, DRAIN and DRY Your Boat</h4>
                    <p className="mb-3 text-muted">
                      Invasive species like zebra mussels travel by boat — and it's the law in Ontario to <strong>CLEAN</strong>, <strong>DRAIN</strong> and <strong>DRY</strong> before moving between waterbodies. That includes moving between our own seven lakes, and it especially matters for rented boats or boats arriving from out of town.
                    </p>
                    <Link href="/news/clean-drain-and-dry-your-boat" className="btn btn-outline-primary btn-sm">
                      Learn More About Prevention →
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="d-flex align-items-start p-4 bg-white rounded-3 shadow-sm border-start border-4" style={{borderColor: 'var(--lake-blue) !important', borderWidth: '4px !important'}}>
                  <div className="me-4">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                      width: '60px', 
                      height: '60px', 
                      backgroundColor: 'rgba(2, 132, 199, 0.15)',
                      border: '2px solid rgba(2, 132, 199, 0.3)'
                    }}>
                      <span style={{fontSize: '1.5rem'}}>🌊</span>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h4 className="text-primary mb-3 fw-bold">Watch Your Wake</h4>
                    <p className="mb-3 text-muted">
                      Boat wakes erode shorelines, muddy fish habitat and can swamp loon nests right at the waterline. Keep to 10 km/h within 30 metres of shore, take big wakes to deep open water, and be #WakeAware around paddlers and swimmers.
                    </p>
                    <Link href="/news/watch-your-wake-to-protect-our-shorelines" className="btn btn-outline-primary btn-sm">
                      Learn About Wake Safety →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex align-items-start p-4 bg-white rounded-3 shadow-sm border-start border-4" style={{borderColor: 'var(--forest-green) !important', borderWidth: '4px !important'}}>
                  <div className="me-4">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                      width: '60px', 
                      height: '60px', 
                      backgroundColor: 'rgba(5, 150, 105, 0.15)',
                      border: '2px solid rgba(5, 150, 105, 0.3)'
                    }}>
                      <span style={{fontSize: '1.5rem'}}>🏠</span>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h4 className="text-primary mb-3 fw-bold">Maintain Your Septic System</h4>
                    <p className="mb-3 text-muted">
                      A failing septic system leaks the nutrients that feed algae blooms. Pump every 3–5 years, use phosphate-free detergents, and know the warning signs — Dysart et al now runs a mandatory inspection program for waterfront systems.
                    </p>
                    <Link href="/septic-systems" className="btn btn-outline-primary btn-sm">
                      Septic Care Guide →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex align-items-start p-4 bg-white rounded-3 shadow-sm border-start border-4" style={{borderColor: 'var(--accent-teal) !important', borderWidth: '4px !important'}}>
                  <div className="me-4">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                      width: '60px', 
                      height: '60px', 
                      backgroundColor: 'rgba(13, 148, 136, 0.15)',
                      border: '2px solid rgba(13, 148, 136, 0.3)'
                    }}>
                      <span style={{fontSize: '1.5rem'}}>🌿</span>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h4 className="text-primary mb-3 fw-bold">Protect Natural Shorelines</h4>
                    <p className="mb-3 text-muted">
                      Native shoreline vegetation holds the bank together, filters runoff before it reaches the lake, and even keeps the geese away. Start with a small no-mow buffer — and remember shoreline vegetation within 30 metres of the water is protected by county by-law.
                    </p>
                    <Link href="/news/shoreline-naturalization-with-abbey-gardens" className="btn btn-outline-primary btn-sm">
                      Naturalization Tips →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex align-items-start p-4 bg-white rounded-3 shadow-sm border-start border-4" style={{borderColor: 'var(--secondary-blue) !important', borderWidth: '4px !important'}}>
                  <div className="me-4">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                      width: '60px', 
                      height: '60px', 
                      backgroundColor: 'rgba(30, 64, 175, 0.15)',
                      border: '2px solid rgba(30, 64, 175, 0.3)'
                    }}>
                      <span style={{fontSize: '1.5rem'}}>🎣</span>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h4 className="text-primary mb-3 fw-bold">Fish Responsibly</h4>
                    <p className="mb-3 text-muted">
                      Our deep, cold lakes are prime lake trout water — a fishery found in only 1% of Ontario lakes. Know the Zone 15 seasons and limits (many lake trout lakes have their own rules), never move live bait between waterbodies, and handle released fish with care.
                    </p>
                    <Link href="/news/fishing-around-the-lake" className="btn btn-outline-primary btn-sm">
                      Fishing Guidelines →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex align-items-start p-4 bg-white rounded-3 shadow-sm border-start border-4" style={{borderColor: 'var(--warm-orange) !important', borderWidth: '4px !important'}}>
                  <div className="me-4">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                      width: '60px',
                      height: '60px',
                      backgroundColor: 'rgba(194, 112, 61, 0.15)',
                      border: '2px solid rgba(194, 112, 61, 0.3)'
                    }}>
                      <span style={{fontSize: '1.5rem'}}>🦆</span>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h4 className="text-primary mb-3 fw-bold">Get the Lead Out</h4>
                    <p className="mb-3 text-muted">
                      A single lost lead sinker is enough to kill an adult loon. Switch to steel, tin, tungsten or bismuth tackle — and trade in your old lead at our tackle exchange for a free limited-edition custom lure.
                    </p>
                    <Link href="/get-the-lead-out" className="btn btn-outline-primary btn-sm">
                      About the Campaign →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Events & News Section */}
      <section id="events-news" className="py-6">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 mb-3">Events & News</h2>
            <p className="lead text-muted">Stay connected with community events and conservation insights</p>
          </div>

          {/* Compact Events Section */}
          <div className="row mb-5">
            <div className="col-12">
              
              {!events.some(e => new Date(e.date) >= new Date()) && (
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 rounded border bg-white px-3 py-2 mb-4">
                  <span className="text-muted small">
                    No upcoming events on file — hosting a concert, cleanup or get-together? We&apos;d love to spread the word.
                  </span>
                  <Link href="/events" className="btn btn-outline-primary btn-sm flex-shrink-0">All events</Link>
                </div>
              )}
              {Object.entries(groupedEvents).map(([monthKey, monthEvents]) => {
                const firstEvent = monthEvents[0]
                const eventDate = new Date(firstEvent.date)
                const now = new Date()
                const currentMonth = now.getMonth()
                const currentYear = now.getFullYear()
                
                // Check if this is the previous month
                const isPreviousMonth = eventDate.getFullYear() < currentYear || 
                                       (eventDate.getFullYear() === currentYear && eventDate.getMonth() < currentMonth)
                
                return (
                  <div key={monthKey} className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <h5 className={`mb-0 me-3 ${isPreviousMonth ? 'text-muted' : 'text-success'}`}>
                        {firstEvent.monthName}
                      </h5>
                      <div className="flex-grow-1" style={{height: '1px', backgroundColor: isPreviousMonth ? '#e5e7eb' : '#d1fae5'}}></div>
                    </div>
                    
                    <div className="row g-2 mb-4">
                      {monthEvents.map(event => {
                        const eventDate = new Date(event.date)
                        const isPastEvent = eventDate < new Date()
                        const isEventInPreviousMonth = isPastEvent

                        return (
                          <div key={event.id} className="col-lg-3 col-md-4 col-sm-6">
                            <div 
                              className={`card border-0 shadow-sm h-100 cursor-pointer hover-lift position-relative ${isPastEvent ? 'opacity-75' : ''}`}
                              style={{
                                borderLeft: `4px solid ${isPastEvent ? '#6b7280' : event.color}`, 
                                cursor: 'pointer'
                              }}
                              onClick={() => openEventModal(event)}
                            >
                              {isPastEvent && (
                                <span
                                  className="badge position-absolute"
                                  style={{ top: '8px', right: '8px', backgroundColor: '#6b7280', fontSize: '0.65rem', letterSpacing: '0.04em' }}
                                >
                                  PAST EVENT
                                </span>
                              )}
                              <div className="card-body p-3">
                                <div className="d-flex align-items-center mb-2">
                                  <div className="me-2 text-center" style={{minWidth: '35px'}}>
                                    <div 
                                      className="fw-bold" 
                                      style={{
                                        fontSize: '1.2rem', 
                                        lineHeight: '1', 
                                        color: isEventInPreviousMonth ? '#6b7280' : event.color
                                      }}
                                    >
                                      {event.day}
                                    </div>
                                    <small className="text-muted text-uppercase" style={{fontSize: '0.65rem', letterSpacing: '0.5px'}}>
                                      {event.month}
                                    </small>
                                  </div>
                                  <span 
                                    style={{
                                      fontSize: '1rem', 
                                      filter: isEventInPreviousMonth ? 'grayscale(0.5)' : 'none'
                                    }}
                                  >
                                    {event.icon}
                                  </span>
                                </div>
                                <h6 
                                  className={`mb-1 fw-semibold ${isEventInPreviousMonth ? 'text-muted' : ''}`} 
                                  style={{fontSize: '0.9rem', lineHeight: '1.2'}}
                                >
                                  {event.title}
                                </h6>
                                <small className="text-muted">{event.type}</small>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              
              {/* Show More Buttons - positioned at bottom center */}
              <div className="text-center mt-4">
                <div className="d-flex justify-content-center">
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      setShowMoreMonths(!showMoreMonths)
                      if (!showMoreMonths) setHasClickedShowMore(true)
                    }}
                    disabled={!hasMoreMonths() && !showMoreMonths}
                  >
                    {showMoreMonths && hasClickedShowMore ? 'Show Less' : 'Show More'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* News Articles */}
          <div className="text-center mb-4">
            <h3 className="h4 mb-3 text-primary">News & Articles</h3>
          </div>

          <NewsletterStrip />

          <div className="row g-4">
            {latestPosts.map(post => (
              <div key={post.slug} className="col-md-6 col-lg-4 d-flex">
                <NewsCard post={post} />
              </div>
            ))}
          </div>

          <div className="text-center mt-4">
            <Link href="/news" className="btn btn-outline-primary btn-lg">View All News & Articles</Link>
          </div>
        </div>
      </section>


      {/* Sponsors strip */}
      <section className="py-4" style={{ backgroundColor: '#ffffff', borderTop: '1px solid rgba(15,23,42,0.06)' }}>
        <div className="container text-center">
          <p className="text-muted small text-uppercase mb-3" style={{ letterSpacing: '0.08em' }}>
            Thank you to our 2026 sponsors
          </p>
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 mb-3">
            {sponsors.filter(s => s.tier === 'premier').map(s => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={s.name}
                src={s.image}
                alt={s.name}
                title={s.name}
                style={{ height: '84px', width: 'auto', maxWidth: '260px', objectFit: 'contain' }}
              />
            ))}
          </div>
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 mb-2">
            {sponsors.filter(s => s.tier !== 'premier').map(s => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={s.name}
                src={s.image}
                alt={s.name}
                title={s.name}
                style={{
                  height: `${(TIER_SIZE[s.tier] || TIER_SIZE.standard).h}px`,
                  width: 'auto',
                  maxWidth: `${(TIER_SIZE[s.tier] || TIER_SIZE.standard).w}px`,
                  objectFit: 'contain'
                }}
              />
            ))}
          </div>
          <Link href="/business-directory" className="small">Meet our sponsors →</Link>
        </div>
      </section>

      {/* Membership CTA */}
      <section className="py-5">
        <div className="container text-center">
          <h2 className="mb-4">Be part of something special. Become a Member Today!</h2>
          <Link href="/membership" className="btn btn-lake-primary btn-lg">
            Join {ORG_ACRONYM}
          </Link>
        </div>
      </section>

      {/* Event Details Modal */}
      {showModal && selectedEvent && (
        <div className="modal show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{borderBottom: `4px solid ${selectedEvent.color}`}}>
                <div className="d-flex align-items-center">
                  <div className="me-3 text-center" style={{minWidth: '60px'}}>
                    <div className="fw-bold" style={{fontSize: '2rem', lineHeight: '1', color: selectedEvent.color}}>
                      {selectedEvent.day}
                    </div>
                    <small className="text-muted text-uppercase" style={{fontSize: '0.75rem', letterSpacing: '0.5px'}}>
                      {selectedEvent.month}
                    </small>
                  </div>
                  <div>
                    <h4 className="modal-title mb-1">{selectedEvent.title}</h4>
                    <div className="d-flex align-items-center text-muted">
                      <span style={{fontSize: '1.2rem', marginRight: '0.5rem'}}>{selectedEvent.icon}</span>
                      <small>{selectedEvent.type} • {selectedEvent.date}</small>
                    </div>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <h6 className="text-primary mb-2">Overview</h6>
                  <p className="text-muted">{selectedEvent.description}</p>
                </div>
                <div>
                  <h6 className="text-primary mb-2">Details</h6>
                  <p className="text-muted mb-0">{selectedEvent.details}</p>
                </div>
              </div>
                                        <div className="modal-footer">
                            <button 
                              type="button" 
                              className="btn btn-secondary" 
                              onClick={() => setShowModal(false)}
                            >
                              Close
                            </button>
                          </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
