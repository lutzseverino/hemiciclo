# What Hemiciclo may store and show from news articles

Research for [#6](https://github.com/lutzseverino/hemiciclo/issues/6). Read 2026-10-06 against statute and directive texts, court opinions and official guidance. **This is not legal advice.** It sets an engineering storage policy, and it flags the points where a lawyer is needed before Hemiciclo goes public.

## Short answer

- **Links and facts are free everywhere.** Hyperlinking is outside the EU and Spanish press-publisher right. [dsm-15][lpi-129bis] Facts reported in the press are outside it too. [dsm-rec57] Under US law, copying facts is permitted, and the protected part is the expression. [uscop p.31–32] Argentina lets "noticias de interés general" be used, provided the source is named. [ar-28] So Hemiciclo's own labels, scores and fact-based summaries are its own material.
- **Headlines are low-risk but not risk-free.** The EU and Spanish right excludes "individual words or very short extracts". [dsm-15][lpi-129bis] US registration practice treats titles and short phrases as uncopyrightable. [cfr-202.1] The US Copyright Office warns, though, that an original headline or lede can carry protected expression. [uscop p.33–35]
- **Excerpts have no safe numeric length** in any of the four jurisdictions. The EU test is "very short", read "so as not to affect the effectiveness" of the publisher's right. [dsm-rec58] Spain adds a qualitative test and a no-harm-to-investment test. [lpi-129bis] One US district court found a headline plus 300 characters of lede infringing. [uscop p.32]
- **Spain is the binding constraint for a public site.** An electronic content-aggregation service needs the rights holders' authorisation to make "textos o fragmentos de textos" of press publications available. [lpi-32] Separately, most outlets' RSS terms permit only personal, non-commercial use. [sources]
- **Transient full-text processing is defensible but not free.** In the EU it rests on the temporary-copy exception [infosoc-5] and the text-and-data-mining exception. The TDM exception yields wherever the publisher has reserved it in machine-readable form, and the New York Times does so in its `robots.txt`. [dsm-4][rdl-67][nyt-robots] In the US the relevant authorities are the transitory-duration rule [cartoon] and the Google Books fair-use holding. [ag-google] Argentina has neither a TDM exception nor a temporary-copy exception. [ar] India exempts only transient storage made *in the technical process* of transmission. [in-2012]
- **Sending text to Jev is not "transient" in the copyright sense.** TypeSafe may keep Input "in perpetuity" for telemetry, abuse monitoring and legal compliance. [mca §4.1] Hemiciclo also warrants that it holds every right needed for TypeSafe to process that Input. [mca §5]

### Recommended storage policy

| Item | Private soak test (owner only, behind login) | Public site |
|---|---|---|
| URL, outlet, publication date, byline, language | Store and show | Store and show |
| Headline | Store; show as the link text | Store; show as the link text. Lawyer check for Spain |
| Publisher excerpt (RSS `description`, lede) | Store at most **200 characters**, cut at a word boundary to one sentence or less. Show to the owner | **Store but don't show** by default. Show only with a licence, or once a lawyer has signed off per jurisdiction |
| Full text (`content:encoded`, a full-text `description`, a fetched page, or a pasted article) | Process in memory, then discard. Never persist it | Same, and also honour TDM reservations (below) |
| Hemiciclo labels, scores, confidence | Store and show | Store and show, marked as AI-produced [jev] |
| Hemiciclo's own summary | Store and show | Store and show. Write it from the facts, never as a close paraphrase or translation |
| Content hash of the full text (for dedupe and change detection) | Store | Store |

**Ingest rules.**

1. **Drop `content:encoded`** and any other full-body field before anything is written. That covers the database, logs, queues, caches, error reports and test fixtures.
2. **Strip HTML from `description` and truncate it to the excerpt cap.** A `description` longer than the cap counts as full text: truncate it, and never store the remainder. The feeds that need this include El País, elDiario.es and ABC. [sources]
3. **Treat full text as process-and-discard.** Hold it only for the length of the classification call. Persist only the derived labels, the hash and Hemiciclo's own summary.
4. **Honour TDM reservations in the public phase** (they are cheap to honour in the soak test too). Before sending any outlet's full text to the classifier, check that outlet's `robots.txt` and terms for an express reservation. For a reserved outlet, classify on headline plus excerpt, or skip it. [dsm-4][rdl-67]
5. **Third-party classifier (Jev).** Send the minimum text the classification needs. Before the public phase, ask TypeSafe whether Input text is retained under the MCA §4.1(c) telemetry grant, or get zero data retention, which TypeSafe offers to enterprise customers only. [jev] Until then, the §5 warranty rests on the exceptions above, and those cover an owner-only soak test better than a public service.
6. **Mark the 200-character cap as a policy choice, not a legal threshold.** It sits near the length of the summaries many feeds already publish (about 150 characters for El País and the NYT). [sources] It stays below the 300-character lede that *Meltwater* found infringing. [uscop p.32]

**A lawyer is needed before going public** for these points: Spain art. 32.2 (whether Hemiciclo is an "agregación de contenidos" service, and whether headlines alone need authorisation); whether classification is "text and data mining" and whether art. 4 covers a processor's copies at TypeSafe; the MCA §5 warranty; and US fair use for any displayed excerpt.

## European Union

**Press publishers' right (DSM Directive art. 15).** Member States give EU-established press publishers the reproduction and making-available rights "for the online use of their press publications by information society service providers". [dsm-15] Four carve-outs follow, in the article's own words:

- The rights "shall not apply to private or non-commercial uses of press publications by individual users".
- The protection "shall not apply to acts of hyperlinking".
- The rights "shall not apply in respect of the use of individual words or very short extracts of a press publication".
- They "shall expire two years after the press publication is published", counted from 1 January of the following year, and they don't apply to publications first published before 6 June 2019. [dsm-15]

**Very short extracts (recital 58).** Such use "may not undermine the investments made by publishers". But "taking into account the massive aggregation … it is important that the exclusion of very short extracts be interpreted in such a way as not to affect the effectiveness of the rights". [dsm-rec58] The Directive sets no length.

**Facts and quotation (recital 57).** The right "should not extend to mere facts reported in press publications". It is subject to the InfoSoc exceptions, including quotation "for purposes such as criticism or review". [dsm-rec57] The quotation exception requires lawful prior publication, attribution "including the author's name", "fair practice" and use only "to the extent required by the specific purpose". [infosoc-5]

**Authors' copyright is separate.** Art. 15 leaves journalists' own copyright "intact". [dsm-15] So the 2-year expiry and the publisher-only carve-outs do not end the analysis. Authors' rights also apply to non-EU outlets, such as the US, Argentine and Indian ones.

**Temporary copies (InfoSoc art. 5(1)).** Transient or incidental reproductions are exempt when they are "an integral and essential part of a technological process", their sole purpose is a network transmission or "a lawful use", and they "have no independent economic significance". [infosoc-5]

**Text and data mining.**

- TDM is "any automated analytical technique aimed at analysing text and data in digital form in order to generate information which includes but is not limited to patterns, trends and correlations". [dsm-2]
- **Art. 3** covers only research organisations and cultural-heritage institutions doing scientific research, so it does not cover Hemiciclo. [dsm-3]
- **Art. 4** covers anyone, including commercial users. It allows reproductions of "lawfully accessible" works, including press publications under art. 15(1), and the copies "may be retained for as long as is necessary for the purposes of text and data mining". [dsm-4]
- Art. 4 applies only if use "has not been expressly reserved by their rightholders in an appropriate manner, such as machine-readable means in the case of content made publicly available online". [dsm-4]
- Recital 18 confirms the exception is meant for private-sector innovation where art. 5(1) is not enough. [dsm-rec18]
- *Inference:* producing per-article framing labels, and aggregating them into outlet ratings, plausibly fits "generate information … patterns, trends". Whether a per-article classifier is TDM has not been tested in the sources read here. **Lawyer.**

**Reservations seen in practice.** The New York Times `robots.txt` says that "text and data mining activities under Art. 4 of the EU Directive on Copyright in the Digital Single Market" are prohibited without permission. [nyt-robots] El País's `robots.txt` blocks named crawlers such as CCBot, but carries no worded TDM reservation in the lines read. [elpais-robots] Each outlet therefore needs a per-outlet check.

## Spain

Spain implemented the Directive through Real Decreto-ley 24/2021, which amends the Ley de Propiedad Intelectual (LPI). [rdl]

**Art. 129 bis LPI (press publishers' right).** Publishers and news agencies established in Spain hold exclusive reproduction and making-available rights over online use "por parte de prestadores de servicios de la sociedad de la información". [lpi-129bis] Section 6 excludes:

- "a) El uso privado o no comercial de las publicaciones de prensa por parte de usuarios individuales."
- "b) Los actos de hiperenlace."
- "c) Al uso de palabras sueltas o extractos muy breves o poco significativos, tanto desde el punto de vista cuantitativo como cualitativo, … cuando dicho uso en línea no perjudique a las inversiones realizadas por las editoriales … y no afecte a la efectividad de los derechos reconocidos en el presente artículo."
- "g) Los contenidos cuyo uso esté amparado por una excepción o un límite". [lpi-129bis]

Spain's carve-out for very short extracts is therefore narrower than the Directive's. The extract must be brief *and* insignificant in both quantity and quality, and must not harm the publisher's investment. The right lasts 2 years from 1 January after publication. [lpi-130]

**Art. 32.2 LPI (aggregators).** Making available "textos o fragmentos de textos de publicaciones de prensa" by "prestadores de servicios electrónicos de agregación de contenidos" requires the rights holders' authorisation under art. 129 bis. Search tools for "palabras aisladas" are exempt only if they have no "finalidad comercial propia", are limited to what search results need, and link to the source. [lpi-32] This provision applies to "fragmentos" generally, and on its face it has no very-short-extract exception of its own. How it interacts with art. 129 bis 6(c) is the main open legal question for a public Spanish feed. **Lawyer.**

**Quotation (art. 32.1 LPI).** Spain's quotation limit applies only "con fines docentes o de investigación". Press reviews ("revista de prensa") count as quotations, but commercial compilations that consist "básicamente en su mera reproducción" owe remuneration, and the author can opt out. [lpi-32] The quotation route is therefore narrower in Spain than InfoSoc art. 5(3)(d) allows.

**Current-affairs articles (art. 33.1 LPI).** Articles on current topics may be reproduced "por cualesquiera otros de la misma clase", meaning other media, provided there is no rights reservation at source. [lpi-33] Hemiciclo is not a news medium, so it should not rely on this.

**Temporary copies (art. 31.1 LPI)** mirror InfoSoc art. 5(1). [lpi-31]

**TDM (art. 67 RDL 24/2021).** No authorisation is needed for reproductions of lawfully accessible works for TDM. Copies may be kept "durante todo el tiempo que sea necesario". The exception does not apply where rights holders "hayan reservado expresamente el uso de las obras a medios de lectura mecánica u otros medios que resulten adecuados". [rdl-67]

**Overlap with the news-sources research.** That research reads art. 129 bis 6(a) as covering the personal soak test, and treats a public site that shows Spanish excerpts as likely an art. 32.2 aggregator. [sources] These findings agree, with one refinement. The soak test's stronger footing is that an owner-only app behind login makes nothing available to the public at all, and 6(a) is a second line of defence. Whether an individual's self-hosted tool is an "information society service provider" is untested.

## United States

**Fair use (17 U.S.C. §107).** "Criticism, comment, news reporting … research" are listed purposes. The four factors are: purpose and character, including whether the use is commercial; the nature of the work; "the amount and substantiality of the portion used"; and "the effect of the use upon the potential market". [usc-107] There is no numeric safe harbour.

**Headlines and short phrases.** "Words and short phrases such as names, titles, and slogans" are not subject to copyright. [cfr-202.1] The Copyright Office cautions that registration practice is not the same as copyrightability. It notes arguments that original headlines and ledes can be protected, and that merger may apply to headlines that are "close to bare statements of fact". [uscop p.34–35]

**Excerpts.**

- *Associated Press v. Meltwater* (S.D.N.Y. 2013, a district court and so not binding precedent): reports showing the headline, "up to 300 characters of its lede, and up to 140 characters surrounding the 'hit'" reproduced protectable expression. [uscop p.32]
- The Office's synthesis: "A platform or service aggregating only the headline and lede … is less likely to reproduce the article's expressive content", but copying more raises the risk. Its conclusion is that "some, but not all, news aggregation is likely to qualify as fair use". [uscop p.33, p.44]

**Summaries.** In *Nihon Keizai Shimbun v. Comline* (2d Cir. 1999), "abstracts" that tracked the articles "sentence by sentence" infringed. Abstracts containing only the factual information did not. [uscop p.32–33] So Hemiciclo's summaries must be fact-based rewrites, not condensed translations.

**Full-text processing.**

- *Authors Guild v. Google* (2d Cir. 2015) held that "unauthorized digitizing of copyright-protected works, creation of a search functionality, and display of snippets … are non-infringing fair uses". The court's reasons were that the purpose is "highly transformative", "the public display of text is limited", and the snippets do not provide "a significant market substitute". [ag-google]
- In that case Google blacklisted "one snippet on each page and one complete page out of every ten", and researchers could not reach "as much as 16%" of any book. [ag-google]
- *Fox News v. TVEyes* (2d Cir. 2018) held that redistributing up-to-ten-minute clips was not fair use. Fox "does not challenge the creation of the text-searchable database". [tveyes][uscop p.42]
- *Inference:* classifying full text and showing only labels is closer to *Google Books* than to *TVEyes*.

**Transient copies.** A work is a "copy" only if it is embodied "for a period of more than transitory duration". Buffer data held for "a fleeting 1.2 seconds" was not fixed. Data kept in RAM until the computer is switched off, as in *MAI Systems*, was fixed. [cartoon] Holding text in memory for one request is the *Cartoon Network* side of that line. A copy kept by a vendor "in perpetuity" is not. [mca §4.1]

**No US press-publisher right.** The Copyright Office "does not recommend adopting a new ancillary copyright", finding that press publishers "have significant protections under existing law". [uscop-summary] Hot-news misappropriation survives only in a narrow form, and most claims since *NBA v. Motorola* "have found them to be either preempted or insufficiently proven". [uscop p.47]

## Argentina (Ley 11.723)

- **Exclusive rights.** The author's right includes reproducing the work "en cualquier forma". [ar-2] Unauthorised reproduction "por cualquier medio o instrumento" is a criminal offence (defraudación). [ar-71-72]
- **Quotation (art. 10).** "Cualquiera puede publicar con fines didácticos o científicos, comentarios, críticas o notas referentes a las obras intelectuales, incluyendo hasta mil palabras de obras literarias … y en todos los casos sólo las partes del texto indispensables a ese efecto." [ar-10] The 1,000 words is a ceiling, and it applies only to didactic or scientific commentary. *Inference:* the Article Lens is commentary on one article. Whether it is "didáctico o científico" is uncertain. **Lawyer.**
- **News (art. 28).** Unsigned articles and original reporting belong to the newspaper or agency. However, "las noticias de interés general podrán ser utilizadas, transmitidas o retransmitidas; pero cuando se publiquen en su versión original será necesario expresar la fuente de ellas". [ar-28] This supports fact-based summaries that cite the source. It does not support republishing original text.
- **Political speeches (art. 27).** These need the author's authorisation, and parliamentary speeches cannot be published for profit without it, "Exceptúase la información periodística". [ar-27] This matters for quoting politicians in Briefs, which goes beyond #6.
- **No TDM or temporary-copy exception** appears in the consolidated text. [ar] Transient processing therefore has no express statutory basis in Argentina. The practical risk mainly attaches to persisted or displayed copies.

## India (Copyright Act 1957, s.52)

- **Fair dealing (s.52(1)(a), as substituted in 2012).** It covers "(i) private or personal use, including research; (ii) criticism or review …; (iii) the reporting of current events and current affairs". An Explanation adds that "the storing of any work in any electronic medium for the purposes mentioned in this clause" is not infringement. [in-2012] The soak test fits (i). A public site would have to fit (ii) or (iii). There is no numeric limit.
- **Transient storage.**
  - Clause (b) covers "the transient or incidental storage of a work or performance purely in the technical process of electronic transmission or communication to the public". [in-2012]
  - Clause (c) covers such storage "for the purpose of providing electronic links, access or integration", unless the right holder has expressly prohibited it. After a written complaint, the provider must stop facilitating access for 21 days. [in-2012]
  - Neither clause expressly covers analysing text, which is the classification step.
- **Newspaper reproduction (s.52(1)(m)).** This allows reproduction "in a newspaper, magazine or other periodical of an article on current economic, political, social or religious topics, unless the author … has expressly reserved" the right. [in-act] It covers periodicals only, so it does not cover Hemiciclo.

## Soak test versus public site

| Question | Soak test | Public |
|---|---|---|
| EU/Spain press-publisher right | Owner-only, nothing made available to the public; art. 15 / 129 bis 6(a) private use | Applies to EU outlets for 2 years after publication. Spain art. 32.2 needs authorisation for "fragmentos" |
| RSS terms | Personal, non-commercial use permitted by every terms page read [sources] | Mostly not permitted without a licence [sources] |
| US fair use | Private, non-commercial, non-substitutive | Commercial use and displayed excerpts weigh against fair use. Keep to labels and own summaries |
| India s.52 | Private or personal use, including research | Criticism, review or current-events reporting only |
| Argentina | Low exposure (no public reproduction) | Art. 10 is narrow, art. 28 allows news with the source named |
| Jev MCA §5 warranty | Backed by private use plus transient copies | Needs a TDM-reservation check per outlet and an answer on retention |

## Unverified or open

- EUR-Lex and Curia did not respond from this environment. The directive text was read from legislation.gov.uk's copy of the as-adopted Official Journal text. The CJEU's *Infopaq* (C-5/08), which by common account holds that an extract of 11 words can be a protected "reproduction in part", and *PRCA v NLA* (C-360/13), on temporary copies for viewing news online, were **not read**. They bear directly on how short "very short" is, and on screen and cache copies.
- India Code's PDF returned 403. The s.52(1)(a)–(c) wording comes from the 2012 Amendment Act on WIPO Lex. The s.52(1)(m) wording comes from secondary reproductions of the Act and is **unverified** against India Code.
- How Spain's art. 32.2 interacts with art. 129 bis 6(c), and whether headlines alone need authorisation there.
- Whether per-article classification is "text and data mining" (DSM art. 2(2)), and whether art. 4 extends to a third-party processor's retained copies.
- Each outlet's TDM reservation. Only the NYT and El País `robots.txt` files were read.
- Whether TypeSafe's telemetry under MCA §4.1(c) keeps Input text or only metadata.

## Sources

- [dsm] Directive (EU) 2019/790, canonical text: https://eur-lex.europa.eu/eli/dir/2019/790/oj. Text read via https://www.legislation.gov.uk/eudr/2019/790/contents
- [dsm-2]: https://www.legislation.gov.uk/eudr/2019/790/article/2
- [dsm-3]: https://www.legislation.gov.uk/eudr/2019/790/article/3
- [dsm-4]: https://www.legislation.gov.uk/eudr/2019/790/article/4
- [dsm-15]: https://www.legislation.gov.uk/eudr/2019/790/article/15
- [dsm-rec18], [dsm-rec57], [dsm-rec58]: recitals 18, 57 and 58, https://www.legislation.gov.uk/eudr/2019/790/contents/data.html
- [infosoc-5] Directive 2001/29/EC art. 5: https://www.legislation.gov.uk/eudr/2001/29/article/5
- [lpi-31], [lpi-32], [lpi-33], [lpi-129bis], [lpi-130] Ley de Propiedad Intelectual, BOE consolidated text: https://www.boe.es/buscar/act.php?id=BOE-A-1996-8930#a31, #a32, #a33, #a1-34 (art. 129 bis), #a130
- [rdl], [rdl-67] Real Decreto-ley 24/2021, arts. 66–67: https://www.boe.es/buscar/act.php?id=BOE-A-2021-17910#a6-9
- [usc-107] 17 U.S.C. §107: https://www.law.cornell.edu/uscode/text/17/107
- [cfr-202.1] 37 C.F.R. §202.1(a): https://www.law.cornell.edu/cfr/text/37/202.1
- [uscop] U.S. Copyright Office, *Copyright Protections for Press Publishers* (June 2022), cited by printed page: https://www.copyright.gov/policy/publishersprotections/202206-Publishers-Protections-Study.pdf
- [uscop-summary]: https://www.copyright.gov/policy/publishersprotections/
- [ag-google] *Authors Guild v. Google, Inc.*, 804 F.3d 202 (2d Cir. 2015): https://www.courtlistener.com/opinion/3124896/authors-guild-v-google-inc/ (text read via https://static.case.law/f3d/804/cases/0202-01.json)
- [tveyes] *Fox News Network, LLC v. TVEyes, Inc.*, 883 F.3d 169 (2d Cir. 2018): https://www.courtlistener.com/opinion/4471221/fox-news-network-llc-v-tveyes-inc/ (text read via https://static.case.law/f3d/883/cases/0169-01.json)
- [cartoon] *Cartoon Network LP v. CSC Holdings, Inc.*, 536 F.3d 121 (2d Cir. 2008): https://www.courtlistener.com/opinion/2599/cartoon-network-lp-lllp-v-csc-holdings-inc/ (text read via https://static.case.law/f3d/536/cases/0121-01.json)
- [ar], [ar-2], [ar-10], [ar-27], [ar-28], [ar-71-72] Ley 11.723, InfoLEG consolidated text: https://servicios.infoleg.gob.ar/infolegInternet/anexos/40000-44999/42755/texact.htm
- [in-act] Copyright Act 1957, India Code: https://www.indiacode.nic.in/bitstream/123456789/1367/1/a195714.pdf
- [in-2012] Copyright (Amendment) Act 2012, s.32 (substituting s.52(1)(a)–(c)): https://www.wipo.int/wipolex/en/legislation/details/13230 (PDF https://www.wipo.int/edocs/lexdocs/laws/en/in/in066en.pdf)
- [mca] TypeSafe Master Customer Agreement, last updated 2026-09-23, §§4.1, 5: https://typesafe.ai/legal/mca
- [jev] Hemiciclo research, Jev API: https://github.com/lutzseverino/hemiciclo/blob/research/jev-api/docs/development/research/jev-api.md
- [sources] Hemiciclo research, political news sources: https://github.com/lutzseverino/hemiciclo/blob/research/political-news-sources/docs/development/research/political-news-sources.md
- [nyt-robots]: https://www.nytimes.com/robots.txt (read 2026-10-06)
- [elpais-robots]: https://elpais.com/robots.txt (read 2026-10-06)
