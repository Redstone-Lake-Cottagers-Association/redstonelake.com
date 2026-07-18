import Link from 'next/link'
import type { Metadata } from 'next'
import EventSubmissionForm from '@/components/EventSubmissionForm'
import { ORG_NAME } from '@/lib/branding'

export const metadata: Metadata = {
  title: `Submit an Event | ${ORG_NAME}`,
  description: 'Share a community event with the lake community.',
}

export default function SubmitEventPage() {
  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <h1 className="mb-3">Submit an Event</h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: '620px' }}>
          Running something the lake community should know about? Tell us the details and
          we&rsquo;ll get it on the <Link href="/events">events calendar</Link>.
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <EventSubmissionForm />
        </div>
      </div>
    </div>
  )
}
