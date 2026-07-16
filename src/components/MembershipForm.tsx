'use client'

import { useState } from 'react'

type Term = '1yr' | '3yr'

export default function MembershipForm() {
  const [form, setForm] = useState({
    primaryName: '',
    primaryEmail: '',
    associateName: '',
    associateEmail: '',
    lakeAddress: '',
    phone: '',
    mailingAddress: '',
    term: '1yr' as Term,
    newsletter: true,
  })
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'fallback' | 'error'>('idle')

  const amount = form.term === '3yr' ? '$80' : '$30'
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const summaryText = () =>
    [
      `Membership registration`,
      `Primary member: ${form.primaryName}`,
      `Primary email: ${form.primaryEmail}`,
      form.associateName && `Associate member: ${form.associateName}`,
      form.associateEmail && `Associate email: ${form.associateEmail}`,
      `Lake address: ${form.lakeAddress}`,
      form.phone && `Phone: ${form.phone}`,
      form.mailingAddress && `Mailing address: ${form.mailingAddress}`,
      `Term: ${form.term === '3yr' ? '3 years ($80)' : '1 year ($30)'}`,
      `Newsletter: ${form.newsletter ? 'Yes' : 'No'}`,
    ]
      .filter(Boolean)
      .join('\n')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    try {
      const r = await fetch('/api/membership', {
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

  const mailtoHref = `mailto:membership@redstonelake.com?cc=president@redstonelake.com&subject=${encodeURIComponent(
    `Membership registration — ${form.primaryName}`
  )}&body=${encodeURIComponent(summaryText())}`

  if (state === 'sent' || state === 'fallback') {
    return (
      <div className="card lake-card">
        <div className="card-body">
          {state === 'sent' ? (
            <>
              <h5 className="mb-2">✅ Registration received!</h5>
              <p className="mb-3">
                Your details are on their way to our membership coordinator. One step left:
              </p>
            </>
          ) : (
            <>
              <h5 className="mb-2">Almost there — two quick steps</h5>
              <p className="small text-muted mb-2">
                Our automated delivery isn&rsquo;t available right now, so please send your
                registration by email (it&rsquo;s pre-filled for you), then pay your dues.
              </p>
              <a href={mailtoHref} className="btn btn-outline-primary btn-sm mb-3">
                1. Email my registration
              </a>
              <textarea
                className="form-control form-control-sm mb-3"
                rows={6}
                readOnly
                value={summaryText() + '\n\nSend to: membership@redstonelake.com'}
                onFocus={e => e.currentTarget.select()}
              />
            </>
          )}
          <div className="p-3 rounded" style={{ background: 'rgba(2,132,199,0.06)', border: '1px solid rgba(2,132,199,0.2)' }}>
            <h6 className="mb-1">{state === 'sent' ? 'Pay your dues' : '2. Pay your dues'} — {amount}</h6>
            <p className="small mb-2">
              Send an Interac e-Transfer® for <strong>{amount}</strong> to{' '}
              <strong>treasurer@redstonelake.com</strong> from your bank.
            </p>
            <a
              href="https://www.interac.ca/en/consumers/products/interac-e-transfer/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-lake-primary btn-sm"
            >
              How to send an Interac e-Transfer →
            </a>
          </div>
          <p className="small text-muted mt-3 mb-0">
            Prefer a cheque? Mail it with your details to RLCA, Box 3, West Guilford, Ontario K0M 2S0.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="card lake-card">
      <div className="card-body">
        <h5 className="mb-3">Join or renew online</h5>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-semibold mb-1">Primary member *</label>
            <input required className="form-control" value={form.primaryName} onChange={e => set('primaryName', e.target.value)} autoComplete="name" />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold mb-1">Primary email *</label>
            <input required type="email" className="form-control" value={form.primaryEmail} onChange={e => set('primaryEmail', e.target.value)} autoComplete="email" />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold mb-1">Associate member</label>
            <input className="form-control" value={form.associateName} onChange={e => set('associateName', e.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold mb-1">Associate email</label>
            <input type="email" className="form-control" value={form.associateEmail} onChange={e => set('associateEmail', e.target.value)} />
          </div>
          <div className="col-md-8">
            <label className="form-label small fw-semibold mb-1">Lake address *</label>
            <input required className="form-control" value={form.lakeAddress} onChange={e => set('lakeAddress', e.target.value)} placeholder="e.g. 1234 North Shore Rd, Redstone Lake" />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold mb-1">Phone</label>
            <input type="tel" className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} autoComplete="tel" />
          </div>
          <div className="col-12">
            <label className="form-label small fw-semibold mb-1">Home mailing address</label>
            <input className="form-control" value={form.mailingAddress} onChange={e => set('mailingAddress', e.target.value)} autoComplete="street-address" />
          </div>
        </div>

        <div className="mt-3">
          <label className="form-label small fw-semibold mb-1 d-block">Membership term *</label>
          <div className="btn-group" role="group" aria-label="Membership term">
            <input type="radio" className="btn-check" name="term" id="term1" checked={form.term === '1yr'} onChange={() => set('term', '1yr')} />
            <label className="btn btn-outline-primary" htmlFor="term1">1 year — $30</label>
            <input type="radio" className="btn-check" name="term" id="term3" checked={form.term === '3yr'} onChange={() => set('term', '3yr')} />
            <label className="btn btn-outline-primary" htmlFor="term3">3 years — $80</label>
          </div>
        </div>

        <div className="form-check mt-3">
          <input className="form-check-input" type="checkbox" id="newsletter" checked={form.newsletter} onChange={e => set('newsletter', e.target.checked)} />
          <label className="form-check-label small" htmlFor="newsletter">
            Yes, keep me up to date with the monthly newsletter!
          </label>
        </div>

        <div className="d-flex align-items-center gap-3 mt-4 flex-wrap">
          <button type="submit" className="btn btn-lake-primary" disabled={state === 'sending'}>
            {state === 'sending' ? 'Sending…' : `Register — then pay ${amount} by e-Transfer`}
          </button>
          {state === 'error' && <span className="text-danger small">Something went wrong — please try again.</span>}
        </div>
        <p className="small text-muted mt-2 mb-0">
          Dues are non-refundable but transfer to new owners. After registering you&rsquo;ll get
          Interac e-Transfer payment instructions.
        </p>
      </div>
    </form>
  )
}
