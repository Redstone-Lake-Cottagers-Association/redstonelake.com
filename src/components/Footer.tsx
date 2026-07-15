import Link from 'next/link'
import { ORG_NAME, ORG_ACRONYM } from '@/lib/branding'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="footer mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-3">
            <h5>Main Menu</h5>
            <ul className="list-unstyled">
              <li><Link href="/" className="text-white-50">Home</Link></li>
              <li><Link href="/water-quality" className="text-white-50">Water Quality</Link></li>
              <li><Link href="/news" className="text-white-50">News</Link></li>
              <li><Link href="/newsletters" className="text-white-50">Newsletters</Link></li>
              <li><Link href="/new-cottager-guide" className="text-white-50">New Cottager Guide</Link></li>
              <li><Link href="/contribute" className="text-white-50">Contribute to This Site</Link></li>
            </ul>
          </div>

          <div className="col-md-3">
            <h5>About Us</h5>
            <ul className="list-unstyled">
              <li><Link href="/about" className="text-white-50">About {ORG_ACRONYM}</Link></li>
              <li><Link href="/membership" className="text-white-50">Membership</Link></li>
              <li><Link href="/board-members" className="text-white-50">Board Members</Link></li>
              <li><Link href="/volunteers" className="text-white-50">Volunteers</Link></li>
              <li><Link href="/governance" className="text-white-50">Governing Docs</Link></li>
              <li><Link href="/agm" className="text-white-50">Annual General Meeting</Link></li>
              <li><Link href="/contact" className="text-white-50">Contact Us</Link></li>
            </ul>
          </div>

          <div className="col-md-3">
            <h5>Community</h5>
            <ul className="list-unstyled">
              <li><Link href="/community-connection" className="text-white-50">Community Connection</Link></li>
              <li><Link href="/galleries" className="text-white-50">Photo Galleries</Link></li>
              <li><Link href="/business-directory" className="text-white-50">Sponsors &amp; Directory</Link></li>
              <li><Link href="/municipal-bylaws" className="text-white-50">Municipal By-Laws</Link></li>
              <li><Link href="/initiatives" className="text-white-50">Initiatives</Link></li>
              <li><Link href="/contests" className="text-white-50">Contests</Link></li>
              <li><Link href="/nature-watch" className="text-white-50">Nature Watch</Link></li>
            </ul>
          </div>

          <div className="col-md-3">
            <h5>Lake Stewardship</h5>
            <ul className="list-unstyled">
              <li><Link href="/make-a-difference" className="text-white-50">Make a Difference</Link></li>
              <li><Link href="/lake-health" className="text-white-50">Lake Health Data</Link></li>
              <li><Link href="/water-quality-program" className="text-white-50">Water Quality Program</Link></li>
              <li><Link href="/healthy-shoreline" className="text-white-50">Healthy Shoreline</Link></li>
              <li><Link href="/septic-systems" className="text-white-50">Septic Systems</Link></li>
              <li><Link href="/get-the-lead-out" className="text-white-50">Get the Lead Out</Link></li>
              <li><Link href="/private-buoys" className="text-white-50">Private Hazard Buoys</Link></li>
            </ul>
            <h5 className="mt-3">Connect With Us</h5>
            <div className="d-flex gap-3">
              <a href="https://www.facebook.com/RedstoneLakeCottagersAssociation/" target="_blank" rel="noopener noreferrer" className="text-white-50">
                Facebook
              </a>
              <a href="https://www.instagram.com/RLCA_Haliburton1/" target="_blank" rel="noopener noreferrer" className="text-white-50">
                Instagram
              </a>
              <a href="https://twitter.com/RLCA_Haliburton" target="_blank" rel="noopener noreferrer" className="text-white-50">
                Twitter
              </a>
            </div>
          </div>
        </div>
        
        <hr className="my-4" />
        
        <div className="row">
          <div className="col-12 text-center">
            <p className="mb-1">&copy; {currentYear} {ORG_NAME}</p>
            <p className="mb-1 small">
              <Link href="/privacy-policy" className="text-white-50">Privacy Policy</Link>
              <span className="text-white-50 mx-2">·</span>
              <Link href="/terms" className="text-white-50">Terms of Use</Link>
            </p>
            <p className="mb-0 text-white-50" style={{ fontSize: '0.78rem' }}>
              Redstone Lake Cottagers Association is an Ontario Not-for-Profit Corporation
              (Ontario Corporation Number 114778), incorporated August 16, 1961.
              Registered office: West Guilford, Ontario, Canada.{' '}
              <a href="https://www.obrpartner.mgcs.gov.on.ca/onbis/corporations/viewInstance/view.pub?id=280aa9d4fbca6577ccb365bb8f57e85a8b028ff989a4417163d9faefb51bbd20&_timestamp=2157795618925474" target="_blank" rel="noopener noreferrer" className="text-white-50" style={{ textDecoration: 'underline' }}>
                View our record in the Ontario Business Registry
              </a>. This site and the domains redstonelake.com, redstonelakes.com and
              redstonelakes.ca are owned and operated by the association.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
} 