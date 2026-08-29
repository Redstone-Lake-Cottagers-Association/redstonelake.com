import Link from 'next/link'
import type { Metadata } from 'next'
import { ORG_NAME } from '@/lib/branding'

export const metadata: Metadata = {
  title: `2025 Water Quality Results | ${ORG_NAME}`,
  description:
    'A plain-language summary of the 2025 water quality results for Redstone, Little Redstone, Pelaw, Bitter, Burdock, Tedious (Long) and Coleman lakes.',
}

const RESULTS = [
  {
    id: 'secchi-depth',
    title: 'Secchi Disk Depth',
    definition:
      'A Secchi disk is used to measure water clarity, which is affected by algae and suspended particles in the water. Clarity helps us understand how much light reaches underwater plants, which helps us understand how deep those plants can grow.',
    findings:
      'All lakes had average Secchi depths that are normal for each lake. Lakes with high transparency (more than 4 m) include Redstone, Little Redstone, Bitter, Burdock, and Tedious (Long). Lakes with moderate transparency (2–4 m) include Pelaw and Coleman.',
  },
  {
    id: 'phosphorus',
    title: 'Phosphorus Concentrations',
    definition:
      'Phosphorus is a nutrient we measure to help monitor the risk of algal blooms. Higher nutrient concentrations mean a higher risk of algal blooms.',
    findings:
      'All lakes had phosphorus concentrations that are normal for each lake. Based on these concentrations, all of the lakes are considered oligotrophic (low-nutrient, clear water), except for Coleman Lake, which is mesotrophic (moderate nutrient levels).',
  },
  {
    id: 'chloride',
    title: 'Chloride Concentrations',
    definition:
      'Chloride is measured to help monitor the influence of roads, septic systems, and water softeners on our lakes. Chloride is naturally very low in our lakes, so rising levels are a signal of human activity, and at high enough concentrations it can also become harmful to aquatic life.',
    findings: (
      <>
        <p>
          All lakes had chloride concentrations that are normal for each lake, except for Bitter
          and Burdock, which continue to have concentrations higher than we have seen historically.
          These results suggest that road salt, septic systems, or water softeners may be having a
          measurable impact on Bitter and Burdock lakes. 2025 was the first year we sampled Tedious
          (Long) Lake, so it&rsquo;s unclear if the chloride concentrations are rising.
        </p>
        <p className="mb-0">
          All lakes have chloride concentrations below the national water quality guideline for the
          protection of aquatic life (120 mg/L). However, Burdock and Tedious (Long) had chloride
          concentrations that exceed the level believed to be toxic to water fleas (20 mg/L). Water
          fleas (a type of zooplankton) are important to lake health because they eat algae and can
          help protect our lakes from algal blooms.
        </p>
      </>
    ),
  },
  {
    id: 'calcium',
    title: 'Calcium Concentrations',
    definition:
      'Calcium is an essential mineral that aquatic life needs to stay healthy, so we measure it to help us understand the general health of our lakes. Our lakes are naturally low in calcium, in part due to historical acid rain and forestry, which remove calcium from the landscape and waterways. Calcium is especially important for healthy populations of water fleas and other zooplankton that help control algae.',
    findings:
      'All lakes had calcium concentrations that are normal for each lake. Lakes with moderate calcium concentrations (3–20 mg/L) include Bitter, Burdock, Tedious (Long), and Coleman. Lakes with low calcium concentrations (less than 3 mg/L) include Redstone, Little Redstone, and Pelaw. Pelaw is the only lake with calcium concentrations below the threshold considered healthy for zooplankton (1.5 mg/L).',
  },
  {
    id: 'dissolved-oxygen',
    title: 'Dissolved Oxygen Concentrations',
    definition:
      'Dissolved oxygen is a measure of how much oxygen is in the water, which is important for understanding where aquatic animals like fish can live. When there is no oxygen in the water just above the lake bed (sediment), nutrients can be released into the water, increasing the potential risk of algal blooms.',
    findings:
      'Dissolved oxygen concentrations were similar to previous years. Redstone and Little Redstone have high oxygen concentrations from the top to the bottom of the water column. Tedious (Long), Burdock, Pelaw, and Coleman all had anoxic (no oxygen) conditions in the deeper water. Dissolved oxygen was not recorded at Bitter Lake in 2025.',
  },
]

