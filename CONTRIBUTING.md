# Contributing News & Events

Anyone can add a news article or community event to the website — no coding
required. Content lives in simple data files, and you propose changes through a
GitHub pull request (PR). A site manager reviews it, and **once merged the site
deploys automatically within a few minutes**.

Questions? Email **website@redstonelake.com**.

---

## The 2-minute version (GitHub web editor — no software needed)

1. Sign in to [GitHub](https://github.com) (free account).
2. Open the file you want to change (links below), then click the **pencil icon** (Edit).
   - Events: [`src/data/events.json`](src/data/events.json)
   - News: [`src/data/news-index.json`](src/data/news-index.json) **and** [`src/data/news-posts.json`](src/data/news-posts.json)
3. Make your edit following the templates below.
4. Click **Commit changes…** → choose **"Create a new branch and start a pull request"** → **Propose changes**.
5. On the next screen click **Create pull request**. Done — a site manager takes it from there.

---

## Adding an event

Edit [`src/data/events.json`](src/data/events.json). It's a list — copy an
existing entry, paste it at the end of the list (mind the commas between `}`
and `{`), and fill in your values:

```json
{
  "title": "Corn Roast & Regatta",
  "date": "August 15, 2026",
  "time": "2:00 pm",
  "location": "The Redstone Sandbar",
  "type": "Community Event",
  "icon": "🌽",
  "color": "#c2703d",
  "description": "One or two sentences shown on event cards.",
  "details": "The longer write-up shown when someone clicks the event — what to bring, how to RSVP, parking/docking notes, etc."
}
```

### Event fields

| Field | Required? | Notes |
|---|---|---|
| `title` | ✅ | Event name |
| `date` | ✅ | Human format: `"August 15, 2026"`. The site works out everything else (calendar badge, upcoming vs. past) from this — **you never need to update an event after it happens.** |
| `time` | recommended | e.g. `"2:00 pm"`. Leave as `""` for all-day/unspecified, or use `"Not yet announced"` if the time genuinely isn't decided yet. |
| `location` | recommended | Venue or description, e.g. `"Haliburton Forest Centre"`. Same rule: `""` if there isn't one, `"Not yet announced"` if it's still being decided. |
| `type` | ✅ | Short category label, e.g. `Community Event`, `Annual Meeting`, `Fundraiser` |
| `icon` | optional | A single emoji (defaults to 📅) |
| `color` | optional | Accent hex colour for the card edge (defaults to lake blue `#0369a1`) |
| `description` | ✅ | 1–2 sentences for cards and previews |
| `details` | ✅ | Full text shown in the event pop-up and on the Events page |

**Do not** add `id`, `day`, `month`, or `status` fields — older versions of the
file had them, but they're now derived automatically from `date`.

Where it appears: the homepage calendar + "Next Event" hero card, and the
[/events](https://new.redstonelake.com/events) page. Events automatically move
to "Past events" the day after they occur.

## Adding a news article

News lives in **two** files that must stay in sync (same entry in both):

1. [`src/data/news-index.json`](src/data/news-index.json) — the listing (no article body). **Add new articles at the TOP of the list** — the site treats the first entry as the newest.
2. [`src/data/news-posts.json`](src/data/news-posts.json) — the same entry **plus a `content` field** holding the article body as HTML.

Entry for `news-index.json` (add at the top):

```json
{
  "slug": "2026-corn-roast-recap",
  "title": "Corn Roast Recap: A Perfect Day on the Sandbar",
  "date": "2026-08-16T09:00:00",
  "excerpt": "Two or three sentences summarizing the article — shown on news cards and the homepage.",
  "categories": ["News"],
  "featuredImage": "/images/news/2026-corn-roast-recap/crowd.jpg"
}
```

Entry for `news-posts.json` (same fields, plus `content`):

```json
{
  "slug": "2026-corn-roast-recap",
  "title": "Corn Roast Recap: A Perfect Day on the Sandbar",
  "date": "2026-08-16T09:00:00",
  "excerpt": "Two or three sentences summarizing the article — shown on news cards and the homepage.",
  "categories": ["News"],
  "featuredImage": "/images/news/2026-corn-roast-recap/crowd.jpg",
  "content": "<p>Article body goes here as HTML.</p><h2>Section heading</h2><p>More paragraphs. Links look like <a href=\"/events\">this</a>.</p>"
}
```

### News fields

| Field | Required? | Notes |
|---|---|---|
| `slug` | ✅ | The article's URL: `/news/<slug>`. Lowercase words separated by hyphens, unique, never change it after publishing. |
| `title` | ✅ | Headline |
| `date` | ✅ | ISO format with time: `"2026-08-16T09:00:00"` (this is different from the event date format!) |
| `excerpt` | ✅ | 1–3 plain-text sentences for cards/previews |
| `categories` | ✅ | Usually `["News"]` |
| `featuredImage` | optional | Path to an image (see below), or `null` — cards get an auto-generated placeholder |
| `content` | ✅ (posts file only) | Article body as HTML: `<p>`, `<h2>`, `<ul>/<li>`, `<a>`, `<img>` |

### Images

Put article images in `public/images/news/<your-slug>/` (in the web editor:
navigate to `public/images/news/`, then **Add file → Upload files** — GitHub
will include them in the same PR). Reference them as
`/images/news/<your-slug>/<filename>.jpg`. Landscape images around
1200–1600px wide look best as the `featuredImage`.

Where it appears: the newest article is automatically featured in the
homepage hero ("Latest News") and the homepage news grid, plus
[/news](https://new.redstonelake.com/news) and its own page at `/news/<slug>`.

---

## Tips & gotchas

- **JSON is picky.** Every entry except the last needs a comma after its
  closing `}`; quotes inside text must be escaped as `\"`. If the site preview
  fails on your PR, it's almost always a missing/extra comma.
- **Emoji and accents are fine** — the files are UTF-8.
- Nothing publishes until a site manager merges your PR, so you can't break
  the live site by proposing a change.
- Prefer working locally? See "Getting Started (Development)" in the
  [README](README.md) — the dev server at `localhost:8080` live-reloads as you
  edit the data files.
