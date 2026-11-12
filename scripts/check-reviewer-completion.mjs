// Run from the repository root: node scripts/check-reviewer-completion.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { reviewerState } from "../.agents/skills/babysit/reviewer.mjs";

const reviewer = JSON.parse(
  readFileSync(
    new URL("../.github/pull-request-reviewer.json", import.meta.url),
    "utf8",
  ),
);
const pattern = new RegExp(reviewer.finished.line, "u");
const unrelated =
  '| Other task | Completed datetime="2026-10-31T01:00:00Z" `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` |';

assert.equal(pattern.exec(unrelated), null, "#26: unrelated task must not match");

// Real summary row from PR #25, comment 6537066008.
const recorded =
  '| 📝 **Code Review** | ✅ **Completed** <relative-time datetime="2026-10-31T01:20:34.284494Z">2026-10-31T01:20:34.284494Z</relative-time> | `dbf0000` | PR opened |';
assert.deepEqual({ ...pattern.exec(recorded)?.groups }, {
  at: "2026-10-31T01:20:34.284494Z",
  sha: "dbf0000",
});

const head = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const at = "2026-10-31T01:00:00Z";
const row = (label, sha = head, time = at, status = "Completed") =>
  `| 📝 **${label}** | ✅ **${status}** <relative-time datetime="${time}">${time}</relative-time> | \`${sha}\` | PR opened |`;
const code = row("Code Review");
const security = row("Security Review");
const pendingCode = row("Code Review", head, at, "In progress");
const staleCode = row("Code Review", head, "2026-10-31T00:59:30Z");
const withSecurity = (codeRow) => `${security}\n${codeRow}`;
for (const sha of ["aaaaaaa", head]) {
  assert.deepEqual({ ...pattern.exec(row("Code Review", sha))?.groups }, {
    at,
    sha,
  });
}
assert.equal(pattern.exec(security), null, "Security Review must not match");

const requestedAt = Date.parse("2026-10-31T00:59:00Z");
function completion(body, options = {}) {
  const {
    login = reviewer.account,
    marker = reviewer.finished.commentMarker,
    ...context
  } = options;
  return reviewerState(reviewer, {
    head,
    requestedAt,
    evidenceRequestedAt: Date.parse(at),
    pushedAt: requestedAt,
    now: Date.parse("2026-10-31T01:02:00Z"),
    comments: [{ login, body: `${marker}\n${body}`, createdAt: at }],
    ...context,
  });
}

const cases = [
  ["exact unrelated task", unrelated, "pending"],
  ["Security Review only", security, "pending"],
  ["Code Review in progress", pendingCode, "pending"],
  ["Security Review with pending Code Review", withSecurity(pendingCode), "pending"],
  [
    "Security Review with another-head Code Review",
    withSecurity(row("Code Review", "bbbbbbb")),
    "pending",
  ],
  ["Security Review with stale Code Review", withSecurity(staleCode), "pending"],
  ["Code Review label on another line", `Code Review\n${unrelated}`, "pending"],
  ["full Code Review hash at cutoff", code, "reviewed"],
  ["abbreviated Code Review hash", row("Code Review", "aaaaaaa"), "reviewed"],
  [
    "Security Review before valid Code Review",
    `${row("Security Review", "bbbbbbb", "2026-10-31T00:59:30Z")}\n${code}`,
    "reviewed",
  ],
  ["Security Review after valid Code Review", `${code}\n${security}`, "reviewed"],
  ["wrong author", code, "pending", { login: "other-reviewer[bot]" }],
  ["missing marker", code, "pending", { marker: "" }],
  ["wrong head", row("Code Review", "bbbbbbb"), "pending"],
  ["completion before evidence cutoff", staleCode, "pending"],
];
for (const [name, body, expected, options] of cases) {
  assert.equal(completion(body, options), expected, name);
  console.log(`${name}: ${expected}`);
}
console.log("Reviewer completion regression checks passed.");
