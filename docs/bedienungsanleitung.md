# Bedienungsanleitung: EASE Cap Table Manager

Der EASE Cap Table Manager ist eine lokale Browser-App für Cap Tables, Eigenkapitalrunden, Wandeldarlehen, Secondaries, mehrere VSOP-Pools und Exit-Simulationen. Alle Eingaben bleiben im lokalen Browserspeicher; ein Server oder Benutzerkonto ist nicht erforderlich.

## Schnellstart mit Beispieldaten

1. Öffne `index.html` in einem modernen Browser.
2. Klicke links unter **Versionen & Daten** auf **CSV laden**.
3. Wähle [`examples/ease-cap-table-example.csv`](../examples/ease-cap-table-example.csv).
4. Prüfe die importierten Daten in den Bereichen **Cap Table**, **Finanzierungen**, **VSOP Pool** und **Exit Simulation**.

> Beim CSV-Import wird der aktuelle Datenstand ersetzt. Exportiere vorher eine Sicherung, wenn du vorhandene Eingaben behalten möchtest.

## 1. Oberfläche und Navigation

![Übersicht des EASE Cap Table Managers](images/01-overview.jpg)

Die Seitenleiste führt zu den fünf Arbeitsbereichen:

- **Übersicht** zeigt Kennzahlen, das Donutdiagramm und die danebenliegende Cap Table.
- **Cap Table** enthält Beteiligte, Anteile, Ownership-Werte und den Export der gerade sichtbaren Ansicht.
- **Finanzierungen** zeigt alle Instrumente gemeinsam chronologisch von links nach rechts.
- **VSOP Pool** verwaltet Pools sowie gewährte und geplante virtuelle Anteile.
- **Exit Simulation** verteilt einen angenommenen Verkaufserlös und berücksichtigt Liquidationspräferenzen.

Mit **Aktuell** springst du zum neuesten Transaktionsstand. Die Zeitpunkte unter **Entwicklung** wechseln zwischen Gründung, Eigenkapitalrunden und Secondaries. Das Suchfeld filtert die sichtbaren Zeilen der Cap Table nach Name oder Typ.

## 2. Transaktion auswählen

![Auswahl unter Neue Transaktion](images/02-neue-transaktion.png)

Klicke im Kopfbereich auf **Neue Transaktion**. Im Auswahlfenster stehen drei Instrumente zur Verfügung:

- **Eigenkapitalrunde** gibt neue Anteile aus und erhöht das aufgenommene Gesellschaftskapital.
- **Wandeldarlehen** wird bei einer späteren Eigenkapitalrunde gewandelt.
- **Secondary** überträgt vorhandene Anteile zwischen zwei Parteien; Gesamtanteile und Gesellschaftskapital bleiben unverändert.

VSOP-Pools, VSOP-Personen und Beteiligte legst du weiterhin direkt über die benachbarten Schaltflächen an.

## 3. Beteiligte und VSOP-Pools anlegen

1. Klicke auf **Beteiligte**, um einen echten Anteilseigner anzulegen.
2. Trage Name, Typ und Anzahl der Anteile ein.
3. Optional kannst du investiertes Kapital und Investitionsdatum für die spätere IRR-Berechnung ergänzen.
4. Klicke auf **Hinzufügen**.

Nutze die Stift- und Papierkorb-Symbole in der Cap Table, um Datensätze zu bearbeiten oder zu löschen. Mindestens eine beteiligte Person muss erhalten bleiben. Datensätze, die als Verkäufer einer Secondary benötigt werden, können erst nach Anpassung der Secondary gelöscht oder umbenannt werden.

![Dialog zum Anlegen eines VSOP-Pools](images/02-vsop-pool-dialog.jpg)

Für virtuelle Anteile klickst du auf **VSOP-Pool**, vergibst einen eindeutigen Namen und legst die Poolgröße fest. Du kannst mehrere Pools parallel verwalten. Ein Pool lässt sich nur löschen oder verkleinern, wenn weder zugeordnete Personen noch Pool-Auffrischungen dadurch ungültig werden.

