import Link from 'next/link'
import type { Metadata } from 'next'
import { ORG_NAME, ORG_ACRONYM } from '@/lib/branding'

export const metadata: Metadata = {
  title: `Privacy Policy | ${ORG_NAME}`,
  description: 'How the association collects, uses and protects personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="mb-2">Privacy Policy</h1>
          <p className="text-muted mb-4">Last updated: July 15, 2026</p>

          <div className="article-content">
            <p>
              The {ORG_NAME} (&ldquo;{ORG_ACRONYM}&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a
              volunteer-run, not-for-profit cottagers&rsquo; association in Haliburton County,
              Ontario. We respect your privacy and handle personal information in accordance with
              Canada&rsquo;s <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA).
            </p>

            <h3>What we collect</h3>
            <ul>
              <li>
                <strong>Membership information.</strong> When you join the association we collect
                your name, contact details, and lake property information so we can administer your
                membership, deliver member benefits, and communicate with you.
              </li>
              <li>
                <strong>Newsletter subscriptions.</strong> Our email newsletter is delivered through
                Mailchimp. Your email address is stored with that service and used only to send you
                association news. Every issue includes an unsubscribe link.
              </li>
              <li>
                <strong>Correspondence.</strong> If you email us, we keep the correspondence for as
                long as needed to deal with your inquiry.
              </li>
              <li>
                <strong>Website visits.</strong> This website does not use advertising, tracking
                cookies, or analytics profiles. Our hosting provider keeps ordinary technical server
                logs (such as IP addresses) for security and reliability purposes.
              </li>
            </ul>

            <h3>What we don&rsquo;t do</h3>
            <ul>
              <li>We do not sell, rent, or trade personal information — ever.</li>
              <li>We do not send marketing on behalf of third parties.</li>
              <li>We collect only what we need to run the association, and keep it only as long as needed.</li>
            </ul>

            <h3>Photos and community content</h3>
            <p>
              We occasionally publish photos from community events and member submissions. If a photo
              of you or your property appears on this site and you would like it removed, contact us
              and we will take it down promptly.
            </p>

            <h3>Third-party services</h3>
            <p>
              Parts of this site display information from external services — Parks Canada water
              levels, weather data, provincial water quality datasets, and links to newsletters
              hosted on Mailchimp. Following links to external websites is subject to those sites&rsquo;
              own privacy policies.
            </p>

            <h3>Your rights</h3>
            <p>
              You may ask us at any time what personal information we hold about you, ask us to
              correct it, or ask us to delete it (subject to any records we must keep as a
              corporation). Contact{' '}
              <a href="mailto:communications@redstonelake.com">communications@redstonelake.com</a>{' '}
              and we will respond as quickly as our volunteers can.
            </p>

            <h3>Changes</h3>
            <p>
              We may update this policy from time to time. The &ldquo;last updated&rdquo; date above
              reflects the current version. Questions? <Link href="/contact">Get in touch</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
