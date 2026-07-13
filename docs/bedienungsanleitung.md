# Bedienungsanleitung: EASE Captable Manager

Der EASE Captable Manager ist eine lokale Browser-App für Cap Tables, Finanzierungsrunden, Wandeldarlehen, mehrere VSOP-Pools, VSOP-Zuteilungen und Exit-Simulationen. Alle Eingaben bleiben im lokalen Browserspeicher; ein Server oder Benutzerkonto ist nicht erforderlich.

## Schnellstart mit Beispieldaten

1. Starte die App über `start-app.cmd`.
2. Klicke links unter **Versionen & Daten** auf **CSV laden**.
3. Wähle [`examples/ease-cap-table-example.csv`](../examples/ease-cap-table-example.csv).
4. Prüfe die importierten Daten in den Bereichen **Cap Table**, **Finanzierungen**, **VSOP Pool** und **Exit Simulation**.

> Beim CSV-Import wird der aktuelle Datenstand ersetzt. Exportiere vorher eine Sicherung, wenn du vorhandene Eingaben behalten möchtest.

## 1. Oberfläche und Navigation

![Übersicht des EASE Captable Managers](images/01-overview.jpg)

Die Seitenleiste führt zu den fünf Arbeitsbereichen:

- **Übersicht** zeigt Kennzahlen und die Entwicklung der Beteiligungsverhältnisse.
- **Cap Table** enthält alle Beteiligten, Anteile und Ownership-Werte.
- **Finanzierungen** zeigt Wandeldarlehen und Equity-Runden unterhalb der Cap Table.
- **VSOP Pool** verwaltet Pools sowie gewährte und geplante virtuelle Anteile.
- **Exit Simulation** berechnet die Verteilung eines angenommenen Verkaufserlöses.

Über die Schaltflächen im Kopfbereich legst du Beteiligte, VSOP-Pools, Wandeldarlehen, VSOP-Zuteilungen und Finanzierungsrunden an. Mit **Aktuell** springst du zum neuesten Finanzierungsstand. Das Suchfeld filtert die sichtbaren Cap-Table-Zeilen nach Name oder Typ.

## 2. Beteiligte und VSOP-Pools anlegen

1. Klicke auf **Beteiligte**, um einen echten Anteilseigner anzulegen.
2. Trage Name, Typ und Anzahl der Anteile ein.
3. Optional kannst du investiertes Kapital und Investitionsdatum für die spätere IRR-Berechnung ergänzen.
4. Klicke auf **Hinzufügen**.

Nutze die Stift- und Papierkorb-Symbole in der Cap Table, um Datensätze zu bearbeiten oder zu löschen. Mindestens eine beteiligte Person muss erhalten bleiben.

![Dialog zum Anlegen eines VSOP-Pools](images/02-vsop-pool-dialog.jpg)

Für virtuelle Anteile klickst du auf **VSOP-Pool**, vergibst einen eindeutigen Namen und legst die Poolgröße fest. Du kannst mehrere Pools parallel verwalten, beispielsweise getrennt nach Programmjahr oder Personengruppe. Ein Pool lässt sich nur löschen oder verkleinern, wenn weder zugeordnete Personen noch Pool-Auffrischungen dadurch ungültig werden.

## 3. Wandeldarlehen erfassen

![Dialog zum Anlegen eines Wandeldarlehens](images/02-convertible-dialog.jpg)

1. Klicke auf **Wandeldarlehen**.
2. Erfasse Darlehensgeber, Betrag, Auszahlungstag, Zinssatz, Discount und optional den Valuation Cap.
3. Entscheide über **Fully Diluted wandeln**:
   - **Aktiviert:** Alle bestehenden VSOP-Pool-Anteile – belegt, geplant oder frei – zählen zur Wandlungsbasis.
   - **Deaktiviert:** Die Wandlung wird nur auf Basis der echten Equity-Anteile berechnet; VSOP-Pools bleiben unberücksichtigt.
4. Klicke auf **Speichern**.

Das Darlehen wandelt bei der ersten Finanzierungsrunde, deren Closing-Datum am oder nach dem Auszahlungstag liegt. Die App berücksichtigt bis dahin aufgelaufene einfache Zinsen sowie den günstigeren Preis aus Discount und Valuation Cap.

## 4. Finanzierungsrunde hinzufügen