## 4. Wandeldarlehen erfassen

![Dialog zum Anlegen eines Wandeldarlehens](images/02-convertible-dialog.jpg)

1. Öffne **Neue Transaktion** und wähle **Wandeldarlehen**.
2. Erfasse Darlehensgeber, Betrag, Auszahlungstag, Zinssatz, Discount und optional den Valuation Cap.
3. Entscheide über **Fully Diluted wandeln**:
   - **Aktiviert:** Alle bestehenden VSOP-Pool-Anteile – belegt, geplant oder frei – zählen zur Wandlungsbasis.
   - **Deaktiviert:** Die Wandlung wird nur auf Basis der echten Equity-Anteile berechnet.
4. Klicke auf **Speichern**.

Das Darlehen wandelt bei der ersten Eigenkapitalrunde, deren Closing-Datum am oder nach dem Auszahlungstag liegt. Die App berücksichtigt bis dahin aufgelaufene einfache Zinsen sowie den günstigeren Preis aus Discount und Valuation Cap.

## 5. Eigenkapitalrunde und Liquidationspräferenz

![Eigenkapitalrunde mit LiqPref-Optionen](images/03-equity-dialog.png)

1. Öffne **Neue Transaktion** und wähle **Eigenkapitalrunde**.
2. Erfasse Rundenname, Anteilsklasse, Pre-Money-Bewertung und Closing-Datum.
3. Erfasse einen oder mehrere Investoren mit ihrem jeweiligen Investment. **Investor hinzufügen** ergänzt weitere Zeichnungen; alle Investoren derselben Runde erhalten denselben Preis je Anteil und dieselben Anteilsklassenbedingungen.
4. Wähle die Liquidationspräferenz:
   - **Keine:** Der Investor erhält ausschließlich seinen pro-rata Anteil.
   - **Nicht partizipierend:** Der Investor erhält den höheren Wert aus Präferenzbetrag und pro-rata Auszahlung.
   - **Partizipierend:** Der Investor erhält zuerst den Präferenzbetrag und nimmt danach zusätzlich an der Restverteilung teil.
5. Lege die Bedingungen der Anteilsklasse fest:
   - **LiqPref-Multiple:** Präferenzanspruch bezogen auf das Investment, beispielsweise `1,0×`.
   - **Senioritätsrang:** Rang `1` wird zuerst bedient. Anteilsklassen mit demselben Rang werden pari passu und bei Unterdeckung proportional bedient.
   - **Participation Cap:** maximale Gesamtauszahlung der partizipierenden Vorzugsanteile als Multiple des Investments; `0` bedeutet unbegrenzt. Ist eine vollständige Konversion wirtschaftlich besser, wird stattdessen konvertiert.
   - **Conversion Ratio:** Fully-Diluted-Anteile je rechtlichem Vorzugsanteil. `1` entspricht einer 1:1-Konversion.
   - **Kumulative Dividende:** einfacher jährlicher Zuwachs des Präferenzanspruchs ab Closing.
   - **Redemption-Floor:** optionaler Mindest-Präferenzanspruch ab einem Stichtag. Die App verwendet dann den höheren Wert aus LiqPref und Redemption-Multiple.
6. Optional kannst du zusätzliche VSOP-Pool-Anteile, den Zielpool und Pre- oder Post-Money-Auffrischung festlegen.
7. Klicke auf **Speichern**.

Der Preis je neuem Anteil ergibt sich einmal pro Runde aus der Pre-Money-Bewertung geteilt durch alle Fully-Diluted-Anteile. Die einzelnen Investments werden nicht nacheinander neu bepreist. Eine Pre-Money-Pool-Auffrischung zählt bereits zur Preisbasis und verwässert damit die bisherigen Beteiligten vor der Runde. Eine Post-Money-Auffrischung wird erst nach Ausgabe der neuen Investor-Anteile hinzugefügt.

## 6. Secondary erfassen

![Dialog zum Erfassen einer Secondary](images/03-secondary-dialog.png)

