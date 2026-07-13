# EASE Cap Table Manager

Lokale Single-Page-App für Cap Tables, Finanzierungsrunden, Wandeldarlehen, VSOP-Pools und Exit-Simulationen. Die App startet mit einem leeren Modell: Ein Founder hält 100 %, alle Finanzierungs-, VSOP- und Exit-Werte stehen auf null.

## Funktionen

- Cap Table über mehrere Finanzierungsstände
- Wandeldarlehen mit Zins, Discount, Valuation Cap und optionaler Berücksichtigung bereits gewährter VSOP-Anteile
- VSOP-Zuteilungen mit Vesting, Cliff, Leaver- und Ablaufdatum
- Exit-Simulation mit MOIC und IRR
- Lokale automatische Speicherung, Rückgängig/Wiederholen und Suche
- CSV-Import und -Export für Backups

## Starten

1. `start-app.cmd` doppelt anklicken.
2. Der Browser öffnet `http://127.0.0.1:8080/` automatisch.
3. Das Serverfenster geöffnet lassen. Mit `Strg+C` wird der Server beendet.

Falls Python nicht installiert ist, öffnet das Startskript die eigenständige `index.html` direkt im Browser.

## Daten und Backups

Die Eingaben werden lokal im Browser gespeichert. Über **CSV exportieren** und **CSV laden** lassen sich Versionen sichern und wiederherstellen. Verwende möglichst immer dieselbe Adresse und denselben Port, da Browserdaten an die Adresse gebunden sind.

## Anderen Port verwenden

```powershell
powershell.exe -ExecutionPolicy Bypass -File .\start-app.ps1 -Port 8090
```
