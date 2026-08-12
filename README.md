<!-- SPDX-License-Identifier: AGPL-3.0-only -->

# Cap Table Manager

Cap Table Manager is a dependency-free, browser-based workspace for modelling
ownership, financing rounds, convertible loans, secondary transfers, VSOP
programmes, and exit proceeds. Everything runs in one `index.html`; no account,
backend, build step, or package installation is required.

A blank workspace starts with one founder holding 100%. For a guided tour, load
the public example and follow the integrated bilingual guide from formation
through Series A and the exit waterfall.

## Quick start

Open `index.html` directly in a modern browser, or serve the repository locally
for a stable browser-storage origin:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`. Using the same address and port keeps the
same local workspace between sessions.

## Typical workflow

1. Add the formation stakeholders and their initial shares.
2. Create VSOP pools before assigning virtual grants.
3. Record equity rounds, convertible loans, and secondary transfers from
   **New transaction**.
4. Move between development stages to review dilution and ownership.
5. Check the chronological financing cards and edit an event when required.
6. Enter an exit value, date, debt, and transaction costs to run the waterfall.
7. Export the workspace as CSV for an app backup or as OCF for exchange with
   compatible cap-table systems before moving data or resetting.

## Modelling coverage

- English and German interface with a persistent €/$ display toggle. The toggle
  changes formatting only; it does not convert stored values.
- Chronological cap-table stages for formation, equity rounds, and secondaries.
- Multi-investor equity rounds priced from a fully diluted pre-money valuation.
- A per-round switch can include the as-converted shares of outstanding
  convertible loans in that fully diluted pricing basis.
- Share classes with seniority, pari-passu ranks, non-participating or fully
  participating liquidation preferences, participation caps, conversion
  ratios, cumulative dividends, and optional redemption floors.
- Convertible loans with simple interest, discount, valuation cap, and three
  possible conversion bases.
- Secondary transfers by seller, buyer, date, share class, quantity, and price.
- Multiple VSOP pools with granted, planned, vested, reserved, and available
  balances.
- VSOP grants with cliff, vesting interval, vesting pause, strike price, expiry,
  leaver retention, and single- or double-trigger acceleration.
- Exit simulation with a seniority-based liquidation-preference waterfall,
  economic conversion choice, payout multiples, and IRR.
- Local automatic saving, a 30-state undo/redo history, cap-table search, view
  export, complete CSV workspace backups, and OCF 1.2 import/export.

Stakeholders with the same name are grouped into one cap-table and exit row.
Their individual lots, financing terms, cash flows, and VSOP grants remain
separate for the calculations.

### Convertible conversion basis

The two convertible switches produce three calculation modes:

- **Convert on a fully diluted basis** off: actual equity shares only.
- **Convert on a fully diluted basis** on: actual equity plus all shares in
  VSOP pools.
- Fully diluted plus **Include granted VSOP shares only**: actual equity plus
  non-cancelled VSOP shares granted by the conversion date. Free capacity,
  planned grants, cancelled grants, and later grants are excluded.

## Guide and example

- [Importable example CSV](examples/ease-cap-table-example.csv)
- **Guide / Anleitung:** open the application and select **Guide** or
  **Anleitung** in the left navigation
- [German screenshots](guide/screenshots/de)
- [English screenshots](guide/screenshots/en)

The example follows a German financing journey. Two founders start with 25,000
shares in total. Two pre-seed angel convertibles are followed by Bridge, Seed,
and Series A rounds, an employee pool, one VSOP grant, and an exit assumption.

The German and English guides use the same 13-section structure and matching
Chrome screenshots. Each section explains the purpose, when to use the feature,
the exact workflow, the expected result, and common errors. The terminology
table also maps product concepts to the relevant state fields and functions.

## Data, CSV, and OCF files

Application data is stored in `localStorage` for the current browser origin.
This makes reloads convenient, but it is not a cloud backup.

- **Export CSV** downloads the complete workspace in CSV schema v5.
- **Import CSV** restores a complete workspace. Schema v2 through v4 exports remain
  importable.
- **Export OCF** asks for the issuer legal name, formation date, and ISO
  country code, then creates a standards-based OCF 1.2 `.ocf.zip` package with
  manifest checksums.
- **Import OCF** reads OCF 1.2 ZIP packages. Packages produced by this app
  restore the workspace losslessly; generic packages import supported
  stakeholders, stock classes, stock plans, financing issuances, convertible
  notes, and equity-compensation issuances.
- **Export view** downloads only the selected and optionally filtered cap-table
  stage. It is a report and cannot be imported as a workspace.
- **Load example** can download the current workspace first, then replace it
  with the versioned public example.

Schema v5 adds `include_convertibles_in_fully_diluted` to round records. When
enabled, the round price uses issued equity, the modelled virtual pool and the
as-converted shares of CLAs outstanding at closing. Schema v4 added
`fully_diluted_granted_vsop_only` to convertible records. Currency fields keep
their historical EUR names; selecting `$` changes only display formatting.

OCF is event-based and does not have direct equivalents for every modelling
field in this app. App exports therefore include a namespaced metadata comment
for exact re-import. Generic OCF imports reject transaction chains that cannot
be represented instead of silently discarding them. The implementation targets
[Open Cap Format 1.2](https://open-cap-table-coalition.github.io/Open-Cap-Format-OCF/).

## Testing

Run the calculation and import scenarios without installing dependencies:

```powershell
node tests/test-scenarios.js
```

The suite contains 63 independently calculated, human-readable scenarios
covering waterfalls, preference claims, financing rounds, VSOP and vesting,
convertible loans, secondary transactions, and CSV imports.

## Security and limitations

The restrictive Content Security Policy denies unspecified sources. **Load
example** permits a read from `raw.githubusercontent.com`; it downloads only the
versioned example CSV and does not transmit workspace data.

The donation button loads its image and tracking pixel from PayPal. Selecting it
submits only the hosted donation-button ID and continues the process on PayPal;
no cap-table data is included.

The waterfall and VSOP tools are financial models, not legal, tax, or accounting
advice. Do not put secrets or production personal data in the repository or
example files.

## Contact

Bug reports and other inquiries can be sent to
[captable@ease-systems.de](mailto:captable@ease-systems.de).

## License

Copyright © 2026 Cap Table Manager contributors.

This software is licensed under the **GNU Affero General Public License,
Version 3 only** (`AGPL-3.0-only`) and is provided without warranty. See
[LICENSE](LICENSE) for the complete terms. The
[source code](https://github.com/fleischer-EASE/EASECapTableManager) is publicly
available.
