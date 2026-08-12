import type { Metadata } from 'next'
import Link from 'next/link'
import {
  AlertTriangle,
  Anchor,
  ArrowDown,
  CheckCircle2,
  Gauge,
  Map,
  Scale,
  Waves,
} from 'lucide-react'
import WakeZoneMap from '@/components/WakeZoneMap'
import WakeMapOverview from '@/components/WakeMapOverview'
import WakeSimulator from '@/components/WakeSimulator'
import { ORG_NAME } from '@/lib/branding'

export const metadata: Metadata = {
  title: `Watch Your Wake | ${ORG_NAME}`,
  description:
    'Answers about Ontario’s 30-metre near-shore speed rule, water-sports distances, towing safety, wake behaviour and shoreline zones for all seven Redstone area lakes.',
  alternates: { canonical: 'https://redstonelake.com/watch-your-wake' },
  openGraph: {
    title: `Watch Your Wake | ${ORG_NAME}`,
    description: 'Ontario wake rules, evidence-based shoreline distances and water-sports guidance for the Redstone area lakes.',
    url: 'https://redstonelake.com/watch-your-wake',
    type: 'article',
  },
}

const wakeFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Which Redstone area lakes can I do water sports on?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For the high-wake activities addressed on this page, only Redstone Lake currently has a practical blue area that is at least 300 metres from every mapped shoreline. The other mapped lakes do not provide enough room to meet this page’s precautionary 300-metre standard for high-wake water sports. This is a local planning recommendation, not a declaration that an activity is legally permitted or prohibited.',
      },
    },
    {
      '@type': 'Question',
      name: 'How far from the shoreline should I be when doing water sports?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For tubing, waterskiing, wakeboarding and especially wakesurfing, this page recommends using the mapped blue area at least 300 metres from every shoreline. University of Minnesota testing found that wakesurf boats operating typically needed more than 500 feet, about 152 metres, for wake height, energy and power to fall to levels similar to the two typical planing tow-sport boats tested. The 300-metre boundary is an added local margin, not a universal safe distance.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is 300 metres from shore a legal requirement in Ontario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Ontario’s general federal rule prohibits operating a power-driven or electrically propelled vessel above 10 kilometres per hour within 30 metres of shore, subject to listed exceptions. The 300-metre distance on this page is a conservative local planning recommendation for high-wake activities, not a law.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I tow a skier or tube inside 30 metres of shore?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The federal 10-kilometre-per-hour rule has an exception for a vessel towing a person when it follows a course away from and perpendicular to shore. That narrow exception does not make parallel-to-shore towing or a large wake near people, docks or vulnerable shoreline responsible, and all other safe-operation and towing rules still apply.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the Canadian safety requirements when towing a rider?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A person other than the operator must watch every person being towed and communicate with the operator. The boat needs seating space for every towed person, required flotation must be worn or carried as specified by the regulation, and towing is prohibited during restricted visibility and from one hour after sunset until sunrise. Wearing an approved lifejacket or personal flotation device is the safer choice.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can a slower boat make a larger wake?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. In one published example summarized by a 2017 technical review, the same 16-foot Boston Whaler produced a 22-centimetre maximum wave at 19 kilometres per hour and a smaller 13-centimetre wave at 44 kilometres per hour, both measured 50 metres from the boat path. A bow-high boat plowing through transition can displace more water than the same hull running cleanly on plane.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do engine power, trim, load and towing change a wake?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'These settings change hull attitude, displacement and drag, so speed alone cannot determine wake size. High power at low speed, bow-high trim, extra load or a tow can increase the wake. The simulator is an educational comparison calibrated to one published boat example, not a prediction for a particular vessel. Watch the wake your boat is actually producing.',
      },
    },
    {
      '@type': 'Question',
      name: 'What should I check before making wake?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Check for swimmers, paddlers, anglers, small craft, docks, moored boats, nesting wildlife and soft or steep shorelines. Canadian safe-operation rules require operators to consider circumstances that could create danger and to avoid endangering people involved in activities on the water. Distance alone does not make a wake safe.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are the shoreline-distance maps exact or suitable for navigation?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The maps are planning aids calculated from Ontario shoreline polygons in a local metre projection. Water level, islands, shoreline-data age and map accuracy can change the real distance. Use current charts, on-water measurements and good judgment; these maps are not navigation charts, surveys or legal determinations.',
      },
    },
  ],
}

