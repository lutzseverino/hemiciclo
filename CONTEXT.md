# Hemiciclo

Hemiciclo gives a neutral, at-a-glance view of each country's political situation and classifies news articles by how they frame events. Its language centres on neutrality: what a text may assert in Hemiciclo's own voice, and what it must attribute.

## Country view

**Country Dashboard**:
The page that shows one country's current political situation, centred on its Country Brief.
_Avoid_: Country page, profile, overview

**Country Brief**:
A short, fixed-section account of a country's political situation on a given day, with every claim linked to a source.
_Avoid_: Summary, overview, report

**Followed country**:
A country the owner chose to keep current, so that its Country Brief is refreshed daily.
_Avoid_: Favourite, subscription

## Neutrality

**Narration rules**:
The four rules that every sentence in Hemiciclo's own voice must satisfy: actor-action-aim attribution, no unattributed causal connectives, describing mechanism rather than intent, and numbers rather than intensifiers.
_Avoid_: Style guide, tone guidelines

**Own voice**:
Text that Hemiciclo asserts itself, as opposed to a claim attributed to a named actor or source.
_Avoid_: Editorial voice

**Attributed claim**:
A statement presented as a named actor's or source's position rather than as fact.
_Avoid_: Quote, opinion

**Lexicon**:
Hemiciclo's controlled vocabulary of political terms, each with a definition and a usage rule. It is shown to readers and is distinct from this glossary.
_Avoid_: Dictionary, glossary, word list

**Reserved word**:
A Lexicon term whose use in the own voice is restricted, marked *defined*, *quote-only* or *banned*.
_Avoid_: Loaded word, banned word

**Form of government**:
The Lexicon term that describes how a country is governed, taken by default from its constitution.
_Avoid_: Regime, regime type, system

## Articles

**Article Lens**:
The capability that takes one pasted article and returns its classification and, later, its overview.
_Avoid_: Analyzer, checker

**Framing signal**:
An observable property of how an article reports, such as article type, attribution ratio, or Lexicon-flagged loaded terms.
_Avoid_: Bias score, quality score

**Leaning signal**:
An estimate of an article's position on one ideological axis, relative to its country's own political spectrum, with a confidence.
_Avoid_: Bias, political score, left-right rating

**Outlet rating**:
An outlet's profile, aggregated from the framing and leaning signals of its articles.
_Avoid_: Media bias rating, source rating

## Generation

**Generation Request**:
A record that a Country Brief or article overview is wanted and not yet produced.
_Avoid_: Job, task, ticket

**Brief bundle**:
The schema-conforming package that a generator delivers to Hemiciclo, containing a Country Brief and its sources.
_Avoid_: Payload, export

**Generator**:
Whatever produces Brief bundles outside the app, currently a scheduled headless Claude Code job on the owner's account.
_Avoid_: Worker, bot, AI
