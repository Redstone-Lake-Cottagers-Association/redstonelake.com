import Link from 'next/link'

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
            </ul>
          </div>

          <div className="col-md-3">
            <h5>About Us</h5>
            <ul className="list-unstyled">
              <li><Link href="/about" className="text-white-50">About RALA</Link></li>
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
              <li><Link href="/sponsors" className="text-white-50">Our Sponsors</Link></li>
              <li><Link href="/business-directory" className="text-white-50">Business Directory</Link></li>
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
            <p className="mb-0">&copy; {currentYear} Redstone Area Lakes Association</p>
          </div>
        </div>
      </div>
    </footer>
  )
} 