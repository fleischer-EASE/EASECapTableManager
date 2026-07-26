<!-- SPDX-License-Identifier: AGPL-3.0-only -->

# EASE Cap Table Manager

EASE Cap Table Manager is a dependency-free, browser-based single-page
application for cap tables, equity rounds, convertible loans, secondary
transactions, VSOP pools, and exit simulations. The application starts with a
simple formation model in which one founder owns 100%, while all transaction,
VSOP, and exit values are set to zero.

## Quick start

No build step or package installation is required. Open `index.html` directly
in a modern browser, or serve the repository locally to give browser storage a
stable origin:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Features

- English-by-default interface switchable between English and German, with a
  persistent €/$ display toggle
- Cap table views across chronological equity and secondary stages
- A shared **New transaction** entry point for equity rounds, convertible loans,
  and secondary transactions
- Equity rounds with multiple investors at one fully diluted pre-money price
- Investors with the same name are bundled into one cap-table and exit row
  across holdings, conversions, and rounds, while the individual conditions of
  their share lots remain separate in the waterfall
- Share classes with seniority, pari-passu ranks, non-participating or fully
  participating liquidation preferences, participation caps, conversion
  ratios, cumulative dividends, and optional redemption floors
- Convertible loans with interest, discount, valuation cap, and a selectable
  fully diluted conversion basis
- Secondary transactions with transferable share class, seller, buyer, share
  count, price per share, and return cash flows
- Multiple VSOP pools with capacity controls and available, planned, granted,
  reserved, and vested balances
- VSOP grants with grant and vesting start dates, monthly, quarterly, or annual
  vesting, cliff, vesting pauses, base price (strike price), and expiry date
- Good-, neutral-, and bad-leaver modelling with a configurable retention rate
  for vested claims; existing and new grants retain 100% of vested claims by
  default
- Single- and double-trigger acceleration for exit simulations; VSOP holders
  with the same name are bundled at exit, while base price, vesting, leaver, and
  acceleration conditions are calculated separately for every grant
- Exit simulation with a seniority-based liquidation-preference waterfall,
  economic conversion choice, multiples, and IRR; ranks start at 1 and higher
  seniority numbers are served first
- Export of the currently selected and optionally filtered cap-table view
- Local automatic saving, undo and redo, search, and complete CSV backups
- Direct import of the current example, with an option to save the existing
  workspace as CSV before it is replaced
- An integrated bilingual **Guide / Anleitung** with 13 continuous practical
  sections and 26 language-specific Chrome screenshots
- A bilingual **Report bug / Fehler melden** button that opens a pre-addressed
  email in the user’s configured email application

## Guide and example

- [Importable example CSV](examples/ease-cap-table-example.csv)
- **Guide / Anleitung:** open the application and select **Guide** or
  **Anleitung** in the left navigation
- [German screenshots](guide/screenshots/de)
- [English screenshots](guide/screenshots/en)

The example CSV represents a German financing journey. Two founders start with
a total of 25,000 shares. Two pre-seed angel convertible loans are followed by
Bridge, Seed, and Series A rounds, an employee pool, and an exit assumption.

The integrated guide uses this same example continuously from formation through
the exit simulation. Its German and English versions have an identical section,
step, and screenshot structure. Each main feature explains its purpose, when to
use it, the required steps, the expected result, and common errors.

## Testing

Run the calculation and import scenarios without installing dependencies:

```powershell
node tests/test-scenarios.js
```

The suite contains 61 independently calculated, human-readable scenarios
covering waterfalls, preference claims, financing rounds, VSOP and vesting,
convertible loans, secondary transactions, and CSV imports.

## Data, backups, and security

Application data is stored locally in the browser. Use **Export CSV** and
**Load CSV** to save and restore complete workspace versions. CSV schema v3
includes the vesting interval and pause, leaver category and retention rate,
exit acceleration, and second-trigger date. Older schema v2 files remain
importable.

**Export view** downloads only the currently selected cap-table stage and
respects the active search filter. It is not a complete workspace backup. Use
the same address and port whenever possible because browsers associate local
data with the page origin.

The VSOP functions model contractual calculation parameters and do not replace
legal or tax review of a specific participation programme.

The €/$ toggle changes only the displayed symbol and number format. It does not
perform currency conversion; stored numbers and the existing EUR fields in the
CSV schema remain unchanged.

For **Load example**, the Content Security Policy permits one additional read
connection to `raw.githubusercontent.com`. The application downloads only the
versioned example CSV from this repository and does not transmit local workspace
data.

No secrets or production personal data should be stored in the repository or
the example files.

## Contact

Bug reports and other inquiries can be sent to
[captable@ease-systems.de](mailto:captable@ease-systems.de).

## License

Copyright © 2026 EASE Cap Table Manager contributors.

This software is licensed under the **GNU Affero General Public License,
Version 3 only** (`AGPL-3.0-only`) and is provided without warranty. See
[LICENSE](LICENSE) for the complete terms. The
[source code](https://github.com/fleischer-EASE/EASECapTableManager) is publicly
available.
