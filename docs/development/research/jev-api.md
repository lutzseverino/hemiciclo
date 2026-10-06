# Jev's API for classification and checking

Research for [#4](https://github.com/lutzseverino/hemiciclo/issues/4). Read on 2026-10-06 against TypeSafe's public docs and legal pages only. No API calls were made.

## Short answer

- **Shape.** One endpoint, `POST https://api.typesafe.ai/v1/systemone`, sends one `state` (a string, an object or an array of text) and a map of named questions. Each question is a **Choice** (up to 255 options; returns the top option, a probability per option and a confidence), a **Score** (2 to 10 ordered levels; returns a probability-weighted position, per-level probabilities and a confidence) or a **Noul** (a yes/no question; returns P(yes), with no separate confidence). [api][system-one]
- **Batching.** You batch questions, not documents. Any number of questions about one state go in one request, are evaluated in parallel and independently, and pay for the state once. There is no documented way to send several states in one request. [state][parallel][rag]
- **Limits.** 64k tokens per request (the state plus all questions), and 32k for the state plus the single longest question. Text only. English is best, and other languages are "handled but not equally well". [models]
- **Latency.** No SLA is published. Cookbook runs on `jev-1.13.0` measured mean round trips of about 111–114 ms. [noul-consistency][choice-consistency] That makes a synchronous Article Lens plausible.
- **Price and rate limits.** $0.042 per million input tokens, and output tokens are free. Default limits are 100K tokens/s and 80 requests/s, but TypeSafe says these "can change without notice". Usage is paid for with prepaid Credits. [models][mca §8.2]
- **First-option bias.** This is a documented jagged edge of `jev-1.13`. The only mitigation the docs give is "reorder the options to double check that the answer stays consistent". [jaggedness] Hemiciclo can do that cheaply by asking rotated copies of the same Choice in one request (sketch (c) below).
- **Terms.** Neither the MCA nor the AUP mentions political content, elections or news. Output is assigned to the customer, so showing Jev's labels publicly is permitted. The relevant constraints are:
  - Don't mislead anyone about whether content is AI-generated. [aup 1.4]
  - Don't offer the API as a standalone service. [mca 2.3(a)]
  - Don't use Output to train an imitating or competing model. [mca 2.3(b)]
  - No right to use TypeSafe's name, brand or logo is granted. [mca 16.4]
  - Output "may be inaccurate", and the customer must evaluate it independently. [mca 9.3]

## Details

### Request and response

- The request has three required fields: `state`, `model` and `questions`. `questions` maps ids you choose to question objects. "The key is not sent to the underlying model and is not used in inference." [api]
- The three question types share `type` and `instructions`, and each adds its own `criteria`. `instructions` and each criterion can be a string, an object or an array. Field names inside an object are free-form and the model sees them, so labels like `what`, `not_for` and `examples` are ordinary text, not API keywords. [api][choice]
  - **Choice:** `criteria` maps each option to a description, or to `null`. Maximum 255 options. The answer has `choice` (the highest-probability option), `probabilities` (summing to 1) and `confidence`. [api]
  - **Score:** `criteria` is an ordered array of level descriptions, "at least two levels; the API accepts up to 10". The answer has `score`, which "can land between levels", plus `legend`, `probabilities` and `confidence`. [api]
  - **Noul:** `criteria` is optional and holds `{true, false}` descriptions. The answer is `noul`, a 0–1 P(yes). "There is no separate `confidence` value for a Noul." [api][noul]
- A Choice's `confidence` is computed from the spread of its probabilities. The docs' interactive explorer computes it as `(n·p_max − 1)/(n − 1)` for n options. [confidence] This matches the docs' own example: p_max 0.61 over 3 options gives 0.42. [choice]
- The response carries `model`, the versioned ID that answered (for example `jev-1.13.0`), and `usage.input_tokens` / `output_tokens`. [api]
- **Aliases.** `jev-latest` and `jev-preview` both point at `jev-1.13.0` today. An alias "moves when a new release ships". "If you have tuned confidence thresholds against a specific version, pin that version's ID." [models] Hemiciclo should pin `jev-1.13.0` and store the response `model` with every label.
- **Errors.** `401` means a bad key. `422` means validation failed. `429` means a rate limit was hit. `529` means TypeSafe is overloaded. Retry 429 and 529 with exponential backoff. [api] The SDKs honour `retry-after`. [models]
- **SDKs.** There are Python and JavaScript SDKs. [llms.txt] There is no Java SDK, so `services/hemiciclo` (Spring Boot) would call the HTTP API directly and implement its own backoff. *(Inference from the SDK list.)* For reference, the Python SDK's default retry policy is 2 retries, 0.5–5 s backoff with jitter, and a 30 s timeout. [retries]

### Batching and context

- "Each request evaluates one state against one or more questions. All questions see the same state and are evaluated independently. You can mix Choice, Score, and Noul questions in one request." [state]
- "Adding questions barely changes the response time and costs only the tokens for the extra questions." [primitives] The parallel-questions cookbook sent 13 questions over the ~54,000-character GDPR article on `jev-1.12`. One call took 0.27 s and cost $0.000497. Thirteen separate calls took 2.71 s and cost $0.006090. The answers were the same. [parallel] The docs quote this two ways: the primitives page says "11.5x cheaper and 9.6x faster", and the cookbook says 12.2x and 10.0x. The figures come from different runs. [primitives][parallel]
- **No multi-document batching.** The RAG cookbook says: "One request per passage, so cost scales with `k`. Nothing batches passages into one request." [rag] Many articles or many Brief sentences means many requests, which can run concurrently within the rate limits. The alternative is one state holding an array, with one question per index (``"Is `items[3]` …?"``), as in the docs' counting example. [jaggedness]
- **Context.** 64k tokens per request; 32k for the state plus the longest question. [models] Accuracy falls when the state holds content irrelevant to the question ("context rot"), so send only what each question needs. [jaggedness]
- *Derived, not documented:* the $0.000497 batched GDPR call implies about 11.8k input tokens at the $0.042/Mtok rate the cookbook used. That is roughly 4.6 characters per token for English prose. On that basis a typical news article fits comfortably. TypeSafe does not document its tokenizer, and non-English text may tokenize differently.

### Latency

- No latency guarantee or SLA appears in the docs or the MCA. The MCA disclaims liability for "delays, failures, outages". [mca §9.3]
- The measured figures are all from TypeSafe's own cookbook runs:
  - 111 ms mean round trip for 14 Nouls on `jev-1.13.0`, sampled 2026-09-11. [noul-consistency]
  - 114 ms for 8 Choices on `jev-1.13.0`. [choice-consistency]
  - 0.27 s for 13 questions over a ~54k-character article on `jev-1.12`. [parallel]

### Price, credits and rate limits

- **Price.** $42 per billion / $0.042 per million tokens. "Charged per input token. Output tokens are free." [models]
- **Credits.** Usage consumes prepaid Credits. Purchased Credits expire after 12 months, or at the end of the Term if that comes first. If the balance runs out and auto-refill is off, "TypeSafe may decline to generate Output". [mca §8.2] The API reference does not document which error code that produces. **Unverified.**
- **Rate limits.** The default is 100K tokens/s and 80 requests/s, and either limit returns `429`. "Rate limits are adjusting dynamically … can change without notice". Higher limits come with custom or enterprise plans. [models] The owner's Order can also set Usage Limits. [mca §2.1] The owner's actual limits are **unverified**.
- *Derived:* an article of ~2.5k tokens plus ~10 short questions comes to about 3–4k input tokens. That is about $0.00015 per article, or roughly $0.15 per thousand articles.

### Consistency and determinism

- System One "is designed to return stable answers across repeated evaluations". [how-to-build] It is not bit-for-bit deterministic, and no temperature or seed parameter is documented. [api]
  - **Nouls:** over 15 repeats on `jev-1.13.0`, the mean per-question standard deviation was 0.0102, and one answer still crossed a 0.5 threshold (0.43–0.53). [noul-consistency]
  - **Choices:** plurality labels repeated 90.8% of the time, and "TypeSafe flips on 2 of the 8 questions". [choice-consistency]
- **Consequence for Hemiciclo:** treat a stored label as an observation, recorded with its model ID and time, rather than recomputing it on view. Route mid-band answers to "uncertain".

### Known weaknesses that matter here ([jaggedness], last reviewed 2026-10-02)

- **Literal reading.** "answers the question you wrote, not the one you meant". Put boundary cases in the criteria.
- **One judgment per question.** Don't hide several judgments in one question. "Where interpretation is unavoidable, split it into two literal questions and combine them in code." The Noul page says the same: "Ask one yes/no question per Noul." [noul]
- **Indirection.** Avoid double negatives and multi-hop questions.
- **Adversarial content.** "text that argues for its own classification, can move the answer". An opinion piece that frames itself as reporting is exactly this case.
- **Contradictory instructions and criteria.** Don't invert a Noul so that `true` means no.
- **Choice option order.** "the order of a Choice's options can affect the answer, and `jev-1.13` leans toward the option that comes first." The docs give no magnitude.
- **Generation.** It does not generate text.
- **Language.** "English is the primary training language … Other languages … are handled but not equally well; test on your own content". [models] This matters directly: the Spain and Argentina sources are Spanish, and India's may not be English. The docs don't say whether instructions should be in English when the state is not. **Unverified.**

### Sketch (a): article-type Choice

This follows the structured-criteria pattern for options that are easy to confuse. [choice] The docs also advise adding an `other` option "when the list might not cover every input". [choice] The map lists only news, opinion and analysis, so adding `other` is a recommendation, not a settled decision.

```json
{
  "model": "jev-1.13.0",
  "state": {
    "outlet": "El País",
    "section_label": "Opinión",
    "headline": "…",
    "text": "…"
  },
  "questions": {
    "article_type": {
      "type": "choice",
      "instructions": {
        "question": "What type of article is `text`?",
        "focus": "Judge the writer's own voice, not the views of people the article quotes."
      },
      "criteria": {
        "news": {
          "what": "Reports events, statements or figures. Judgments appear only as quotes or attributed claims.",
          "not_for": "Pieces where the writer explains why things happened (analysis) or argues for a position (opinion)."
        },
        "analysis": {
          "what": "Explains context, causes or likely consequences in the writer's own voice, without arguing for what should be done.",
          "not_for": "Pieces that recommend, praise or condemn (opinion)."
        },
        "opinion": {
          "what": "Argues for a position in the writer's own voice: recommends, praises, condemns. Includes editorials, columns and letters.",
          "not_for": "Neutral explanation (analysis)."
        },
        "other": "None of the above, such as a live blog, a transcript or a press release."
      }
    }
  }
}
```

Keep any deterministic signal in code, such as an outlet's own "Opinion" section label. [how-to-build] Passing it in `state` as well lets Jev weigh it, but be aware that self-labelling text can steer the answer. [jaggedness]

### Sketch (b): Narration-rule-2 check as Nouls

The ticket's question, "does this sentence assert a causal link in the writer's own voice?", is **two conditions in one Noul**: a causal link, and the absence of attribution. The docs advise splitting it. [noul][jaggedness] Rule 2 also bans *adversative* connectives (*but*, *despite*), which needs a third question. A word-list match on *so, because, therefore, but, despite, in response to* belongs in code as a cheap hard flag. Jev catches implicit links ("prompted", "sparked", "after" used causally) that a regex misses.

```json
{
  "model": "jev-1.13.0",
  "state": { "sentence": "The central bank raised rates after inflation reached 4.1%, prompting street protests." },
  "questions": {
    "asserts_causal_link": {
      "type": "noul",
      "instructions": "Does `sentence` state that one event, action or condition caused, led to, prompted, or was a response to another?",
      "criteria": {
        "true": "Explicit or implied cause and effect, e.g. 'because', 'so', 'led to', 'prompting', 'in response to', or 'after' used to mean 'because of'",
        "false": "Events listed or ordered in time with no claim that one produced the other"
      }
    },
    "causal_link_attributed": {
      "type": "noul",
      "instructions": "Is every cause-and-effect claim in `sentence` attributed to a named or described source, such as 'the government said' or 'according to the opposition'?",
      "criteria": {
        "true": "Each causal claim is reported as what a source said or claimed",
        "false": "At least one causal claim is stated as fact, without a source"
      }
    },
    "adversative_in_own_voice": {
      "type": "noul",
      "instructions": "Outside of quotes or attributed claims, does `sentence` set two facts against each other, using words like 'but', 'however', 'despite' or 'although'?"
    }
  }
}
```

In code: flag a violation when `asserts_causal_link > YES` and `causal_link_attributed < NO`, or when `adversative_in_own_voice > YES`. Send anything in the middle band to review. The thresholds are Hemiciclo's to tune. [noul] For a whole Brief, either send one request per sentence (cleanest, since the state holds only that sentence) or one request with `{"sentences": [...]}` and one question per index. The second option is fewer calls but a larger state, which risks context rot. [jaggedness] [#10](https://github.com/lutzseverino/hemiciclo/issues/10) should compare the split form against the single-Noul phrasing from the ticket.

### Sketch (c): option-order shuffling

The docs' remedy is to reorder the options and check that the answer holds. [jaggedness] Three documented facts make this cheap:

- Questions in one request are independent. [state][parallel]
- Question ids are not seen by the model. [api]
- Extra questions cost only their own tokens, since the state is billed once. [primitives]

So send **every cyclic rotation** of the option list as separate questions in the same request, which puts each option first exactly once:

```json
"questions": {
  "article_type_r0": { "type": "choice", "instructions": "…", "criteria": { "news": "…", "analysis": "…", "opinion": "…", "other": "…" } },
  "article_type_r1": { "type": "choice", "instructions": "…", "criteria": { "analysis": "…", "opinion": "…", "other": "…", "news": "…" } },
  "article_type_r2": { "type": "choice", "instructions": "…", "criteria": { "opinion": "…", "other": "…", "news": "…", "analysis": "…" } },
  "article_type_r3": { "type": "choice", "instructions": "…", "criteria": { "other": "…", "news": "…", "analysis": "…", "opinion": "…" } }
}
```

Combine the results in code:

1. Average `probabilities` per option name. Read them by key, because the response map does not preserve request order (see the examples on the Choice page). [choice]
2. Take the argmax and recompute confidence with the docs' formula.
3. If the rotations' `choice` values disagree, mark the label `uncertain`, whatever the averaged confidence says.

**Caveats:**

- The docs don't say how strong the bias is or whether rotation fully cancels it. This is **unverified** until [#9](https://github.com/lutzseverino/hemiciclo/issues/9) measures it.
- The option order is the key order of the `criteria` JSON object. The JSON spec notes that libraries differ in whether they preserve member order ([RFC 8259 §4](https://www.rfc-editor.org/rfc/rfc8259#section-4)), so Spring/Jackson must build `criteria` from an ordered map (`LinkedHashMap`).
- Score levels are ordered by meaning, and the docs report no position bias for Score. Don't shuffle them.
- Nouls have no options to reorder. Their analogous trap is inverted true/false wording. [jaggedness]

### Terms: MCA and AUP

Both the MCA and the AUP were last updated 2026-09-23. [mca][aup]

- **Political content.** No clause in either document mentions politics, elections, campaigns or news. The applicable AUP limits are the general ones:
  - no defamatory, hateful or discriminatory activity, and no incitement (1.7–1.9);
  - no infringing another person's IP or privacy (1.1);
  - no misleading others "about whether content, including Output, was generated by AI" (1.4).

  TypeSafe "reserves the right to take remedial action in connection with content or uses not specifically described" and may change the AUP "at any time by posting a revised version". [aup]
- **Showing labels publicly.**
  - TypeSafe "disclaims ownership of Output" and assigns any rights in it to the customer. [mca §4.2]
  - Building a Customer Application "for the benefit of Customer's end users" is licensed. [mca §2.2]
  - Public display of Hemiciclo's labels is permitted, provided they are clearly presented as AI-produced (AUP 1.4). This fits the map's rule that a Brief shows its model.
- **Limits that touch Hemiciclo's design.**
  - **§2.3(a):** no making the Services available "as a standalone service". A public Article Lens that returned raw Jev answers for arbitrary pasted text could look like that. The v1 owner-only soak test does not.
  - **§2.3(b):** no using Output "to perform model distillation, train a model to imitate the output of the Services, or develop … a similar or competing product". Aggregating labels into outlet ratings is not training. The docs themselves suggest feeding Jev probabilities into a downstream classical model ([models], AutoResearch cookbook), but a Hemiciclo-trained classifier that reproduces Jev's labels would be at risk. **Needs a decision.**
  - **§16.4:** "Nothing in this Agreement grants either Party the right to use the name, brand, or logo of the other Party." Captioning labels "classified by Jev 1.13" is not expressly licensed. Whether nominative use is fine is a legal question the docs don't answer. **Unverified.**
  - **§5:** the customer warrants that it has the rights needed for TypeSafe to process Input. Sending copyrighted article text as `state` relies on that warranty, which overlaps with [#6](https://github.com/lutzseverino/hemiciclo/issues/6).
  - **§9.3:** "the Services may produce inaccurate or erroneous output … Customer is responsible for independently evaluating the Output."
  - **§2.4 and §14.1:** API keys are Access Credentials, so they must stay confidential and live server-side.
  - **§16.7:** MCA updates take effect at least 60 days after notice.
- **Data.**
  - Jev "is not trained on customer requests or responses". [models]
  - TypeSafe won't train on Customer Data without consent, but it may keep Customer Data "in perpetuity" for Telemetry, abuse monitoring and legal compliance. [mca §4.1]
  - Zero data retention is offered to enterprise customers only. [legal]

## Unverified or open

- The owner's actual rate limits, Usage Limits and credit setup, which depend on their Order.
- The HTTP status returned when credits run out.
- Accuracy on Spanish, and on any non-English Indian sources, and whether instructions should match the language of the state.
- How strong first-option bias is, and whether cyclic rotation removes it.
- Whether naming Jev or TypeSafe on public labels needs TypeSafe's consent under MCA §16.4.
- The tokenizer. The 4.6 characters per token figure is derived, not documented.

## Sources

- [api]: https://docs.typesafe.ai/api.md
- [models]: https://docs.typesafe.ai/models.md
- [system-one]: https://docs.typesafe.ai/concepts/system-one.md
- [state]: https://docs.typesafe.ai/concepts/state.md
- [primitives]: https://docs.typesafe.ai/primitives.md
- [choice]: https://docs.typesafe.ai/primitives/choice.md
- [noul]: https://docs.typesafe.ai/primitives/noul.md
- [confidence]: https://docs.typesafe.ai/confidence.md
- [how-to-build]: https://docs.typesafe.ai/concepts/how-to-build-with-system-one.md
- [jaggedness]: https://docs.typesafe.ai/model-jaggedness/jev-1.13.md
- [parallel]: https://docs.typesafe.ai/cookbooks/parallel_questions.md
- [rag]: https://docs.typesafe.ai/cookbooks/classifying_rag_passages.md
- [noul-consistency]: https://docs.typesafe.ai/cookbooks/consistency_noul_cookbook.md
- [choice-consistency]: https://docs.typesafe.ai/cookbooks/consistency_choice_cookbook.md
- [retries]: https://docs.typesafe.ai/sdk/python/api/retries.md
- [llms.txt]: https://docs.typesafe.ai/llms.txt
- [legal]: https://docs.typesafe.ai/legal.md
- [mca]: https://typesafe.ai/legal/mca
- [aup]: https://typesafe.ai/legal/acceptable-use-policy
