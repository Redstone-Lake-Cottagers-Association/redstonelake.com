import Link from 'next/link'
import LakeInfo from '@/components/LakeInfo'
import WaterLevelComponent from '@/components/WaterLevelComponent'

export default function Home() {
  return (
    <>
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

      {/* Main Content Sections */}
      <section className="py-6">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 mb-3">Excellence in Lake Stewardship</h2>
            <p className="lead text-muted">Discover how we're preserving Haliburton's natural treasures</p>
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
                  <h3 className="card-title h4">Make A Difference</h3>
                  <p className="card-text text-muted mb-4">
                    For 60 years, the RLCA has worked as a volunteer-based organization to ensure the quality of our water and the natural environment surrounding our lakes. Join our mission to preserve these pristine waters for future generations to enjoy.
                  </p>
                  <p className="card-text mb-4">
                    <strong className="text-primary">Ready to get involved? We'd love to hear from you.</strong>
                  </p>
                  <div className="mt-auto">
                    <Link href="/volunteers" className="btn btn-lake-primary">
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
                  <h3 className="card-title h4">Water Quality Excellence</h3>
                  <p className="card-text text-muted mb-4">
                    Our comprehensive water quality monitoring program ensures the health and sustainability of Haliburton's lake ecosystem. Through scientific testing and environmental stewardship, we maintain the highest standards of water purity.
                  </p>
                  <div className="mt-auto">
                    <Link href="/water-quality" className="btn btn-lake-primary">
                      Learn More
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
                  <h3 className="card-title h4">New Cottager Welcome</h3>
                  <p className="card-text text-muted mb-4">
                    Welcome to our exclusive cottage community! Our comprehensive guide will help you seamlessly integrate into lake life while understanding the important environmental practices that keep our waters pristine.
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
      <section className="py-6 bg-light">
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


      {/* Recent News */}
      <section className="py-6">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 mb-3">Latest News & Updates</h2>
            <p className="lead text-muted">Stay informed about lake conservation efforts and community initiatives</p>
          </div>
          <div className="row g-4">
            <div className="col-lg-6">
              <article className="news-card h-100">
                <div className="d-flex align-items-start mb-3">
                  <div className="me-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                      width: '48px', 
                      height: '48px', 
                      backgroundColor: 'rgba(30, 64, 175, 0.15)',
                      border: '2px solid rgba(30, 64, 175, 0.3)'
                    }}>
                      <span style={{fontSize: '1.4rem'}}>📅</span>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="mb-2">RLCA Annual General Meeting - July 12th</h5>
                    <div className="d-flex align-items-center text-muted mb-3">
                      <small>July 12, 2024</small>
                    </div>
                  </div>
                </div>
                <p className="text-muted mb-3">The Redstone Lake Cottage Association held its Annual General Meeting on July 12th at 9:00 AM at the Haliburton Forest Center. Community members gathered to discuss lake stewardship initiatives, review the year's activities, and plan for the future of our lake community.</p>
                <Link href="/news/agm-2024" className="fw-semibold">Read AGM Summary →</Link>
              </article>
            </div>

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
                      backgroundColor: 'rgba(5, 150, 105, 0.15)',
                      border: '2px solid rgba(5, 150, 105, 0.3)'
                    }}>
                      <span style={{fontSize: '1.4rem'}}>📊</span>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="mb-2">2025 FOCA AGM & Spring Seminar</h5>
                    <div className="d-flex align-items-center text-muted mb-3">
                      <small>March 14, 2025</small>
                    </div>
                  </div>
                </div>
                <p className="text-muted mb-3">The FOCA AGM & Spring Seminar was held on March 1, 2025. Here is a copy of the Event Summary which includes session overviews and links to PDF copies of all the slides shown during the presentations.</p>
                <Link href="/news/foca-agm-2025" className="fw-semibold">Read Full Article →</Link>
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
    </>
  )
}