1. Öffne **Neue Transaktion** und wähle **Secondary**.
2. Wähle den Verkäufer aus der zu diesem Zeitpunkt verfügbaren Cap Table.
3. Wähle die **übertragene Anteilsklasse**. Du kannst Common-Anteile oder die Anteile einer bestimmten Eigenkapitalrunde auswählen. **Automatisch** verwendet zuerst Common-Anteile und danach die ältesten Finanzierungsrunden.
4. Erfasse Käufer, Anzahl der übertragenen Anteile, Preis je Anteil und Transaktionsdatum.
5. Klicke auf **Speichern**.

Die App prüft die chronologische Verfügbarkeit innerhalb der gewählten Anteilsklasse. Der Käufer wird bei Bedarf automatisch als Investor angelegt. Mit Anteilen einer Finanzierungsrunde werden deren Liquidationspräferenzrechte proportional übertragen. Kaufpreis und Verkaufserlös fließen in Multiple und IRR ein; sie zählen nicht als von der Gesellschaft aufgenommenes Kapital.

![Chronologische Transaktionen im Drei-Spalten-Raster](images/03-financing-grid.jpg)

Alle Instrumente erscheinen gemeinsam von links nach rechts und anschließend in der nächsten Zeile. Eigenkapitalrunden sind grün, Wandeldarlehen violett und Secondaries orange eingefärbt.

## 7. VSOP-Zuteilung verwalten

![Dialog zum Anlegen einer VSOP-Zuteilung](images/03-vsop-dialog.jpg)

1. Stelle sicher, dass mindestens ein ausreichend großer VSOP-Pool vorhanden ist.
2. Klicke auf **VSOP-Person** und wähle den zugehörigen Pool.
3. Erfasse gewährte und optional geplante Anteile, Zusage- und Vestingbeginn, Vestingdauer sowie Cliff.
4. Optional kannst du Basispreis, Ablaufdatum, Status und Austrittsdatum ergänzen.
5. Klicke auf **Speichern**.

Die App prüft die Kapazität für jeden Pool getrennt und berücksichtigt zugeordnete Auffrischungen. Vesting wird anhand vollständig abgelaufener Kalendermonate berechnet. Monatsenden werden auf den letzten gültigen Tag des Zielmonats begrenzt, sodass beispielsweise der Zeitraum vom 31. Januar bis zum 28. oder 29. Februar als voller Monat zählt. Bei ausgeschiedenen Personen werden nur die bis zum Austritt gevesteten Anteile weiter berücksichtigt; stornierte Zuteilungen belegen den Pool nicht.

## 8. Exit simulieren

![Exit-Simulation mit LiqPref und Multiples](images/04-exit-simulation.jpg)

1. Öffne **Exit Simulation**.
2. Erfasse Unternehmensverkauf, Exit-Datum, Schulden und Transaktionskosten.
3. Prüfe Nettoerlös, Gruppen- und Einzelauszahlungen sowie ausgewiesene LiqPref-Beträge.
4. Vergleiche das **Multiple** aus Exit-Auszahlung plus bereits realisierten Secondary-Erlösen geteilt durch alle erfassten Investments. Bei positiver Auszahlung ohne Investment zeigt die App `∞×`.

Der Waterfall bedient Präferenzansprüche nach aufsteigendem Senioritätsrang. Innerhalb desselben Rangs werden Ansprüche pari passu bedient und bei Unterdeckung proportional gekürzt. Nicht partizipierende Anteilspakete wählen iterativ die wirtschaftlich bessere Alternative aus Präferenz und Konversion. Partizipierende Anteilspakete erhalten Präferenz und Restbeteiligung bis zu ihrem Participation Cap; ist die vollständige Konversion wirtschaftlich besser, wird konvertiert. Conversion Ratio, zeitanteilige einfache kumulative Dividenden und ein zum Exit-Datum erreichter Redemption-Floor fließen in die Berechnung ein. Common-Anteile desselben Investors bleiben auch dann an der Restverteilung beteiligt, wenn dessen Vorzugsanteile die Präferenz wählen. Bei VSOP-Personen gilt der Strike der gevesteten Anteile als Investment.

