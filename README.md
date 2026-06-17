# Song Yunkun AI Education Product Builder

Static bilingual personal website for AI education product, application planning, and technical product management positioning. The site is structured for admissions officers, project mentors, and internship recruiters.

## Files

- `index.html`: page structure and bilingual content
- `styles.css`: responsive sci-fi console art direction, Cobalt System color tokens, layout and motion styling
- `script.js`: AI education opening sequence control, language switching, reveal animation, tabs, magnetic buttons, interactive art states, count-up metrics, pointer light fields, auto-cycling network modes, generative hero canvas, and full-page ambient background canvas
- `DYNAMIC_DESIGN_PLAN.md`: project-level design plan for keeping high-motion interaction meaningful, performant, and tied to the AI education product narrative
- `COLOR_STRATEGY.md`: project-level Cobalt System color strategy, including semantic roles, usage ratios, dynamic color choreography, and contrast baseline
- `start.cmd`: double-click launcher for a local webpage
- `assets/resume.docx`: optional local resume download target

## Open Locally

Double-click `start.cmd`.

The script tries to start a local server at `http://127.0.0.1:5177/`. If Python is unavailable, it opens `index.html` directly.

## Codex Smoke Check

Do not run `start.cmd` from Codex. It starts a foreground `http.server`, which is correct for a double-click preview but will keep a Codex shell call open.

Use the bounded smoke scripts instead.

Verify the launch path only:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\scripts\Start-YunkunSmokeServer.ps1" -StopAfterReady
```

Start the local server for browser or Playwright verification:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\scripts\Start-YunkunSmokeServer.ps1"
```

The start command prints JSON. Save the `ManifestPath` field and stop the server after browser verification:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\scripts\Stop-YunkunSmokeServer.ps1" -ManifestPath "<ManifestPath from starter JSON>"
```

The wrapper uses the shared guard in the Obsidian vault. That guard normalizes duplicate `Path`/`PATH` and proxy environment keys, waits for `http://127.0.0.1:5177/`, writes logs/manifests under `%TEMP%\codex-smoke-check`, and only stops the process recorded in the manifest.


## Design Direction

- Theme: AI Education Console
- Palette: Porcelain, Ink Graphite, Signal Cobalt
- Motion: 8-second AI Education Core opening, full-page ambient canvas, scroll-aware background states, dynamic grid, data rain, scan sweep, circuit traces, generative node field, mode inspector, orbit rings, pointer glow, mission console panels, count-up proof metrics, dual audience cards, layered case interaction, animated workflow, path progress, archive flip cards, language morph, reveal states, magnetic CTA
- Structure: hero, proof metrics, two review modes, mission console, selected work, AI education operating system, capability matrix, archive wall, contact

## Color Strategy

See `COLOR_STRATEGY.md` for the active color plan.

Color principles:

- Keep Cobalt System as the brand palette.
- Use cobalt for product signal, active states, paths, links, and primary CTA.
- Use green only for verified delivery and test proof.
- Use amber only for growth evidence and content-performance proof.
- Use red only for risk, safety, compliance, failed, or blocked states.
- Keep dark mode as a contrast-adjusted version of the same palette, not a different visual identity.

## Dynamic Design Roadmap

See `DYNAMIC_DESIGN_PLAN.md` for the active design plan.

Current design dials:

- `DESIGN_VARIANCE`: 8 / 10
- `MOTION_INTENSITY`: 8 / 10
- `VISUAL_DENSITY`: 4 / 10

Next priorities:

- Keep one major dynamic idea per page instead of making every section equally loud.
- Work page sticky flagship case sequence is implemented.
- Connect About page operating-system steps to more distinct ambient canvas states.
- Add Archive category filtering only after preserving keyboard and mobile tap access.
- Replace abstract case visuals with real product screenshots when available, without using fake dashboard mockups.

## Opening Sequence

- Concept: AI Education Core
- Timeline: black-field wakeup, student signal detection, profile graph build, school context retrieval, strategy engine ignition, AI advising core, agent orchestration, evidence handoff
- Behavior: plays once per browser session, includes Skip, then removes itself from the DOM
- Accessibility: reduced-motion users get a short 0.85-second handoff instead of particle and flash effects

## Background System

- Global: fixed ambient canvas, drifting grid, circuit traces, scanning light, moving data labels, and code rain
- Section states: hero, audience, motion, work, system, stack, archive, contact
- Interaction: pointer glow and subtle particle displacement on fine-pointer devices
- Performance: lower node count on mobile, fewer labels on narrow screens, reduced-motion mode disables sweeping/rain animations

## Notes

The GitHub button currently uses the generic URL supplied in the brief. Replace it with a real profile or repository URL when available. Real project screenshots can replace the current abstract visuals later. The current version stays offline-friendly and avoids external image dependencies.
