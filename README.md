# EASE Cap Table Manager

Lokale Single-Page-App für Cap Tables, Finanzierungsrunden, Wandeldarlehen, VSOP-Pools und Exit-Simulationen. Die App startet mit einem leeren Modell: Ein Founder hält 100 %, alle Finanzierungs-, VSOP- und Exit-Werte stehen auf null.

## Funktionen

- Cap Table über mehrere Finanzierungsstände
- Wandeldarlehen mit Zins, Discount, Valuation Cap und wählbarer Fully-Diluted-Wandlungsbasis
- Mehrere VSOP-Pools mit zugeordneten Personen, Vesting, Cliff, Leaver- und Ablaufdatum
- Exit-Simulation mit Multiple und IRR für alle Beteiligten
- Lokale automatische Speicherung, Rückgängig/Wiederholen und Suche
- CSV-Import und -Export für Backups

## Dokumentation und Beispiel

- [Bebilderte Bedienungsanleitung](docs/bedienungsanleitung.md)
- [Importierbare Beispiel-CSV](examples/ease-cap-table-example.csv)

## Starten

Öffne `index.html` direkt in einem modernen Browser. Alternativ kann die Datei über einen beliebigen lokalen Webserver bereitgestellt werden.

## Daten und Backups

Die Eingaben werden lokal im Browser gespeichert. Über **CSV exportieren** und **CSV laden** lassen sich Versionen sichern und wiederherstellen. Verwende möglichst immer dieselbe Adresse und denselben Port, da Browserdaten an die Adresse gebunden sind.

## Optional über einen lokalen Server starten

```powershell
python -m http.server 8080
```
