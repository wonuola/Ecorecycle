// ============================================================================
// SOP DATA - Sourcing and Collector Network SOP Content
// ============================================================================

export const SOP_SECTIONS = [
  {
    id: 'overview',
    title: 'Overview',
    content: `The plant is built for 10 tonnes a day and runs 10 tonnes a week. The gap is not machinery, labour, or process — it is feedstock. Until that changes, no improvement anywhere else in the operation will move the business much.

A Procurement Officer who spends the week negotiating price is doing the second-most-important half of the job. The first is building the collector network — more collectors, in more catchments, delivering more reliably. Price optimisation on 10 tonnes is worth a fraction of what a second reliable aggregator is worth.`
  },
  {
    id: 'supply-chain-tiers',
    title: 'Part 1 — Supply Chain Tiers',
    content: `Material reaches Osogbo through four tiers. Each behaves differently and needs a different approach.

**Tier 1 — Pickers**
Individuals collecting from streets, dumps, events. 10–50 kg per trip. Need: Cash on the spot, no waiting.

**Tier 2 — Small Aggregators**
Buy from pickers, hold a few hundred kg. 200–800 kg per delivery. Need: Float, a reliable buyer, fair scales.

**Tier 3 — Large Aggregators**
Warehouse operators, may bale. 1–5 tonnes per delivery. Need: Volume commitment, prompt payment.

**Tier 4 — Institutional**
Bottlers, hotels, event centres, schools, hospitals. Variable, contractable. Need: Reliable collection, documentation, sometimes a fee.

Most Nigerian recyclers buy almost entirely from tier 2 and 3, compete on price alone, and stay supply-constrained forever. The two moves that break out of that are floating tier 2 (so they buy more aggressively on your behalf) and contracting tier 4 (which nobody else bothers to do).`
  },
  {
    id: 'catchment-mapping',
    title: 'Part 2 — Catchment Mapping',
    content: `Osogbo sits in a workable catchment. Map it, assign it, and work it deliberately rather than waiting for material to appear.

| Catchment | Distance | Priority |
|---|---|---|
| Osogbo metro | Local | Core — highest density, lowest logistics cost |
| Ede | ~25 km | High |
| Ilesa | ~35 km | High |
| Ikirun | ~25 km | Medium |
| Iwo | ~50 km | Medium |
| Ila Orangun | ~60 km | Opportunistic |

**Procedure:**
1. Assign every collector to a catchment on registration.
2. Track tonnes per catchment per month.
3. A catchment supplying less than expected relative to its population is a gap, not a fact — it means no one has recruited there yet.
4. Review coverage monthly. The question is never "why is supply low" — it is "which catchment have we not worked."`
  },
  {
    id: 'collector-registration',
    title: 'Part 3 — Collector Registration',
    content: `**Trigger:** any new supplier delivering more than once.

**Procedure:**
1. Record: name, phone number, catchment, tier, and how they were introduced.
2. Photograph the person and, where they have one, their premises. This is identity, not bureaucracy — it matters when float is advanced.
3. Take a reference from an existing collector where possible.
4. Explain three things clearly at registration:
   - How your scale works and that they may watch every weighing
   - What you reject and why — water, sand, oil, non-PET, contamination above 5%
   - How and when they get paid
5. Register them in EcoRec before the second delivery.

**Why the scale conversation matters:** collectors' single biggest complaint against Nigerian recyclers is suspected false weighing. A visible, calibrated scale that they are invited to watch is a genuine competitive advantage and costs you nothing.`
  },
  {
    id: 'pricing',
    title: 'Part 4 — Pricing',
    content: `**Trigger:** monthly, and whenever market conditions shift sharply.

**Procedure:**
1. The Owner sets a buying band each month — a floor and a ceiling per kg, by material and quality tier.
2. Procurement buys within the band without further approval.
3. Anything above the ceiling requires the Factory Manager. In the field, the answer is no.
4. Price differentiates by quality, not by relationship. Clean, dry, well-sorted material earns the top of the band. This is how you train the network to deliver better material without policing it.
5. Publish the band to collectors. Opacity buys you nothing and costs you trust.

**A discipline worth holding:** never quietly cut the price after a collector has already loaded. It saves a small amount once and costs a supplier permanently. If quality is poor, deduct openly against the stated impurity rule and show them the evidence.`
  },
  {
    id: 'float-advances',
    title: 'Part 5 — Float and Advances',
    content: `This is the highest-leverage tool available to you, and the one most likely to lose money if run casually.

**What float is:** working capital advanced to a trusted aggregator so they can buy from pickers before selling to you. Without it, they buy only what their own cash allows, which caps their volume — and therefore yours.

**Procedure:**
1. Float is advanced only to collectors with at least three months of delivery history and a positive reliability record.
2. The Factory Manager approves. Finance records. The Owner is informed of every advance.
3. Every float carries: amount, date, expected delivery volume, and expected repayment window.
4. Float is repaid in material, offset automatically against deliveries — not in cash.
5. A running balance per collector is visible in EcoRec at all times.
6. Float is capped per collector, and the cap rises only with demonstrated performance.
7. An outstanding float beyond the agreed window blocks any further advance. No exceptions and no verbal overrides.

**Escalation:** any float outstanding beyond the window is reported to the Owner in the weekly review, by name.`
  },
  {
    id: 'institutional',
    title: 'Part 6 — Institutional Supply Agreements',
    content: `**Why:** this is the least contested source of PET in Osun, because almost nobody pursues it. A bottling plant, a hotel group, a school, or a large event centre generates a steady stream and currently has no organised buyer.

**Procedure:**
1. Build a target list by catchment: bottlers, hotels, restaurants, event centres, schools, hospitals, filling stations, religious institutions.
2. Approach with a written proposal offering: scheduled collection, free bins or bags, a monthly weight statement, and where useful, a simple certificate of recycling for their own reporting.
3. Some will want payment for material; some will accept free collection as the benefit. Both are good outcomes — the second is better.
4. Agree in writing: collection frequency, who bags, where material is staged, who bears transport.
5. Register the institution as a collector in EcoRec so volumes track like any other source.
6. Review each agreement quarterly against actual volume.

**Sequencing:** start with two or three institutions and serve them impeccably before expanding. A missed collection is worse than never having offered.`
  },
  {
    id: 'weekly-routine',
    title: 'Part 7 — Weekly Sourcing Routine',
    content: `Supply growth is a habit, not a project. This is the rhythm.

**Monday**
Review last week: tonnes in by catchment, by collector, against target. Identify the two collectors whose volume dropped and find out why. Identify the catchment with the largest gap.

**Tuesday to Thursday — field days**
Procurement is out, not at a desk. Visit collectors in their own location. Recruit at least one new collector per week. Meet one institutional prospect per week.

**Friday**
Confirm next week's expected deliveries. Reconcile float balances. Settle outstanding payments — a collector who waits for money tells five others.

**Standing target:** one new registered collector per week, one institutional conversation per week. At that rate the network roughly doubles within a quarter, and supply follows.`
  },
  {
    id: 'records',
    title: 'Part 8 — Records',
    content: `Every sourcing activity is recorded in EcoRec. If the Procurement Officer leaves, the network must remain with the company.

| Record | Captured when |
|---|---|
| Collector registration | Before second delivery |
| Catchment assignment | At registration |
| Buying band | Monthly, by Owner |
| Lot created — vendor, expected kg, price, date | Before dispatch of collection vehicle |
| Float advanced — amount, expected offset | At approval |
| Float balance | Running, automatic |
| Delivery outcome — actual kg, impurity %, decision | At intake |
| Reliability score | Rolling, from delivery history |
| Institutional agreement terms | At signature |

**The rule that protects the business:** a collector relationship that exists only in the Procurement Officer's phone is not an asset of Bamboo Trybe. Registration in the system is not administration — it is ownership.`
  },
  {
    id: 'measures',
    title: 'Part 9 — Measures',
    content: `Reviewed weekly, discussed monthly.

| Measure | Definition | What it tells you |
|---|---|---|
| Tonnes received | Weekly total | The only number that ultimately matters right now |
| Active collectors | Delivered at least once in 30 days | Network health |
| New collectors | Registered this week | Whether the network is growing or coasting |
| Catchment spread | Tonnes by catchment | Where the gaps are |
| Average impurity % | By collector | Who to develop, who to price down |
| Float outstanding | By collector, with ageing | Working capital at risk |
| Cost per kg delivered | Material plus logistics | True buying performance |
| Days of cover | Buffer stock ÷ daily consumption | Whether the line will starve |`
  },
  {
    id: 'escalation',
    title: 'Part 10 — Escalation Summary',
    content: `| Situation | Action |
|---|---|
| Collector demands above the ceiling | Refuse in the field. Escalate to Factory Manager. |
| Impurities above 5% at intake | Hold the truck. Notify Procurement before offload completes. |
| Weight variance above 10% vs the lot | Hold the truck. Notify Procurement and Factory Manager. |
| Float overdue beyond agreed window | Block further advances. Report to Owner by name. |
| Buffer stock below 3 days of cover | Factory Manager takes direct charge of sourcing that week. |
| Collector alleges false weighing | Re-weigh in their presence immediately. Escalate to Factory Manager regardless of outcome. |`
  }
];

