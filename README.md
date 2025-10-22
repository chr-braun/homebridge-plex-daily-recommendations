# Homebridge Plex Daily Recommendations

Ein Homebridge Plugin, das dir täglich um eine bestimmte Uhrzeit (z.B. 20:00 Uhr) eine HomeKit-Benachrichtigung sendet, wenn neue Filme oder Serien auf deinem Plex Server hinzugefügt wurden.

## Installation

### 1. Plugin installieren

```bash
sudo npm install -g homebridge-plex-daily-recommendations
```

Oder falls du es lokal installiert hast:

```bash
npm install homebridge-plex-daily-recommendations
```

### 2. Dependencies installieren

Das Plugin brauch folgende NPM-Pakete:

- `axios` - für HTTP-Requests zur Plex API
- `node-cron` - für tägliche Planung

Diese werden automatisch mit dem Plugin installiert.

### 3. Konfiguration – Zwei Optionen

#### Option A: Homebridge UI-X (Empfohlen! 🎨)

Das Plugin hat eine benutzerfreundliche Oberfläche für Homebridge UI-X!

1. Öffne Homebridge UI-X: `http://localhost:8581`
2. Gehe zu **Accessories** → **"+"**
3. Wähle **"Plex Daily Recommendations"**
4. Fülle das Formular mit deinen Daten aus
5. Klick **"Save"**

Detaillierte Anleitung: [HOMEBRIDGE-UI-SETUP.md](HOMEBRIDGE-UI-SETUP.md)

#### Option B: Manuelle config.json Konfiguration

Füge dies zu deiner Homebridge `config.json` hinzu:

```json
{
  "platforms": [
    {
      "platform": "PlexDailyRecommendations",
      "name": "Plex Daily Recommendations",
      "plexUrl": "http://192.168.178.3:32400",
      "plexToken": "DEIN_PLEX_TOKEN",
      "machineId": "DEINE_SERVER_MACHINE_ID",
      "notificationTime": "20:00",
      "hoursBack": 24
    }
  ]
}
```

**Wichtig:** Das Plugin ist eine **Platform**, nicht ein einzelnes Accessory. Stelle sicher, dass du es unter `platforms` (nicht `accessories`) in der config.json einträgst.

## Konfigurationsoptionen

| Option             | Beschreibung                                        | Standard                     |
| ------------------ | --------------------------------------------------- | ---------------------------- |
| `name`             | Name des Accessories in HomeKit                     | "Plex Recommendations"       |
| `plexUrl`          | URL deines Plex Servers                             | "http://192.168.178.3:32400" |
| `plexToken`        | Dein Plex API Token                                 | - (erforderlich)             |
| `machineId`        | Machine ID deines Plex Servers                      | - (erforderlich)             |
| `notificationTime` | Uhrzeit für tägliche Benachrichtigung (HH:MM)       | "20:00"                      |
| `hoursBack`        | Wie viele Stunden zurück nach neuen Inhalten suchen | 24                           |

## Child Bridge Support (Empfohlen!)

Dieses Plugin unterstützt **Homebridge Child Bridges** für bessere Stabilität und Performance.

### Vorteile von Child Bridges:

- 🛡️ **Stabilität**: Plugin-Crashes beeinflussen nicht die Hauptbridge
- 🔄 **Unabhängiges Neustarten**: Plugin kann einzeln neu gestartet werden
- ⚡ **Performance**: Bessere Resource-Nutzung durch Prozess-Isolation
- 🔍 **Debugging**: Einfacheres Troubleshooting durch isolierte Logs

### Aktivierung in Homebridge UI-X:

1. Öffne Homebridge UI-X
2. Gehe zu **Plugins** → **Plex Daily Recommendations** → **Settings**
3. Aktiviere **"Bridge Settings"** → **"Run As Separate Child Bridge"**
4. Speichern und Homebridge neu starten

Das Plugin läuft dann als eigene Bridge mit eigenem Port!

## Wie es funktioniert

1. Das Plugin erstellt einen Occupancy Sensor in HomeKit
2. Um die angegebene Uhrzeit (z.B. 20:00) wird automatisch überprüft, ob neue Inhalte auf deinem Plex Server hinzugefügt wurden
3. Wenn neue Inhalte gefunden werden, wird der Sensor kurz aktiviert → HomeKit sendet eine Benachrichtigung
4. Die neuen Inhalte werden in den Homebridge Logs angezeigt

## HomeKit Automation einrichten

Nach der Installation kannst du eine Automation in der Home App erstellen:

1. Öffne die Home App
2. Gehe zu "Automation" → "+"
3. Wähle "Ein Accessory wird aktiviert"
4. Wähle "Plex Empfehlungen" aus
5. Konfiguriere die Aktion (z.B. "Benachrichtigung senden")

## Debugging

Für detaillierte Logs, starte Homebridge mit Debug-Flag:

```bash
homebridge -D
```

Dort siehst du:

- Wenn der Cron-Job ausgelöst wird
- Wieviele neue Inhalte gefunden wurden
- Details zu jedem neuen Film/Serie mit Zeitstempel

## Plex Token und Machine ID finden

**Plex Token:**

1. Gehe zu https://app.plex.tv/web/
2. Öffne Developer Console (F12)
3. Gehe zum Tab "Network"
4. Lade eine Seite neu
5. Suche nach einem Request zu plex.tv
6. In den Headers siehst du `X-Plex-Token=...`

**Machine ID:**

1. Öffne `http://DEIN_PLEX_SERVER:32400/?X-Plex-Token=DEIN_TOKEN` im Browser
2. Suche nach `machineIdentifier=`

## Troubleshooting

**Plugin wird nicht geladen:**

- Überprüfe deine `config.json` auf Syntax-Fehler
- Stelle sicher, dass `plexToken` und `machineId` korrekt sind

**Keine Benachrichtigungen:**

- Überprüfe, ob die Zeit korrekt ist (Format: HH:MM im 24h-Format)
- Schau in den Homebridge Logs nach Fehlermeldungen
- Teste manuell: `curl "http://PLEX_SERVER:32400/library/sections?X-Plex-Token=TOKEN"`

**Falsche Benachrichtigungszeit:**

- Das System nutzt die lokale Zeitzone des Homebridge-Servers
- Überprüfe die Systemzeit mit `date`

## Lizenz

MIT
