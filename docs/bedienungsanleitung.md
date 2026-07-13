# Bedienungsanleitung: EASE Cap Table Manager

Der EASE Cap Table Manager ist eine lokale Browser-App für Cap Tables, Finanzierungsrunden, Wandeldarlehen, VSOP-Zuteilungen und Exit-Simulationen. Alle Eingaben bleiben im lokalen Browserspeicher; ein Server oder Benutzerkonto ist nicht erforderlich.

## Schnellstart mit Beispieldaten

1. Starte die App über `start-app.cmd`.
2. Klicke links unter **Versionen & Daten** auf **CSV laden**.
3. Wähle [`examples/ease-cap-table-example.csv`](../examples/ease-cap-table-example.csv).
4. Prüfe die importierten Daten in den Bereichen **Cap Table**, **Finanzierungen**, **VSOP Pool** und **Exit Simulation**.

> Beim CSV-Import wird der aktuelle Datenstand ersetzt. Exportiere vorher eine Sicherung, wenn du vorhandene Eingaben behalten möchtest.

## 1. Oberfläche und Navigation

![Übersicht des EASE Cap Table Managers](images/01-overview.jpg)

Die Seitenleiste führt zu den fünf Arbeitsbereichen:

- **Übersicht** zeigt Kennzahlen und die Entwicklung der Beteiligungsverhältnisse.
- **Cap Table** enthält alle Beteiligten, Anteile und Ownership-Werte.
- **Finanzierungen** zeigt Wandeldarlehen und Equity-Runden.
- **VSOP Pool** verwaltet gewährte und geplante virtuelle Anteile.
- **Exit Simulation** berechnet die Verteilung eines angenommenen Verkaufserlöses.

Über die Schaltflächen im Kopfbereich legst du neue Beteiligte, Wandeldarlehen, VSOP-Zuteilungen und Finanzierungsrunden an. Mit **Aktuell** springst du zum neuesten Finanzierungsstand. Das Suchfeld filtert die sichtbaren Cap-Table-Zeilen nach Name oder Typ.

## 2. Beteiligte und Cap Table anlegen

1. Klicke auf **Beteiligte**.
2. Trage Name, Typ und Anzahl der Anteile ein.
3. Optional kannst du investiertes Kapital und Investitionsdatum für die spätere IRR-Berechnung ergänzen.
4. Klicke auf **Hinzufügen**.

Nutze die Stift- und Papierkorb-Symbole in der Cap Table, um Datensätze zu bearbeiten oder zu löschen. Mindestens eine beteiligte Person muss erhalten bleiben.

Für VSOP-Zuteilungen wird ein virtueller Holder mit der ID `vsop-pool` benötigt. Die Beispieldatei enthält diesen bereits.

## 3. Wandeldarlehen erfassen

![Dialog zum Anlegen eines Wandeldarlehens](images/02-convertible-dialog.jpg)

1. Klicke auf **Wandeldarlehen**.
2. Erfasse Darlehensgeber, Betrag, Auszahlungstag, Zinssatz, Discount und optional den Valuation Cap.
3. Entscheide über **Bereits gewährte VSOP-Anteile einbeziehen**:
   - **Aktiviert:** Bis zum Closing gewährte, nicht stornierte VSOP-Anteile erhöhen die Fully-Diluted-Basis der Wandlung.
   - **Deaktiviert:** Die Wandlung wird nur auf Basis der echten Equity-Anteile berechnet.
   - Freie oder nur geplante Pool-Anteile werden in beiden Fällen nicht als bereits gewährt behandelt.
4. Klicke auf **Speichern**.

Das Darlehen wandelt bei der ersten Finanzierungsrunde, deren Closing-Datum am oder nach dem Auszahlungstag liegt. Die App berücksichtigt bis dahin aufgelaufene einfache Zinsen sowie den günstigeren Preis aus Discount und Valuation Cap.

## 4. Finanzierungsrunde hinzufügen

1. Klicke auf **Finanzierungsrunde**.
2. Erfasse Investor, Pre-Money-Bewertung, Investment und Closing-Datum.
3. Optional kannst du zusätzliche VSOP-Pool-Anteile festlegen und bestimmen, ob die Auffrischung Pre- oder Post-Money erfolgt.
4. Klicke auf **Speichern**.

Über die Zeitpunkte unter **Entwicklung** wechselst du zwischen Gründung und den einzelnen Runden. Cap Table, Ownership und Kennzahlen werden für den ausgewählten Stand neu berechnet.

## 5. VSOP-Zuteilung verwalten

![Dialog zum Anlegen einer VSOP-Zuteilung](images/03-vsop-dialog.jpg)

1. Stelle sicher, dass im Cap Table ein ausreichend großer virtueller VSOP-Pool vorhanden ist.
2. Klicke auf **VSOP-Person**.
3. Erfasse gewährte und optional geplante Anteile, Zusage- und Vestingbeginn, Vestingdauer sowie Cliff.
4. Optional kannst du Basispreis, Ablaufdatum, Status und Austrittsdatum ergänzen.
5. Klicke auf **Speichern**.

Die App verhindert Zuteilungen, die den Pool einschließlich späterer Pool-Auffrischungen überschreiten. Bei ausgeschiedenen Personen werden nur die bis zum Austritt gevesteten Anteile weiter berücksichtigt; stornierte Zuteilungen belegen den Pool nicht.

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
| `holder` | Zwei Gründer und ein virtueller VSOP-Pool |
| `convertible` | Wandeldarlehen mit Zins, Discount, Cap und aktivierter VSOP-Berücksichtigung |
| `round` | Seed-Runde mit Pre-Money-Pool-Auffrischung |
| `vsop` | Aktive Zuteilung mit Granted-, Planned-, Vesting- und Ablaufdaten |
| `exit` | Beispielhafte Exit-Annahmen |

Datumswerte verwenden das Format `JJJJ-MM-TT`. Dezimalzahlen sollten ohne Tausendertrennzeichen eingetragen werden. Die Datei ist semikolongetrennt und UTF-8-codiert.

## Wichtiger Hinweis

Die Anwendung ist ein Planungs- und Simulationswerkzeug. Ergebnisse ersetzen keine rechtliche, steuerliche oder finanzielle Beratung und sollten vor Transaktionen mit den zugrunde liegenden Verträgen abgeglichen werden.