const habits = [
  {
    icon: Gauge,
    title: 'Inside 30 metres',
    text: 'Stay at or below 10 km/h and use the lowest-wake setting your boat can maintain. Usually that means true idle, bow down.',
  },
  {
    icon: Map,
    title: 'Use the mapped 300m+ area',
    text: 'Keep wakesurfing and other high-wake water sports inside the blue 300-metre-plus area. It is a precautionary local margin—not a guarantee of zero impact.',
  },
  {
    icon: Waves,
    title: 'Avoid the plowing zone',
    text: 'Wake size changes across displacement, transition and planing speeds. Avoid lingering bow-high in the transition range.',
  },
  {
    icon: Anchor,
    title: 'Look beyond the boat',
    text: 'Your wake keeps travelling after you pass. Check docks, paddlers, anglers, swimmers, nests and soft or steep banks before adding throttle.',
  },
]

function WakeComparison() {
  return (
    <div className="wake-comparison" aria-label="Comparison of planing and transitional boat wakes">
      <article className="wake-scenario wake-scenario-plane">
        <div className="wake-scenario-copy">
          <span className="wake-example-badge">Measured example · same 16 ft boat</span>
          <h3>Faster, fully on plane</h3>
          <p>
            Hydrodynamic lift raises more of the hull out of the water, so the boat displaces less
            water. Speed alone does not tell you the wake size.
          </p>
        </div>
        <div className="wake-side-illustration" aria-hidden="true">
          <div className="wake-sky-label">Side view</div>
          <div className="wake-boat boat-planing"><i /><b /></div>
          <div className="wake-wave wake-wave-small one" />
          <div className="wake-wave wake-wave-small two" />
          <div className="wake-waterline" />
        </div>
        <div className="wake-stat-row">
          <span><strong>44 km/h</strong> boat speed</span>
          <span><strong>13 cm</strong> maximum wave at 50 m</span>
        </div>
        <div className="wake-top-illustration" aria-hidden="true">
          <div className="wake-top-label">Top view</div>
          <div className="top-boat top-boat-plane" />
          <div className="wake-cone wake-cone-small" />
          <div className="top-distance"><i />50 m to shore</div>
          <div className="top-shore"><span>shoreline</span></div>
          <div className="top-course">Course parallel to shore <b>↓</b></div>
          <div className="top-arrival">about 20–35 sec</div>
        </div>
      </article>

      <article className="wake-scenario wake-scenario-plow">
        <div className="wake-scenario-copy">
          <span className="wake-example-badge">Measured example · same 16 ft boat</span>
          <h3>Slower, but still plowing</h3>
          <p>
            The hull sits deeper and pushes a larger volume aside. A heavy load, stern-down trim or
            sustained throttle in transition can make this effect worse.
          </p>
        </div>
        <div className="wake-side-illustration" aria-hidden="true">
          <div className="wake-sky-label">Side view</div>
          <div className="wake-boat boat-plowing"><i /><b /></div>
          <div className="wake-wave wake-wave-large one" />
          <div className="wake-wave wake-wave-large two" />
          <div className="wake-waterline" />
        </div>
        <div className="wake-stat-row">
          <span><strong>19 km/h</strong> boat speed</span>
          <span><strong>22 cm</strong> maximum wave at 50 m</span>
        </div>
        <div className="wake-top-illustration" aria-hidden="true">
          <div className="wake-top-label">Top view</div>
          <div className="top-boat top-boat-plow" />
          <div className="wake-cone wake-cone-large" />
          <div className="top-distance"><i />50 m to shore</div>
          <div className="top-shore"><span>shoreline</span></div>
          <div className="top-course">Course parallel to shore <b>↓</b></div>
          <div className="top-arrival">about 20–35 sec</div>
        </div>
      </article>
    </div>
  )
}

