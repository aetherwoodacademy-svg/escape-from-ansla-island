# Escape from Ansla Island: Architecture v1.1

*Companion to Build Brief v1.0. The brief holds the vision; this document holds the map.*
*v1.1 incorporates Ange's decisions of 2 Jul 2026: time of day, Rollo, Island Stone as information hub, memory and rewards layer, real compass, real photos.*

---

## 1. Locked foundations (from the brief, restated so we never drift)

- **Scene first. Interactions second. Backend later.**
- Pipeline per feature: design discussion (if needed) → single self-contained HTML mock-up → review → iterate until approved → split into CSS/JS/assets → implement functionality → local test → commit → deploy only after approval.
- The scene itself is the interface. Hidden-object interaction, no visible hotspot markers, no dashboard layouts, no white cards, no large text panels. Objects react rather than open ugly UI.
- Voyage I is **localStorage only**. No Supabase, GPS, push or external APIs.
- Success criterion: *"I opened it, and I smiled. Ansla Island exists."*
- Core promise: *"Close me. Go outside. Come back with a story."*
- Every feature supports at least three of: Adventure, Connection, Wonder, Story, Belonging.

## 2. Decided (2 Jul 2026)

- **Time of day is real.** Headquarters follows the actual clock: sunrise, day, dusk, night states. The greeting matches ("Good morning, Captain").
- **Rollo**, based on the family's real dog. Photoreal, animated and interactive. Not cartoon; brief superseded on this point.
- **Plant an Idea: reinstated (2 Jul 2026)** as an open suggestions board. Any crew member plants an idea (poker night, Sunday BBQ), and ideas can be promoted straight to Raising the Colours.
- **The Chaos Crystal (canon, from Ange 2 Jul 2026):** chaos is a challenge set *within* an adventure. The crystal goes live only when the colours are raised AND every crew member is aboard. Any one member may then unleash it: every crew member is sent a **secret mission**, achieved and evidenced in the Treasure Chest (example missions: find the stick abducted by aliens; lace cursed s'mores with hot sauce; convince everyone there is a yowie in the woods). When the colours are struck, the crew votes a **Chaos Champion** (biggest laughs or most inventive chaos), who earns an extra in-app reward. Not deployable by all at once; one deployment per adventure.
- **The Call** is the app reaching out to crew when the colours are raised. It is the push layer, so it lands with notifications (Voyage III), but the drums and shell can sit in the scene from day one.
- **Island Stone is the information hub.** It interprets nature rather than displaying data: weather, warnings, rainfall, radar, tides, moon, stars, rivers, wildlife, fishing guides, whale season, markets, UV, night sky events and summarises them so the crew can choose the right kind of fun: mountain hike, river swim, photography, stargazing, or retreat to Dream World when the UV is savage. Live feeds are external APIs, so the Stone speaks from static/seeded wisdom in Voyage I and comes alive when the API voyage arrives.
- **Storm chasing is a first-class adventure.** This crew chases storms. The Stone treats an approaching cell as a call to adventure, not only a warning ("a storm builds to the southwest, Captains"), with radar and warnings feeding it in the API voyage. Storm chasing sits in the adventure library from day one, and storm photos are Treasure Chest gold. Proposed, not locked: a storm state for the Headquarters scene itself, so when real weather turns wild, the island's sky darkens, the lantern gutters and Rollo lifts his head.
- **Compass is a real orienteering tool.** Device-orientation compass usable on actual adventures, plus navigate/explore prompts.
- **Real family photos** woven into the app where possible, including the scene background.
- **Theme: island adventure.** Any time of day (and with real time of day, it will be all of them). This crew is hard to get out of bed.

## 3. The memory and rewards layer (the second half of the promise)

The brief covers "go outside". This layer covers "come back with a story".

- **Capture:** each crew member drops the photos they took into the Treasure Chest. The chest is the family's shared memory store, and its long intent is a **multi-generation archive**: built to be handed down, so storage must always be durable and exportable, never locked in.
- **Reward:** completing family adventures unlocks things. Known reward types: the sea shanty (see below), motif upgrades, and room for more (chart fragments, Rollo tricks, crew titles).
- **The shanty writes itself:** the winner of each challenge earns the right to nominate the next line of the song. Line by line, adventure by adventure, until the crew has its own private shanty deployed. Nobody writes it in advance; it is authored by the family, one victory at a time.
- **Loop:** flag raised → adventure happens → photos into the chest → Chronicle entry → reward unlocked → next adventure beckons.

Rules for this layer: rewards celebrate *shared* adventures (connection, not competition). Unlocks are revealed in-scene (the shanty is heard, the motif changes on the flag), never as badge popups.

## 4. Headquarters scene map

One panoramic scene, drag-to-explore sideways on smaller screens. Objects live at fixed percentage coordinates over the artwork, same technique as the portal rooms. A time-of-day engine sets the scene state from the real clock.

### Object inventory

| Object | Reaction (Voyage I) | Opens / does | State it touches |
|---|---|---|---|
| Rollo | Photoreal. Sleeps by default; randomised ear twitch, tail wag, head lift, stretch; bark and reaction on tap. No label. | Presence and personality; interactive but never a menu | none |
| Flagpole | Flag hoists with cloth animation, chosen motif on the colours | Raise / Strike the Colours (declare an adventure is on) | `flag`, `adventures` |
| Adventure Board | Paper flutters, pin glints | Current adventure card + "On the horizon" queue (planned adventures waiting their turn; one flag at a time, locked 2 Jul 2026) + the adventure library | `adventures`, `horizon` |
| Treasure Chest | Sparkle, lid creaks open, warm glow | Family memory store: each member adds their photos; browse the shared gallery | `treasures` |
| Island Stone | Runes glow | Information hub: today's conditions summary, spoken as island wisdom. Static/seeded in Voyage I; live feeds later | `stone` |
| Compass | Needle spins, settles, glows | Orienteering: real device compass for use on adventures, plus explore prompts | `compass` |
| Lantern | Flame kindles | Giant Hide & Seek | `hideSeek` |
| Chronicle | Cover embosses, opens | Journal of past adventures and tales | `chronicle` |
| Chaos Crystal | Purple pulse, small magical tease only | Mischief (kept mysterious in Voyage I) | `chaos` |
| The Call (shell + drums) | Present in scene; drum skin trembles faintly | Push layer, arrives Voyage III. Until then, atmosphere | `call` (later) |

### First-run flow (Voyage I)

1. Test Crew selection: pick who you are from the crew roster (no passwords, it is a family porch)
2. Motif selection: chosen once, more unlock through adventures
3. Land at Headquarters at the real time of day, greeted by name ("Ahoy, Mumgela!")

## 5. State model (localStorage, Voyage I)

Single namespaced key, versioned so migration to Supabase later is clean:

```
ansla.v1 = {
  crew: { members: [...], currentMemberId },
  motif: { chosen, unlocked: [...] },
  flag: { raised, raisedBy, raisedAt },
  adventures: [ { title, place, when, joining: [...], status, completedAt, chaos, chaosChampion } ],
  ideas: [ { text, plantedBy, plantedAt } ],
  chaos: { deployed, deployedBy, missions: { memberId: mission } },
  treasures: [ { imageRef, caption, addedBy, addedAt, adventureId } ],
  rewards: { shanty: [ { line, author, earnedBy, date } ], motifs: [...], chaosChampions: [ { name, adventure, date } ] },
  chronicle: [ { entry, author, date } ],
  hideSeek: { active, startedAt },
  stone: { lastShownIndex },
  compass: { calibrated },
  settings: { }
}
```

Notes: photo storage in localStorage is limited (roughly 5 MB), so Voyage I treasures use small compressed images, with real photo storage arriving with the backend voyage. Treasures link to the adventure they came from, which is what makes rewards checkable ("adventure complete when it has photos in the chest and a Chronicle entry").

## 6. Voyage roadmap (proposed, not locked)

- **Voyage I: The Porch.** Local-only Headquarters. Brief scope plus the reward loop in local form (adventure library seeded, shanty lines unlock, motifs upgrade). Real time-of-day engine. localStorage.
- **Voyage II: The Crew.** Supabase backend mirroring the portal's patterns: shared crew state, shared Treasure Chest (real photo storage), adventures visible to everyone, rewards sync. Old Google Sheets data mapped across. Real compass ships here if not sneaked into late Voyage I.
- **Voyage III: The Call.** Push notifications: the drums sound on every crew phone when the colours are raised. PWA install so it lives on home screens.
- **Voyage IV: The Island Watches.** External data and GPS: the Island Stone comes alive (weather, tides, UV, whales, markets, night sky), live crew positions during adventures, Giant Hide & Seek goes properly giant.

Each voyage still follows the per-feature pipeline internally. Voyage boundaries are review points, not release pressure.

Everything not claimed by a voyage waits in **the Harbour** (`docs/THE_HARBOUR.md`): the permanent moorage for every idea, so nothing is ever lost between sessions, briefs or attempts.

## 7. Tech stack

- Static HTML/CSS/JS, one self-contained file per the pipeline, split only after approval
- **Local first for all testing** (the portal discipline: no needless resource churn; deploy only approved work)
- **GitHub Pages hosting, Cloudinary for assets**, both available anytime. No Netlify at this stage; family-only audience does not need it. One note: GitHub Pages on a free plan requires the repo to be public, so no family photos ever live in the repo itself; photos go to Cloudinary (and Supabase later), the repo holds only code and scene art
- localStorage now; Supabase later, consistent with the portal's patterns
- Device Orientation API for the real compass (needs HTTPS and a phone; no external service)
- No frameworks. Same discipline as the portal rooms.

## 8. Art pipeline

Standing rules apply: ultra realistic, never painterly or cinematic fantasy, "magical" as the working adjective, nothing derelict.

- **Time-of-day art strategy:** rather than four full renders, start with one base scene plus colour-grade overlays and a sky treatment per state (the portal technique). If a state feels wrong, it earns its own render.
- **Rollo:** built from photos of the real dog. Photoreal base pose set (sleeping, head up, stretch, alert) generated via image-to-image from the family photos, animated with sprite swaps and subtle CSS motion.
- **Real family photos in the background:** candidates include framed photos on the porch posts, polaroids pinned to the Adventure Board, and photos scattered in the open chest (the concept already gestures at this). True background integration (a family photo blended into the scene art itself) is possible via image-to-image; we test it during concept iteration.
- Concept iteration continues from the current render, shifted toward the brief's palette (ocean blues, turquoise, white sand, pandanus greens) across the daytime states, with the current golden-hour mood kept for the dusk state.
- Full-resolution concept render to be saved to `art/concepts/` as the baseline.

## 9. Content to gather (updated 2 Jul 2026)

1. ~~Rollo photos~~ **Gathered:** 5 photos + 1 video in `art/photos/rollo/`. Grass sunbathing shot = sleeping porch pose base; video = animation reference for ear/tail motion
2. ~~Family photos~~ **Gathered:** 14 photos in `art/photos/family/`
3. ~~Full-res concept~~ **Gathered:** in `art/concepts/`, plus the **Ansla emblem** (unexpected treasure)
4. ~~Crew roster~~ **Locked:** launch crew is Dadrew (The Captain), Mumgela (The Mapmaker & Magic Keeper), The Boy (First Mate & Explorer), with Rollo as Official Headquarters Guardian. Milo, Cherub and BigJ join the crew later, so the roster must be easy to grow. Family values: Explore Together, Laugh Often, Choose the Fun, Make Memories
5. ~~Motif~~ **Locked:** the Ansla emblem is the first motif; the flag flies it by default. New motifs unlock through adventures
6. ~~Adventure seed list~~ **Gathered:** 27 adventures in `docs/ADVENTURE_LIBRARY.md`, categorised with Stone pairings for later. (Correction: Currimundi paddle was concept sample copy, not a real adventure)
7. ~~Shanty~~ **Locked:** the song develops as the crew writes it after each adventure, one earned line at a time, until the private shanty is deployed. Nothing pre-written, tune included
8. ~~Hidden chorus~~ **Locked (4 Jul 2026):** one exception to "nothing pre-written" — a chorus, authored now, carrying Dadrew's founding credit (see `docs/ADVENTURE_LIBRARY.md`, Founding Almanac). Stays hidden/undeployed until the crew earns their first verse line, then deploys alongside it and recurs after every verse from then on. Verses stay fully crew-authored, one earned line at a time, exactly as locked above; only the chorus is fixed. Text: *"He mapped the year before we sailed her, so we'd never wonder where to go."* Build note: `rewards.shanty` needs a `chorus: { text, revealed }` alongside the existing `lines[]`, revealed flips true on first line earned.

## 10. Next step

Headquarters mock-up: single self-contained HTML, concept render as interim background, time-of-day engine stubbed, all objects placed and reacting. Reviewed against one criterion only: *"I opened it, and I smiled."*
