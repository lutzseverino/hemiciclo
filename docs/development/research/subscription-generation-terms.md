# May subscription-run agent threads produce Hemiciclo content?

Research for [#5](https://github.com/lutzseverino/hemiciclo/issues/5). All sources were retrieved on 2026-10-06. Quotes are verbatim. This note reports what Anthropic's own documents say. It is not legal advice.

## Setup evaluated

Scheduled T3 Code threads generate country Briefs and article overviews and POST them to Hemiciclo's ingest endpoint. T3 Code is a third-party app that drives Claude Code through `@anthropic-ai/claude-agent-sdk` ([t3code `apps/server/package.json`](https://github.com/pingdotgg/t3code/blob/main/apps/server/package.json)). The threads run on the owner's Claude Pro/Max login, and Hemiciclo never holds that credential. The owner is a consumer resident in Spain, so the EEA/Switzerland Consumer Terms apply. That is also the version anthropic.com served for this research.

## Short answer

- **Soak test (owner-only): allowed, with one tolerated grey zone.** The owner signs in to the unmodified Claude Code with his own subscription, which Anthropic says it does not prevent. Anthropic documents scripted and scheduled subscription use itself. Anthropic also owns that "third-party apps that authenticate with your Claude subscription through the Agent SDK" currently "still draw from your subscription's usage limits". The grey zone is that T3 Code is a third-party tool. Anthropic only "may at its discretion allow" such tools on a subscription, and it reserves the right to bill them to usage credits instead. Keep the runs at personal scale.
- **Public site: move generation to API billing first.** Three things in the sources point the same way. Subscription credentials may not serve "third-party traffic", which covers public visitors' Generation Requests. The EEA Consumer Terms forbid "any commercial or business purposes". And Anthropic tells anyone "building a product, application, or tool for others" to use an API key under the Commercial Terms. Whatever the billing, a public site that auto-publishes generated content is an AUP High-Risk Use Case, which requires human review and AI disclosure.
- **Clearly not allowed under either plan:** sharing the subscription credential, letting Hemiciclo or any other app store or intermediate it, and generating misleading political content.

## Clause-by-clause

### 1. Which terms govern

- Claude Code docs, [Legal and compliance](https://code.claude.com/docs/en/legal-and-compliance) (undated, retrieved 2026-10-06): "Your use of Claude Code is subject to: Commercial Terms of Service - for Team, Enterprise, and Claude API users; Consumer Terms of Service - for Free, Pro, and Max users". The subscription runs therefore sit under the **Consumer Terms**.
- [Consumer Terms](https://www.anthropic.com/legal/consumer-terms) (effective 8 Oct 2025): "These Terms apply to you if you are a consumer who is resident in the European Economic Area or Switzerland. You are a consumer if you are acting wholly or mainly outside your trade, business, craft or profession". Also: "Our Commercial Terms of Service govern your use of any Anthropic API key, the Anthropic Console, …".
- [Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview) (retrieved 2026-10-06): "Use of the Claude Agent SDK is governed by Anthropic's Commercial Terms of Service". This binds T3 Code as the SDK's integrator. The owner's model usage stays on his consumer plan. *Ambiguous:* no source says how the SDK licence and the consumer plan interact for an end user of a third-party SDK app.

### 2. Automated, scheduled use

- Consumer Terms §3 forbids accessing the Services "[e]xcept when you are accessing our Services via an Anthropic API Key or where we otherwise explicitly permit it, … through automated or non-human means, whether through a bot, script, or otherwise."
- Anthropic explicitly permits scripted and scheduled subscription use on its own surfaces:
  - [Authentication](https://code.claude.com/docs/en/authentication): "For CI pipelines, scripts, or other environments where interactive browser login isn't available, generate a one-year OAuth token with `claude setup-token` … This token authenticates with your Claude subscription".
  - [Routines](https://code.claude.com/docs/en/routines): "Routines are available on Pro, Max, Team, and Enterprise plans" and "draw down subscription usage the same way interactive sessions do."
  - [Desktop scheduled tasks](https://code.claude.com/docs/en/desktop-scheduled-tasks) offers the same scheduling inside Claude Code Desktop.
- [Use the Claude Agent SDK with your Claude plan](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan) (updated 16 Jun 2026): "Update June 15: We're pausing the changes to Claude Agent SDK usage … For now, nothing has changed: Claude Agent SDK, claude -p, and third-party app usage still draw from your subscription's usage limits." The paused plan names the case directly as "Third-party apps that authenticate with your Claude subscription through the Agent SDK". It also says the credit was "sized for individual experimentation and automation" and that "shared production automation should use Claude Platform with an API key".
- **Reading:** scheduled automation on a subscription is explicitly permitted. Anthropic also acknowledges SDK-based third-party apps on a subscription and currently bills them against plan limits. Anthropic has signalled that the billing treatment may change.

### 3. Subscription credentials in a third-party tool

- [Legal and compliance](https://code.claude.com/docs/en/legal-and-compliance), "Authentication and credential use":
  - "OAuth authentication is intended exclusively for purchasers of Claude Free, Pro, Max, Team, and Enterprise subscription plans and is designed to support ordinary use of Claude Code and other native Anthropic applications."
  - "Anthropic does not permit third-party developers to offer Claude.ai login into their own applications, or to route requests through Free, Pro, or Max plan credentials on behalf of their users. Moreover, developers may not collect, store, or intermediate Claude.ai credentials or session tokens — sign-in to a Claude account must complete through Anthropic's own flow."
  - "Nor does it prevent an end user from signing in to the unmodified Claude Code binary with their own Claude subscription, including where a platform hosts Claude Code".
  - "Anthropic reserves the right to take measures to enforce these restrictions and may do so without prior notice."
- [Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview): "Unless previously approved, Anthropic does not allow third party developers to offer claude.ai login or rate limits for their products, including agents built on the Claude Agent SDK."
- [Log in to your Claude account](https://support.claude.com/en/articles/13189465-log-in-to-your-claude-account) (updated 19 May 2026): "Subscription plans can only be used by subscribers, and the usage included in these plans is designed to support ordinary use of native Anthropic applications". It continues: "The preferred way to access Anthropic services using third-party software … is through API key authentication … Anthropic may at its discretion allow paid subscribers who have enabled usage credits to use certain third-party tools …, but reserves the right to draw use of such third-party tools from usage credits rather than subscription limits. … Use of third-party tools that misrepresent their identity to Anthropic's servers, attempt to route third-party traffic against subscription limits, or otherwise violate applicable terms or policies is prohibited". Under "Developers" it adds: "If you're building a product, application, or tool for others, use API key authentication".
- Consumer Terms §2: "You may not share your Account login information, Anthropic API key, or Account credentials with anyone else or make your Account available to anyone else."
- **Reading:**
  - The owner signs in through Anthropic's own flow, Claude Code runs unmodified, and only the owner's traffic is served. That matches the end-user carve-out.
  - Hemiciclo never holding the credential keeps it clear of "collect, store, or intermediate".
  - The residual grey zone is T3 Code as a third-party tool. Its use on a subscription is at Anthropic's discretion and may be billed to usage credits. Whether T3 Code itself "offer[s] claude.ai login" is T3 Code's compliance question.
  - To remove the grey zone, run the same thread as a first-party Desktop scheduled task or Routine.

### 4. Volume

- [Legal and compliance](https://code.claude.com/docs/en/legal-and-compliance): "Advertised usage limits for Pro and Max plans assume ordinary, individual usage of Claude Code and the Agent SDK."
- Daily refreshes for four soak-test countries plus the owner's own requests look like individual use. Refreshing every country for an audience does not.

### 5. Owning and publishing the outputs

- Consumer Terms §4: "Subject to your compliance with our Terms, we assign to you all our right, title, and interest (if any) in Outputs." The same section anticipates "shar[ing] Materials with others at your direction". It also makes the user responsible for ensuring that sharing "will not violate our Terms, our Acceptable Use Policy, or any laws".
- Consumer Terms §4 also says: "You should not rely on any Outputs or Actions without independently confirming their accuracy."
- Commercial Terms (effective 17 Jun 2025), under API billing: "Customer … owns its Outputs". Under D.3 the customer "must notify its Users, that factual assertions in Outputs should not be relied upon without independently checking their accuracy".

### 6. Commercial use

- Consumer Terms §11 (EEA): "Non-commercial use only. You agree that you will not use our Services for any commercial or business purposes".
- **Reading:**
  - A private soak test is not commercial.
  - A paid tier, ads or any monetised public site would be commercial and needs the Commercial Terms, meaning API billing.
  - *Ambiguous:* whether a free, non-monetised public site run as a product counts as a "business purpose".

### 7. Usage Policy (applies on any plan)

[Usage Policy](https://www.anthropic.com/legal/aup), effective 15 Sep 2025.

- It applies to anyone who submits inputs, under "Universal Usage Standards". Relevant prohibitions:
  - "Generate or disseminate false or misleading information in political and electoral contexts, including about candidates, parties, policies, voting procedures, or election security"
  - "Create political content designed to deceive or mislead voters"
  - "Impersonate real entities or create fake personas to falsely attribute content". This matters for attributed claims in Briefs.
- High-Risk Use Cases include "Media or professional journalistic content: Use cases related to using our products or services to automatically generate content and publish it for external consumption." These cases require:
  - "Human-in-the-loop: … a qualified professional in that field must review the content or decision prior to dissemination or finalization."
  - "Disclosure: If model outputs are presented directly to individuals or consumers, you must disclose to them that you are using AI".
- **Reading:**
  - Private soak test: the content is not published "for external consumption", so the high-risk requirements do not apply yet.
  - Public site: these requirements apply whatever the billing. Showing the model and generation time on each Brief (map #1) goes toward disclosure. A human review gate before publication is not in the current design.

## Allowed, not allowed, ambiguous

| | Status | Source |
| - | - | - |
| Owner signs in to unmodified Claude Code with his own Pro/Max login | Allowed | Legal and compliance |
| Scheduled or scripted runs on that login (setup-token, Routines, Desktop scheduled tasks) | Allowed, explicitly documented | Authentication; Routines; Desktop scheduled tasks |
| Those runs driven through T3 Code (third-party Agent SDK app) | Ambiguous but currently acknowledged and billed against plan limits; may be moved to usage credits or enforced against | Agent SDK plan article; Log-in article; Agent SDK overview |
| Owner keeps, edits and shares outputs | Allowed, subject to the Terms and the AUP | Consumer Terms §4 |
| Hemiciclo stores or forwards the OAuth token | Not allowed | Legal and compliance; Consumer Terms §2 |
| Public visitors' Generation Requests served on the owner's subscription | Not allowed ("third-party traffic"; "on behalf of their users") | Log-in article; Legal and compliance |
| Any commercial or business use, including the paid tier | Not allowed on the consumer plan; needs Commercial Terms and API billing | Consumer Terms §11; Commercial Terms |
| Free, non-monetised public site generated by the owner's own scheduled thread | Ambiguous ("business purposes"; "building a product … for others"); Anthropic's guidance points to an API key | Consumer Terms §11; Log-in article |
| Auto-publishing generated political content publicly | Allowed only with human review and AI disclosure, never misleading | Usage Policy |

## What moves generation to API billing

Switch the generator to an Anthropic API key, under the Commercial Terms, when any of these happens:

1. Generation runs for anyone other than the owner. This includes honouring public visitors' Generation Requests.
2. Hemiciclo becomes commercial in any way: a paid tier, ads, or a business entity behind it.
3. The site goes public as a product "for others". Anthropic's guidance points to an API key here even without monetisation.
4. Volume outgrows "ordinary, individual usage".
5. Anthropic stops tolerating subscription auth in third-party SDK apps, or starts billing that usage to usage credits.

Map #1 already fixes the bundle schema so that an API-backed generator can replace the thread. That keeps this switch cheap.
