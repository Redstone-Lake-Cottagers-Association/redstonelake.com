import Link from 'next/link'

export default function Membership() {
  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8">
          <h1 className="display-4 mb-4">Become a Member Today!</h1>
          
          <div className="card lake-card mb-4">
            <div className="card-body">
              <h3>Why Join RLCA?</h3>
              <p className="lead">
                Take advantage of all the great benefits that you will get with your new membership.
              </p>
              
              <div className="row">
                <div className="col-md-6">
                  <h5>Member Benefits</h5>
                  <ul>
                    <li>Annual General Meeting participation</li>
                    <li>Quarterly newsletters</li>
                    <li>Access to water quality reports</li>
                    <li>Community event invitations</li>
                    <li>Voice in lake preservation decisions</li>
                    <li>Business directory listing (if applicable)</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h5>Membership Types</h5>
                  <ul>
                    <li><strong>Individual:</strong> $50/year</li>
                    <li><strong>Family:</strong> $75/year</li>
                    <li><strong>Business:</strong> $100/year</li>
                    <li><strong>Lifetime:</strong> $500 one-time</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="card lake-card mb-4">
            <div className="card-body">
              <h3>What Your Membership Supports</h3>
              <p>
                Your membership fees directly support our mission to protect and preserve the lakes for future generations:
              </p>
              
              <ul>
                <li>Water quality monitoring and testing programs</li>
                <li>Environmental education and awareness initiatives</li>
                <li>Shoreline preservation projects</li>
                <li>Community events and programs</li>
                <li>Advocacy for responsible lake management</li>
                <li>Support for local environmental research</li>
              </ul>
            </div>
          </div>

          <div className="card lake-card">
            <div className="card-body">
              <h3>Join Online or by Mail</h3>
              <div className="row">
                <div className="col-md-6">
                  <h5>Online Registration</h5>
                  <p>Complete our secure online form and pay instantly with credit card or PayPal.</p>
                  <button className="btn btn-lake-primary btn-lg">Join Online</button>
                </div>
                <div className="col-md-6">
                  <h5>Mail-in Registration</h5>
                  <p>Download our membership form and mail with your payment to:</p>
                  <address>
                    <strong>RLCA Membership</strong><br />
                    P.O. Box 123<br />
                    Haliburton, ON K0M 1S0
                  </address>
                  <a href="#" className="btn btn-outline-primary">Download Form</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card lake-card mb-4">
            <div className="card-body">
              <h5>Quick Facts</h5>
              <ul className="list-unstyled">
                <li><strong>Founded:</strong> 1964</li>
                <li><strong>Members:</strong> 500+ families</li>
                <li><strong>Lakes Protected:</strong> 7</li>
                <li><strong>Volunteer Hours:</strong> 2000+ annually</li>
              </ul>
            </div>
          </div>

          <div className="card lake-card mb-4">
            <div className="card-body">
              <h5>Contact Us</h5>
              <p>Questions about membership?</p>
              <Link href="/contact" className="btn btn-lake-primary">Contact RLCA</Link>
            </div>
          </div>

          <div className="card lake-card">
            <div className="card-body">
              <h5>Volunteer Opportunities</h5>
              <p>Interested in getting more involved? We have many volunteer opportunities available.</p>
              <Link href="/volunteers" className="btn btn-outline-primary">Learn More</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 