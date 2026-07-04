# Voyage II: The Crew — Design

*Goal: one shared island. Dadrew raises the colours on his phone and the flag climbs on everyone's. Photos dropped in the chest appear in every pocket. The shanty is one song, not three.*

*Pipeline unchanged: design approved → build in increments → local testing → commit → deploy only on approval. Nothing here is locked until Ange says so.*

---

## 1. Principles

- **The island still opens instantly.** localStorage becomes the cache; the app renders from it first, then Supabase catches it up. No spinners on the porch.
- **No passwords on a family porch.** Getting aboard should feel like knowing the secret knock, not filling in a form.
- **Memories are forever.** Photos live in private storage, always exportable (the multi-generation archive rule). The public GitHub repo continues to hold only code and scene art.
- **Live moments stay theatrical.** When the colours rise remotely, the pennant hoists and the proclamation plays on every open island — the sync IS the magic, so it arrives as ceremony, not as a silent data refresh.

## 2. Getting aboard: the Crew Code (decision for Ange)

Proposed: one **crew code** for the whole family — a secret word or phrase (like a treasure-map word). First visit: enter the crew code, then claim who you are from the roster. The device remembers forever. No emails, no passwords, works for The Boy without an account anywhere.

Under the hood: Supabase anonymous sign-in per device + the crew code checked server-side; every table guarded so only code-bearers read or write. Milo, Cherub and BigJ join later by being added to the roster and told the code.

Alternative (rejected unless you prefer it): email magic links per member — more standard, but kids and shared iPads make it clumsy.

## 3. What becomes shared (schema sketch)

One `island` (future-proofing if Ansla ever hosts more than one family), then:

- `crew_members` — id, name, role, joined_at, active
- `flag` — single current state: raised, adventure, when, raised_by, joining[]
- `horizon` — queued adventures (title, when, charted_by)
- `ideas` — planted ideas
- `adventures` — completed log (title, when, joining, chaos, chaos_champion, completed_at)
- `treasures` — caption, author, adventure link, photo path (file itself in a **private Storage bucket**)
- `chronicle` — entries (text, author, date)
- `shanty_lines` — line, author, earned date (the one true song)
- `shanty_chorus` — single row: text (locked 4 Jul 2026, carries Dadrew's founding credit), revealed (flips true when the first shanty_line is earned; chorus then plays alongside every verse after)
- `chaos` — current deployment + **missions kept secret per member** (each phone can only read its own mission; true secrecy at last, enforced server-side)
- `hide_seek` — active state (the lantern lights on every phone)

## 4. Live moments (Supabase Realtime)

Subscribed on every open island: flag changes (pennant + proclamation fire remotely), new treasures (polaroid drops into the chest), chaos deployment (the crystal pulses on every phone — your mission awaits), hide & seek (the lantern kindles everywhere), new shanty lines and chronicle entries.

## 5. Migration

- One-time import: Ange's phone holds the true state (treasures, chronicle, shanty so far) — a hidden "sail the chest to the cloud" step in Settings uploads it all once.
- Old Google Sheets app: adventure history can be imported into `adventures` for the record. Ange shares the sheet/repo when convenient; not blocking.

## 6. The compass ships this voyage

Real device-orientation compass (promised in the architecture): no backend needed, but it lands here so the crew's first whole island includes it. Needs HTTPS (GitHub Pages provides it) — one reason the compass waited.

## 7. Chest export (the safety line)

Settings gains "Export the chest": downloads every photo, caption, chronicle entry and shanty line as ordinary files. The archive is never hostage to any service. Ships early in this voyage, not last.

## 8. Build order (each step mock-tested locally before the next)

1. Supabase project + schema + crew-code gate (island works exactly as now, but signed in)
2. Shared flag + horizon + realtime ceremony (the headline magic, proven between Ange's phone and desktop)
3. Shared treasures with private photo storage + migration of existing chest
4. Shared chronicle, shanty, ideas
5. True-secret chaos missions + champion voting from each phone
6. Real compass
7. Chest export
8. Crew walkthrough → deploy decision (repo public + Pages, or Pro) → **launch to the crew, whole**

## 9. What Ange does to open the voyage

1. Create a **new Supabase project** (separate from the portal's — clean keys, clean blast radius): supabase.com → New project, name it `ansla-island`, pick the Sydney region, set a strong database password (save it in your password manager; we rarely need it).
2. Once created: Project Settings → API → send me the **Project URL** and the **anon public key** (both are safe to share — the anon key is designed to live in the app; the `service_role` key is the one that must never leave Supabase).
3. Choose the **crew code** (don't tell me yet — we'll set it as a server-side secret, not in the code).
4. Decide on section 2 (crew code vs magic links) and bless or amend this document.

## Open questions (moored here, not blocking)

- Chaos Champion's extra reward (still unclaimed in the Harbour)
- Whether striking the colours could also *notify* — true push is Voyage III, but a gentle in-island bell may be possible sooner
- Old Google Sheets import: what history exists and what's worth keeping