export default function WaterQualityResults2025Page() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <header className="text-center mb-5">
            <p className="text-uppercase text-primary fw-semibold small mb-2">Annual report</p>
            <h1 className="mb-3">2025 Water Quality Results</h1>
            <p className="lead text-muted mx-auto mb-3" style={{ maxWidth: '760px' }}>
              Every year the Association, with help from our lake stewards, tests water quality
              indicators of our lakes. Almost all of our 2025 water quality results fall within the
              normal range for each of our lakes, and little has changed from previous years. Two
              areas stand out as worth a closer look, and we have a plan for each.
            </p>
            <p className="small mb-0">
              <Link href="/water-quality-program">How our monitoring program works</Link>
              <span className="mx-2" aria-hidden="true">·</span>
              <Link href="/lake-health">Explore the historical data</Link>
            </p>
          </header>

          <section className="card lake-card mb-5" aria-labelledby="what-stands-out">
            <div className="card-body p-4 p-md-5">
              <h2 id="what-stands-out" className="h3 mb-4">What stands out in 2025</h2>

              <h3 className="h5">Chloride</h3>
              <p>
                Chloride is naturally very low in our lakes, so when it rises it usually points to
                human activity. Two lakes, Bitter and Burdock, have chloride levels climbing above
                what we&rsquo;ve measured in the past. At Burdock and Tedious (Long), those levels
                are now high enough that they may be harmful to water fleas — tiny animals that eat
                algae and help keep our water clear. The most likely sources are road salt and water
                softeners, which drain into septic systems. This winter we plan to look at how best
                to monitor these lakes, so we can pinpoint where the chloride is coming from and
                work to stop it from climbing further.
              </p>

              <h3 className="h5 mt-4">Dissolved oxygen</h3>
              <p className="mb-0">
                In several lakes, the deepest water runs out of oxygen by late summer. This is a
                natural seasonal pattern, but it matters because low-oxygen conditions can cause
                the lake bed to release phosphorus — a nutrient that can feed algae blooms — back
                into the water. To find out whether this is happening in our lakes, we&rsquo;re
                looking into purchasing a sampler that would let us collect water from these deep
                areas and measure it directly.
              </p>
            </div>
          </section>

          <section aria-labelledby="full-results">
            <div className="text-center mb-4">
              <h2 id="full-results" className="mb-2">Full 2025 results</h2>
              <p className="text-muted mb-0">
                What each indicator tells us, followed by this year&rsquo;s findings.
              </p>
            </div>

            <nav aria-label="Water quality result sections" className="mb-4">
              <ul className="list-inline text-center mb-0">
                {RESULTS.map(result => (
                  <li key={result.id} className="list-inline-item mb-2">
                    <a href={`#${result.id}`} className="btn btn-outline-primary btn-sm">
                      {result.title.replace(' Concentrations', '').replace(' Disk', '')}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="d-grid gap-4">
              {RESULTS.map(result => (
                <article key={result.id} id={result.id} className="card lake-card scroll-margin-top">
                  <div className="card-body p-4">
                    <h2 className="h3 mb-3">{result.title}</h2>
                    <h3 className="h6 text-uppercase text-primary mb-2">What is it?</h3>
                    <p>{result.definition}</p>
                    <h3 className="h6 text-uppercase text-primary mb-2 mt-4">2025 results</h3>
                    {typeof result.findings === 'string' ? (
                      <p className="mb-0">{result.findings}</p>
                    ) : result.findings}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="card lake-card mt-5">
            <div className="card-body p-4 text-center">
              <h2 className="h4 mb-2">See how the lakes have changed over time</h2>
              <p className="text-muted mb-3">
                Explore nearly 30 years of phosphorus, water clarity, calcium, chloride and
                sulphate measurements for all seven lakes.
              </p>
              <Link href="/lake-health#explore" className="btn btn-lake-primary">
                Open the Lake Health Data Explorer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
