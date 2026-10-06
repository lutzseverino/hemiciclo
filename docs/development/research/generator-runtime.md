# Which runtime should run the soak-test Generator?

Research for [#13](https://github.com/lutzseverino/hemiciclo/issues/13). All sources were retrieved on 2026-10-06. Anthropic doc pages were read as the Markdown that `code.claude.com` serves at `<page>.md`. T3 Code source is pinned to commit [`f4f148e`](https://github.com/pingdotgg/t3code/tree/f4f148eb670622a049ae6561d7795011e383fc43). Homelab facts come from read-only checks on 2026-10-06. Nothing on the homelab was changed. The licensing reading builds on [the terms findings](https://github.com/lutzseverino/hemiciclo/blob/research/subscription-generation-terms/docs/development/research/subscription-generation-terms.md) for #5. This is not legal advice.

## Short answer

- **Recommendation: a headless `claude -p` run on the always-on Pi (`raspi`), started by a systemd timer and authenticated with a `claude setup-token` token.**
  - It is the unmodified, first-party Claude Code binary. Anthropic documents it for "CI pipelines, scripts, or other environments where interactive browser login isn't available". That removes the T3 Code grey zone.
  - It reaches a homelab ingest endpoint over the LAN or overlay, so the endpoint never has to be public.
  - The Pi never sleeps. A failed run gives a non-zero exit code, which systemd records.
- **Routine: first-party and the most reliable scheduler, but it cannot reach the homelab as built.** Routines run in Anthropic's cloud behind an egress proxy. Every Hemiciclo-shaped homelab service is overlay-only with split DNS. A Routine would need the ingest endpoint published on a public HTTPS name, which the homelab rules treat as a reviewed exposure change. A Routine could also use GitHub as a mailbox instead of reaching the homelab directly.
- **Desktop scheduled task: first-party, but it runs only while the owner's computer is awake with the Claude app open.** Missed runs collapse into one catch-up run. That suits a laptop, not a daily unattended job.
- **T3 Code scheduled thread: works today and is the most convenient to watch, but it stays the grey zone.** It must run on the Pi's T3 instance, because the homeserver powers off after two hours idle, and T3 skips a fixed-time run missed by more than 10 minutes. T3's "succeeded" status only means the prompt was dispatched.
- **Whichever runtime runs, Hemiciclo itself should flag stale Briefs.** No runtime's status shows whether the Brief was actually generated and ingested. A freshness check on the ingest side, such as "no bundle for Spain in 26 hours", is the one failure signal that is the same for every runtime.

## Comparison

| | First-party on Pro/Max? | Reaches a homelab ingest endpoint? | How it is scheduled | How failures are seen |
| - | - | - | - | - |
| **Headless `claude -p` + `setup-token` on the Pi** (recommended) | Yes. It is the unmodified Claude Code binary, and `setup-token` is documented for scripts. It is billed in the "`claude -p`" bucket of the paused Agent SDK plan. | Yes, privately over the LAN or overlay. No new exposure. | A systemd timer on `raspi`, which is always on. Any cron expression works. | Exit code (non-zero on failure), JSON `result`, the systemd unit status and journal, and resumable session transcripts. Token expiry after one year is a scheduled failure to plan for. |
| **Claude Code Routine** | Yes, an Anthropic-hosted feature on Pro and Max. It is a research preview. | Only if the ingest endpoint gets a public DNS name and public HTTPS on `raspi`, with the domain on the environment's network allowlist or attached as an API credential. Self-hosted runners that could sit inside the network are Team/Enterprise only. | Cloud schedule (hourly, daily, weekdays, weekly, or cron via `/schedule update`). Minimum interval of one hour. Runs even when every home machine is off. | Run list on claude.ai. Green only means "no infrastructure error". Task failures and blocked requests appear only in the run transcript. `/schedule` can explain a run. |
| **Claude Code Desktop scheduled task** | Yes, inside Anthropic's Claude app. | Yes, while the owner's computer is on the overlay. | The Desktop app checks every minute, but only while the app is open and the computer is awake. Skipped runs collapse into one catch-up run within 7 days. | Desktop notification when a run starts. Run history shows skipped runs and why. Runs in Manual mode stall on permission prompts. |
| **T3 Code scheduled thread** | No. T3 Code is a third-party app driving Claude Code through the Agent SDK. This is the grey zone from #5. | Yes, from the T3 instance on the Pi or the homeserver. | T3's in-app scheduler: an interval, a fixed time of day, or a webhook. Fixed-time runs missed by more than 10 minutes are skipped. The homeserver instance is powered off when idle. | Thread transcript. `lastRunStatus` and `lastRunError` cover dispatch only. Mobile push on finish or failure needs T3 Connect. |

## Details

### 1. Headless `claude -p` with `claude setup-token`

**First-party.**
- `claude setup-token` generates "a one-year OAuth token" for "CI pipelines, scripts, or other environments where interactive browser login isn't available". It "authenticates with your Claude subscription and requires a Pro, Max, Team, or Enterprise plan". It is passed as `CLAUDE_CODE_OAUTH_TOKEN` ([Authentication](https://code.claude.com/docs/en/authentication)).
- The token "can only make model requests, so it can't establish Remote Control sessions or fetch claude.ai connectors. MCP servers you configure locally still work" ([Authentication](https://code.claude.com/docs/en/authentication)).
- `--bare` "does not read `CLAUDE_CODE_OAUTH_TOKEN`", so the Generator must run without `--bare` ([Authentication](https://code.claude.com/docs/en/authentication); [Headless](https://code.claude.com/docs/en/headless)).
- Anthropic's credential rules do not prevent "an end user from signing in to the unmodified Claude Code binary with their own Claude subscription" ([Legal and compliance](https://code.claude.com/docs/en/legal-and-compliance)).
- On billing, the paused Agent SDK credit plan grouped "The `claude -p` command in Claude Code (non-interactive mode)" with SDK and third-party app usage. The June 16 notice says that "Claude Agent SDK, `claude -p`, and third-party app usage still draw from your subscription's usage limits" ([Use the Claude Agent SDK with your Claude plan](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan)).
- **Reading:** headless runs are first-party for the credential rules, which is the grey zone that mattered in #5. If Anthropic revives the credit plan, they would be billed exactly like T3 Code, against a monthly credit ($20 on Pro, $100 on Max 5x, $200 on Max 20x per the same article).

**Reaching the endpoint.**
- The Pi is the "always-on control plane, public HTTP/HTTPS edge, private routing, DNS, VPN" (homelab skill, `/home/agents/.agents/skills/homelab/SKILL.md`). A process there can reach an overlay-only or `host-local` ingest endpoint without any new exposure.
- The Pi already has Claude Code installed: `claude_version: 2.1.280` on its T3 host (`raspi:/srv/homelab/platform/inventory.yaml`, entry `t3_code_raspi`).

**Scheduling.**
- `claude -p` has no scheduler of its own. A systemd timer on `raspi` fits the platform, which already runs timers for jobs such as Cloudflare DDNS (`raspi:/srv/homelab/platform/inventory.yaml`, `cloudflare_ddns`).
- Do not schedule it on the homeserver. It "powers off after 7200 seconds idle" (`/srv/homelab/README.md`; `/etc/homelab/idle-shutdown.conf`).
- For unattended runs, pass `--permission-prompts none` "when nobody is available to answer permission prompts, for example in a scheduled job". Also pass an explicit `--permission-mode` and `--allowedTools` ([Headless](https://code.claude.com/docs/en/headless)).
- `--max-turns` and `--max-budget-usd` cap a runaway run ([CLI reference](https://code.claude.com/docs/en/cli-reference)).

**Failures.**
- "Claude Code exits with code 0 on success and a non-zero code when the run fails … When a failure happens inside the run, such as missing authentication, Claude Code prints the failure as the result on stdout" ([Headless](https://code.claude.com/docs/en/headless)).
- `--output-format json` returns the result, session ID and metadata. With `stream-json`, permission denials appear as `permission_denied` messages ([Headless](https://code.claude.com/docs/en/headless)).
- Sessions persist to disk unless `--no-session-persistence` is passed, so the owner can resume a failed run to inspect it ([CLI reference](https://code.claude.com/docs/en/cli-reference)).
- The token expires after one year. Record its renewal date.

**Secret handling.** The homelab rules forbid putting a long-lived token in a command line or a broadly inherited environment variable. They prefer a root-owned service secret store (homelab skill, `references/security.md`). A systemd unit can load `CLAUDE_CODE_OAUTH_TOKEN` from such a protected file. Hemiciclo never sees the token, which keeps the "never stores the owner's model credentials" rule from map #1.

### 2. Claude Code Routines

**First-party, and the billing differs.**
- "Routines are available on Pro, Max, Team, and Enterprise plans" and "draw down subscription usage the same way interactive sessions do" ([Routines](https://code.claude.com/docs/en/routines)).
- Routines are not in the list of Agent SDK credit uses ([Agent SDK plan article](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan)).
- "Routines are in research preview. Behavior, limits, and the API surface may change" ([Routines](https://code.claude.com/docs/en/routines)).

**Network.**
- "Routines execute on Anthropic-managed cloud infrastructure, or on your organization's self-hosted environment when routed there" ([Routines](https://code.claude.com/docs/en/routines)).
- Self-hosted environments "are in public beta on Team and Enterprise plans" ([Self-hosted environments](https://code.claude.com/docs/en/self-hosted-environments)). They are therefore not an option on the owner's Pro/Max plan.
- The Default environment's **Trusted** access "allows only the default allowlist". Other hosts "fail with `403` and `x-deny-reason: host_not_allowed`". "If your routine needs to reach your own services directly … edit the environment's network access" to **Custom** (your own domains) or **Full** ([Routines](https://code.claude.com/docs/en/routines); [Cloud environments](https://code.claude.com/docs/en/cloud-environments)).
- "All outbound internet traffic from an Anthropic-hosted session passes through" an "HTTP/HTTPS network proxy" ([Cloud environments](https://code.claude.com/docs/en/cloud-environments)).
- **Inference:** an HTTP(S)-only proxy rules out joining the WireGuard or NetBird overlay from the session VM.
- Anthropic publishes a stable outbound range, `160.79.104.0/21`, "for outbound requests (for example, when making MCP tool calls to external servers)" ([IP addresses](https://platform.claude.com/docs/en/api/ip-addresses)). No source says that cloud-session traffic leaves from that range, so source-IP allowlisting is not a documented option.

**Homelab side.**
- Comparable services are `exposure: overlay-only` with `dns_mode: split-dns-only`. Examples are both T3 Code instances (`raspi:/srv/homelab/platform/inventory.yaml`).
- A Routine-reachable ingest endpoint therefore needs a public DNS record and a public Caddy route on `raspi`, at the `authenticated-public` tier (homelab skill, `references/domain-routing.md` and `references/security.md`).
- The skill requires the owner's explicit approval and a security review before exposing anything sensitive.
- The endpoint would carry both the pending Generation Requests that the Routine reads and the bundles it posts.

**Credential.**
- On Pro and Max, an environment **API credential** lets "Anthropic's agent proxy add the key to requests for the hosts you list … The key never reaches Claude" ([Cloud environments](https://code.claude.com/docs/en/cloud-environments)).
- Hosts listed on a credential are reachable "even when the environment's network access level wouldn't otherwise allow them" ([Cloud environments](https://code.claude.com/docs/en/cloud-environments)).
- **Reading:** this is a clean way to hold the ingest token, if the endpoint were public.

**Alternative without inbound exposure (inference).**
- A Routine could commit bundles to a GitHub branch through the built-in GitHub proxy, and the homelab could pull them. Pushes go to "a branch prefixed with `claude/`" by default ([Routines](https://code.claude.com/docs/en/routines); [Cloud environments](https://code.claude.com/docs/en/cloud-environments)).
- This needs a sync component on the homelab. It also puts the request queue in GitHub instead of Hemiciclo.

**Scheduling.**
- Presets are "hourly, daily, weekdays, or weekly", and custom cron is set via `/schedule update`. "The minimum interval is one hour" ([Routines](https://code.claude.com/docs/en/routines)).
- A run "exactly on the hour … can start several minutes late" ([Routines](https://code.claude.com/docs/en/routines)).
- An API trigger (`/fire` with a bearer token) also exists, under a beta header ([Routines](https://code.claude.com/docs/en/routines)).

**Failures.**
- "A green status in the run list means the session started and exited without an infrastructure error. It does not mean the task in your prompt succeeded … Blocked network requests, missing connector tools, and task-level failures all surface there" in the transcript ([Routines](https://code.claude.com/docs/en/routines)).
- `/schedule why did my nightly review do nothing this morning?` reads run logs ([Routines](https://code.claude.com/docs/en/routines)).
- If GitHub is disconnected, the routine "skips runs … for up to 72 hours" and then turns off ([Routines](https://code.claude.com/docs/en/routines)).

### 3. Claude Code Desktop scheduled tasks

**First-party.** Local scheduled tasks live in the Claude Desktop app's **Code** tab ([Desktop scheduled tasks](https://code.claude.com/docs/en/desktop-scheduled-tasks)). The app ships for macOS and Windows, with a Linux beta ([Desktop](https://code.claude.com/docs/en/desktop)).

**Network.** A local task "runs on your machine with direct access to your files and tools" ([Desktop scheduled tasks](https://code.claude.com/docs/en/desktop-scheduled-tasks)). It reaches the ingest endpoint whenever that machine is on the LAN or overlay.

**Scheduling.**
- "Tasks only run while the desktop app is running and your computer is awake. If your computer sleeps through a scheduled time, the run is skipped. … Closing the laptop lid still puts it to sleep" ([Desktop scheduled tasks](https://code.claude.com/docs/en/desktop-scheduled-tasks)).
- On wake, "Desktop starts exactly one catch-up run for the most recently missed time" within seven days ([Desktop scheduled tasks](https://code.claude.com/docs/en/desktop-scheduled-tasks)).
- The minimum interval is 1 minute ([Desktop scheduled tasks](https://code.claude.com/docs/en/desktop-scheduled-tasks)).

**Failures.**
- "When a task fires, you get a desktop notification." The task's history shows "every past run, including skipped runs", and why each was skipped ([Desktop scheduled tasks](https://code.claude.com/docs/en/desktop-scheduled-tasks)).
- In Manual mode, a run that needs an unapproved tool "stalls until you approve it" ([Desktop scheduled tasks](https://code.claude.com/docs/en/desktop-scheduled-tasks)).

**Reading:** the Desktop app is a GUI app, and the homelab hosts are headless servers. The docs describe it only as running on "your machine", meaning the owner's computer. Daily Brief freshness would depend on the owner's computer being on.

### 4. T3 Code scheduled threads

**Not first-party.**
- T3 Code drives Claude through `@anthropic-ai/claude-agent-sdk` ([`apps/server/package.json`](https://github.com/pingdotgg/t3code/blob/f4f148eb670622a049ae6561d7795011e383fc43/apps/server/package.json)).
- It points the SDK at the user's own `claude` binary (`pathToClaudeCodeExecutable` in [`ClaudeProvider.ts`](https://github.com/pingdotgg/t3code/blob/f4f148eb670622a049ae6561d7795011e383fc43/apps/server/src/provider/ClaudeProvider.ts)).
- It "uses Claude Code's login and configuration", set up with `claude auth login` ([T3 docs: Claude](https://github.com/pingdotgg/t3code/blob/f4f148eb670622a049ae6561d7795011e383fc43/docs/user/providers-claude.md)).
- **Reading:** this keeps the credential out of T3 Code. It is still the "third-party apps that authenticate with your Claude subscription through the Agent SDK" case, which #5 left as the tolerated grey zone ([terms findings](https://github.com/lutzseverino/hemiciclo/blob/research/subscription-generation-terms/docs/development/research/subscription-generation-terms.md)).

**Network.**
- The homelab runs two instances, `t3_code_raspi` (always-on) and `t3_code_homeserver` (`raspi:/srv/homelab/platform/inventory.yaml`). Both can reach a LAN or overlay endpoint.
- Webhook-triggered tasks need "a T3 Connect managed tunnel" for a public URL ([T3 docs: Project settings](https://github.com/pingdotgg/t3code/blob/f4f148eb670622a049ae6561d7795011e383fc43/docs/user/project-settings.md)).

**Scheduling.**
- Schedules are an interval, a fixed time of day with weekdays, or a webhook. Fixed-time schedules use "that environment's time zone" ([T3 docs: Project settings](https://github.com/pingdotgg/t3code/blob/f4f148eb670622a049ae6561d7795011e383fc43/docs/user/project-settings.md)).
- "A due fixed-time run that is long past its slot (server was off or asleep) is skipped and re-aimed at its next occurrence". The grace window is 10 minutes. Interval runs catch up once ([`ScheduledTaskService.ts`](https://github.com/pingdotgg/t3code/blob/f4f148eb670622a049ae6561d7795011e383fc43/apps/server/src/scheduledTasks/ScheduledTaskService.ts); [`Schedule.ts`](https://github.com/pingdotgg/t3code/blob/f4f148eb670622a049ae6561d7795011e383fc43/apps/server/src/scheduledTasks/Schedule.ts)).
- The homeserver instance's power policy is "user-navigation-wakes; background-reconnects-passive; tasks-protect-power; idle-shutdown-after-two-hours" (`raspi:/srv/homelab/platform/inventory.yaml`).
- **Inference:** a timer on that instance does not fire while the host is off. The Generator would have to live on the Pi instance.

**Failures.**
- A run is marked `succeeded` when the thread starts or the prompt is queued, and `failed` with `lastRunError` when dispatch fails ([`ScheduledTaskService.ts`](https://github.com/pingdotgg/t3code/blob/f4f148eb670622a049ae6561d7795011e383fc43/apps/server/src/scheduledTasks/ScheduledTaskService.ts)). It does not reflect what the agent then did. Skipped fixed-time runs are only logged.
- Mobile push alerts "when an agent finishes, fails, needs approval, or asks for input" require T3 Connect ([T3 docs: Mobile notifications](https://github.com/pingdotgg/t3code/blob/f4f148eb670622a049ae6561d7795011e383fc43/docs/user/mobile-notifications.md)).

## Open points

- **Where the ingest endpoint lives, and its power behaviour.** Homeserver services "must tolerate the host being off" (homelab skill). If Hemiciclo runs on the homeserver, the Generator on the Pi must wake it first, for example with `hl-wake demand` as used for `t3-home` (`raspi:/srv/homelab/platform/inventory.yaml`). The alternative is to host the ingest on the Pi. This belongs to the map's open "How Hemiciclo deploys … on the homelab" item.
- **Where the Generator's instructions live.** The headless run is a fixed prompt plus repo skills, so the Generator's instructions should live in the Hemiciclo repo (`.claude/skills/`). Then a later API-key Generator, or a Routine, reuses them unchanged.
