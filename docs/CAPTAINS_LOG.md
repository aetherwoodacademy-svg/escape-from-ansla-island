# Captain's Log: State of the Island & Runbook

*Everything needed to maintain, change and launch the island, independent of any assistant's memory. No secrets in this file — where a secret is needed, this says where it lives.*

## Where everything lives

- **Code & docs:** this repository (`aetherwoodacademy-svg/escape-from-ansla-island`, public), deployed by GitHub Pages from `main`, root folder. Live at `https://aetherwoodacademy-svg.github.io/escape-from-ansla-island/headquarters.html`.
- **The island's soul (all shared data):** Supabase project "Family App" (ref `snnbgttfavruslntoosu`). Tables: crew, flag, horizon, ideas, adventures, treasures, chronicle, shanty_lines, chaos (state/missions/bank), hide_seek, hs_positions, push_subscriptions. Photos in the private `treasures` storage bucket.
- **The crew code:** Supabase → Table Editor → `island_secrets` → `crew_code`. Change it by editing the cell (press Enter to save). New devices need the new word; joined devices stay joined.
- **Chaos missions:** Table Editor → `chaos_mission_bank`. Add rows to grow the mischief.
- **Push notifications:** Edge Function `sound-the-drums` (Supabase → Edge Functions), with secrets `DRUM_VAPID_PUBLIC`, `DRUM_VAPID_PRIVATE`, `DRUM_CONTACT` (Edge Functions → Secrets). The matching public key sits in `js/headquarters.js` CONFIG. If keys are ever regenerated, all three places must agree and every device must re-teach the drums.
- **Weather/tides:** Open-Meteo, free, no key, called directly from the browser. Nothing to maintain.
- **Family photos for art:** `art/photos/` exists locally only — gitignored, never in the public repo.
- **Assistant memory:** design and build history also mirrored in the Claude project memory on Ange's Mac, but nothing in this repo depends on it.

## How to change and deploy (the whole ritual)

1. Edit files (or have your assistant edit them).
2. **Bump the cache stamp:** in `headquarters.html`, increase both `?v=` numbers (css and js) by one. Without this, phones cling to old code for ~10 minutes.
3. Commit, then `git push` (the Mac keychain holds the credentials; if they expire, generate a new GitHub personal access token with `repo` scope and push once with it).
4. Wait 1–2 minutes for Pages, then on phones: fully close the installed island and reopen it.

## Hard-won lessons (do not relearn these)

- Supabase SQL editor runs a script as one transaction: any error rolls back EVERYTHING, including earlier statements that "worked". Make patches idempotent (`if not exists`, `drop policy if exists`).
- GitHub Pages needs `.nojekyll` for a plain static site (already present — don't delete it).
- iOS: push notifications and full-screen only work from the Home Screen-installed island; web audio obeys the ring/silent switch; motion (compass) and location (GPS) need HTTPS, so they only work on the deployed island, never on local previews.
- Custom notification sounds are impossible for web push; the in-island drums are synthesised in the browser instead.
- Overlay positions are percentages of the scene image, measured from the image pixels — never eyeballed.

## Launch checklist (held until the drums sounded — they have)

- [x] Shared island proven across devices (flag, chest, chronicle, chaos state)
- [x] Push notifications land on a locked phone
- [x] Drums audible in-island; squeak built for the hunt
- [x] Stone reads live weather, tides, moon, whales, meteors (home shore: Maroochydore)
- [x] Treasure chart (live map) for long chases
- [ ] Field hunt: GPS tracking + needle + squeak tested outdoors on two phones
- [ ] Chaos crystal full ritual with three crew aboard
- [ ] Consider changing the crew code (the build-time code passed through chat)
- [ ] Give the crew the address + the code. Add to Home Screen. First hunt as launch ceremony.

## Voyage status

- **Voyage I (The Porch):** complete. **II (The Crew):** complete. **III (The Call):** complete. **IV (The Island Watches):** Stone senses live; wildlife intelligence, BOM warnings, guest hunters and the rest wait in `THE_HARBOUR.md`.

*Family is our crew. Adventure is our way.*