export default function WatchYourWakePage() {
  return (
    <div className="wake-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(wakeFaqJsonLd).replace(/</g, '\\u003c') }}
      />
      <section className="wake-hero">
        <div className="container wake-hero-grid">
          <div>
            <span className="wake-eyebrow">Respect the lake. Protect the shore.</span>
            <h1>Watch your wake</h1>
            <p className="wake-hero-lead">
              Find your lake in the map previews below, then see where near-shore speed limits,
              low-wake transit and water sports belong. Slow does not always mean a small wake—your
              operating choices still matter in every zone.
            </p>
            <div className="wake-hero-actions">
              <a href="#lake-map-previews" className="btn btn-light btn-lg">Compare all seven maps</a>
              <a href="#lake-maps" className="btn btn-outline-light btn-lg">Open the detailed maps</a>
            </div>
          </div>
          <div className="wake-rule-sign" aria-label="10 kilometres per hour maximum within 30 metres of shore, plus 300 metres or more for high-wake water sports">
            <div className="wake-rule-roundel">
              <span>MAX</span>
              <strong>10</strong>
              <small>km/h</small>
            </div>
            <div className="wake-rule-copy">
              <strong>within 30 m of shore</strong>
              <span>Federal speed rule in Ontario</span>
            </div>
            <div className="wake-buffer-callout">
              <strong>300m+</strong>
              <div>
                <b>High-wake water sports</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WakeMapOverview />

      <section className="wake-section wake-simulator-feature" id="wake-simulator">
        <div className="container">
          <div className="wake-section-heading">
            <span className="wake-kicker">Try different operating settings</span>
            <h2>See how your choices change the wake</h2>
            <p>
              Adjust speed, engine power, trim, load, shoreline distance and towing to compare their
              estimated effect before you head onto the lake.
            </p>
          </div>

          <WakeSimulator />

          <aside className="wake-risk-footnote" aria-label="Evidence and limits for the shoreline risk colours">
            <strong>How to read the risk colours</strong>
            <p>
              Research supports these hazards, but not one universal set of green, orange and red
              wave-height cutoffs. <a href="https://www.birdscanada.org/fantastic-loons-and-where-to-find-them" target="_blank" rel="noopener noreferrer">Birds Canada</a> notes
              that a water-level rise over 15 cm will typically flood a loon nest. A{' '}
              <a href="https://repository.library.noaa.gov/view/noaa/44011/noaa_44011_DS1.pdf" target="_blank" rel="noopener noreferrer">STAC technical review</a> reports
              erosion at 10 cm in one vegetated-shore experiment, while a{' '}
              <a href="https://onlinelibrary.wiley.com/doi/abs/10.1002/rrr.3450090102" target="_blank" rel="noopener noreferrer">Gordon River study</a> found
              a major 30–35 cm threshold on its unconsolidated sandy banks. The review stresses that
              depth, bank profile, sediment, vegetation and repeated traffic change the result. No
              comparable universal wave-height cutoff exists for every dock, swimmer or small craft;
              Canadian law instead requires operators to consider conditions and avoid endangering
              people. Therefore these colours are conservative relative indicators based on the
              simulator&apos;s estimated shore height and settings—not published damage probabilities.{' '}
              <a href="https://laws-lois.justice.gc.ca/eng/regulations/SOR-2008-120/FullText.html#s-15" target="_blank" rel="noopener noreferrer">Vessel Operation Restriction Regulations, s. 15</a>
            </p>
          </aside>

          <div className="wake-data-note">
            <strong>Illustrative simulator—not a navigation or engineering model.</strong> The controls
            show an educational estimate, not a predicted wave height for a particular boat. The estimate
            is calibrated to published measurements for one 16-foot Boston Whaler, then applies simplified
            distance attenuation. Hull, load, engine power, trim, water depth, course, tow setup and weather
            all matter.
          </div>

          <details className="wake-sim-method">
            <summary>How is the estimated wave height calculated?</summary>
            <div className="wake-sim-method-body">
              <div className="wake-sim-method-grid">
                <div>
                  <strong>1 · Starting wave</strong>
                  <p>
                    The speed curve is anchored approximately to the published 16-foot Boston Whaler
                    example: 22 cm at 19 km/h while plowing and 13 cm at 44 km/h while planing, both at
                    50 metres. It produces a 0–100 relative score, then uses +5.5% per bow-high trim
                    step, a 0.78–1.22 load scale, +16% for towing and a power/low-speed adjustment.
                    The score becomes a starting height at 0.42 cm per point, capped at 55 cm. These
                    adjustment coefficients are ours—not measured constants from the study. The two
                    following crests are displayed at 78% and 60% of the leading crest.
                  </p>
                </div>
                <div>
                  <strong>2 · Distance decay</strong>
                  <p>
                    The animation reduces height with a smoothed inverse-cube-root curve:
                    <span className="wake-sim-equation">H(d) = H₀ × [25 ÷ (25 + d)]<sup>1/3</sup></span>
                    where <em>d</em> is distance travelled in metres. The University of Minnesota field
                    study also fitted measured wake-height decay with power laws; examples in its Condition
                    2 results use exponents of −0.332 and −0.371. The 25-metre smoothing value is a display
                    calibration, not a physical constant.
                  </p>
                </div>
                <div>
                  <strong>3 · What remains illustrative</strong>
                  <p>
                    Arrival time assumes a wave speed between 1.45 and 2.35 m/s, while the green, orange
                    and red risk labels use educational thresholds based on estimated shore height. Neither is a
                    site-specific engineering result. The model does not solve for hull geometry, wave period,
                    bathymetry, wind, reflection or shoreline slope.
                  </p>
                </div>
              </div>
              <p className="wake-sim-method-sources">
                <a href="https://repository.library.noaa.gov/view/noaa/44011/noaa_44011_DS1.pdf" target="_blank" rel="noopener noreferrer">STAC technical review, Table 1 (p. 16) →</a>
                <a href="https://conservancy.umn.edu/bitstream/handle/11299/226190/BoatGeneratedWakeWaveReport_Feb12022_Final.pdf?sequence=1&amp;isAllowed=y" target="_blank" rel="noopener noreferrer">University of Minnesota field study, methodology p. 52 and Figures 22–23 →</a>
              </p>
            </div>
          </details>
        </div>
      </section>

      <section className="container wake-law-section">
        <div className="wake-law-card">
          <div className="wake-law-icon"><Scale size={28} /></div>
          <div>
            <span className="wake-kicker">The rule, precisely</span>
            <h2>30 metres is a speed limit—not a promise of zero wake</h2>
            <p>
              Canada’s Vessel Operation Restriction Regulations prohibit operating a power-driven or
              electrically propelled vessel above <strong>10 km/h within 30 metres of shore</strong> in
              Ontario, subject to listed exceptions. “No wake” is the better operating goal near shore,
              but it is not the wording of this general federal rule.
            </p>
            <p className="mb-0">
              <a
                href="https://laws-lois.justice.gc.ca/eng/regulations/SOR-2008-120/section-2.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read section 2(7) and its exceptions on Justice Laws →
              </a>
            </p>
          </div>
        </div>
        <div className="wake-law-note">
          <AlertTriangle size={22} />
          <p>
            Ten kilometres per hour can still produce a damaging wake on some hulls. Inside 30 metres,
            watch the water behind you and reduce throttle until the wake settles—not merely until the
            speedometer reads 10.
          </p>
        </div>
      </section>

      <section className="wake-section wake-section-soft" id="wake-shape">
        <div className="container">
          <div className="wake-section-heading">
            <span className="wake-kicker">Wake is about displacement</span>
            <h2>The slower boat can make the bigger wave</h2>
            <p>
              These diagrams use a published measured example for the same 16-foot planing boat at
              two speeds. At 50 metres from its path, the slower transitional run produced the larger
              maximum wave.
            </p>
          </div>

          <WakeComparison />

          <div className="wake-data-note">
            <strong>Published measurements—not a prediction for every boat.</strong> A 2017 STAC review
            summarizes measurements for a 16-foot Boston Whaler at 50 metres from its sailing line: 22 cm
            at 19 km/h and 13 cm at 44 km/h. Hull design, load, trim, depth, course and weather can produce
            different results.{" "}
            <a
              href="https://repository.library.noaa.gov/view/noaa/44011/noaa_44011_DS1.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              Source: STAC technical review, Table 1 (p. 16) →
            </a>
          </div>
        </div>
      </section>

      <section className="container wake-habits-section">
        <div className="wake-section-heading wake-section-heading-left">
          <span className="wake-kicker">At the helm</span>
          <h2>4 key things to remember</h2>
          <p>Keep these four checks in mind every time you leave the dock.</p>
        </div>
        <div className="wake-habit-grid">
          {habits.map(({ icon: Icon, title, text }, index) => (
            <article className="wake-habit" key={title}>
              <span className="wake-habit-number">{index + 1}</span>
              <Icon size={25} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="wake-open-water-rule">
          <CheckCircle2 size={25} />
          <div>
            <strong>Simple operating rule</strong>
            <p>
              Near shore: true slow, bow down, smallest possible wake. In open water: either cleanly
              on plane or truly slow—avoid lingering in the bow-high transition range. Move wake sports
              much farther out. University of Minnesota field testing compared two wakesurf boats with two
              typical planing tow-sport boats. Under typical operation, the wakesurf boats needed more than
              <strong> 500 ft (about 152 metres)</strong> for wake height, energy and power to fall to similar
              levels. Use the map’s blue 300-metre-plus area as an added local margin. Even there, keep watching the wake and reduce it around people,
              property, wildlife and vulnerable banks.
            </p>
          </div>
        </div>
      </section>

      <section className="wake-section wake-map-section" id="lake-maps">
        <div className="container">
          <div className="wake-section-heading">
            <span className="wake-kicker"><Map size={17} /> Seven lake maps</span>
            <h2>Know the shoreline zones before you add throttle</h2>
            <p>
              Choose a lake to see the calculated shoreline bands. They are drawn using a local metre
              projection. The 30-metre line marks the federal speed rule. University of Minnesota testing
              found wakesurf boats needed more than 500 ft (about 152 metres) for their wakes to fall to
              levels similar to the typical planing tow-sport boats in the study. The maps keep water sports
              outside 300 metres and identify 200–300 metres only for well-trimmed planing transit. Those
              boundaries are conservative local planning choices—not research-defined safe cutoffs.
            </p>
          </div>

          <WakeZoneMap />

          <div className="wake-map-cautions wake-map-cautions-four">
            <div>
              <strong><span className="wake-caution-number">30 m</span> Legal speed zone</strong>
              <p>Maximum 10 km/h under the general federal rule. Aim for the smallest wake your boat can make.</p>
            </div>
            <div>
              <strong><span className="wake-caution-number">30–200 m</span> Not suitable for water sports</strong>
              <p>Keep tubing, skiing, wakeboarding and wakesurfing out of this band. Operate with the smallest wake conditions allow.</p>
            </div>
            <div>
              <strong><span className="wake-caution-number">200–300 m</span> Well-trimmed planing transit</strong>
              <p>Transit only: cleanly on plane, bow down and wake monitored. The measured planing examples made smaller wakes than the same hulls while plowing.</p>
            </div>
            <div>
              <strong><span className="wake-caution-number">300m+</span> Acceptable water-sports zone</strong>
              <p>A candidate activity area—not a guarantee. Traffic, depth, rider safety and the actual wake still determine whether water sports are responsible.</p>
            </div>
          </div>

          <div className="wake-buffer-evidence">
            <div className="wake-buffer-evidence-heading">
              <span className="wake-kicker">Evidence behind the map</span>
              <h3>What the law and research support</h3>
            </div>
            <div className="wake-buffer-evidence-grid">
              <article>
                <strong>30 m · federal law</strong>
                <p>Ontario’s general rule limits powered vessels to 10 km/h within 30 metres of shore, subject to the regulation’s exceptions.</p>
                <a href="https://laws-lois.justice.gc.ca/eng/regulations/SOR-2008-120/section-2.html" target="_blank" rel="noopener noreferrer">Justice Laws, VORR 2(7)–(8) →</a>
              </article>
              <article>
                <strong>Planing transit · smaller measured wake</strong>
                <p>A technical review reports one 16-foot planing boat produced a 22 cm wave at 19 km/h while plowing, compared with 13 cm at 44 km/h on plane, both measured 50 metres away.</p>
                <a href="https://repository.library.noaa.gov/view/noaa/44011/noaa_44011_DS1.pdf" target="_blank" rel="noopener noreferrer">STAC technical review, Table 1 →</a>
              </article>
              <article>
                <strong>&gt;152 m · wakesurf boats needed more distance</strong>
                <p>The study compared Malibu VLX and MXZ wakesurf boats with a Larson LXI 210 and Malibu Response LX operating as typical planing tow-sport boats. Under typical operation, the wakesurf boats required more than 500 ft (about 152 m) for wake height, energy and power to fall to similar levels.</p>
                <a href="https://twin-cities.umn.edu/news-events/university-minnesota-researchers-study-waves-created-recreational-boats" target="_blank" rel="noopener noreferrer">University of Minnesota summary →</a>
              </article>
              <article>
                <strong>300 m · precautionary local map margin</strong>
                <p>This page extends that evidence with a conservative 300-metre planning margin before highlighting a candidate high-wake area. The study did not establish 300 metres as a universal safe cutoff.</p>
                <a href="https://conservancy.umn.edu/bitstream/handle/11299/226190/BoatGeneratedWakeWaveReport_Feb12022_Final.pdf?sequence=1&amp;isAllowed=y" target="_blank" rel="noopener noreferrer">Read the underlying research →</a>
              </article>
            </div>
            <p className="wake-buffer-evidence-note"><strong>Read the bands correctly:</strong> 30 metres is Ontario’s general near-shore speed rule. Research supports avoiding sustained plowing and keeping large wakes farther away; it does not establish 200 or 300 metres as universal safe cutoffs. The yellow, green and blue boundaries are conservative local planning choices—not additional laws.</p>
          </div>

          <p className="wake-map-disclaimer">
            <strong>Planning aid only:</strong> These bands are calculated from Land Information Ontario
            shoreline polygons and are approximate. Water levels, islands, data age and map accuracy can
            change the real distance. This is not a navigation chart, survey or legal determination.
          </p>
        </div>
      </section>

      <section className="container wake-impact-section">
        <div className="wake-impact-copy">
          <span className="wake-kicker">Why the extra care matters</span>
          <h2>The wake ends at someone’s shoreline</h2>
          <p>
            Repeated boat wakes can contribute to bank erosion and sediment resuspension, especially in
            sheltered or narrow waters. The effect depends on wave size, traffic, water depth and shoreline
            conditions; docks, shoreline habitat, swimmers and small craft can also be affected after the boat passes.
          </p>
          <Link href="/healthy-shoreline" className="btn btn-primary">Protect your shoreline too</Link>
        </div>
        <div className="wake-impact-list">
          <span><ArrowDown size={18} /> Less shoreline erosion</span>
          <span><ArrowDown size={18} /> Less sediment disturbance</span>
          <span><ArrowDown size={18} /> Lower risk to nests and wildlife</span>
          <span><ArrowDown size={18} /> Safer water for neighbours</span>
        </div>
      </section>

      <section className="wake-section wake-faq-section" id="wake-faq">
        <div className="container">
          <div className="wake-section-heading wake-section-heading-left">
            <span className="wake-kicker">Wake and water-sports FAQ</span>
            <h2>Clear answers before you leave the dock</h2>
            <p>These answers separate federal requirements, published research and this page’s precautionary local recommendations.</p>
          </div>

          <div className="wake-faq-grid">
            <details>
              <summary>Which Redstone area lakes can I do water sports on?</summary>
              <div>
                <p>
                  For the high-wake activities addressed here, only <strong>Redstone Lake</strong> has a
                  practical blue area at least 300 metres from every mapped shoreline. The other lakes do
                  not provide enough room to meet this page’s precautionary standard for high-wake water
                  sports. That is a local planning recommendation—not a declaration that an activity is
                  legally permitted or prohibited.
                </p>
                <p className="wake-faq-citations">
                  <a href="#lake-maps">Compare the seven lake maps ↑</a>
                  <a href="https://www.ontario.ca/page/geospatial-ontario" target="_blank" rel="noopener noreferrer">Geospatial Ontario map-data context →</a>
                </p>
              </div>
            </details>

            <details>
              <summary>How far from the shoreline should I be when doing water sports?</summary>
              <div>
                <p>
                  For tubing, waterskiing, wakeboarding and especially wakesurfing, use the mapped blue
                  area <strong>at least 300 metres from every shoreline</strong>. University of Minnesota
                  testing found wakesurf boats operating typically needed more than 500 ft (about 152 m)
                  for wake height, energy and power to fall to levels similar to the two typical planing
                  tow-sport boats tested. The 300-metre boundary adds a local margin; it is not a universal
                  safe distance.
                </p>
                <p className="wake-faq-citations">
                  <a href="https://twin-cities.umn.edu/news-events/university-minnesota-researchers-study-waves-created-recreational-boats" target="_blank" rel="noopener noreferrer">University of Minnesota study summary →</a>
                  <a href="https://conservancy.umn.edu/bitstream/handle/11299/226190/BoatGeneratedWakeWaveReport_Feb12022_Final.pdf?sequence=1&amp;isAllowed=y" target="_blank" rel="noopener noreferrer">Full field study →</a>
                </p>
              </div>
            </details>

            <details>
              <summary>Is 300 metres from shore a legal requirement in Ontario?</summary>
              <div>
                <p>
                  No. Ontario’s general federal rule prohibits operating a power-driven or electrically
                  propelled vessel above <strong>10 km/h within 30 metres of shore</strong>, subject to
                  listed exceptions. The 300-metre distance is this page’s conservative local recommendation
                  for high-wake activities—not a law.
                </p>
                <p className="wake-faq-citations">
                  <a href="https://laws-lois.justice.gc.ca/eng/regulations/SOR-2008-120/section-2.html" target="_blank" rel="noopener noreferrer">Vessel Operation Restriction Regulations, 2(7)–(8) →</a>
                </p>
              </div>
            </details>

            <details>
              <summary>Can I tow a skier or tube inside 30 metres of shore?</summary>
              <div>
                <p>
                  The 10 km/h rule has an exception for a vessel towing a person when it follows a course
                  <strong> away from and perpendicular to shore</strong>. That narrow exception does not make
                  parallel-to-shore towing or a large wake near people, docks or vulnerable shoreline responsible.
                  All other safe-operation and towing rules still apply.
                </p>
                <p className="wake-faq-citations">
                  <a href="https://laws-lois.justice.gc.ca/eng/regulations/SOR-2008-120/section-2.html" target="_blank" rel="noopener noreferrer">Vessel Operation Restriction Regulations, 2(8) →</a>
                </p>
              </div>
            </details>

            <details>
              <summary>What are the Canadian safety requirements when towing a rider?</summary>
              <div>
                <p>
                  A person other than the operator must watch every person being towed and communicate with
                  the operator. The boat needs seating space for every towed person, required flotation must
                  be worn or carried as specified by the regulation, and towing is prohibited during restricted
                  visibility and from one hour after sunset until sunrise. Wearing an approved lifejacket or PFD
                  is the safer choice.
                </p>
                <p className="wake-faq-citations">
                  <a href="https://laws-lois.justice.gc.ca/eng/regulations/SOR-2010-91/section-1005.html" target="_blank" rel="noopener noreferrer">Small Vessel Regulations, section 1005 →</a>
                  <a href="https://tc.canada.ca/sites/default/files/2026-05/boating_guide_2026_en_acc.pdf" target="_blank" rel="noopener noreferrer">Transport Canada Safe Boating Guide →</a>
                </p>
              </div>
            </details>

            <details>
              <summary>Can a slower boat make a larger wake?</summary>
              <div>
                <p>
                  Yes. In one published example, the same 16-foot Boston Whaler produced a 22 cm maximum
                  wave at 19 km/h and a smaller 13 cm wave at 44 km/h, both measured 50 metres from the boat
                  path. A bow-high boat plowing through transition can displace more water than the same hull
                  running cleanly on plane.
                </p>
                <p className="wake-faq-citations">
                  <a href="https://repository.library.noaa.gov/view/noaa/44011/noaa_44011_DS1.pdf" target="_blank" rel="noopener noreferrer">STAC technical review, Table 1 (p. 16) →</a>
                </p>
              </div>
            </details>

            <details>
              <summary>How do engine power, trim, load and towing change a wake?</summary>
              <div>
                <p>
                  These settings change hull attitude, displacement and drag, so speed alone cannot determine
                  wake size. High power at low speed, bow-high trim, extra load or a tow can increase the wake.
                  The simulator is an educational comparison calibrated to one published boat example—not a
                  prediction for a particular vessel. Watch the wake your boat is actually producing.
                </p>
                <p className="wake-faq-citations">
                  <a href="https://repository.library.noaa.gov/view/noaa/44011/noaa_44011_DS1.pdf" target="_blank" rel="noopener noreferrer">STAC technical review →</a>
                  <a href="#wake-simulator">Try the educational simulator ↑</a>
                </p>
              </div>
            </details>

            <details>
              <summary>What should I check before making wake?</summary>
              <div>
                <p>
                  Check for swimmers, paddlers, anglers, small craft, docks, moored boats, nesting wildlife and
                  soft or steep shorelines. Canadian safe-operation rules require operators to consider
                  circumstances that could create danger and to avoid endangering people involved in activities
                  on the water. Distance alone does not make a wake safe.
                </p>
                <p className="wake-faq-citations">
                  <a href="https://laws-lois.justice.gc.ca/eng/regulations/SOR-2008-120/FullText.html" target="_blank" rel="noopener noreferrer">Vessel Operation Restriction Regulations, section 15 →</a>
                  <a href="https://repository.library.noaa.gov/view/noaa/44011/noaa_44011_DS1.pdf" target="_blank" rel="noopener noreferrer">STAC review of wake effects →</a>
                </p>
              </div>
            </details>

            <details>
              <summary>Are the shoreline-distance maps exact or suitable for navigation?</summary>
              <div>
                <p>
                  No. They are planning aids calculated from Ontario shoreline polygons in a local metre
                  projection. Water level, islands, shoreline-data age and map accuracy can change the real
                  distance. Use current charts, on-water measurements and good judgment; these maps are not
                  navigation charts, surveys or legal determinations.
                </p>
                <p className="wake-faq-citations">
                  <a href="https://www.ontario.ca/page/geospatial-ontario" target="_blank" rel="noopener noreferrer">Geospatial Ontario →</a>
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>

      <section className="wake-sources">
        <div className="container">
          <h2>Sources &amp; further reading</h2>
          <ul>
            <li>
              <a href="https://laws-lois.justice.gc.ca/eng/regulations/SOR-2008-120/section-2.html" target="_blank" rel="noopener noreferrer">
                Justice Laws — Vessel Operation Restriction Regulations, section 2
              </a>
            </li>
            <li>
              <a href="https://tc.canada.ca/en/marine-transportation/preparing-operate-your-vessel/visitor-information" target="_blank" rel="noopener noreferrer">
                Transport Canada — Ontario’s unposted 10 km/h / 30 m rule
              </a>
            </li>
            <li>
              <a href="https://conservancy.umn.edu/bitstream/handle/11299/226190/BoatGeneratedWakeWaveReport_Feb12022_Final.pdf?sequence=1&amp;isAllowed=y" target="_blank" rel="noopener noreferrer">
                University of Minnesota — Boat-generated wake-wave study
              </a>
            </li>
            <li>
              <a href="https://repository.library.noaa.gov/view/noaa/44011/noaa_44011_DS1.pdf" target="_blank" rel="noopener noreferrer">
                Virginia Sea Grant review — boat wakes, shoreline erosion and measured wake table
              </a>
            </li>
            <li>
              <a href="https://onlinelibrary.wiley.com/doi/abs/10.1002/rra.803" target="_blank" rel="noopener noreferrer">
                Maynord — Wave height from planing and semi-planing small boats
              </a>
            </li>
            <li>
              <a href="https://laws-lois.justice.gc.ca/eng/regulations/SOR-2010-91/section-1005.html" target="_blank" rel="noopener noreferrer">
                Justice Laws — Small Vessel Regulations, water-sports towing rules
              </a>
            </li>
            <li>
              <a href="https://www.ontario.ca/page/geospatial-ontario" target="_blank" rel="noopener noreferrer">
                Geospatial Ontario — provincial map-data context
              </a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
