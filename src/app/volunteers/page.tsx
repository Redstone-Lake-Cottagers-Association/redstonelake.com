import Link from 'next/link'
import type { Metadata } from 'next'
import { ORG_NAME } from '@/lib/branding'

export const metadata: Metadata = {
  title: `Volunteers | ${ORG_NAME}`,
  description: 'Everything the association does is done by volunteers. Here’s how to lend a hand.',
}

const ROLES = [
  {
    icon: '🛟',
    title: 'Buoy Steward',
    text: 'Put a hazard buoy out in the spring and bring it in each fall — we supply the anchor, chain and buoy. Local eyes keep the markers on station all season.',
    contact: 'privatebuoys@redstonelake.com',
    href: '/private-buoys',
    link: 'About the buoy program',
  },
  {
    icon: '🔬',
    title: 'Lake Steward',
    text: 'Take water clarity readings and collect Lake Partner Program samples on your lake through the summer — training and kits provided.',
    contact: 'watershed@redstonelake.com',
    href: '/water-quality-program',
    link: 'About the program',
  },
  {
    icon: '🌿',
    title: 'Healthy Shorelines Champion',
    text: 'Lead our shoreline education efforts — naturalization, erosion, and habitat.',
    contact: 'shorelines@redstonelake.com',
    href: '/healthy-shoreline',
    link: 'Shoreline resources',
    open: true,
  },
  {
    icon: '🎪',
    title: 'Events & Social',
    text: 'Help plan and run the AGM, regatta, and special events that bring the lakes together.',
    contact: 'president@redstonelake.com',
  },
  {
    icon: '📬',
    title: 'Membership & Communications',
    text: 'Help manage memberships, write for the newsletter, or share photos for the galleries.',
    contact: 'membership@redstonelake.com',
  },
  {
    icon: '💻',
    title: 'Web & Technology',
    text: 'This website is open source — fix something directly, or help keep content current.',
    contact: 'webmaster@redstonelake.com',
    href: '/contribute',
    link: 'How to contribute',
  },
]

export default function VolunteersPage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="text-center mb-5">
            <h1 className="mb-3">Volunteer With Us</h1>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '640px' }}>
              Everything the association has accomplished in sixty years — clean water, marked
              hazards, protected shorelines, a real community — has been done by volunteers. You
              don&rsquo;t need to be a board member to help — you just need to be a{' '}
              <Link href="/membership">member of the association</Link>.
            </p>
          </div>

          <div className="row g-3 mb-5">
            {ROLES.map(r => (
              <div key={r.title} className="col-md-6 col-lg-4 d-flex">
                <div className="card lake-card w-100">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="fs-4" aria-hidden="true">{r.icon}</span>
                      <h5 className="mb-0">{r.title}</h5>
                    </div>
                    {r.open && (
                      <span
                        className="badge align-self-start mb-2"
                        style={{ background: '#2f7d5c' }}
                      >
                        VOLUNTEER NEEDED
                      </span>
                    )}
                    <p className="text-muted small flex-grow-1">{r.text}</p>
                    <div className="small">
                      <a href={`mailto:${r.contact}`} className="fw-semibold d-block">{r.contact}</a>
                      {r.href && <Link href={r.href}>{r.link} →</Link>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h3 className="mb-1">Our current volunteers</h3>
          <p className="text-muted small mb-3">
            Roles held by board members are listed on the{' '}
            <Link href="/board-members">Board Members page</Link>.
          </p>
          <div className="row g-3 mb-4">
            <div className="col-md-6 d-flex">
              <div className="card lake-card w-100">
                <div className="card-body">
                  <h5 className="mb-2">🔬 Lake Stewards <span className="badge bg-secondary align-middle" style={{ fontSize: '0.65rem' }}>2026</span></h5>
                  <ul className="list-unstyled small mb-0">
                    {[
                      ['Redstone', 'Lewis McIntosh'],
                      ['Little Redstone', 'Peter Sergejewich'],
                      ['Bitter', 'Laura Sim'],
                      ['Burdock', 'Laurie Kerr'],
                      ['Coleman', 'Chris Jones'],
                      ['Pelaw', 'Ed Payne'],
                      ['Long (Tedious)', 'Frank Wunderlich'],
                    ].map(([lake, name]) => (
                      <li key={lake} className="d-flex justify-content-between border-bottom py-1">
                        <span className="text-muted">{lake}</span>
                        <span>{name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-6 d-flex">
              <div className="card lake-card w-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="mb-2">🛟 Buoy Stewards <span className="badge bg-secondary align-middle" style={{ fontSize: '0.65rem' }}>2026</span></h5>
                  <p className="small mb-2">
                    Peter Sergejewich, Geoffrey North, Barry Smith, Ted Rule, Mike Quinn,
                    Rob Chausse and Paul Kalydy.
                  </p>
                  <p className="text-muted small mb-3">
                    Want your bay&rsquo;s buoy on this list?{' '}
                    <a href="mailto:privatebuoys@redstonelake.com">Volunteer with the buoy program</a>.
                  </p>
                  <h5 className="mb-2 mt-auto">🤝 Committee <span className="badge bg-secondary align-middle" style={{ fontSize: '0.65rem' }}>2026</span></h5>
                  <ul className="list-unstyled small mb-0">
                    <li className="d-flex justify-content-between border-bottom py-1">
                      <span className="text-muted">Information Technology Manager</span>
                      <span>Andrew McGrath</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="card lake-card mb-5" style={{ borderLeft: '4px solid #2f7d5c' }}>
            <div className="card-body py-3">
              <p className="small mb-0">
                <strong>With thanks:</strong> the August 2025 aquatic vegetation surveys of all seven
                lakes were paddled by volunteers Paula Miller, Milt Fullen, Ed Payne, Jeff Hockley,
                Mark Johnson, Gerry Oxford, Frank Wunderlich, and Laurie &amp; Greg Kerr — the surveys
                found healthy native plant communities on every lake.
              </p>
            </div>
          </div>

          <div className="card lake-card mb-5">
            <div className="card-body d-flex align-items-center justify-content-between gap-3 flex-wrap">
              <div>
                <strong>Not sure where you fit?</strong>
                <span className="text-muted">
                  {' '}Tell our volunteer coordinator what you enjoy and how much time you have —
                  there&rsquo;s a job for every schedule.
                </span>
              </div>
              <a href="mailto:president@redstonelake.com" className="btn btn-lake-primary flex-shrink-0">
                Raise Your Hand
              </a>
            </div>
          </div>

          <div className="text-center border-top pt-4">
            <p className="text-muted mb-2">
              Volunteering is also the path to the board — directors are elected each year at the AGM.
            </p>
            <p className="mb-0">
              Meet the current team on the <Link href="/board-members">Board Members page</Link>,
              see <Link href="/initiatives">what our programs do</Link>, or start by{' '}
              <Link href="/membership">becoming a member</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