1. Klicke auf **Finanzierungsrunde**.
2. Erfasse Investor, Pre-Money-Bewertung, Investment und Closing-Datum.
3. Optional kannst du zusätzliche VSOP-Pool-Anteile festlegen, den Zielpool auswählen und bestimmen, ob die Auffrischung Pre- oder Post-Money erfolgt.
4. Klicke auf **Speichern**.

Über die Zeitpunkte unter **Entwicklung** wechselst du zwischen Gründung und den einzelnen Runden. Cap Table, Ownership und Kennzahlen werden für den ausgewählten Stand neu berechnet. Die Finanzierungsübersicht steht direkt unter der Cap Table.

## 5. VSOP-Zuteilung verwalten

![Dialog zum Anlegen einer VSOP-Zuteilung](images/03-vsop-dialog.jpg)

1. Stelle sicher, dass mindestens ein ausreichend großer VSOP-Pool vorhanden ist.
2. Klicke auf **VSOP-Person**.
3. Wähle den zugehörigen **VSOP-Pool** aus.
4. Erfasse gewährte und optional geplante Anteile, Zusage- und Vestingbeginn, Vestingdauer sowie Cliff.
5. Optional kannst du Basispreis, Ablaufdatum, Status und Austrittsdatum ergänzen.
6. Klicke auf **Speichern**.

Die App prüft die Kapazität für jeden Pool getrennt und berücksichtigt dabei spätere, diesem Pool zugeordnete Auffrischungen. Bei ausgeschiedenen Personen werden nur die bis zum Austritt gevesteten Anteile weiter berücksichtigt; stornierte Zuteilungen belegen den Pool nicht.

## 6. Exit simulieren

![Exit-Simulation mit Beispielwerten](images/04-exit-simulation.jpg)

1. Öffne **Exit Simulation**.
2. Erfasse Unternehmensverkauf, Exit-Datum, Schulden und Transaktionskosten.
3. Prüfe den verteilbaren Nettoerlös sowie die Auszahlungen an Gründer, Angels, Investoren und VSOP-Personen.

Die Simulation verteilt den Erlös pro rata und berücksichtigt keine Liquidationspräferenzen, Steuern oder individuellen Vertragsklauseln. MOIC und IRR werden nur angezeigt, wenn die notwendigen Investitionsbeträge und Daten vorhanden sind.

## 7. Speichern, Rückgängig und Backups

- Änderungen werden automatisch im Browser gespeichert.
- **Rückgängig** und **Wiederholen** verwalten bis zu 30 Datenstände.
- Tastaturkürzel: `Strg+Z`, `Strg+Umschalt+Z` und `Strg+Y` außerhalb von Eingabefeldern.
- **CSV exportieren** lädt eine vollständige Sicherung herunter.
- **CSV laden** ersetzt den aktuellen Datenstand durch eine zuvor exportierte oder kompatible Datei.
- **Zurücksetzen** bietet an, vor dem Löschen eine CSV-Sicherung zu erstellen.

Browserdaten sind an Adresse und Port gebunden. Verwende für dieselbe Arbeitsdatei möglichst immer dieselbe Startadresse, beispielsweise `http://127.0.0.1:8080/`.

## 8. Aufbau der Beispiel-CSV

Die Beispieldatei enthält folgende `record_type`-Datensätze:

| Typ | Inhalt |
| --- | --- |
| `holder` | Zwei Gründer und der virtuelle Pool `Employee Pool 2024` |
| `convertible` | Wandeldarlehen mit Zins, Discount, Cap und Fully-Diluted-Wandlung |
| `round` | Seed-Runde mit Pre-Money-Auffrischung des ausgewählten Pools |
| `vsop` | Dem Pool zugeordnete aktive Zuteilung mit Granted-, Planned-, Vesting- und Ablaufdaten |
| `exit` | Beispielhafte Exit-Annahmen |

Die Spalte `pool_id` verbindet VSOP-Personen und Pool-Auffrischungen mit ihrem Pool. `fully_diluted_conversion` steuert die Wandlungsbasis eines Darlehens. Datumswerte verwenden das Format `JJJJ-MM-TT`. Dezimalzahlen sollten ohne Tausendertrennzeichen eingetragen werden. Die Datei ist semikolongetrennt und UTF-8-codiert.

## Wichtiger Hinweis

Die Anwendung ist ein Planungs- und Simulationswerkzeug. Ergebnisse ersetzen keine rechtliche, steuerliche oder finanzielle Beratung und sollten vor Transaktionen mit den zugrunde liegenden Verträgen abgeglichen werden.
