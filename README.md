# EASE Cap Table Manager

Lokale Single-Page-App für Cap Tables, Eigenkapitalrunden, Wandeldarlehen, Secondaries, VSOP-Pools und Exit-Simulationen. Die App startet mit einem leeren Modell: Ein Founder hält 100 %, alle Transaktions-, VSOP- und Exit-Werte stehen auf null.

## Funktionen

- Umschaltbare deutsche und englische Benutzeroberfläche sowie persistenter €/$-Anzeigeschalter
- Cap Table über chronologische Eigenkapital- und Secondary-Stände
- Gemeinsamer Einstieg **Neue Transaktion** für Eigenkapitalrunde, Wandeldarlehen und Secondary
- Eigenkapitalrunden mit mehreren Investoren zu einem gemeinsamen Fully-Diluted-Pre-Money-Preis
- Namensgleiche Investoren werden über Beteiligungen, Wandlungen und Runden hinweg zu einer Cap-Table- und Exit-Zeile gebündelt; die unterschiedlichen Konditionen ihrer einzelnen Anteilspakete bleiben im Waterfall erhalten
- Anteilsklassen mit Seniorität, pari-passu Rängen, nicht oder voll partizipierender Liquidationspräferenz, Participation Cap, Conversion Ratio, kumulativer Dividende und optionalem Redemption-Floor
- Wandeldarlehen mit Zins, Discount, Valuation Cap und wählbarer Fully-Diluted-Wandlungsbasis
- Secondaries mit übertragbarer Anteilsklasse, Verkäufer, Käufer, Anteilen, Stückpreis und Rendite-Cashflows
- Mehrere VSOP-Pools mit Kapazitätskontrolle, freiem, geplanten, gewährtem, reserviertem und gevestetem Bestand
- VSOP-Zuteilungen mit Zuteilungs- und Vestingbeginn, monatlichem, quartalsweisem oder jährlichem Vesting, Cliff, Vesting-Pausen, Basispreis (Strikepreis) und Ablaufdatum
- Good-, Neutral- und Bad-Leaver-Modellierung mit frei definierbarem Erhalt bereits gevesteter Ansprüche; bestehende und neue Zuteilungen behalten standardmäßig 100 % der gevesteten Ansprüche
- Single- und Double-Trigger-Beschleunigung für Exit-Simulationen; namensgleiche VSOP-Berechtigte werden im Exit gebündelt, während Basispreis, Vesting, Leaver- und Beschleunigungsbedingungen je Zuteilung separat berechnet werden
- Exit-Simulation mit senioritätsbasiertem LiqPref-Waterfall, wirtschaftlicher Konversionswahl, Multiple und IRR; die Rangfolge beginnt bei 1 und höhere Senioritätsränge werden zuerst bedient
- Export der gerade ausgewählten und optional gefilterten Cap Table
- Lokale automatische Speicherung, Rückgängig/Wiederholen, Suche sowie CSV-Backups
- Direkter Import der aktuellen GitHub-Beispieldaten mit vorgelagerter Auswahl, den bestehenden Workspace als CSV zu sichern

## Dokumentation und Beispiel

- [Importierbare Beispiel-CSV](examples/ease-cap-table-example.csv)

## Starten

Öffne `index.html` direkt in einem modernen Browser. Alternativ kann die Datei über einen beliebigen lokalen Webserver bereitgestellt werden.

## Berechnungen testen

Die regressionskritischen Berechnungen lassen sich ohne Installation mit Node.js prüfen:

```powershell
node tests/test-scenarios.js
```

Die Suite deckt 61 unabhängig berechnete und menschenlesbar dokumentierte Szenarien für Waterfalls, Präferenzansprüche, Finanzierungsrunden, VSOP/Vesting, Wandeldarlehen und CSV-Importe ab.

## Daten und Backups

Die Eingaben werden lokal im Browser gespeichert. Über **CSV exportieren** und **CSV laden** lassen sich vollständige Versionen sichern und wiederherstellen. Das CSV-Schema v3 enthält auch Vesting-Intervall und -Pause, Leaver-Kategorie und Erhaltungsquote sowie Exit-Beschleunigung und zweites Triggerdatum; ältere v2-Dateien bleiben importierbar. **Ansicht exportieren** lädt ausschließlich den aktuell ausgewählten Cap Table-Stand herunter und berücksichtigt den Suchfilter. Verwende möglichst immer dieselbe Adresse und denselben Port, da Browserdaten an die Adresse gebunden sind.

Die VSOP-Funktionen bilden vertragliche Rechenparameter ab und ersetzen keine rechtliche oder steuerliche Prüfung des konkreten Beteiligungsprogramms.

Der €/$-Schalter ändert ausschließlich Symbol und Zahlenformat in der Oberfläche. Er führt keine Währungsumrechnung durch; gespeicherte Zahlen und die bestehenden EUR-Felder des CSV-Schemas bleiben unverändert.

Für **GitHub-Beispiel laden** erlaubt die Content Security Policy ausschließlich eine zusätzliche Leseverbindung zu `raw.githubusercontent.com`. Dabei wird nur die versionierte Beispiel-CSV aus diesem Repository abgerufen; lokale Workspace-Daten werden nicht übertragen.

