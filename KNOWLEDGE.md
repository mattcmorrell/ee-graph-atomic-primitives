# Knowledge: Strategic Vision & Product Thinking

> **Claude: Read this file before making product decisions** — component design, interaction patterns, feature scope, UX tradeoffs. This is the "why" behind everything we build.

## The Long Tail Problem in HRIS

If you line up HRIS features by commonality — payroll, benefits, time tracking on the left; geography-specific compliance, industry workflows, company-specific approval chains on the right — you get a classic long-tail distribution.

Current-generation HRIS platforms serve the left side well. They build each feature as a bespoke module with high marginal cost, so only the common use cases get built. The long tail — the workflows specific to a particular geography, industry, or even a single company — stays permanently unserved.

## How Long Tails Get Unlocked

Every platform that unlocked a long tail followed the same pattern:

| Domain | Head solution | What unlocked the tail | Key insight |
|---|---|---|---|
| Business math | Calculator programs | Spreadsheets | General-purpose substrate, user expresses the logic |
| Publishing | Print publishers | Blogs/CMS | Zero marginal cost per publication |
| Software | Custom apps | App stores + APIs | Platform provides substrate, anyone builds for their niche |
| Commerce | Retail stores | Shopify/Etsy | Platform handles infrastructure, seller brings niche knowledge |
| Automation | Custom integrations | Zapier/IFTTT | Describe trigger → action, system handles plumbing |

**The pattern: general-purpose substrate + expressive interface = long tail unlocked.**

For HRIS: **Graph** (substrate) + **AI** (reasoning engine) + **expressive interface** (the thing we're building) = every workflow served.

## Why "Chat With Your HR Data" Isn't the Answer

The obvious approach — put a chat box on it — fails for several reasons:

- **Chat is terrible for complex, multi-step workflows** — it's linear when work is branching
- **Chat doesn't persist** — ask the same question next quarter and start over
- **Chat is one-shot** — it doesn't watch, trigger, or automate
- **Chat doesn't compound** — your org's knowledge stays in your head, not the system

## What the Interface Actually Is: Generated Workflows

Three interaction modes, one substrate:

### Mode 1: "What happens if..." → Generated Situation Room

You describe a scenario. The AI traverses the graph and generates a purpose-built, interactive view specific to THIS question and YOUR org.

Example: "What if we open an office in Vilnius?" produces a mini-application showing labor law implications, employees who requested EU transfers, required certifications by role, tax implications — all assembled from graph traversals, not canned reports.

### Mode 2: "Make this happen whenever..." → Generated Automation

You've seen a situation room and say: "Whenever someone requests an EU transfer, run this automatically and alert me."

The AI crystallizes its traversal pattern into a persistent automation:
- **Trigger:** life event of type "relocation request" where target is EU
- **Traversal:** the same graph walk it just performed
- **Output:** generated situation room, delivered as a briefing item
- **Refinement:** "also check if they have an active non-compete" → automation evolves

This is Zapier where the "apps" are graph traversal patterns and the "logic" is AI reasoning. No engineer builds it.

### Mode 3: "Keep me honest on..." → Generated Monitor

Ongoing awareness, not event-triggered:

"Every engineering team must have at least 2 people with K8s certification at all times."

The AI creates a continuous graph query, monitors for changes (departures, cert expirations, restructures), and alerts only when the constraint is violated — showing specifically which teams, which people, what changed.

This is compliance, coverage tracking, policy enforcement — the long-tail stuff that's incredibly specific to each company.

## The Compounding Effect

This is what separates the concept from "ChatGPT for HR":

1. **Workflows persist.** Your Lithuania question becomes a saved workflow. Next time someone asks, it's already there. The org accumulates operational knowledge.
2. **Workflows compose.** The Lithuania workflow + the certification tracker + the tax compliance monitor all run on the same graph. They see each other's effects. A new hire in Vilnius triggers all three.

## Graph Visibility

**Visible on demand, invisible by default.** Like "View Source" on a web page.

In situation rooms, showing the graph traversal path builds trust ("here's how I found this"). In automations and monitors, the graph should be invisible — users shouldn't think in nodes and edges. Power users and skeptics can see the traversal path. Everyone else just sees the answer.

## What Makes JIT UI Delightful (Not Janky)

AI-generated UI fails when every view looks different (no muscle memory), it's slow (3-second spinner kills magic), it hallucinates structure, it's not refinable, or it's disposable when it shouldn't be.

Seven requirements for it to work:

### 1. Constrained Component Vocabulary
The AI doesn't generate raw UI — it assembles from a finite library of ~15-20 polished, tested primitives. Components are designed once, beautifully, by humans. The AI chooses which ones, arranges them, and maps graph data into the slots.

**The newspaper analogy:** Every edition is different, but you instantly know how to read it because headlines, columns, photos, and captions always work the same way. The AI is the layout editor working within a typographic system.

### 2. Stable Patterns for Similar Intents
The same type of question always produces a recognizably similar view:
- "What happens if [person] [event]?" → always a cascade layout
- "Who covers [skill/cert/role]?" → always a coverage matrix
- "Tell me about [person]" → always a profile + context layout
- "Compare [X] and [Y]" → always a comparison view
- "What do I need to do for [process]?" → always a runbook

Users learn these patterns fast. After the third resignation cascade, the content is novel but the structure is predictable.

### 3. Speed Architecture: Structure First, Insight Streams In
The skeleton must appear under 500ms:
- **0-100ms:** Intent classification → select layout template
- **100-400ms:** Graph traversal (deterministic, fast) → populate component slots with real data
- **400ms+:** AI reasoning streams into each component progressively

The structure and data are fast (graph queries). Only the reasoning is slow (LLM). The view is useful before the AI finishes thinking.

### 4. Radical Traceability
Every data point is grounded and clickable:
- Every person card links to the actual person node
- Every claim is a verifiable traversal result — click it, see the path
- Numbers are exact graph query results, never AI-estimated
- **AI interprets but never invents.** Facts are visually distinct from interpretations (e.g., different background color, subtle "AI" indicator). Facts are black, interpretations are gray.

### 5. Refinable Without Starting Over
After a view generates, the user adjusts conversationally:
- "Also show me pipeline candidates" → recruiting component added
- "Collapse the equipment section" → section minimizes, layout reflows
- "Make this about the whole engineering team" → view generalizes, same pattern, wider scope

The mental model: talking to a fast analyst with a whiteboard. You refine, not restart.

### 6. Save / Share / Automate Lifecycle
Generated views need three post-creation actions:
- **Save** — becomes a card in "My Workflows," re-runs on demand with fresh data
- **Share** — shareable link, recipient sees same view (read-only). Generated views become organizational knowledge.
- **Automate** — "Run every Monday" or "Run whenever someone resigns." Conversation → persistent automation.

### 7. AI Learns Org-Specific Language
Over time:
- "the platform team" → Lisa Huang's group
- "our cert problem" → the K8s coverage gap
- "do the same thing we did for Sarah's leave" → recalls the workflow pattern
- "Raj-level risk" → a severity benchmark

The system builds a vocabulary specific to YOUR org. It feels like it was built for you because, incrementally, it was.

The measure of delight: it's faster than navigating a traditional HRIS, it surfaces things you didn't know to ask about, and it makes you look prepared.
