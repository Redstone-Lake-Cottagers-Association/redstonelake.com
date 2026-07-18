'use client'

import { useState } from 'react'

export default function EventSubmissionForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    date: '',
    time: '',
    location: '',
    type: '',
    description: '',
    details: '',
  })
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'fallback' | 'error'>('idle')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const summaryText = () =>
    [
      `Event submission`,
      `Submitted by: ${form.name}`,
      `Email: ${form.email}`,
      form.phone && `Phone: ${form.phone}`,
      `Event: ${form.title}`,
      `Date: ${form.date}`,
      form.time && `Time: ${form.time}`,
      form.location && `Location: ${form.location}`,
      form.type && `Type: ${form.type}`,
      `Description: ${form.description}`,
      form.details && `Details: ${form.details}`,
    ]
      .filter(Boolean)
      .join('\n')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    try {
      const r = await fetch('/api/event-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (r.ok) {
        setState('sent')
      } else if (r.status === 503 || r.status === 502) {
        setState('fallback')
      } else {
        setState('error')
      }
    } catch {
      setState('fallback')
    }
  }

  const mailtoHref = `mailto:communications@redstonelake.com?cc=president@redstonelake.com&subject=${encodeURIComponent(
    `Event submission — ${form.title}`
  )}&body=${encodeURIComponent(summaryText())}`

  if (state === 'sent' || state === 'fallback') {
    return (
      <div className="card lake-card">
        <div className="card-body">
          {state === 'sent' ? (
            <>
              <h5 className="mb-2">✅ Event submitted!</h5>
              <p className="mb-0">
                Thanks, {form.name.split(' ')[0] || 'neighbour'} — your event is on its way to the
                communications team. Once it&rsquo;s reviewed it will appear on the{' '}
                <a href="/events">Events page</a> and the homepage calendar. We&rsquo;ll reach out
                to <strong>{form.email}</strong> if we have questions.
              </p>
            </>
          ) : (
            <>
              <h5 className="mb-2">Almost there — one quick step</h5>
              <p className="small text-muted mb-2">
                Our automated delivery isn&rsquo;t available right now, so please send your event
                by email (it&rsquo;s pre-filled for you):
              </p>
              <a href={mailtoHref} className="btn btn-outline-primary btn-sm mb-3">
                Email my event submission
              </a>
              <textarea
                className="form-control form-control-sm"
                rows={8}
                readOnly
                value={summaryText() + '\n\nSend to: communications@redstonelake.com'}
                onFocus={e => e.currentTarget.select()}
              />
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="card lake-card">
      <div className="card-body">
        <h5 className="mb-3">Tell us about your event</h5>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-semibold mb-1">Your name *</label>
            <input required className="form-control" value={form.name} onChange={e => set('name', e.target.value)} autoComplete="name" />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold mb-1">Your email *</label>
            <input required type="email" className="form-control" value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold mb-1">Phone</label>
            <input type="tel" className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} autoComplete="tel" />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold mb-1">Event type</label>
            <input className="form-control" value={form.type} onChange={e => set('type', e.target.value)} placeholder="e.g. Community Event, Fundraiser" />
          </div>
          <div className="col-12">
            <label className="form-label small fw-semibold mb-1">Event title *</label>
            <input required className="form-control" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Corn Roast & Regatta" />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold mb-1">Date *</label>
            <input required type="date" className="form-control" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-semibold mb-1">Time</label>
            <input className="form-control" value={form.time} onChange={e => set('time', e.target.value)} placeholder="e.g. 2:00 pm" />
          </div>
          <div className="col-md-5">
            <label className="form-label small fw-semibold mb-1">Location</label>
            <input className="form-control" value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Haliburton Forest Centre" />
          </div>
          <div className="col-12">
            <label className="form-label small fw-semibold mb-1">Short description *</label>
            <textarea required className="form-control" rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="One or two sentences shown on event cards." />
          </div>
          <div className="col-12">
            <label className="form-label small fw-semibold mb-1">Full details</label>
            <textarea className="form-control" rows={4} value={form.details} onChange={e => set('details', e.target.value)} placeholder="What to bring, RSVP info, parking/docking notes — anything attendees should know." />
          </div>
        </div>

        <p className="small text-muted mt-3 mb-2">
          Time and location can be left blank if they&rsquo;re not decided yet — we can list the
          event as &ldquo;Not yet announced&rdquo; and update it later.
        </p>

        <div className="d-flex align-items-center gap-3 flex-wrap">
          <button type="submit" className="btn btn-lake-primary" disabled={state === 'sending'}>
            {state === 'sending' ? 'Sending…' : 'Submit Event'}
          </button>
          {state === 'error' && <span className="text-danger small">Something went wrong — please try again.</span>}
        </div>
        <p className="small text-muted mt-2 mb-0">
          Submissions are reviewed by the communications team before appearing on the site.
        </p>
      </div>
    </form>
  )
}
