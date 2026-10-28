import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Media Package | Redstone Area Lakes Association',
  description:
    'Logos, colours, name usage and approved descriptions of the Redstone Area Lakes Association (RALA) for partners, sponsors, press and volunteers.',
  alternates: { canonical: '/media-package' },
}

const LOGOS = [
  {
    name: 'Horizontal logo',
    tag: 'Primary',
    preview: '/brand/rala-horizontal.png',
    dark: false,
    wide: true,
    use: 'Our main logo. Use it anywhere there is room for a wide mark: website headers, letterhead, email signatures, newsletter mastheads, posters, slides and sponsor listings with a wide slot.',
    files: [
      { label: 'PNG, transparent', href: '/brand/rala-horizontal.png' },
      { label: 'Original JPG', href: '/brand/originals/rala-horizontal-original.jpg' },
    ],
  },
  {
    name: 'Horizontal logo, reversed',
    tag: 'Dark backgrounds',
    preview: '/brand/rala-horizontal-white.png',
    dark: true,
    wide: true,
    use: 'The same logo with white lettering, for dark backgrounds such as slide decks, website footers, banners and photos with a dark, even area.',
    files: [{ label: 'PNG, transparent', href: '/brand/rala-horizontal-white.png' }],
  },
  {
    name: 'Roundel',
    tag: 'Square spaces',
    preview: '/brand/rala-roundel.png',
    dark: false,
    wide: false,
    use: 'Our badge for square or round spaces: the website favicon, social media profile pictures, app icons, stickers, hats, shirts, buoys and signage.',
    files: [
      { label: 'PNG, transparent', href: '/brand/rala-roundel.png' },
      { label: 'Original JPG', href: '/brand/originals/rala-roundel-original.jpg' },
    ],
  },
]

const PLACEMENTS = [
  ['Website header and page banners', 'Horizontal'],
  ['Browser tab icon (favicon) and phone home-screen icon', 'Roundel'],
  ['Facebook, Instagram and other profile pictures', 'Roundel'],
  ['Email signatures, letterhead and newsletters', 'Horizontal'],
  ['Slide decks and the website footer (dark backgrounds)', 'Horizontal, reversed'],
  ['Sponsor and partner listings', 'Horizontal for wide slots, roundel for square slots'],
  ['Stickers, hats, shirts, buoys and signage', 'Roundel'],
  ['Certificates and printed programs', 'Horizontal or roundel'],
]

const COLOURS = [
  { name: 'Redstone Red', hex: '#B2422A', note: 'Ring and lettering' },
  { name: 'Sunrise Gold', hex: '#ECB547', note: 'Sky' },
  { name: 'Lake Blue', hex: '#347091', note: 'Water' },
  { name: 'Hill Green', hex: '#547040', note: 'Far shore' },
  { name: 'Pine Green', hex: '#254230', note: 'Trees and outlines' },
]

const DOS = [
  'Use the files on this page as they are.',
  'Leave clear space around the logo at least as wide as the red ring.',
  'Use the reversed horizontal logo on dark backgrounds.',
  'Keep the horizontal logo at least 120 px (1¼ in) wide and the roundel at least 48 px (½ in) across, so the name stays readable.',
]

const DONTS = [
  'Stretch, squash, rotate or crop the logo.',
  'Change the colours or add shadows, outlines or other effects.',
  'Separate the lake scene from the name, or retype the name in another font.',
  'Place the logo over a busy photo where it is hard to read.',
  'Use the old RLCA logo for anything new.',
]

const FACTS = [
  'Founded in 1961. Letters patent issued August 16, 1961.',
  'Run entirely by volunteers, with a board elected each July at the Annual General Meeting.',
  'Covers seven connected lakes: Redstone, Little Redstone, Pelaw, Bitter, Long (Tedious), Burdock and Coleman.',
  'Located in the Redstone River watershed (235 km²) near West Guilford, in Haliburton County, Ontario.',
  'Volunteers have monitored water quality on our lakes for nearly 30 years.',
  'Programs include hazard buoys, lead-free tackle exchanges, shoreline naturalization and septic education.',
  'Works alongside FOCA (the Federation of Ontario Cottagers’ Associations), Ontario Parks and the Municipality of Dysart et al.',
]

const BOILERPLATE = [
  {
    label: 'One line',
    text: 'The Redstone Area Lakes Association (RALA) is a volunteer-run association protecting the Redstone group of lakes in Haliburton County since 1961.',
  },
  {
    label: 'Short (about 50 words)',
    text: 'The Redstone Area Lakes Association (RALA) is a volunteer-run, not-for-profit association that has looked after the Redstone group of lakes in Haliburton County, Ontario, since 1961. RALA monitors water quality, maintains hazard buoys, promotes healthy shorelines and brings the community together across seven connected lakes.',
  },
  {
    label: 'Long (about 100 words)',
    text: 'The Redstone Area Lakes Association (RALA) is a volunteer-run, not-for-profit association serving the Redstone group of lakes in Haliburton County, Ontario: Redstone, Little Redstone, Pelaw, Bitter, Long (Tedious), Burdock and Coleman. Founded in 1961 as the Redstone Lake Cottagers Association, it took its current name in 2026. For nearly 30 years its volunteers have tracked water quality on the lakes, and today the association also maintains hazard buoys, runs lead-free tackle exchanges, and supports shoreline naturalization and septic education. RALA works alongside FOCA, Ontario Parks and the Municipality of Dysart et al to keep the lakes clean and the community strong. Learn more at redstonelake.com.',
  },
]

