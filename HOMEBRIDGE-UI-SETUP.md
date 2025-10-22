# Homebridge UI-X Konfiguration

Das Plugin hat jetzt eine benutzerfreundliche Oberfläche für Homebridge UI-X integriert!

## Installation & Setup

### 1. Plugin installieren

```bash
sudo npm install -g homebridge-plex-daily-recommendations
```

### 2. Homebridge UI-X öffnen

Gehe zu: `http://localhost:8581` (oder deine Homebridge UI URL)

### 3. Neues Accessory hinzufügen

1. Gehe zu **Accessories**
2. Klick auf **"+"** (Add Accessory)
3. Wähle **"Plex Daily Recommendations"** aus
4. Fülle das Formular aus:

## Formularfelder erklärt

### Name

- **Was:** Der Name des Accessories in HomeKit und Homebridge
- **Beispiel:** "Plex Empfehlungen" oder "Neue Filme"
- **Standard:** "Plex Empfehlungen"

### Plex Server Verbindung

#### Plex Server URL

- **Was:** Die HTTP-Adresse deines Plex Servers
- **Format:** `http://IP:PORT` (z.B. `http://192.168.178.3:32400`)
- **Hinweis:** Nutze HTTP, nicht HTTPS! Der Port ist normalerweise `32400`
- **Lokal:** `http://localhost:32400` oder `http://127.0.0.1:32400`
- **Im Netzwerk:** `http://192.168.X.X:32400`

#### Plex API Token

- **Was:** Dein Authentifizierungs-Token für die Plex API
- **Passwort-Feld:** Der Token wird verschlüsselt gespeichert
- **Wie du ihn findest:**
  1. Gehe zu https://app.plex.tv/web/
  2. Öffne die Developer Console (F12)
  3. Gehe zum "Network" Tab
  4. Lade eine Seite neu
  5. Suche nach einem Request zu plex.tv
  6. In den Headers siehst du `X-Plex-Token=...`
  7. Kopiere alles nach dem `=`

#### Plex Server Machine ID

- **Was:** Die eindeutige ID deines Plex Servers
- **Wie du sie findest:**
  1. Öffne `http://DEIN_PLEX_SERVER:32400/?X-Plex-Token=DEIN_TOKEN` im Browser
  2. Drücke Ctrl+F und suche nach `machineIdentifier=`
  3. Kopiere die Nummer ohne Anführungszeichen
- **Beispiel:** `72608c6d7f50411587ca59f8a91cc5fe19e5bc78`

### Benachrichtigungen

#### Benachrichtigungszeit

- **Was:** Uhrzeit, wann täglich die Benachrichtigung gesendet wird
- **Format:** `HH:MM` (24-Stunden-Format)
- **Beispiele:**
  - `20:00` = 20:00 Uhr (8 PM)
  - `09:00` = 9:00 Uhr morgens
  - `18:30` = 18:30 Uhr
- **Standard:** `20:00`

#### Stunden zurückblicken

- **Was:** Wie weit in die Vergangenheit das Plugin nach neuen Inhalten schaut
- **Bereich:** 1-168 Stunden (1 Stunde - 1 Woche)
- **Standard:** 24 Stunden (1 Tag)
- **Beispiele:**
  - `24` = Alle neuen Inhalte aus den letzten 24 Stunden
  - `48` = Alle neuen Inhalte aus den letzten 2 Tagen
  - `1` = Nur die letzte Stunde

## Speichern & Aktivieren

1. Fülle alle erforderlichen Felder aus (Plex Token und Machine ID sind Pflichtfelder)
2. Klick **"Save"**
3. Homebridge wird automatisch neu gestartet
4. Das neue Accessory erscheint in der Home App

## In der Home App

Nach dem Speichern:

1. Öffne die Home App auf deinem iPhone/iPad
2. Das neue Accessory "Plex Empfehlungen" sollte erscheinen
3. Konfiguriere eine Automation (optional):
   - Gehe zu "Automation" → "+"
   - Wähle "Ein Accessory wird aktiviert"
   - Wähle dein neues Accessory
   - Konfiguriere, was passieren soll (z.B. Benachrichtigung)

## Debugging in der UI

Die Homebridge UI-X zeigt auch Logs:

1. Gehe zu **Logs**
2. Filtere nach `homebridge-plex-daily-recommendations`
3. Du siehst:
   - Wann der tägliche Check ausgeführt wird
   - Wieviele neue Inhalte gefunden wurden
   - Fehler (falls vorhanden)

## Häufige Probleme

### "Ungültiges Token-Format"

- Stelle sicher, dass du den kompletten Token kopiert hast (ohne Leerzeichen)

### "Verbindung zum Plex Server fehlgeschlagen"

- Überprüfe die URL (sollte `http://` sein, nicht `https://`)
- Stelle sicher, dass der Server läuft
- Prüfe die Firewall-Einstellungen

### "Keine Benachrichtigungen erhalten"

- Überprüfe die Zeit im Format `HH:MM`
- Schau in die Logs, ob der Cron-Job ausgelöst wird
- Stelle sicher, dass HomeKit-Benachrichtigungen aktiviert sind

### "Machine ID nicht gefunden"

- Öffne `http://SERVER:32400/?X-Plex-Token=TOKEN` direktüber
- Aktualisiere die Seite (Ctrl+R oder Cmd+R)
- Suche erneut nach `machineIdentifier=`

## Änderungen vornehmen

1. Gehe zu **Accessories**
2. Klick auf das Stift-Icon (✎) neben dem Accessory
3. Ändere die Werte
4. Klick **"Save"**
5. Homebridge wird neu gestartet

## Accessory löschen

1. Gehe zu **Accessories**
2. Klick auf die Mülltonne neben dem Accessory
3. Bestätige das Löschen
4. Das Accessory wird entfernt
