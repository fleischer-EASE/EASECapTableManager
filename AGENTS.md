# Repository Guidelines

## Project Structure & Module Organization

This is a dependency-free, browser-based single-page application. `index.html` contains the complete UI, styles, state management, calculations, CSV import/export, and persistence logic. `README.md` provides the quick start and feature overview. User documentation lives in `docs/bedienungsanleitung.md`, with screenshots under `docs/images/`. Keep importable sample data in `examples/`; update `examples/ease-cap-table-example.csv` when the CSV schema changes.

## Build, Test, and Development Commands

No build step or package installation is required. Open `index.html` directly in a modern browser, or serve the repository locally for a stable storage origin:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`. Use `git diff --check` before committing to catch whitespace errors, and `git status --short` to confirm the intended files are included.

## Coding Style & Naming Conventions

Keep HTML, CSS, and JavaScript self-contained in `index.html`; do not introduce a framework or build tool without discussion. Follow nearby formatting: two-space CSS indentation, single-quoted JavaScript strings, semicolons, `camelCase` variables/functions, and kebab-case HTML IDs/classes such as `erm-latest-stage`. Reuse the existing CSS custom properties instead of hard-coded theme colors. Preserve German user-facing copy and escape user-controlled text with the existing `esc` helper before inserting HTML.

## Testing Guidelines

There is currently no automated test suite or coverage threshold. Test changes manually in both light and dark themes and at desktop and narrow viewport widths. For calculation or data-model changes, exercise equity rounds, convertibles, secondaries, VSOP pools, and exit payouts. Verify undo/redo, browser reload persistence, blank reset, and a CSV export/import round-trip using the example file. Check the browser console for errors.

## Commit & Pull Request Guidelines

Recent commits use short, imperative, title-case subjects, for example `Add Secondary transactions and liquidation preferences`. Keep each commit focused. Pull requests should explain behavior and calculation changes, list manual test scenarios, and link the relevant issue. Include before/after screenshots for visible UI changes. Update the README, German guide, screenshots, or sample CSV whenever contributor-facing behavior changes.

## Security & Data Handling

Application data stays in browser `localStorage`; never add secrets or production personal data. Preserve the restrictive Content Security Policy. Review any new CDN origin or external asset carefully and document why it is needed.
