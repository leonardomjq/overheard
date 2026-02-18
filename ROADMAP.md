# ScoutAgent — Product Roadmap

Enhancements to close the gap between "here's a signal" and "here's what to build Monday morning."

---

## 1. "Build This" Blueprints ← NEXT
**Impact: Highest | Effort: Low (L3 prompt + schema fields)**

Each Alpha Card ships with a startup-in-a-box:
- Concrete product concept (not vague — a specific tool/SaaS idea)
- Suggested name ideas (LLM-generated)
- MVP scope (week-by-week buildable plan)
- Monetization model suggestion
- Suggested tech stack
- Estimated TAM from signal volume

Implementation: enhance Strategist (L3) prompt, add fields to `AlphaCardSchema`.

---

## 2. Demand Proof — "Someone is literally asking for this"
**Impact: Very High | Effort: Medium (L1 heuristic + new schema fields)**

Surface tweets where people explicitly ask for a tool:
- "Is there a tool that...", "I wish there was...", "I'd pay for..."
- Attach as "Demand Signals" to each Alpha Card
- Show actual tweets, follower count, engagement
- Quantify: "72 developers publicly asked for this in 48h"

Implementation: new keyword patterns in scrubber heuristics, new `demand_signals` field on Alpha Cards.

---

## 3. Competitor Landscape Auto-Scan
**Impact: High | Effort: Hard (additional scraping sources)**

Auto-answer "who's already doing this?" for every Alpha Card:
- Scan Product Hunt, GitHub trending, app stores
- Show: name, launch date, stars/growth, pricing, weaknesses
- Flag gaps: "3 competitors exist but none support X"

Implementation: new scraping pipeline (Product Hunt API, GitHub API), new `competitors` field on Alpha Cards.

---

## 4. Personalized "For You" Scoring
**Impact: High | Effort: Medium (user preferences + scoring)**

Match opportunities to the individual developer:
- User sets: tech stack, domain interests, ambition level
- Personal fit score per Alpha Card: "92% match"
- Filter feed by buildability

Implementation: `user_preferences` table, scoring function, feed filtering.

---

## 5. Weekly "Top Alpha" Digest Email
**Impact: Medium | Effort: Low (cron + email service)**

Monday morning email with the 3 strongest Alpha Cards of the week:
- Brief, scannable, links back to app
- Habit loop for retention
- Growth channel (forwardable)

Implementation: cron job + Resend/Postmark integration.

---

## 6. Social Proof Loop — "I Built This"
**Impact: Medium-High | Effort: Hard (community features)**

Long-term flywheel:
- Users flag "I'm pursuing this Alpha"
- Track Alpha Cards → Product Hunt launches
- Surface success stories as marketing
- Comments/discussions per card

Implementation: new tables, real-time updates, moderation.

---

## Priority Order
`1 → 5 → 2 → 4 → 3 → 6`

Blueprints and digest email are shippable in days. Demand signals next. Personalization and competitor scanning follow as user feedback comes in. Social proof is the long game.
