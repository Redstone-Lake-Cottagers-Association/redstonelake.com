'use client'

import Link from 'next/link'
import { useState } from 'react'
import LakeInfo from '@/components/LakeInfo'
import WaterLevelComponent from '@/components/WaterLevelComponent'
import HeroMap from '@/components/HeroMap'

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

  const events: Event[] = [
    {
      id: 1,
      title: "Spring Lake Cleanup",
      date: "May 17, 2025",
      day: "17",
      month: "MAY",
      type: "Community Event",
      status: "upcoming",
      icon: "🌊",
      color: "#0ea5e9",
      description: "Join our annual spring cleanup to maintain the pristine beauty of our lakes. Volunteers will help remove debris, check for invasive species, and prepare our lakes for the summer season.",
      details: "Meet at the Redstone Lake boat launch at 9:00 AM. We'll provide all cleanup supplies, gloves, and refreshments. Bring sun protection and wear clothes you don't mind getting dirty. Event runs rain or shine until 2:00 PM."
    },
    {
      id: 2,
      title: "Fishing Derby",
      date: "June 21, 2025",
      day: "21",
      month: "JUN",
      type: "Competition",
      status: "upcoming",
      icon: "🎣",
      color: "#10b981",
      description: "Annual fishing competition for all ages with prizes and community fun.",
      details: "Registration starts at 6:00 AM at the community dock. Entry fee $10 for adults, $5 for children under 12. Prizes for biggest fish, most fish, and best junior angler. BBQ lunch included with registration. Weigh-in closes at 4:00 PM."
    },
    {
      id: 3,
      title: "RLCA Annual General Meeting",
      date: "July 12, 2025",
      day: "12",
      month: "JUL",
      type: "Annual Meeting",
      status: "upcoming",
      icon: "📅",
      color: "#f59e0b",
      description: "Review the year's activities and plan for the future of our lake community.",
      details: "Held at the Haliburton Forest Center starting at 9:00 AM. Agenda includes financial reports, water quality updates, new member welcome, and planning for 2026 initiatives. Coffee and light refreshments provided. All members encouraged to attend."
    },
    {
      id: 10,
      title: "Summer Solstice Paddle",
      date: "July 21, 2025",
      day: "21",
      month: "JUL",
      type: "Recreation",
      status: "upcoming",
      icon: "🛶",
      color: "#06b6d4",
      description: "Evening paddle to celebrate the longest day of summer with fellow lake enthusiasts.",
      details: "Meet at the main dock at 7:00 PM for a leisurely group paddle around Redstone Lake. We'll watch the sunset from the water and enjoy the peaceful summer evening. Bring your own canoe/kayak or arrange to borrow one. Hot chocolate and snacks provided afterward."
    },
    {
      id: 11,
      title: "Water Safety Workshop",
      date: "July 28, 2025",
      day: "28",
      month: "JUL",
      type: "Educational",
      status: "upcoming",
      icon: "🏊",
      color: "#8b5cf6",
      description: "Essential water safety skills for families and children around the lake.",
      details: "Certified instructor will cover swimming safety, boating basics, and emergency procedures. Perfect for families with children or new cottagers. Includes hands-on practice with life jackets and basic rescue techniques. Registration required, limited to 20 participants."
    },
    {
      id: 4,
      title: "Shoreline Restoration Workshop",
      date: "August 9, 2025",
      day: "09",
      month: "AUG",
      type: "Educational",
      status: "upcoming",
      icon: "🌿",
      color: "#8b5cf6",
      description: "Learn about native plants and techniques for natural shoreline protection.",
      details: "Expert-led workshop covering native plant selection, erosion control, and naturalization techniques. Includes hands-on planting demonstration and take-home native plant starter kit. Limited to 25 participants, advance registration required."
    },
    {
      id: 12,
      title: "Loon Watch Evening",
      date: "August 15, 2025",
      day: "15",
      month: "AUG",
      type: "Wildlife",
      status: "upcoming",
      icon: "🦆",
      color: "#059669",
      description: "Guided evening to observe and learn about the common loons on our lakes.",
      details: "Join our wildlife expert for an evening of loon watching and education. Learn about loon behavior, calls, and conservation efforts. Bring binoculars if you have them (extras provided). Meet at the north shore observation point at 7:30 PM. Weather dependent event."
    },
    {
      id: 13,
      title: "Kids' Nature Scavenger Hunt",
      date: "August 22, 2025",
      day: "22",
      month: "AUG",
      type: "Family Event",
      status: "upcoming",
      icon: "🔍",
      color: "#dc2626",
      description: "Fun nature exploration activity for children and families around the lake area.",
      details: "Interactive scavenger hunt designed for kids ages 5-12 with their families. Explore the shoreline and forest while learning about local plants, animals, and ecosystems. Prizes for all participants and healthy snacks provided. Meet at the community pavilion at 10:00 AM."
    },
    {
      id: 5,
      title: "Fall Community BBQ",
      date: "September 14, 2025",
      day: "14",
      month: "SEP",
      type: "Social Event",
      status: "upcoming",
      icon: "🍂",
      color: "#ef4444",
      description: "End-of-season celebration with food, fellowship, and lake community spirit.",
      details: "Potluck-style BBQ at the community beach. RLCA provides burgers, hot dogs, and beverages. Please bring a side dish to share. Games and activities for all ages. Sunset canoe paddle for interested participants."
    },
    {
      id: 14,
      title: "Fall Photography Contest",
      date: "September 7, 2025",
      day: "07",
      month: "SEP",
      type: "Competition",
      status: "upcoming",
      icon: "📸",
      color: "#7c3aed",
      description: "Capture the beauty of autumn around our lakes in this friendly photography competition.",
      details: "Submit your best fall photos of the lake area taken during September. Categories include landscape, wildlife, and people enjoying the lake. Entry fee $5, with prizes for each category. Deadline for submissions is September 30th. Voting by community members."
    },
    {
      id: 15,
      title: "Dock Removal Workshop",
      date: "September 28, 2025",
      day: "28",
      month: "SEP",
      type: "Maintenance",
      status: "upcoming",
      icon: "🔧",
      color: "#0891b2",
      description: "Learn proper techniques for seasonal dock removal and winter storage.",
      details: "Hands-on workshop covering safe dock removal, hardware maintenance, and proper winter storage techniques. Bring your dock hardware questions! Experienced cottagers will share tips and tricks. Tools and refreshments provided. Meet at the boat launch at 9:00 AM."
    },
    {
      id: 6,
      title: "FOCA AGM & Spring Seminar",
      date: "March 1, 2025",
      day: "01",
      month: "MAR",
      type: "External Event",
      status: "past",
      icon: "📊",
      color: "#6b7280",
      description: "Event summary with session overviews and presentation materials.",
      details: "The Federation of Ontario Cottagers' Associations annual meeting covered lake health monitoring, policy updates, and best practices for cottage associations. Presentation materials and session recordings are available on the FOCA website."
    },
    {
      id: 7,
      title: "RLCA Annual General Meeting",
      date: "July 12, 2024",
      day: "12",
      month: "JUL",
      type: "Annual Meeting",
      status: "past",
      icon: "📅",
      color: "#6b7280",
      description: "Community members discussed lake stewardship and future planning.",
      details: "Well-attended meeting with 45 members present. Key topics included water quality improvements, invasive species monitoring, and budget approval for 2025. Meeting minutes available to all members."
    },
    {
      id: 8,
      title: "Fishing Derby 2024",
      date: "June 22, 2024",
      day: "22",
      month: "JUN",
      type: "Competition",
      status: "past",
      icon: "🎣",
      color: "#6b7280",
      description: "Successful community fishing competition with great participation.",
      details: "Record turnout with 78 participants! Winning fish: 4.2 lb bass caught by Sarah Chen. Junior winner: 2.1 lb pike by 8-year-old Marcus Thompson. Raised $850 for lake conservation efforts."
    },
    {
      id: 9,
      title: "Spring Lake Cleanup 2024",
      date: "May 18, 2024",
      day: "18",
      month: "MAY",
      type: "Community Event",
      status: "past",
      icon: "🌊",
      color: "#6b7280",
      description: "Volunteers helped maintain the pristine beauty of our lakes.",
      details: "Amazing volunteer turnout with 52 community members participating. Collected 340 lbs of debris and identified 3 small areas of invasive plant growth for targeted removal. Thank you to all volunteers!"
    }
  ]

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
                  60 years of protecting seven pristine Haliburton lakes through passionate community stewardship.
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
                <h2 className="display-5 mb-4">About the Redstone Lake Cottage Association</h2>
                <p className="lead text-muted mb-4">
                  For over 60 years, the RLCA has been the dedicated guardian of pristine lakes nestled in the heart of Haliburton's wilderness. Our volunteer-driven community is united by a shared commitment to preserving these natural treasures for current and future generations.
                </p>
                
              </div>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="text-center mb-4">
                <h2 className="h4 mb-2 text-primary">Our Protected Lakes</h2>
                <p className="lead text-muted">
                  From Redstone Lake to Little Redstone, Pelaw, Bitter, Tedious (Long), Burdock, and Coleman Lakes, our stewardship extends across seven pristine waters that form a remarkable ecosystem in the heart of Haliburton's wilderness.
                </p>
              </div>
              <HeroMap />
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
                <div className="card-img-top" style={{
                  background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.8), rgba(14, 165, 233, 0.8)), url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 400 200\'%3E%3Cdefs%3E%3ClinearGradient id=\'lake1\' x1=\'0%25\' y1=\'0%25\' x2=\'0%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%2387CEEB\'/%3E%3Cstop offset=\'100%25\' style=\'stop-color:%23E0F6FF\'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=\'400\' height=\'200\' fill=\'url(%23lake1)\'/%3E%3Cpath d=\'M0 120 Q100 100 200 120 Q300 140 400 120 L400 200 L0 200 Z\' fill=\'%23006400\' opacity=\'0.8\'/%3E%3Cellipse cx=\'200\' cy=\'160\' rx=\'180\' ry=\'30\' fill=\'%230d9488\' opacity=\'0.9\'/%3E%3Cpath d=\'M150 120 L170 90 L190 120 Z\' fill=\'%23228B22\'/%3E%3Cpath d=\'M210 120 L235 85 L260 120 Z\' fill=\'%23228B22\'/%3E%3C/svg%3E")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}></div>
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
                <div className="card-img-top" style={{
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.8), rgba(59, 130, 246, 0.8)), url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 400 200\'%3E%3Cdefs%3E%3ClinearGradient id=\'water2\' x1=\'0%25\' y1=\'0%25\' x2=\'0%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%234A90E2\'/%3E%3Cstop offset=\'100%25\' style=\'stop-color:%230ea5e9\'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=\'400\' height=\'200\' fill=\'url(%23water2)\'/%3E%3Cellipse cx=\'200\' cy=\'140\' rx=\'150\' ry=\'40\' fill=\'%23FFFFFF\' opacity=\'0.3\'/%3E%3Cellipse cx=\'200\' cy=\'140\' rx=\'100\' ry=\'25\' fill=\'%23FFFFFF\' opacity=\'0.2\'/%3E%3Ccircle cx=\'180\' cy=\'60\' r=\'3\' fill=\'%23FFFFFF\' opacity=\'0.8\'/%3E%3Ccircle cx=\'220\' cy=\'80\' r=\'2\' fill=\'%23FFFFFF\' opacity=\'0.6\'/%3E%3Ccircle cx=\'160\' cy=\'90\' r=\'2.5\' fill=\'%23FFFFFF\' opacity=\'0.7\'/%3E%3C/svg%3E")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}></div>
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
                <div className="card-img-top" style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(13, 148, 136, 0.8)), url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 400 200\'%3E%3Cdefs%3E%3ClinearGradient id=\'cottage\' x1=\'0%25\' y1=\'0%25\' x2=\'0%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%2387CEEB\'/%3E%3Cstop offset=\'100%25\' style=\'stop-color:%23E0F6FF\'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=\'400\' height=\'200\' fill=\'url(%23cottage)\'/%3E%3Cpath d=\'M0 140 Q100 120 200 140 Q300 160 400 140 L400 200 L0 200 Z\' fill=\'%23228B22\' opacity=\'0.8\'/%3E%3Crect x=\'150\' y=\'120\' width=\'100\' height=\'60\' fill=\'%238B4513\'/%3E%3Cpolygon points=\'140,120 200,90 260,120\' fill=\'%23A0522D\'/%3E%3Crect x=\'170\' y=\'140\' width=\'15\' height=\'25\' fill=\'%23654321\'/%3E%3Crect x=\'210\' y=\'135\' width=\'20\' height=\'15\' fill=\'%2387CEEB\' opacity=\'0.8\'/%3E%3Cellipse cx=\'200\' cy=\'180\' rx=\'80\' ry=\'15\' fill=\'%230d9488\' opacity=\'0.6\'/%3E%3C/svg%3E")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}></div>
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

      {/* Water Level Monitor Section */}
      <section id="water-level-monitor" className="py-6 bg-light">
        <div className="container">
          <WaterLevelComponent />
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
                      Motors, boats, and Ontario's ecosystems can be ruined by zebra mussels and other aquatic invasive species. Take a few simple steps to preserve our lakes and fisheries: <strong>CLEAN</strong> off any plants or debris, <strong>DRAIN</strong> bilges and ballast water, and <strong>DRY</strong> any wet areas of your boat.
                    </p>
                    <Link href="/clean-drain-dry" className="btn btn-outline-primary btn-sm">
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
                      The wave action created by boats moving at high speeds can wash away shoreline soils, which can harm fish and their habitat. Protect our delicate shoreline ecosystem by maintaining appropriate speeds and distances from shore.
                    </p>
                    <Link href="/shoreline-protection" className="btn btn-outline-primary btn-sm">
                      Watch Protection Video →
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
                      A failing septic system is one of the biggest threats to lake water quality. Have your system inspected every 3 years and pumped every 3-5 years. Use phosphate-free detergents and avoid flushing harmful chemicals that can kill beneficial bacteria.
                    </p>
                    <Link href="/septic-maintenance" className="btn btn-outline-primary btn-sm">
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
                      Natural vegetation along shorelines prevents erosion, filters runoff, and provides critical habitat for wildlife. Maintain a natural buffer zone of at least 30 feet from the water's edge. Avoid using fertilizers and pesticides near the water.
                    </p>
                    <Link href="/shoreline-naturalization" className="btn btn-outline-primary btn-sm">
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
                      Use lead-free tackle to protect loons and other wildlife from poisoning. Follow catch limits and seasonal restrictions. Practice catch-and-release for breeding fish, and never transport live fish between water bodies to prevent species introduction.
                    </p>
                    <Link href="/responsible-fishing" className="btn btn-outline-primary btn-sm">
                      Fishing Guidelines →
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
                                      <div className="text-center mb-4">
                          <h3 className="h4 mb-3 text-primary"> Community Events</h3>
                        </div>
              
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
                        const isEventInPreviousMonth = eventDate.getFullYear() < currentYear || 
                                                      (eventDate.getFullYear() === currentYear && eventDate.getMonth() < currentMonth)
                        
                        return (
                          <div key={event.id} className="col-lg-3 col-md-4 col-sm-6">
                            <div 
                              className={`card border-0 shadow-sm h-100 cursor-pointer hover-lift ${isEventInPreviousMonth ? 'opacity-75' : ''}`}
                              style={{
                                borderLeft: `4px solid ${isEventInPreviousMonth ? '#6b7280' : event.color}`, 
                                cursor: 'pointer'
                              }}
                              onClick={() => openEventModal(event)}
                            >
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
          <div className="row g-4">
            <div className="col-lg-6">
              <article className="news-card h-100">
                <div className="d-flex align-items-start mb-3">
                  <div className="me-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                      width: '48px', 
                      height: '48px', 
                      backgroundColor: 'rgba(249, 115, 22, 0.15)',
                      border: '2px solid rgba(249, 115, 22, 0.3)'
                    }}>
                      <span style={{fontSize: '1.4rem'}}>🦆</span>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="mb-2">Lead Fishing Tackle Endangers Common Loons</h5>
                    <div className="d-flex align-items-center text-muted mb-3">
                      <small>January 15, 2025</small>
                    </div>
                  </div>
                </div>
                <p className="text-muted mb-3">A small amount of lead will cause massive fatal lead poisoning in a loon. It's a terrible death for these legendary birds - and it is so easily avoidable. Learn about our tackle exchange program and get a FREE limited edition custom lure.</p>
                <Link href="/news/lead-fishing-tackle-loons" className="fw-semibold">Read Full Article →</Link>
              </article>
            </div>
            
            <div className="col-lg-6">
              <article className="news-card h-100">
                <div className="d-flex align-items-start mb-3">
                  <div className="me-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                      width: '48px', 
                      height: '48px', 
                      backgroundColor: 'rgba(2, 132, 199, 0.15)',
                      border: '2px solid rgba(2, 132, 199, 0.3)'
                    }}>
                      <span style={{fontSize: '1.4rem'}}>🌡️</span>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="mb-2">Climate Impact on Lake Health</h5>
                    <div className="d-flex align-items-center text-muted mb-3">
                      <small>October 22, 2023</small>
                    </div>
                  </div>
                </div>
                <p className="text-muted mb-3">This July was the warmest on record and we expect to continue to see record-breaking weather in the near future. Understanding how warmer temperatures affect our lake ecosystem is crucial for preservation efforts.</p>
                <Link href="/news/warmer-temperatures-lakes" className="fw-semibold">Read Full Article →</Link>
              </article>
            </div>

            <div className="col-lg-6">
              <article className="news-card h-100">
                <div className="d-flex align-items-start mb-3">
                  <div className="me-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                      width: '48px', 
                      height: '48px', 
                      backgroundColor: 'rgba(13, 148, 136, 0.15)',
                      border: '2px solid rgba(13, 148, 136, 0.3)'
                    }}>
                      <span style={{fontSize: '1.4rem'}}>🚤</span>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="mb-2">CLEAN, DRAIN and DRY Your Boat</h5>
                    <div className="d-flex align-items-center text-muted mb-3">
                      <small>August 28, 2023</small>
                    </div>
                  </div>
                </div>
                <p className="text-muted mb-3">Motors, boats, and Ontario's ecosystems can be ruined by zebra mussels and other aquatic invasive species. Learn the essential steps to protect our lakes and fisheries from invasive species.</p>
                <Link href="/news/clean-drain-dry" className="fw-semibold">Read Full Article →</Link>
              </article>
            </div>

            <div className="col-lg-6">
              <article className="news-card h-100">
                <div className="d-flex align-items-start mb-3">
                  <div className="me-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                      width: '48px', 
                      height: '48px', 
                      backgroundColor: 'rgba(15, 23, 42, 0.15)',
                      border: '2px solid rgba(15, 23, 42, 0.3)'
                    }}>
                      <span style={{fontSize: '1.4rem'}}>🔥</span>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="mb-2">Fire Safety & Fireworks Guidelines</h5>
                    <div className="d-flex align-items-center text-muted mb-3">
                      <small>June 12, 2023</small>
                    </div>
                  </div>
                </div>
                <p className="text-muted mb-3">This summer has been off to a smoky start. Smoke from wildfires in Quebec is causing hazy conditions while dry weather conditions expose us to our own wildfire risks. Stay safe and informed.</p>
                <Link href="/news/fire-ban-fireworks" className="fw-semibold">Read Full Article →</Link>
              </article>
            </div>

            <div className="col-lg-6">
              <article className="news-card h-100">
                <div className="d-flex align-items-start mb-3">
                  <div className="me-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                      width: '48px', 
                      height: '48px', 
                      backgroundColor: 'rgba(168, 85, 247, 0.15)',
                      border: '2px solid rgba(168, 85, 247, 0.3)'
                    }}>
                      <span style={{fontSize: '1.4rem'}}>🧪</span>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="mb-2">Understanding Phosphorus in Lake Ecosystems</h5>
                    <div className="d-flex align-items-center text-muted mb-3">
                      <small>September 15, 2023</small>
                    </div>
                  </div>
                </div>
                <p className="text-muted mb-3">Phosphorus is a key nutrient that affects lake health, but too much can lead to harmful algae blooms. Learn about the sources of phosphorus pollution and how cottagers can help maintain healthy phosphorus levels in our lakes.</p>
                <Link href="/news/phosphorus-lake-ecosystems" className="fw-semibold">Read Full Article →</Link>
              </article>
            </div>

            <div className="col-lg-6">
              <article className="news-card h-100">
                <div className="d-flex align-items-start mb-3">
                  <div className="me-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                      width: '48px', 
                      height: '48px', 
                      backgroundColor: 'rgba(34, 197, 94, 0.15)',
                      border: '2px solid rgba(34, 197, 94, 0.3)'
                    }}>
                      <span style={{fontSize: '1.4rem'}}>🌿</span>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="mb-2">Native Plants for Shoreline Restoration</h5>
                    <div className="d-flex align-items-center text-muted mb-3">
                      <small>May 20, 2023</small>
                    </div>
                  </div>
                </div>
                <p className="text-muted mb-3">Discover which native plants are best for creating natural shoreline buffers that prevent erosion, filter runoff, and provide habitat for local wildlife. A comprehensive guide for cottagers looking to naturalize their waterfront.</p>
                <Link href="/news/native-plants-shoreline" className="fw-semibold">Read Full Article →</Link>
              </article>
            </div>
          </div>
        </div>
      </section>


      {/* Membership CTA */}
      <section className="py-5">
        <div className="container text-center">
          <h2 className="mb-4">Be part of something special. Become a Member Today!</h2>
          <Link href="/membership" className="btn btn-lake-primary btn-lg">
            Join RLCA
          </Link>
        </div>
      </section>

      {/* Event Details Modal */}
      {showModal && selectedEvent && (
        <div className="modal show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
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
