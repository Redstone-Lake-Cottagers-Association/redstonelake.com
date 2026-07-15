import Link from 'next/link'
import type { Metadata } from 'next'
import { ORG_NAME, ORG_ACRONYM } from '@/lib/branding'

export const metadata: Metadata = {
  title: `Terms of Use | ${ORG_NAME}`,
  description: 'Terms of use for this website.',
}

export default function TermsPage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="mb-2">Terms of Use</h1>
          <p className="text-muted mb-4">Last updated: July 15, 2026</p>

          <div className="article-content">
            <p>
              This website is operated by the {ORG_NAME} (&ldquo;{ORG_ACRONYM}&rdquo;), a
              volunteer-run, not-for-profit association in Haliburton County, Ontario. By using this
              site you agree to these terms.
            </p>

            <h3>Information is provided &ldquo;as is&rdquo;</h3>
            <p>
              Everything on this site is provided in good faith by volunteers, for general
              information only, without warranties of any kind — express or implied — as to
              accuracy, completeness, or timeliness. Nothing on this site constitutes legal,
              safety, environmental, financial, or other professional advice.
            </p>

            <h3>Safety and environmental data</h3>
            <p>
              Water levels, weather, fire-ban status, water quality data and similar information are
              gathered automatically from third-party sources (such as Parks Canada, the Municipality
              of Dysart et al, and the Province of Ontario) and can be delayed, incomplete, or wrong.{' '}
              <strong>
                Always verify safety-critical information — including fire bans and burning rules —
                directly with the responsible authority before acting on it.
              </strong>
            </p>

            <h3>Limitation of liability</h3>
            <p>
              To the fullest extent permitted by law, the {ORG_ACRONYM}, its directors, officers,
              volunteers, and members will not be liable for any loss, injury, or damage of any kind
              arising from the use of this site or reliance on any information it contains, even if
              advised of the possibility of such damage. Your sole remedy for dissatisfaction with
              the site is to stop using it.
            </p>

            <h3>External links and third-party content</h3>
            <p>
              Links to other websites, and listings for local businesses and sponsors, are provided
              for convenience. They are not endorsements, and we are not responsible for the content,
              products, or services of any third party.
            </p>

            <h3>Content and use</h3>
            <p>
              Site content (text, photos, documents) belongs to the association or its contributors.
              You are welcome to share it for personal, non-commercial community purposes with
              attribution; please ask before any other use. You agree not to misuse the site,
              attempt to disrupt it, or harvest information from it.
            </p>

            <h3>Governing law</h3>
            <p>
              These terms are governed by the laws of the Province of Ontario and the federal laws
              of Canada applicable therein.
            </p>

            <h3>Changes</h3>
            <p>
              We may update these terms from time to time; continued use of the site means you
              accept the current version. Questions? <Link href="/contact">Get in touch</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
