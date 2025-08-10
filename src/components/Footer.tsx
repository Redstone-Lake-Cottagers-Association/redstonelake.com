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
              <li><Link href="/new-cottager-guide" className="text-white-50">New Cottager's Guide</Link></li>
              <li><Link href="/community-connection" className="text-white-50">Community Connection</Link></li>
            </ul>
          </div>
          
          <div className="col-md-3">
            <h5>About Us</h5>
            <ul className="list-unstyled">
              <li><Link href="/about" className="text-white-50">About RLCA</Link></li>
              <li><Link href="/board-members" className="text-white-50">Board Members</Link></li>
              <li><Link href="/governing-docs" className="text-white-50">Governing Docs</Link></li>
              <li><Link href="/volunteers" className="text-white-50">Volunteers</Link></li>
              <li><Link href="/contact" className="text-white-50">Contact Us</Link></li>
            </ul>
          </div>
          
          <div className="col-md-3">
            <h5>Community Links</h5>
            <ul className="list-unstyled">
              <li><Link href="/news" className="text-white-50">News</Link></li>
              <li><Link href="/municipal-bylaws" className="text-white-50">Municipal By-Laws</Link></li>
              <li><Link href="/initiatives" className="text-white-50">Initiatives</Link></li>
              <li><Link href="/contests" className="text-white-50">RLCA Contests</Link></li>
              <li><Link href="/privacy-policy" className="text-white-50">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div className="col-md-3">
            <h5>Connect With Us</h5>
            <div className="d-flex gap-3">
              <a href="#" className="text-white-50">
                <i className="fab fa-facebook-f"></i> Facebook
              </a>
              <a href="#" className="text-white-50">
                <i className="fab fa-instagram"></i> Instagram
              </a>
              <a href="#" className="text-white-50">
                <i className="fab fa-twitter"></i> Twitter
              </a>
            </div>
          </div>
        </div>
        
        <hr className="my-4" />
        
        <div className="row">
          <div className="col-12 text-center">
            <p className="mb-0">&copy; {currentYear} Redstone Lake Cottagers Association</p>
          </div>
        </div>
      </div>
    </footer>
  )
} 