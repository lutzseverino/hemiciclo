# Free sources of political news for the soak-test countries

Researched 2026-10-06 for [#2](https://github.com/lutzseverino/hemiciclo/issues/2). Countries: Spain, United States, Argentina, India.

## Short answer

- **GDELT** is the only free source that covers all four countries in their original languages, refreshed every 15 minutes, under terms that allow commercial reuse with attribution. It gives headline, outlet domain, date and URL, but **no excerpt**. Its search API was heavily throttled when tested, so plan to read the raw 15-minute files instead.
- **Outlets' own RSS feeds** have the richest fields (headline, author, date, URL, summary, and often the full text). Every RSS terms page we could read limits use to **personal, non-commercial** use. The soak test fits that. A public app would need a licence from each outlet, or would have to fall back to headline and link only.
- **Wikipedia's Current events portal** is a curated digest, written in a neutral style, with outlets cited per item, under CC BY-SA 4.0. Coverage is **thin outside the US**: of 638 sourced items in September 2026, about 118 mention the US, 16 India, 10 Spain and 2 Argentina. Spanish Wikipedia's equivalent portal is not kept up day by day. It works as a cross-check and a source-discovery aid, not as the main feed.
- **Recommendation for v1:** use GDELT for discovery across all four countries, a curated per-country list of outlet RSS feeds for excerpts during the personal soak test, and Wikipedia Current events as a curated signal for big stories. Before going public, revisit the outlet terms (see "Open question" below).

## Comparison

| | GDELT (DOC API / raw files) | Outlet RSS feeds | Wikipedia Current events |
|---|---|---|---|
| Coverage: Spain | Yes. Spanish-language outlets in the translingual stream (37 `.es` domains in one 15-minute file) | Yes: El País, El Mundo, ABC, elDiario.es feeds live | Sparse (about 10 items in Sept 2026) |
| Coverage: US | Yes, the English stream | Yes: NYT, NPR, Politico, Fox News, The Hill feeds live | Strong (about 118 items in Sept 2026) |
| Coverage: Argentina | Yes, Spanish (45 `.ar` domains in one 15-minute file) | Yes: Clarín, La Nación, Infobae, Perfil, Página/12 feeds live | Very sparse (about 2 items in Sept 2026) |
| Coverage: India | Yes. English outlets are in the English stream; Indian-language outlets in the translingual stream | Yes: The Hindu, Indian Express, Times of India, NDTV, Hindustan Times feeds live | Moderate (about 16 items in Sept 2026) |
| Languages | Over 100 monitored; 65 machine-translated to English. The original-language title is kept | The outlet's own language | English (es.wikipedia portal stale) |
| Freshness | 15 min (English); the translingual files lagged about 1 h when tested | Minutes to hours. Newest item ranged from 0 to 13 h old when tested; the RTVE feed was years stale | Same day. Day pages are edited for 1 to 3 days afterwards |
| Headline | Yes (`title` / `PAGE_TITLE`) | Yes | Editor-written one-line summary, not the outlet's headline |
| Outlet | Domain only | Implicit (one feed per outlet) | Outlet name in the citation, e.g. "(Reuters)" |
| Date | `seendate` (when GDELT saw it) | `pubDate` | Event day |
| URL | Yes | Yes | Yes, 1 or more source URLs per item |
| Excerpt | **No** | Yes (`description`). Many feeds also carry the full text | The item text itself, under CC BY-SA |
| Rate limits | API: "one every 5 seconds" (enforced harder in practice). Raw files: none stated | None published. Poll politely | Action API: 1 concurrent request and under 5 req/s unauthenticated; descriptive User-Agent required |
| Licence: personal app | Free; cite GDELT and link to it | Allowed by every terms page we read (personal / non-commercial) | CC BY-SA 4.0 or GFDL; attribute |
| Licence: public app | Allowed, including commercial use, with citation | **Mostly not allowed** without permission | Allowed, including commercial use, with attribution; derived text must be share-alike |

## GDELT

**What it is.** GDELT is a global news-monitoring project. It publishes article metadata and does not publish article text.

**Terms.** "all datasets released by the GDELT Project are available for unlimited and unrestricted use for any academic, commercial, or governmental use of any kind without fee", and "any use or redistribution of the data must include a citation to the GDELT Project and a link to this website". Source: <https://www.gdeltproject.org/about.html#termsofuse>.

- *Unverified, my inference:* GDELT's licence covers GDELT's own data. It cannot grant rights in third-party headlines. Showing a headline with a link is common practice, but no GDELT page addresses it.

**Freshness and languages.** "the GDELT Event and Global Knowledge Graph now update every 15 minutes". The translingual stream machine-translates "all global news that GDELT monitors in 65 languages, representing 98.4% of its daily non-English monitoring volume". Source: <https://blog.gdeltproject.org/gdelt-2-0-our-global-world-in-realtime/>.

- **Observed:** `https://data.gdeltproject.org/gdeltv2/lastupdate.txt` was current to the 15-minute slot.
- **Observed:** `lastupdate-translation.txt` pointed to a translation GKG file that returned 404. The newest translation file available was about 1 h old.

**DOC 2.0 API.** Source: <https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/>.

- Endpoint: `https://api.gdeltproject.org/api/v2/doc/doc`.
- It searches a rolling 3 months, with a minimum `timespan` of 15 minutes.
- It returns up to 250 records per query (75 by default).
- The `sourcecountry:` operator matches "articles published in outlets located in a particular country", and `sourcelang:` matches the original language.
- Output formats include JSON and RSS.

**Fields observed** in a live `mode=artlist&format=json` response for `sourcecountry:india`: `url`, `url_mobile`, `title`, `seendate`, `socialimage`, `domain`, `language`, `sourcecountry`.

- There is no excerpt, author or body.
- `seendate` is the time GDELT saw the article. The API docs describe the `DateDesc` sort as "publication date". *Unverified:* how closely the two match.

**Rate limit, observed and not formally documented.** The API answers throttled calls with the plain-text message "Please limit requests to one every 5 seconds or contact kalev.leetaru5@gmail.com for larger queries. All high-traffic users should switch to our ngrams dataset".

- In testing, 9 of 10 calls got this message, including calls spaced 20 to 90 s apart. Only one call (`sourcecountry:india`) returned data.
- Treat the API as unreliable for scheduled jobs.
- *Unverified:* whether the throttle is per IP, shared, or temporary.

**Raw-file alternative.** The 15-minute GKG files are unauthenticated zips with no stated rate limit.

- One English GKG file held 1,465 articles. Every row had `<PAGE_TITLE>` in the extras field, plus the source domain, the URL and often `<PAGE_AUTHORS>`.
- One translation GKG file held 1,865 articles: 37 `.es`, 45 `.ar` and 4 `.in` domains. Titles were in the original language, and the field marked the source language (e.g. `srclc:spa`).
- Filtering to politics is up to Hemiciclo, by domain allow-list, GKG themes or locations.
- Field definitions are in the GKG 2.1 codebook: <http://data.gdeltproject.org/documentation/GDELT-Global_Knowledge_Graph_Codebook-V2.1.pdf>. *Not re-read for this note.*

## Outlet RSS feeds

**Feeds probed live on 2026-10-06** (all returned HTTP 200 and valid RSS unless noted):

| Country | Feed | Newest item | Summary | Full text in feed |
|---|---|---|---|---|
| ES | El País España `https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/espana/portada` | 10 h | ~150 chars | Yes (`content:encoded`) |
| ES | El Mundo España `https://e00-elmundo.uecdn.es/elmundo/rss/espana.xml` | 0.2 h | ~450 chars | No |
| ES | ABC España `https://www.abc.es/rss/2.0/espana/` | 1.6 h | Often full text in `description` | Partly |
| ES | elDiario.es Política `https://www.eldiario.es/rss/politica/` | 2 h | Full text in `description` | Yes |
| ES | RTVE `https://api2.rtve.es/rss/temas_noticias.xml` | **about 4 years stale** | | |
| US | NYT Politics `https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml` | 0.3 h | ~150 chars | No |
| US | NPR Politics `https://feeds.npr.org/1014/rss.xml` | 11 h | ~180 chars | Short |
| US | Politico `https://rss.politico.com/politics-news.xml` | 13 h | ~100 chars | Yes |
| US | Fox News Politics `https://moxie.foxnews.com/google-publisher/politics.xml` | 2 h | ~150 chars | Yes |
| US | The Hill `https://thehill.com/homenews/feed/` | 0.1 h | ~350 chars | No |
| AR | Clarín Política `https://www.clarin.com/rss/politica/` | 1.7 h | ~250 chars | No |
| AR | La Nación Política `https://www.lanacion.com.ar/arc/outboundfeeds/rss/category/politica/` | 0.1 h | ~150 chars | Yes |
| AR | Infobae Política `https://www.infobae.com/arc/outboundfeeds/rss/category/politica/` | 0 h | ~250 chars | Yes |
| AR | Perfil Política `https://www.perfil.com/feed/politica` | 0.4 h | ~550 chars | No |
| AR | Página/12 `https://www.pagina12.com.ar/arc/outboundfeeds/rss/` | (200 OK; the section feed URLs return 404) | | |
| IN | The Hindu National `https://www.thehindu.com/news/national/feeder/default.rss` | 0.3 h | ~130 chars | No |
| IN | Indian Express Political Pulse `https://indianexpress.com/section/political-pulse/feed/` | 6.6 h | none | No |
| IN | Times of India India `https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms` | n/a | ~700 chars (HTML) | No |
| IN | NDTV India `https://feeds.feedburner.com/ndtvnews-india-news` | 2.5 h | ~150 chars | Short |
| IN | Hindustan Times India `https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml` | 4.6 h | ~130 chars | No |

**Fields.** All of these feeds carry `title`, `link`, `pubDate` and (except Indian Express) `description`. Most carry `dc:creator` (author) and `category`.

**Full text in feeds.** Many feeds put the full article text in `content:encoded` or in `description`. The map says "full text is processed transiently and never republished", so the ingest must drop those fields or truncate them.

**Rate limits.** None of the outlets publishes a rate limit for its feeds. Polling every 10 to 15 minutes with a descriptive User-Agent and conditional GETs is ordinary practice, but that is not a documented term.

**Terms, quoted from each outlet's own page:**

- **New York Times**: "We allow the use of NYTimes.com RSS feeds for personal use in a news reader or as part of a non-commercial blog. We require proper format and attribution … Commercial use of the Service is prohibited without prior written permission". Source: <https://www.nytimes.com/rss>.
- **NPR**:
  - Content Feeds may be displayed "on your personal site or application, or the site or application of a nonprofit organization that is exempt from federal income taxes under Section 501(c)(3)".
  - The content "may be used only for personal noncommercial use", with attribution to "NPR".
  - NPR may "require you to cease accessing" the feeds.
  - Source: <https://www.npr.org/about-npr/179876898/terms-of-use>. The feed's own `<copyright>` reads "For Personal Use Only".
- **Times of India**: "TOI grants you permission to only access and make personal use of its RSS feeds … TIL forbids you from any attempts at displaying, hosting, aggregating, reselling or putting to commercial use". Source: <https://timesofindia.indiatimes.com/rss.cms>.
- **Hindustan Times**: feeds "are provided solely for the purpose of allowing individuals to view headlines … within news readers for their personal and non-commercial use". Source: <https://www.hindustantimes.com/rss>.
- **Indian Express**: "Consumption of content via these RSS feeds are strictly for personal and non-commercial use". Source: <https://indianexpress.com/rss/>.
- **Clarín**:
  - Grants a "licencia revocable, intransferible, no exclusiva y gratuita, para la exhibición en su propio sitio web … de los títulos y/o links".
  - Content may not be altered, and the user must not "vender, modificar, traducir, copiar, publicar, transmitir, distribuir".
  - Source: <https://www.clarin.com/rss.html>.
  - This is the only terms page we read that explicitly lets anyone display headline and link on their own site. It does not say "non-commercial". *Unverified:* whether a public app counts as "su propio sitio web".
- **Infobae**:
  - The site terms forbid reproducing "la totalidad o parte de los contenidos" without written permission.
  - Infobae "se opone de manera expresa" to its pages counting as a quotation under art. 10 of Argentina's Ley 11.723.
  - Source: <https://www.infobae.com/terminos-y-condiciones/>.
  - No RSS-specific terms were found.
- **El Mundo (Unidad Editorial)**:
  - Same model as Infobae: reproduction is forbidden without written authorisation.
  - It opposes treating reproduction as a quotation under the Spanish LPI art. 32.
  - Source: <https://www.elmundo.es/privacidad/avisolegal.html>.
- **elDiario.es**:
  - "los contenidos publicados pasan a formar parte de una licencia 'creative commons atribución-no comercial'". Source: <https://www.eldiario.es/aviso-legal-eldiario-es/>.
  - This makes it the most permissive Spanish outlet for non-commercial reuse.
  - *Unverified:* the exact CC version. The linked Creative Commons page did not render.

**Not verified:**

- El País's legal notice returned HTTP 403 to every fetch.
- The Hindu's RSS terms are not in the page HTML; the page says they apply but loads them by script.
- The RSS terms of La Nación, Perfil, Página/12, NDTV, Politico, Fox News, The Hill and ABC were not checked.

**Spanish law (applies to publishers established in Spain).** Ley de Propiedad Intelectual art. 129 bis gives press publishers an exclusive right over online use of their publications by information-society service providers. Section 6 exempts:

- "a) El uso privado o no comercial de las publicaciones de prensa por parte de usuarios individuales.
- b) Los actos de hiperenlace.
- c) Al uso de palabras sueltas o extractos muy breves o poco significativos …".

