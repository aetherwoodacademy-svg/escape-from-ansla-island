# Escape from Ansla Island

An immersive family adventure headquarters. Not a dashboard, not a planner: a place.

**Core promise:** *Close me. Go outside. Come back with a story.*

The Headquarters is a hidden-object scene: raise the colours to call an adventure, answer the call, unleash a little chaos, then come home to strike the flag, crown the day's winner, add a line to the crew's shanty and drop treasures in the chest. Memories are the real treasure.

## Running it

Voyage I is fully local: open `headquarters.html` in a browser, or serve the folder and visit it from a phone. Add to Home Screen for the full-screen experience. All state lives in the device's local storage; no accounts, no servers, no tracking.

## Structure

```
headquarters.html    the scene
css/ js/             split per build pipeline (mock-up approved first, always)
art/                 scene render, emblem, adventure board art
docs/                architecture, adventure library, the Harbour (idea moorage)
mockups/             approved mock-ups, kept for the record
```

Family photographs are never committed to this repository.

*Built with the pipeline: scene first, interactions second, backend later. Nothing deploys until the island makes us smile.*
