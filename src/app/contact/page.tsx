import Link from 'next/link'
import type { Metadata } from 'next'
import { ORG_NAME } from '@/lib/branding'

export const metadata: Metadata = {
  title: `Contact Us | ${ORG_NAME}`,
  description: `Get in touch with the ${ORG_NAME}.`,
}

const contacts = [
  {
    department: 'Membership Inquiries',
    email: 'membership@redstonelake.com',
    description: 'Joining the association, renewals and member benefits.',
  },
  {
    department: 'General Inquiries & Communications',
    email: 'communications@redstonelake.com',
    description: 'Questions, news tips, newsletter and general association matters.',
  },
  {
    department: 'Treasurer',
    email: 'treasurer@redstonelake.com',
    description: 'Payments, dues and financial matters.',
  },
  {
    department: 'Website & Technical Support',
    email: 'website@redstonelake.com',
    description: 'Report a problem with this website or request an update.',
  },
]

export default function ContactPage() {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">Contact Us</h1>
        <p className="lead text-muted">
          We’re looking for new members to join our Cottagers Association. Want to know about the
          benefits that come with a membership? Send us an email.
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="row g-4">
            {contacts.map(c => (
              <div key={c.email} className="col-md-6 d-flex">
                <div className="card lake-card h-100 w-100">
                  <div className="card-body">
                    <h5 className="card-title">{c.department}</h5>
                    <p className="text-muted">{c.description}</p>
                    <a href={`mailto:${c.email}`} className="fw-semibold">{c.email}</a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card lake-card mt-4">
            <div className="card-body text-center">
              <h5>Be part of something special. Become a Member today!</h5>
              <Link href="/membership" className="btn btn-lake-primary mt-2">Join RLCA</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