Art. 32.2 requires authorisation from rights holders before "prestadores de servicios electrónicos de agregación de contenidos" make "textos o fragmentos de textos de publicaciones de prensa" available. Source: BOE consolidated text, <https://www.boe.es/buscar/act.php?id=BOE-A-1996-8930>.

- The personal soak test sits inside exemption (a).
- A public Hemiciclo showing excerpts from Spanish outlets would likely be a content aggregator under art. 32.2. Headline plus link sits closer to exemptions (b) and (c).
- *Not legal advice.* The equivalent Argentine and Indian law was not researched.

## Wikipedia Current events portal

**Structure.**

- The page lives at <https://en.wikipedia.org/wiki/Portal:Current_events>.
- It shows about the last 6 days. Each day is a subpage, e.g. `Portal:Current_events/2026_October_5`, grouped by category ("Armed conflicts", "Politics and elections", "Law and crime", …).
- Each item is a one-sentence summary written by editors and cites one or more source URLs with the outlet's name, e.g. `[https://www.reuters.com/… (Reuters)]`. This was observed in the live wikitext through the Action API (`action=parse&prop=wikitext`).
- Writing items in actor, action, aim form with citations is close to Hemiciclo's Narration rules.

**Freshness, observed through page revisions.**

- Each day page is created at 03:30 UTC the day before.
- It is edited through the day: 17 edits so far on 2026-10-06, 77 edits on 2026-10-05.
- It keeps changing for 1 to 3 days. The last edit to the 2026-10-01 page was on 2026-10-03.

