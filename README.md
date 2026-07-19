# EASE Cap Table Manager

Lokale Single-Page-App für Cap Tables, Eigenkapitalrunden, Wandeldarlehen, Secondaries, VSOP-Pools und Exit-Simulationen. Die App startet mit einem leeren Modell: Ein Founder hält 100 %, alle Transaktions-, VSOP- und Exit-Werte stehen auf null.

## Funktionen

- Cap Table über chronologische Eigenkapital- und Secondary-Stände
- Gemeinsamer Einstieg **Neue Transaktion** für Eigenkapitalrunde, Wandeldarlehen und Secondary
- Eigenkapitalrunden mit mehreren Investoren zu einem gemeinsamen Fully-Diluted-Pre-Money-Preis
- Anteilsklassen mit Seniorität, pari-passu Rängen, nicht oder voll partizipierender Liquidationspräferenz, Participation Cap, Conversion Ratio, kumulativer Dividende und optionalem Redemption-Floor
- Wandeldarlehen mit Zins, Discount, Valuation Cap und wählbarer Fully-Diluted-Wandlungsbasis
- Secondaries mit übertragbarer Anteilsklasse, Verkäufer, Käufer, Anteilen, Stückpreis und Rendite-Cashflows
- Mehrere VSOP-Pools mit monatsbasiertem Vesting, Cliff, Leaver- und Ablaufdatum
- Exit-Simulation mit senioritätsbasiertem LiqPref-Waterfall, wirtschaftlicher Konversionswahl, Multiple und IRR
- Export der gerade ausgewählten und optional gefilterten Cap Table
- Lokale automatische Speicherung, Rückgängig/Wiederholen, Suche sowie CSV-Backups

## Dokumentation und Beispiel

- [Bebilderte Bedienungsanleitung](docs/bedienungsanleitung.md)
- [Importierbare Beispiel-CSV](examples/ease-cap-table-example.csv)

## Starten

Öffne `index.html` direkt in einem modernen Browser. Alternativ kann die Datei über einen beliebigen lokalen Webserver bereitgestellt werden.

## Berechnungen testen

Die regressionskritischen Berechnungen lassen sich ohne Installation mit Node.js prüfen:

```powershell
node tests/calculation-scenarios.js
```

Die Suite deckt 32 benannte Szenarien und 250 deterministisch erzeugte Waterfalls ab.

## Daten und Backups

Die Eingaben werden lokal im Browser gespeichert. Über **CSV exportieren** und **CSV laden** lassen sich vollständige Versionen sichern und wiederherstellen. **Ansicht exportieren** lädt ausschließlich den aktuell ausgewählten Cap Table-Stand herunter und berücksichtigt den Suchfilter. Verwende möglichst immer dieselbe Adresse und denselben Port, da Browserdaten an die Adresse gebunden sind.

