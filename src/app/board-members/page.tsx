import type { Metadata } from 'next'
import boardData from '@/data/board-members.json'

export const metadata: Metadata = {
  title: 'Board Members | Redstone Area Lakes Association',
  description: 'The volunteer board of directors and committee members of the Redstone Area Lakes Association.',
}

function initials(name: string) {
  return name.split(' ').map(part => part[0]).join('')
}

function MemberRow({ member }: { member: { name: string; role: string; years: number; emails: string[] } }) {
  return (
    <div className="d-flex align-items-center gap-3 py-3 border-bottom">
      <div
        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
        style={{
          width: '44px',
          height: '44px',
          backgroundColor: 'rgba(3, 105, 161, 0.1)',
          color: '#14536b',
          fontWeight: 700,
          fontSize: '0.9rem',
        }}
      >
        {initials(member.name)}
      </div>
      <div className="flex-grow-1">
        <div className="fw-semibold">{member.name}</div>
        <div className="text-muted small">
          {member.role}
          <span className="ms-2 text-nowrap">· {member.years} {member.years === 1 ? 'year' : 'years'} of service</span>
        </div>
      </div>
      <div className="text-end small">
        {member.emails.map(email => (
          <div key={email}>
            <a href={`mailto:${email}`}>{email}</a>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BoardMembersPage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="text-center mb-5">
            <h1 className="mb-2">Board Members</h1>
            <p className="lead text-muted mb-1">
              Meet the volunteers who keep our lakes and community thriving.
            </p>
            <p className="text-muted small">{boardData.asOf}</p>
          </div>

          <h5 className="text-uppercase text-muted small fw-bold mb-2" style={{ letterSpacing: '0.08em' }}>
            Board of Directors
          </h5>
          <div className="card lake-card mb-4">
            <div className="card-body py-2">
              {boardData.board.map(member => (
                <MemberRow key={member.name} member={member} />
              ))}
            </div>
          </div>

          <h5 className="text-uppercase text-muted small fw-bold mb-2" style={{ letterSpacing: '0.08em' }}>
            Committee
          </h5>
          <div className="card lake-card mb-4">
            <div className="card-body py-2">
              {boardData.committee.map(member => (
                <MemberRow key={member.name} member={member} />
              ))}
            </div>
          </div>

          <p className="text-muted small text-center mb-0">
            Interested in volunteering or joining a committee?{' '}
            <a href="mailto:communications@redstonelake.com">Get in touch</a> — we&apos;d love the help.
          </p>
        </div>
      </div>
    </div>
  )
}
