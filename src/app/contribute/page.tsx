import Link from 'next/link'
import type { Metadata } from 'next'
import { ORG_NAME } from '@/lib/branding'

export const metadata: Metadata = {
  title: `Contribute to This Website | ${ORG_NAME}`,
  description:
    'This website is open source. Learn how to propose a change, report a problem, or submit an improvement on GitHub.',
}

const REPO = 'https://github.com/Redstone-Lake-Cottagers-Association/redstonelake.com'

export default function ContributePage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="text-center mb-5">
            <h1 className="mb-3">Contribute to This Website</h1>
            <p className="lead text-muted">
              This website is open source and maintained by volunteers. Spotted a mistake, have an
              idea, or want to build something? We&rsquo;d love your help.
            </p>
            <a href={REPO} target="_blank" rel="noopener noreferrer" className="btn btn-lake-primary">
              View the Code on GitHub
            </a>
          </div>

          <h3 className="mb-3">Three ways to contribute</h3>
          <div className="row g-3 mb-5">
            <div className="col-md-4 d-flex">
              <div className="card lake-card w-100">
                <div className="card-body">
                  <h5 className="mb-2">💡 Suggest</h5>
                  <p className="text-muted small mb-2">
                    Not technical? No problem — email your idea or correction to{' '}
                    <a href="mailto:website@redstonelake.com">website@redstonelake.com</a> and a
                    volunteer will take it from there.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 d-flex">
              <div className="card lake-card w-100">
                <div className="card-body">
                  <h5 className="mb-2">🐛 Report</h5>
                  <p className="text-muted small mb-2">
                    Found a broken link, wrong information, or a bug?{' '}
                    <a href={`${REPO}/issues/new`} target="_blank" rel="noopener noreferrer">
                      Open an issue on GitHub
                    </a>{' '}
                    describing what you found.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 d-flex">
              <div className="card lake-card w-100">
                <div className="card-body">
                  <h5 className="mb-2">🔧 Build</h5>
                  <p className="text-muted small mb-2">
                    Comfortable with code? Fork the repository, make your change, and{' '}
                    <a href={`${REPO}/pulls`} target="_blank" rel="noopener noreferrer">
                      submit a pull request
                    </a>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <h3 className="mb-3">Conventions</h3>
          <div className="article-content mb-4">
            <h5>Opening an issue</h5>
            <ul>
              <li>Use a clear, specific title (&ldquo;Broken link on the Membership page&rdquo; beats &ldquo;website problem&rdquo;).</li>
              <li>Include the page address, what you expected, and what you saw instead. Screenshots help a lot.</li>
              <li>For content corrections (dates, names, rules), include a source we can verify.</li>
            </ul>

            <h5>Submitting a pull request</h5>
            <ul>
              <li>Keep each pull request focused on one change — small PRs get reviewed faster.</li>
              <li>Describe <em>what</em> you changed and <em>why</em> in the PR description.</li>
              <li>Match the existing style of the code and content around your change.</li>
              <li>Test locally first: <code>npm install &amp;&amp; npm run dev</code>, then check your change in the browser.</li>
              <li>Never include passwords, API keys, or personal information in a contribution.</li>
              <li>Safety-related content (fire rules, water conditions, by-laws) must cite an official source.</li>
            </ul>

            <h5>How review works</h5>
            <p>
              A volunteer site manager reviews every suggestion, issue, and pull request — and we&rsquo;re
              grateful for all of them. Please know that we may not accept a proposed change exactly
              as submitted: the board is responsible for what the association publishes, so we may
              ask you to revise it, or adapt your idea into a future update ourselves. Either way,
              your input shapes the site.
            </p>
            <p>
              By contributing, you agree your contribution is licensed under the project&rsquo;s MIT
              License, with no expectation of payment.
            </p>
          </div>

          <p className="text-center text-muted small mb-0">
            Questions about contributing? <Link href="/contact">Get in touch</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
