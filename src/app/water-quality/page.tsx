export default function WaterQuality() {
  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8">
          <h1 className="display-4 mb-4">Water Quality</h1>
          
          <div className="card lake-card mb-4">
            <div className="card-body">
              <h3>Protecting Our Lakes</h3>
              <p>
                Our lakes, rivers, and associated natural environmental features support Haliburton's way of life and our stewardship is central to the creation of a Shoreline Preservation By-law. Building on current legislation, policies, and by-laws, the proposed by-law includes but is not limited to:
              </p>
              
              <ul>
                <li>Setback requirements for buildings and structures</li>
                <li>Vegetation protection and enhancement</li>
                <li>Stormwater management</li>
                <li>Erosion and sediment control</li>
                <li>Dock and waterfront structure guidelines</li>
              </ul>
            </div>
          </div>

          <div className="card lake-card mb-4">
            <div className="card-body">
              <h3>Water Testing Program</h3>
              <p>
                The RLCA conducts regular water quality testing throughout the summer months to monitor the health of our lakes. Our testing program includes:
              </p>
              
              <div className="row">
                <div className="col-md-6">
                  <h5>Parameters Tested</h5>
                  <ul>
                    <li>Total Phosphorus</li>
                    <li>Chlorophyll-a</li>
                    <li>Water clarity (Secchi depth)</li>
                    <li>Temperature profiles</li>
                    <li>Dissolved oxygen</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h5>Testing Schedule</h5>
                  <ul>
                    <li>May through October</li>
                    <li>Monthly sampling</li>
                    <li>Multiple lake locations</li>
                    <li>Professional lab analysis</li>
                    <li>Annual reporting</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="card lake-card mb-4">
            <div className="card-body">
              <h3>How You Can Help</h3>
              <p>Every cottager and visitor can contribute to maintaining our water quality:</p>
              
              <div className="row">
                <div className="col-md-6">
                  <h5>Septic Systems</h5>
                  <ul>
                    <li>Regular pumping and maintenance</li>
                    <li>Use phosphate-free detergents</li>
                    <li>Avoid excessive water usage</li>
                    <li>Never flush harmful chemicals</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h5>Shoreline Care</h5>
                  <ul>
                    <li>Maintain natural vegetation</li>
                    <li>Avoid fertilizers near water</li>
                    <li>Control erosion</li>
                    <li>Minimize impervious surfaces</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card lake-card mb-4">
            <div className="card-body">
              <h5>Quick Links</h5>
              <ul className="list-unstyled">
                <li><a href="/lake-health" className="text-decoration-none">Lake Health Data Explorer</a></li>
                <li><a href="/#water-level-monitor" className="text-decoration-none">Live Water Level Monitoring</a></li>
                <li><a href="/healthy-shoreline" className="text-decoration-none">Healthy Shoreline Guide</a></li>
                <li><a href="/septic-systems" className="text-decoration-none">Septic Systems Information</a></li>
                <li><a href="/get-the-lead-out" className="text-decoration-none">Get the Lead Out (protect our loons)</a></li>
                <li><a href="/contact" className="text-decoration-none">Report Water Quality Issues</a></li>
              </ul>
            </div>
          </div>

          <div className="card lake-card">
            <div className="card-body">
              <h5>Latest Lake Health Data</h5>
              <p>Environmental monitoring and research findings for our lakes were presented at the 2026 Annual General Meeting.</p>
              <a href="/documents/agm/AGM_2026Presentation_JKidd.pptx" className="btn btn-lake-primary mb-2">Download 2026 Presentation</a>
              <div><a href="/agm" className="small">Past years&apos; reports →</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 