import Link from 'next/link'
import type { Metadata } from 'next'
import eventsData from '@/data/events.json'
import { ORG_NAME } from '@/lib/branding'

export const metadata: Metadata = {
  title: `Events | ${ORG_NAME}`,
  description: 'Upcoming and past community events on the Redstone group of lakes.',
}

interface Event {
  id: number
  title: string
  date: string
  day: string
  month: string
  type: string
  icon: string
  color: string
  description: string
  details: string
}

export const dynamic = 'force-dynamic' // "upcoming vs past" depends on today's date

export default function EventsPage() {
  const events = (eventsData as Event[]).slice().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const now = new Date()
  const upcoming = events.filter(e => new Date(e.date) >= now).reverse() // soonest first
  const past = events.filter(e => new Date(e.date) < now)

  const EventCard = ({ event, isPast }: { event: Event; isPast: boolean }) => (
    <div
      className={`card lake-card mb-3 ${isPast ? 'opacity-75' : ''}`}
      style={{ borderLeft: `4px solid ${isPast ? '#6b7280' : event.color}` }}
    >
      <div className="card-body">
        <div className="d-flex gap-3">
          <div className="text-center flex-shrink-0" style={{ minWidth: '56px' }}>
            <div className="fw-bold" style={{ fontSize: '1.6rem', lineHeight: 1, color: isPast ? '#6b7280' : event.color }}>
              {event.day}
            </div>
            <div className="small text-muted fw-semibold">{event.month}</div>
          </div>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-baseline gap-2 flex-wrap">
              <h5 className="mb-1">{event.icon} {event.title}</h5>
              {isPast && <span className="badge bg-secondary">PAST EVENT</span>}
            </div>
            <div className="small text-muted mb-2">{event.date} · {event.type}</div>
            <p className="mb-2">{event.description}</p>
            <p className="small text-muted mb-0">{event.details}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="mb-3">Events</h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: '620px' }}>
          What&rsquo;s happening — and what&rsquo;s happened — around our seven lakes.
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h4 className="mb-3">Upcoming</h4>
          {upcoming.length > 0 ? (
            upcoming.map(e => <EventCard key={e.id} event={e} isPast={false} />)
          ) : (
            <div className="card lake-card mb-3">
              <div className="card-body d-flex align-items-center justify-content-between gap-3 flex-wrap">
                <span className="text-muted">
                  Nothing on the calendar right now — check back soon, or watch the{' '}
                  <Link href="/newsletters">monthly newsletter</Link>.
                </span>
                <a
                  href="mailto:communications@redstonelake.com?subject=Event%20submission"
                  className="btn btn-lake-primary btn-sm flex-shrink-0"
                >
                  Submit an Event
                </a>
              </div>
            </div>
          )}

          {past.length > 0 && (
            <>
              <h4 className="mb-3 mt-5">Past events</h4>
              {past.map(e => <EventCard key={e.id} event={e} isPast={true} />)}
            </>
          )}

          <div className="text-center border-top pt-4 mt-5">
            <p className="text-muted mb-2">
              Running something the lake community should know about?
            </p>
            <a
              href="mailto:communications@redstonelake.com?subject=Event%20submission"
              className="btn btn-outline-primary"
            >
              Submit an Event
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