export default function MediaPackagePage() {
  return (
    <div className="container py-5 media-package">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="text-center mb-5">
            <h1 className="mb-3">Media Package</h1>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '680px' }}>
              Logos, colours and wording for anyone writing about the Redstone Area Lakes
              Association, including sponsors, partners, press, municipalities and our own
              volunteers.
            </p>
            <a href="/brand/rala-logo-package.zip" className="btn btn-lake-primary" download>
              Download all logos (ZIP)
            </a>
          </div>

          <h2 className="h3 mb-3">Logos</h2>
          <p className="text-muted mb-4">
            We have two logos: the <strong>horizontal logo</strong>, used on the website and
            anywhere wide, and the <strong>roundel</strong>, used in square spaces like browser
            tabs and profile pictures. Pick the one that fits the space.
          </p>
          <div className="row g-4 mb-5 justify-content-center">
            {LOGOS.map(logo => (
              <div key={logo.name} className="col-md-6 d-flex">
                <div className="card lake-card w-100">
                  <div className={`media-logo-preview ${logo.dark ? 'is-dark' : ''}`}>
                    <img
                      src={logo.preview}
                      alt={`${logo.name} of the Redstone Area Lakes Association`}
                      className={logo.wide ? 'is-wide' : 'is-round'}
                    />
                  </div>
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <h3 className="h5 mb-0">{logo.name}</h3>
                      <span className="badge text-bg-light border">{logo.tag}</span>
                    </div>
                    <p className="text-muted small flex-grow-1">{logo.use}</p>
                    <div className="d-flex flex-wrap gap-2">
                      {logo.files.map(f => (
                        <a key={f.href} href={f.href} className="btn btn-outline-primary btn-sm" download>
                          {f.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="h3 mb-3">Which logo goes where</h2>
          <div className="table-responsive mb-5">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th scope="col">Placement</th>
                  <th scope="col">Logo</th>
                </tr>
              </thead>
              <tbody>
                {PLACEMENTS.map(([where, which]) => (
                  <tr key={where}>
                    <td>{where}</td>
                    <td className="fw-semibold">{which}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="h3 mb-3">Using the logos</h2>
          <div className="row g-4 mb-5">
            <div className="col-md-6">
              <div className="card lake-card h-100">
                <div className="card-body">
                  <h3 className="h5 mb-3">Please do</h3>
                  <ul className="mb-0">
                    {DOS.map(d => <li key={d} className="mb-2">{d}</li>)}
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card lake-card h-100">
                <div className="card-body">
                  <h3 className="h5 mb-3">Please don&rsquo;t</h3>
                  <ul className="mb-0">
                    {DONTS.map(d => <li key={d} className="mb-2">{d}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <h2 className="h3 mb-3">Colours</h2>
          <p className="text-muted mb-3">
            Taken from the logo artwork. Use them for accents, headings and backgrounds that sit
            alongside the logo.
          </p>
          <div className="row g-3 mb-5">
            {COLOURS.map(c => (
              <div key={c.hex} className="col-6 col-md">
                <div className="media-swatch" style={{ background: c.hex }} />
                <div className="fw-semibold mt-2">{c.name}</div>
                <div className="small text-muted">
                  <code>{c.hex}</code> · {c.note}
                </div>
              </div>
            ))}
          </div>

          <h2 className="h3 mb-3">Our name</h2>
          <div className="article-content mb-5">
            <p>
              Our name is the <strong>Redstone Area Lakes Association</strong>. After the first
              mention, <strong>RALA</strong> or <strong>the Association</strong> is fine.
            </p>
            <ul>
              <li>
                Write it in full the first time: &ldquo;the Redstone Area Lakes Association
                (RALA)&rdquo;.
              </li>
              <li>
                Write &ldquo;RALA&rdquo; in capitals with no periods, not &ldquo;R.A.L.A.&rdquo; or
                &ldquo;Rala&rdquo;.
              </li>
              <li>
                Watch the plurals: it&rsquo;s &ldquo;Area <em>Lakes</em>&rdquo;, not &ldquo;Area
                Lake&rdquo; or &ldquo;Redstone Lakes Association&rdquo;.
              </li>
              <li>
                We were the <strong>Redstone Lake Cottagers Association (RLCA)</strong> from 1961
                until members voted to change the name at the July 2026 AGM. Use the old name only
                when writing about our history, for example &ldquo;formerly the Redstone Lake
                Cottagers Association&rdquo;.
              </li>
            </ul>
            <p className="small text-muted mb-0">
              <strong>For contracts, cheques and government forms:</strong> use our full legal
              name, Redstone Area Lakes Association (Ontario Corporation Number 114778). See{' '}
              <Link href="/about">About Us</Link> for official details.
            </p>
          </div>

          <h2 className="h3 mb-3">How to describe us</h2>
          <p className="text-muted mb-3">
            You can copy these descriptions as they are, or shorten them to fit.
          </p>
          <div className="mb-4">
            {BOILERPLATE.map(b => (
              <div key={b.label} className="media-boilerplate mb-3">
                <div className="small fw-semibold text-uppercase text-muted mb-1">{b.label}</div>
                <p className="mb-0">{b.text}</p>
              </div>
            ))}
          </div>

          <h3 className="h5 mb-2">Key facts</h3>
          <ul className="mb-4">
            {FACTS.map(f => <li key={f} className="mb-1">{f}</li>)}
          </ul>

          <h3 className="h5 mb-2">Tone</h3>
          <p className="mb-5">
            We&rsquo;re neighbours looking after the lakes we love. Write in plain, friendly
            language, back up claims with our monitoring data where you can, and give credit to
            the volunteers who do the work.
          </p>

          <div className="border-top pt-4">
            <h2 className="h5 mb-2">Questions or other formats</h2>
            <p className="small text-muted mb-0">
              Need a different file format, a one-colour version or help with a placement? Email{' '}
              <a href="mailto:communications@redstonelake.com">communications@redstonelake.com</a>{' '}
              or visit our <Link href="/contact">contact page</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
