# EASE Cap Table Manager

Lokale Single-Page-App für Cap Tables, Finanzierungsrunden, Wandeldarlehen, VSOP-Pools und Exit-Simulationen. Die App startet mit einem leeren Modell: Ein Founder hält 100 %, alle Finanzierungs-, VSOP- und Exit-Werte stehen auf null.

## Funktionen

- Cap Table über mehrere Finanzierungsstände
- Wandeldarlehen mit Zins, Discount, Valuation Cap und wählbarer Fully-Diluted-Wandlungsbasis
- Mehrere VSOP-Pools mit zugeordneten Personen, Vesting, Cliff, Leaver- und Ablaufdatum
- Exit-Simulation mit MOIC und IRR
- Lokale automatische Speicherung, Rückgängig/Wiederholen und Suche
- CSV-Import und -Export für Backups

## Dokumentation und Beispiel

- [Bebilderte Bedienungsanleitung](docs/bedienungsanleitung.md)
- [Importierbare Beispiel-CSV](examples/ease-cap-table-example.csv)

## Starten

Öffne die eigenständige `index.html` direkt im Browser.

## Daten und Backups

Die Eingaben werden lokal im Browser gespeichert. Über **CSV exportieren** und **CSV laden** lassen sich Versionen sichern und wiederherstellen. Verwende möglichst immer dieselbe Adresse und denselben Port, da Browserdaten an die Adresse gebunden sind.


