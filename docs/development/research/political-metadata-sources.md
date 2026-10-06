# Free sources of structured political metadata

Research for [#3](https://github.com/lutzseverino/hemiciclo/issues/3). Read on 2026-10-06 against each source's own pages, licences and APIs. Live queries were run that day against the Wikidata Query Service, the Parline API, the Constitute API and the ParlGov 2024 release on Harvard Dataverse.

## Short answer

- **No single free source covers the whole Country Brief.** Two sources together cover most of it:
  - **Wikidata** for who governs: head of state, head of government and their party. It covers every country, is CC0 and is updated within hours. [wd-licence][q-heads][q-coverage]
  - **IPU Parline** for how they got there and what's next: the last legislative election with seats per party, the expected date of the next one, and a controlled political-system label such as `parliamentary_system` + `constitutional_monarchy`. It has a keyless JSON:API and covers 193 countries, but it is **CC BY-NC-SA 4.0**. [parline-api][parline-licence]
- **Ruling party or coalition has no clean structured source anywhere.**
  - Wikidata gives only the head of government's own party. That value is noisy: Milei carries three parties with no end dates. [q-heads]
  - Wikidata's cabinet items carry no member parties. [q-cabinets]
  - Parline gives seats per party, not the government. In Spain the largest party (PP, 136 seats) is not in government. [parline-es]
  - ParlGov has real cabinet composition, but it is frozen. [parlgov-retire]
- **Last election and next scheduled vote.** Parline is the most consistent structured source for **legislative** elections. **Presidential** elections, and anything Parline lacks, need Wikidata or ElectionGuide.
  - Wikidata's election items are uneven. The 2023 Spanish election has no winner. The 2025 Argentine legislative election and the 2026 US House elections have no date. [q-elections]
  - ElectionGuide is purpose-built for this and covers presidential elections too. Its API needs a token issued on request, and its licence is non-commercial only. [eg-access][eg-use]
- **Constitutional form of government.** Parline's `political_systems` is the best fit for the Lexicon, because it is a small controlled vocabulary. [parline-es]
  - Wikidata's `P122` is free-form and multi-valued. India has four values. [q-heads]
  - Constitute supplies the constitution text itself, so it is the citation behind the label. It assigns no label of its own. [constitute-api]
- **ParlGov is out for v1.**
  - It covers 37 EU/OECD democracies, so not the US, Argentina or India. [parlgov-data]
  - Its last data is June 2023, so Spain's 23 July 2023 election is missing. [parlgov-data]
  - Its maintainer retired in October 2024 with "no further updates" planned. [parlgov-retire]
- **Licences.** Wikidata and ParlGov are CC0. Parline (BY-NC-SA), Constitute (BY-NC 3.0) and ElectionGuide (non-commercial, plus banned uses) are all fine for the non-commercial soak test. All three would need permission or replacement before the paid tier, which is out of scope today. Parline's ShareAlike may also apply to Briefs that republish its data. *(Licence reading, not legal advice.)*

## Comparison

Coverage key: **●** structured and usable · **◐** partial or needs work · **○** absent.

| | Wikidata | IPU Parline | IFES ElectionGuide | ParlGov | Constitute / CCP |
|---|---|---|---|---|---|
| Head of state | ● `P35`, 197/197 sovereign states [q-coverage] | ◐ only a flag saying whether the head of government is also the head of state; no names [parline-es] | ○ | ○ | ○ |
| Head of government | ● `P6`, 192/197 [q-coverage]; 5 states have several "current" values [q-ambig] | ○ | ○ | ◐ prime minister in cabinet data, 37 countries, ≤ 2023 [parlgov-data] | ○ |
| Ruling party / coalition | ◐ head of government's `P102` only, 153/197, unfiltered by date [q-coverage][q-heads] | ○ seats per party, not the government [parline-es] | ◐ "prominent political groups" (≥ 5 % of the vote), not the government [eg-codebook] | ● cabinet party composition, frozen at 2023 [parlgov-retire] | ○ |
| Last election + result | ◐ items exist, but winners, dates and typing are inconsistent [q-elections] | ● legislative: date, seats at stake, seats per party [parline-es] | ● legislative + presidential + referendums; results "as early as two weeks" after [eg-codebook] | ● legislative vote and seat shares, ≤ June 2023 [parlgov-data] | ○ |
| Next scheduled vote | ◐ only where an item has a future date [q-elections] | ● `expect_date_next_election` (legislative) [parline-es] | ● elections "identified up to one year in advance" [eg-codebook] | ○ | ○ |
| Constitutional form | ◐ `P122`, 160/197, free-form, multi-valued [q-coverage][q-heads] | ● controlled `political_systems` terms [parline-es] | ◐ "structure of political institutions" in country profiles [eg-codebook] | ○ | ◐ full text plus topic tags; no single label [constitute-api] |
| Countries | all | 193 [parline-api] | 240 [eg-codebook] | 37 [parlgov-data] | "nearly all" in-force constitutions [ccp-download] |
| Freshness | live; WDQS reflected a same-day edit to Spain (Q29) within hours [q-modified] | per-field `date_from`; Argentina's 26 Oct 2025 election already includes its 17 Dec 2025 first sitting [parline-ar] | "daily updates" [eg-codebook]; the US 2026 House page was modified 11 Aug 2026 [eg-us2026] | frozen: last data June 2023 [parlgov-retire] | amendments tracked; CCP chronology "updated through 2025" [ccp-download] |
| Access | SPARQL (60 s per query, 60 s of processing per minute per client, User-Agent required) [wdqs-manual]; weekly dumps [wd-dumps] | keyless REST, JSON:API [parline-api] | free website; API token and portal login on request [eg-access] | Dataverse download (CSV, SQLite) [parlgov-data] | keyless JSON API [constitute-api] |
| Licence | **CC0** [wd-licence] | **CC BY-NC-SA 4.0** [parline-licence] | **non-commercial use with attribution**; commercial use by licence; some uses banned [eg-use] | **CC0** (2024 release) [parlgov-dv] | **CC BY-NC 3.0**, except third-party-copyrighted text [constitute-about] |
| Refresh in Hemiciclo | daily SPARQL query per followed country | daily or weekly API pull per country | API pull with token (needs a request to IFES) | none: one-time historical import at most | on a constitution change only |

## Details

### Wikidata

- **Licence.** "All structured data (i.e. the main, Property, Lexeme, and EntitySchema namespaces) is released into the public domain under Creative Commons Zero." [wd-licence]
- **Access.**
  - The Query Service enforces a 60-second query deadline.
  - Each client (User-Agent plus IP) gets "60 seconds of processing time each 60 seconds" and "30 error queries per minute".
  - Clients without a proper User-Agent "may be blocked completely". [wdqs-manual]
  - Full JSON and RDF dumps are produced weekly. [wd-dumps]
  - Since 2025, scholarly-article items are served from a separate graph. [graph-split] That does not affect political items.
- **Live check: heads of state and government (2026-10-06).** The query read `P35`/`P6` statements without an end date, the holder's `P102` and the country's `P122`. [q-heads]

  | Country | Head of state (since) | Head of government (since) | Head of government's `P102` | `P122` |
  |---|---|---|---|---|
  | Spain | Felipe VI (2014-06-19) | Pedro Sánchez (2018-06-02) | PSOE | parliamentary monarchy |
  | United States | Donald Trump (2025-01-20) | Donald Trump (2025-01-20) | Republican Party | constitutional republic; democratic republic |
  | Argentina | Javier Milei (2023-12-10) | Javier Milei (2023-12-10) | Avanza Libertad; Freedom Advances; Libertarian Party | federal republic |
  | India | Droupadi Murmu (2022-07-25) | Narendra Modi (2014-05-26) | BJP | republic; federal republic; constitutional republic; democratic republic |

  The people were all current. Party and form need cleaning: filter `P102` by its qualifiers, and map `P122` onto the Lexicon.
- **Coverage across all 197 non-dissolved sovereign states (`Q3624078`).** [q-coverage]
  - Head of state: 197/197.
  - Head of government: 192/197.
  - Head of government with a party: 153/197.
  - `P122`: 160/197.
  - Chad, Samoa, Kyrgyzstan (9), Benin (3) and Djibouti each return more than one "best-rank" head of government. Someone has not marked the current holder as preferred, so Hemiciclo must filter on the end-date qualifier. [q-ambig]
- **Elections are the weak spot.** Live checks: [q-elections]
  - **2023 Spanish general election (Q84082018).** Has its date, but no winner.
  - **2025 Argentine legislative election (Q131007945).** No date at all.
  - **2026 US House elections (Q132767622).** No date and no `P1001` jurisdiction. It is typed only as "public election".
  - **2024 Indian general election (Q65042773).** Seven `P585` dates, one per phase, and typed partly as "electoral result".
  - A generic query by type and jurisdiction found none of the Spanish or Indian national elections. Election data needs a curated query per country, or another source.
- **Coalitions.** Cabinet items exist, for example "Third government of Pedro Sánchez" (Q123463301). But they carry no `P102` member parties, and queries by country mix in regional cabinets, such as the Catalan and Canarian governments under Spain. [q-cabinets]
- **Freshness.** The Spain item was last modified 2026-10-06T15:09Z, and the Query Service already reflected that edit at 22:08Z. [q-modified] How fast the community updates office-holders after a change was not measured. See *Not verified*.

### IPU Parline

- **Licence.** Every API response carries: "This work is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International", along with a pointer to the IPU terms of use. [parline-licence]
- **Access.**
  - `https://api.data.ipu.org/v1/…` answered without a key: `countries` (193 total), `parliaments/{CC}`, `chambers/{CC}-LC01` and `elections/{CC}-LC01-E{yyyymmdd}`. [parline-api]
  - The documentation site `data.ipu.org` and `ipu.org` returned HTTP 403 to every fetch, so the API documentation was not read. Endpoint shapes above come from probing. The `filter[country_code]` parameter was ignored, returning all 2,970 elections.
- **Fields of interest (live, 2026-10-06).** [parline-es][parline-ar]
  - **Country.** `political_systems`:
    - Spain: `parliamentary_system` + `constitutional_monarchy`.
    - India: `parliamentary_system` + `parliamentary_ceremonial_president`.
    - United States and Argentina: `presidential_system`.
  - **Parliament.** `head_gov_is_head_state`: true for the US and Argentina, false for Spain and India.
  - **Chamber.** `last_election`, `parliamentary_term`, `chamber_speakers`.
  - **Election.** `election_date`, `expect_date_next_election`, `number_of_seats_at_stake`, `seats_per_parties`, `first_session_date`.

  | Lower-house election | Seats at stake | Largest party (seats) | Expected next election |
  |---|---|---|---|
  | Spain 2023-07-23 | 350 | PP (136) | 2027-07-31 |
  | Argentina 2025-10-26 | 127 | Freedom Advances (64) | 2027-10-31 |
  | India 2024-04-19 → 06-01 | 543 | BJP (240) | 2029-04-30 |
  | United States 2024-11-05 | 435 | Republican (220) | 2026-11-03 |

- **Caveats.**
  - `largest_party_seat_percent` is relative to the seats at stake: Argentina shows 50.4 % = 64/127 of a partial renewal, not of the chamber.
  - `vote_breakdown` was empty or null in all four records, so vote shares are not guaranteed.
  - Parline covers parliaments only: no presidential elections and no names of the head of state or head of government.

### IFES ElectionGuide

- **Licence.** "Data may be used freely for personal and non-commercial purposes such as research and teaching, provided appropriate attribution is made to IFES ElectionGuide." [eg-use]
  - Changes to the data must be marked.
  - "Surveillance, targeted political influence campaigns, and predictive markets" are prohibited.
  - Other commercial use needs a licence from IFES.
- **Access.**
  - The website is open.
  - Registered users can download XLSX/CSV files.
  - The JSON API gives "a subset of the complete dataset" and needs a token requested through a form or by email. [eg-access][eg-codebook]
- **Coverage and freshness.** The codebook (v1.1, July 2022) says: [eg-codebook]
  - It covers national-level elections in 240 countries from 1998, including snap elections and referendums.
  - "Elections are identified up to one year in advance."
  - Profiles are complete about two weeks before the vote.
  - Results "as early as two weeks after".
  - "The ElectionGuide team provides daily updates."
  - Dates not yet fixed are tracked as "Proposed" versus "Official" start and end dates.
- **Live check.**
  - The US House 2026 profile reads "Confirmed", Nov. 3, 2026, modified Aug 11, 2026. [eg-us2026]
  - The Argentina Chamber of Deputies profile for 26 Oct 2025 reads "Held", modified Dec 01, 2025. The fetched HTML showed no results table, so whether results load client-side or only in the portal is unverified. [eg-ar2025]

### ParlGov

- **Licence.** The ParlGov 2024 Release on Harvard Dataverse is **CC0 1.0** (read from the Dataverse API). [parlgov-dv]
- **Coverage.** "All EU and most OECD democracies (37 countries)". [parlgov-about]
  - The 2024 election table lists exactly 37 countries. Spain is among them; the United States, Argentina and India are not.
  - The latest election in the table is 2023-06-25.
  - Spain's latest is 2019-11-10, which misses 2023-07-23. [parlgov-data]
- **Status.** On 2024-10-01 the maintainer wrote "Today, I (Holger) retire from ParlGov". The data runs to June 2023 with no further updates planned, and the site will stay online "as long as it needs only security updates". [parlgov-retire] The parlgov.org news list shows no posts after October 2024. [parlgov-home]

### Constitute Project and the Comparative Constitutions Project (CCP)

- **Licence.** Constitute's About page: "Except for material identified as copyrighted by other parties, the content of constituteproject.org is provided under a Creative Commons Attribution-Non Commercial 3.0 Unported License." [constitute-about]
  - Some translations are third-party copyright. The live API marks Argentina's text "© Oxford University Press, Inc." [constitute-live]
  - The Terms page adds that "commercial use is expressly prohibited". [constitute-terms]
- **Access.**
  - A keyless JSON API at `https://www.constituteproject.org/service/`, with `constitutions`, `topics`, `locations`, topic search, text search and `html` endpoints. [constitute-api]
  - Live: `constitutions?country=Spain` returned `Spain_2011` ("Spain 1978 (rev. 2011)", `in_force: true`). [constitute-live]
  - XML dumps cover countries, topics, chronology and constitution metadata. [constitute-data]
- **Form of government.** Neither Constitute nor its API gives a single form-of-government label. It tags constitutional sections by topic, such as "Name/structure of executive(s)". [constitute-api][constitute-execnum]
  - The CCP "Characteristics of National Constitutions" v5.0 (February 2025) codes features like whether the executive is head of state or head of government. [ccp-download]
  - Its download page states no licence. See *Not verified*.
  - Use it to cite and quote the constitutional basis for the label Hemiciclo takes from Parline, not as the label itself.

## Implications for Hemiciclo

- **Suggested split.**
  - Wikidata: names and parties of the head of state and head of government, daily.
  - Parline: political system, last legislative election and next expected date, daily or weekly.
  - Constitute: a link to the in-force constitution.
  - ElectionGuide: optional, once a token is granted, for presidential elections and referendums.
  - Each Brief claim cites the record it came from: the Wikidata QID, the Parline election code, or the Constitute `cons_id`.
- **Coalition is a gap.** No free structured source gives current government composition worldwide. The agent run would have to state it from attributed sources, or Hemiciclo would have to accept the head of government's party as a proxy.
- **Licence boundary.** Three of the five sources are non-commercial. That is fine for the soak test, but it is a blocker to resolve before any paid tier.

## Not verified

- IPU's own Parline API documentation and terms-of-use pages (`data.ipu.org/data-tools/api/`, `ipu.org/terms-use`). Both returned HTTP 403. The licence comes from the API's own response metadata.
- ElectionGuide's API field list beyond the 2022 codebook, and whether its results are visible without login. No token was requested.
- The licence of the CCP "Characteristics of National Constitutions" downloads. None is stated on the download page.
- How quickly Wikidata editors update heads of government after a change of office. Only Query Service lag was observed.
- Whether a curated SPARQL query per country can reliably find the latest *national* election. Only the generic query was shown to fail.

## Sources

- [wd-licence]: https://www.wikidata.org/wiki/Wikidata:Licensing
- [wd-dumps]: https://www.wikidata.org/wiki/Wikidata:Database_download
- [wdqs-manual]: https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual
- [graph-split]: https://meta.wikimedia.org/wiki/WikiCite/WDQS_graph_split
- [q-heads]: live WDQS query, 2026-10-06, `P35`/`P6` without `P582`, plus `P102` and `P122`, for Q29, Q30, Q414 and Q668. https://query.wikidata.org/
- [q-coverage]: live WDQS query, 2026-10-06, counts of `wdt:P35`/`P6`/`P6→P102`/`P122` over `wdt:P31 wd:Q3624078` without `P576`
- [q-ambig]: live WDQS query, 2026-10-06, sovereign states with more than one `wdt:P6`
- [q-elections]: live WDQS queries, 2026-10-06, for Q84082018, Q65042773, Q131007945, Q132767622, Q135654575 and Q101110072, plus a generic query for `P31/P279*` general or presidential elections by `P1001`
- [q-cabinets]: live WDQS query, 2026-10-06, `P31/P279* wd:Q640506` (cabinet) by country, with `P102`
- [q-modified]: live WDQS query, 2026-10-06T22:08Z, `schema:dateModified` for Q29, Q30, Q414 and Q668
- [parline-api]: https://api.data.ipu.org/v1/countries (live, 2026-10-06; `meta.total` = 193)
- [parline-licence]: `meta.licence` in any https://api.data.ipu.org/v1/ response (live, 2026-10-06)
- [parline-es]: https://api.data.ipu.org/v1/countries/ES, https://api.data.ipu.org/v1/parliaments/ES, https://api.data.ipu.org/v1/chambers/ES-LC01, https://api.data.ipu.org/v1/elections/ES-LC01-E20230723, plus the equivalent US, AR and IN records (live, 2026-10-06)
- [parline-ar]: https://api.data.ipu.org/v1/elections/AR-LC01-E20251026 (live, 2026-10-06)
- [eg-use]: https://electionguide.org/p/use
- [eg-access]: https://electionguide.org/p/access/
- [eg-codebook]: https://www.ifes.org/sites/default/files/migrate/electionguide_codebook_v1.1.pdf
- [eg-us2026]: https://electionguide.org/elections/id/5099/
- [eg-ar2025]: https://www.electionguide.org/elections/id/4594
- [parlgov-home]: https://www.parlgov.org/
- [parlgov-about]: https://www.parlgov.org/about/
- [parlgov-retire]: https://www.parlgov.org/2024/10/01/retiring-from-parlgov/
- [parlgov-dv]: https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/2VZ5ZC (licence read via the Dataverse API, 2026-10-06)
- [parlgov-data]: `view_election.tab` from the ParlGov 2024 Release, doi:10.7910/DVN/2VZ5ZC (downloaded and parsed, 2026-10-06)
- [constitute-about]: https://www.constituteproject.org/content/about
- [constitute-terms]: https://www.constituteproject.org/content/terms
- [constitute-data]: https://www.constituteproject.org/content/data
- [constitute-api]: https://docs.google.com/document/d/1wATS_IAcOpNZKzMrvO8SMmjCgOZfgH97gmPedVxpMfw/pub
- [constitute-execnum]: https://constituteproject.org/topics/execnum?lang=en
- [constitute-live]: https://www.constituteproject.org/service/constitutions?country=Spain&lang=en and `?country=Argentina` (live, 2026-10-06)
- [ccp-download]: https://comparativeconstitutionsproject.org/download-data/
