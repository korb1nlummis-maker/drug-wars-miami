# Drug Wars: Miami — Depth Roadmap

Target: **100+ hour campaign (human time), 400+ hour New Game+.**
Pacing baseline already in place: 5,000-day campaign, acts at days 1-500 /
500-1500 / 1500-2500 / 2500-3500 / 3500-5000, ~1.2 min per in-game day.

## DONE (this branch)
- Revived dead campaign/endings files; wired bosses, contracts, side ops, intimidation
- Full pacing overhaul (story, economy, drugs, reputation, chemistry, crew, romance)
- Suppliers system (trust, haggling, credit, spot offers, buybacks)
- Living news wire + real-time price ticker; player actions (shootouts,
  takeovers, raids, busts, big trades, boss hits) make headlines and move
  district prices via `reportPlayerEvent` / `getMarketImpactMult`
- Court charge taxonomy, weapon rank-gating + gunsmith, romance story beats

## NEXT: Neighborhood ecology (the big one)
Every district gets a living condition model in `state.districts[locId]`:
- **condition** 0-100 (blighted → thriving): drifts from events; shootouts,
  raids, floods of product push it down; investment pushes it up
- **police presence** 0-100: follows player heat/events; affects bust
  chance, prices, encounter rates
- **civilian loyalty** 0-100: how the neighborhood feels about YOU
- Player choices on owned territory:
  - **Invest/clean up** (community centers, youth programs, renovated
    storefronts — front-business synergy): condition up, loyalty up,
    police presence down, heat decays faster, but street prices soften
    and volume shrinks (fewer desperate buyers) — the "beloved don" path
  - **Bleed it** (flood product, strip businesses, corner armies):
    condition down, prices and volume up, loyalty down → informants,
    police surges, faction disgust — the "scorched earth" path
- News wire reports district trajectory ("LIBERTY CITY RENAISSANCE?" /
  "OVERTOWN SPIRALS AS CITY LOOKS AWAY"); condition feeds prices via the
  existing `getMarketImpactMult` hook
- Map/travel screens show condition badges; long-term condition shifts
  unlock district-specific stories and change ending grades

## NEXT: Per-tab depth sweep (skip nothing)
- **Weapons**: durability/jamming, black-market provenance (traceable guns
  raise court risk — ties into ballistics charges), crew loadouts
- **People/Crew**: named lieutenants with agendas, rivalries, defection
  offers from factions; crew families (heirs when someone dies)
- **Map/Travel types**: transport ownership (own the speedboat/plane you
  smuggle with), route risk profiles per transport, border/checkpoint
  minigame choices, seasonal weather closures
- **Bank/Laundering**: offshore accounts with seizure risk, IRS audits,
  shell-company layering minigame
- **Properties**: per-district synergy with neighborhood ecology
- **Phone**: contact rolodex with favors ledger
- **Stats**: empire timeline charting net worth vs heat vs condition

## NEXT: New Game+ = 400 hours
- NG+ tiers 1-5, each re-adding: 8 NG+ characters (4 exist), skill tiers
  6-10 (exist, gated), NG+ endings (exist), fentanyl era, global boss
  campaign (52 bosses across 8 regions is the NG+ spine), rival cartel AI
  that plays the same game you do (takes territory, invests/bleeds
  districts, reacts to your news)
- Prestige systems: legacy perks per completed ending, museum of past runs
