# The Harbour

*Every idea for Ansla Island that is not in the current voyage is moored here. Nothing is lost; it waits at anchor. If an idea is mentioned in conversation, a doc, or a 3am note, it gets a line in the Harbour the same day.*

*Ships depart the Harbour when a voyage claims them. Nothing is ever deleted from this file; shipped items move to the log at the bottom.*

---

## At anchor

### Backend and reach
- Supabase shared crew state (Voyage II)
- Real photo storage; Treasure Chest as a **multi-generation family archive**, built to be handed down (shapes storage choices: durable, exportable, never locked in)
- Push notifications: The Call, drums sounding on every phone when the colours are raised (Voyage III)
- PWA install to home screens (Voyage III)
- Live GPS: crew positions on adventures, Giant Hide & Seek at full scale (Voyage IV)

### The Island Stone's senses (API voyage)
Weather, warnings, rainfall, radar, tides, moon, stars, rivers, wildlife, fishing guides, whale season, markets, UV, night sky events, local events. The Stone interprets nature; it does not display data.

**Local events, investigated 4 Jul 2026:** checked whether the Stone could pull from Sunshine Coast Council's events calendar (`events.sunshinecoast.qld.gov.au`) the same way it pulls weather from Open-Meteo. Confirmed via live browser inspection (not guessed): the council's own site is just a link-out page; the real calendar is a separate platform ("Everi", via FactFour-branded image buckets) that is fully server-rendered HTML with no RSS/iCal/JSON — the search form does a plain page load with filters baked into the URL path, no XHR to intercept. Unlike Open-Meteo, there is no cross-origin-friendly public API to call from the browser. The only real route in would be a server-side scraper (a Supabase Edge Function parsing the HTML, same shape as `sound-the-drums`), which carries ongoing maintenance risk (breaks whenever the council redesigns the page) rather than a stable API contract. Ange still wants this (important to know what's happening locally) and will look into it herself; parked here rather than built, since it's a different order of engineering effort to the rest of the Stone.

### Wildlife intelligence
Its own line item from the discovery phase: the island knowing what creatures are about (whales, birds, seasonal visitors) and whispering it through the Stone.

### Storms
- Storm chasing as first-class adventure (in the library now); radar feeds later
- Proposed: storm state for the Headquarters scene, real weather darkening the island sky

### Final Headquarters render requirements (checklist for the art remake)
- Completely text-free (all signs, banners, board copy, greeting live as overlays)
- No flag hanging from the tree (the crew's hoisting pennant replaces it; conflict noted by Ange 3 Jul 2026)
- Island Stone present in the scene (missing from concept)
- Rollo composed from the real dog's photos, in his sleeping porch pose
- Chest mouth composed to receive the live polaroid overlay cleanly

### Scene and atmosphere
- Real time-of-day states (Voyage I) with per-state art upgrades if any state feels wrong
- Seasons: the island changing across the year (from discovery phase)
- Real family photos blended into the scene art via image-to-image (to test in concept iteration)

### Open design questions
- Chaos Champion extra reward type (motif flourish? crown by name? shanty privilege?)

### Giant Hide & Seek: future layers (core built 4 Jul 2026)
- **Guest hunters (second rollout, Ange):** family friends invited to find the crew — needs a guest access model (single-hunt invite code or link, no full crew membership)
- Audio squeak for the tension cue (all island audio is deferred as one pass)
- Device-heading needle (compass physically points as you turn; needs motion permission on iOS — current needle is north-referenced)
- Hunt history / longest chase records in the Chronicle

### Decided from the Harbour
- **One flag + "On the horizon" (LOCKED by Ange, 2 Jul 2026):** one set of colours flies at a time; planned adventures queue in an "On the horizon" section of the board with their island-time. Hoisting the next remains a deliberate ceremony, never automatic.

### Rewards and lore
- The shanty: challenge winner nominates the next line until the crew's private song is deployed; tune TBD (or earned)
- Motif upgrades through achievements
- Possible future unlocks: chart fragments, Rollo tricks, crew titles
- Sea shanty deployment ceremony (what happens when the song is complete?)

### Chaos (canon captured 2 Jul 2026, built into mock-up)
Chaos = a challenge within an adventure. Crystal live only when colours raised AND all crew aboard; one member unleashes; everyone receives a secret mission, evidenced in the Treasure Chest; crew votes Chaos Champion at strike; champion gets an extra in-app reward. Future: real per-device secrecy arrives with the backend voyage (each phone shows only its own mission); Chaos Champion reward types TBD (motif flourish? crown on the crew list? shanty privilege?).

### Superseded (kept for the record)
- Rollo as illustrated/cartoon guardian → superseded 2 Jul 2026: photoreal, based on the real dog
- "Plant an Idea" board feature → dropped 2 Jul 2026 → **reinstated same day** as open suggestions board (poker night, Sunday BBQ), ideas promotable to adventures

## Shipped
*(nothing yet; Voyage I is at the mock-up stage)*