**Coverage per country, measured.**

- Method: keyword match over all 30 September 2026 day pages, 638 sourced items in all. This is rough: keywords can over-count, as with "U.S." in foreign stories, or under-count.
- Results: United States ≈118, India ≈16, Spain ≈10, Argentina ≈2.
- The per-country year pages (`2026 in Spain`, `2026 in Argentina`, `2026 in India`, `2026 in the United States`) exist and were edited within the last 1 to 6 days. They lag more and are less structured.
- **Spanish Wikipedia:**
  - `Portal:Actualidad` says sections are now updated through day subpages.
  - No subpages exist for September or October 2026 (`Portal:Actualidad/5 de octubre de 2026` is missing).
  - The only recent edits in that namespace are to 2007–2009 pages.
  - Treat it as not maintained.

**Licence.** Text is licensed under "Creative Commons Attribution-ShareAlike 4.0 International License ('CC BY-SA 4.0'), and GNU Free Documentation License ('GFDL')". Commercial use is allowed. Attribution is by hyperlink or URL to the article, or by a list of authors. Source: <https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use>.

- Share-alike means any Hemiciclo text adapted from item wording would itself have to be CC BY-SA.
- Using items only as pointers to the cited outlet URLs avoids reusing Wikipedia text.

**Access rules.**

- **User-Agent:** must follow the format `<client name>/<version> (<contact information>) <library/framework name>/<version>`. Without it, requests "may be blocked without notice". Source: <https://foundation.wikimedia.org/wiki/Policy:Wikimedia_Foundation_User-Agent_Policy>.
- **Robot policy:**
  - Action API, unauthenticated: "keep the concurrency of your requests to 1 at a time, and below 5 requests per second overall". Authenticated clients may use 3 concurrent requests and 10 req/s.
  - REST API, unauthenticated: 3 concurrent requests and under 5 req/s.
  - High-volume commercial users are steered to Wikimedia Enterprise.
  - Source: <https://wikitech.wikimedia.org/wiki/Robot_policy>.
- **API etiquette:** prefer serial requests, batch titles with `|`, and use `maxlag` for background jobs. Source: <https://www.mediawiki.org/wiki/API:Etiquette>.

Daily reads of one or two day pages are far inside all of these limits.

## Not covered

Commercial news APIs (NewsAPI, GNews and others) and Google News RSS were outside the ticket's minimum set and were not researched.