> Die Simulation bildet keine automatische Anti-Dilution-Anpassung, Pay-to-play-Regelung, Dividendenverzinsung oder -kapitalisierung, tatsächliche Ausübung eines Rücknahmerechts, Steuern oder frei formulierte Vertragsklauseln ab. Der Redemption-Wert ist bewusst nur ein Floor im Exit-Waterfall. Prüfe deshalb die Simulation gegen die tatsächlichen Beteiligungsverträge.

## 9. Cap Table exportieren, speichern und wiederherstellen

- Wähle unter **Entwicklung** den gewünschten Stand und setze optional einen Suchfilter.
- **Ansicht exportieren** lädt genau die sichtbare Cap Table mit Stand, Datum, Anteilen, Ownership und Wert als CSV herunter.
- **CSV exportieren** in der Seitenleiste erstellt dagegen ein vollständiges Backup aller Datensätze.
- **CSV laden** ersetzt den aktuellen Datenstand durch eine zuvor exportierte oder kompatible Datei.
- **Rückgängig** und **Wiederholen** verwalten bis zu 30 Datenstände.
- Tastaturkürzel: `Strg+Z`, `Strg+Umschalt+Z` und `Strg+Y` außerhalb von Eingabefeldern.
- **Zurücksetzen** bietet an, vor dem Löschen eine vollständige CSV-Sicherung zu erstellen.

Browserdaten sind an die aufgerufene Adresse gebunden. Öffne daher möglichst immer dieselbe `index.html` oder verwende bei einem lokalen Webserver dieselbe Adresse und denselben Port.

## 10. Aufbau der Beispiel-CSV

Die Beispieldatei enthält folgende `record_type`-Datensätze:

| Typ | Inhalt |
| --- | --- |
| `holder` | Zwei Gründer und der virtuelle Pool `Employee Pool 2024` |
| `convertible` | Wandeldarlehen mit Zins, Discount, Cap und Fully-Diluted-Wandlung |
| `round` | Eigenkapitalrunde, Anteilsklasse, Bewertung und gemeinsame Präferenzbedingungen |
| `round_investor` | Einzelne Zeichnung mit Round-ID, Investor und Investment |
| `secondary` | Übertragung von Common-Anteilen eines Gründers an einen neuen Investor |
| `vsop` | Dem Pool zugeordnete aktive Zuteilung |
| `exit` | Beispielhafte Exit-Annahmen, bei denen die LiqPref sichtbar greift |

`round_id` verbindet jeden `round_investor` mit seiner Runde. `liquidation_preference_type` akzeptiert `none`, `non-participating` oder `participating`; die weiteren Bedingungen stehen in `liquidation_preference_multiple`, `liquidation_seniority`, `participation_cap_multiple`, `conversion_ratio`, `cumulative_dividend_rate_pct`, `redemption_enabled`, `redemption_date` und `redemption_multiple`. CSV-Dateien des bisherigen Ein-Investor-Schemas bleiben importierbar. Eine Secondary verwendet `seller`, `buyer`, `shares`, `secondary_price_per_share_eur`, `closing_date` und optional `source_round_id`. Der Wert `common` überträgt ausschließlich Common-Anteile, eine Round-ID überträgt Anteile dieser Finanzierungsrunde und ein leerer Wert verwendet die automatische Reihenfolge. `pool_id` verbindet VSOP-Personen und Pool-Auffrischungen mit ihrem Pool. `fully_diluted_conversion` steuert die Wandlungsbasis eines Darlehens. Datumswerte verwenden `JJJJ-MM-TT`; die Datei ist semikolongetrennt und UTF-8-codiert.

## Wichtiger Hinweis

Die Anwendung ist ein Planungs- und Simulationswerkzeug. Ergebnisse ersetzen keine rechtliche, steuerliche oder finanzielle Beratung und sollten vor Transaktionen mit den zugrunde liegenden Verträgen abgeglichen werden.