export const CATCHMENTS = [
  { name: 'Osogbo metro', distanceKm: 0, priority: 'Core' },
  { name: 'Ede', distanceKm: 25, priority: 'High' },
  { name: 'Ilesa', distanceKm: 35, priority: 'High' },
  { name: 'Ikirun', distanceKm: 25, priority: 'Medium' },
  { name: 'Iwo', distanceKm: 50, priority: 'Medium' },
  { name: 'Ila Orangun', distanceKm: 60, priority: 'Opportunistic' },
];

export const TIERS = [
  { key: 'picker', label: 'Picker', description: 'Individuals collecting from streets, dumps, events', typicalVolume: '10–50 kg per trip' },
  { key: 'small_aggregator', label: 'Small Aggregator', description: 'Buy from pickers, hold a few hundred kg', typicalVolume: '200–800 kg per delivery' },
  { key: 'large_aggregator', label: 'Large Aggregator', description: 'Warehouse operators, may bale', typicalVolume: '1–5 tonnes per delivery' },
  { key: 'institutional', label: 'Institutional', description: 'Bottlers, hotels, event centres, schools, hospitals', typicalVolume: 'Variable, contractable' },
];

export const QUALITY_TIERS = [
  { key: 'clean_dry', label: 'Clean & Dry', description: 'Well-sorted, minimal contamination', priceModifier: 1.0 },
  { key: 'standard', label: 'Standard', description: 'Some contamination, needs sorting', priceModifier: 0.85 },
  { key: 'wet_dirty', label: 'Wet/Dirty', description: 'Requires washing, high contamination', priceModifier: 0.65 },
];
