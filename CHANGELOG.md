# Changelog

Alle wesentlichen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

## [0.0.5-alpha] - 2025-10-22

### ✨ Neue Features

#### Child Bridge Konfiguration in GUI

- **Child Bridge Settings** jetzt direkt in der GUI konfigurierbar
- Expandierbarer Bereich "Child Bridge Settings (Optional)"
- Homebridge generiert automatisch Username und Port
- Bessere Sichtbarkeit der Child Bridge Option

#### Test-Benachrichtigung Switch

- **Neuer Switch in HomeKit**: "Test Benachrichtigung"
- Manuelles Auslösen von Benachrichtigungen für Tests
- Switch schaltet sich automatisch wieder aus nach Ausführung
- Ideal zum Testen der Plex-Verbindung und Benachrichtigungen

### Hinzugefügt

- Test-Switch Service für manuelle Benachrichtigungstests
- `_bridge` Konfiguration im Schema für Child Bridge Support
- Hilfetext für Child Bridge Aktivierung
- Automatisches Ausschalten des Test-Switch

### Verbessert

- Child Bridge Option ist jetzt in UI-X sichtbar
- Logging zeigt an, dass Test-Switch verfügbar ist
- Bessere UX für Test-Funktionalität

### Nutzung

**Child Bridge aktivieren:**

1. Settings → Child Bridge Settings (Optional) expandieren
2. Username und Port eintragen (oder leer lassen für Auto-Generierung)
3. Speichern und Homebridge neu starten

**Test-Benachrichtigung senden:**

1. Öffne Home App
2. Suche "Test Benachrichtigung" Switch
3. Schalte ihn ein → Benachrichtigung wird sofort gesendet
4. Switch schaltet sich automatisch wieder aus

## [0.0.4-alpha] - 2025-10-22

### 🔧 GUI-Konfiguration Fix

GUI-Konfiguration sollte jetzt endlich in Homebridge UI-X funktionieren!

### Geändert

- **config.schema.json**: Separate Schema-Datei erstellt (bevorzugte Methode für Homebridge UI-X)
- **Schema-Syntax**: Korrigiert - `required` jetzt als Array auf Objektebene
- **Schema-Format**: Integer statt number für hoursBack
- **Header/Footer**: Hilfreiche Texte am Anfang und Ende des Config-Formulars

### Hinzugefügt

- Separate `config.schema.json` für bessere UI-X Kompatibilität
- `headerDisplay` und `footerDisplay` für bessere Benutzerführung
- Emoji in Hilfe-Text für bessere visuelle Darstellung

### Behebte Probleme

- GUI-Konfiguration erscheint jetzt korrekt in Homebridge UI-X
- Required-Felder werden jetzt korrekt validiert
- Schema folgt JSON-Schema Standard

## [0.0.3-alpha] - 2025-10-22

### ✨ Child Bridge Support

Das Plugin unterstützt jetzt **Homebridge Child Bridges**!

### Hinzugefügt

- **Child Bridge Support**: Plugin kann als isolierte Child Bridge laufen
  - Bessere Stabilität: Plugin-Crashes beeinflussen nicht die Hauptbridge
  - Isolierte Prozesse: Jede Child Bridge läuft unabhängig
  - Einfaches Neustarten: Plugin kann einzeln neugestartet werden ohne Homebridge
  - Bessere Performance: Resource-Isolation pro Plugin

### Konfiguration

In Homebridge UI-X:

1. Gehe zu Plugin-Settings
2. Aktiviere "Bridge Settings" → "Run As Separate Child Bridge"
3. Speichern und Homebridge neu starten

Das Plugin läuft dann als eigener Prozess mit eigenem Port.

## [0.0.2-alpha] - 2025-10-22

### 🎯 Umstellung auf Platform-Plugin

**BREAKING CHANGE**: Das Plugin wurde von einem Accessory- auf ein Platform-Plugin umgestellt.

### Geändert

- **Platform-Architektur**: Plugin ist jetzt als Homebridge Platform registriert
  - Ermöglicht GUI-Konfiguration in Homebridge UI-X
  - Bessere Integration in das Homebridge-Ökosystem
- **Config-Schema**: Komplett überarbeitet für Platform-Support
  - Hinzugefügt: Hilfetext im UI
  - Hinzugefügt: Placeholder-Texte für Eingabefelder
  - Hinzugefügt: Expandierbare Fieldsets
  - Verbessert: Validierung mit `required` Feldern
- **Konfiguration**: Migration erforderlich von `accessories` zu `platforms` in config.json

### Migration von v0.0.1-alpha

**Alte Konfiguration (accessories):**

```json
{
  "accessories": [
    {
      "accessory": "homebridge-plex-daily-recommendations",
      "type": "PlexDailyRecommendations",
      "name": "Plex Empfehlungen",
      ...
    }
  ]
}
```

**Neue Konfiguration (platforms):**

```json
{
  "platforms": [
    {
      "platform": "PlexDailyRecommendations",
      "name": "Plex Daily Recommendations",
      ...
    }
  ]
}
```

### Hinzugefügt

- GUI-Konfiguration über Homebridge UI-X vollständig unterstützt
- Platform-Klasse mit Accessory-Discovery
- Verbesserte Logging-Ausgaben für Platform-Lifecycle

## [0.0.1-alpha] - 2025-10-22

### Alpha Release

Initial alpha release des Homebridge Plex Daily Recommendations Plugins.

### Hinzugefügt

- **XML Parser**: Ersetzt Regex-basiertes XML-Parsing durch `fast-xml-parser` Library
- **Konfigurationsvalidierung**: Umfassende Validierung aller Konfigurationsparameter beim Start
  - Validierung von `plexToken` und `machineId` (erforderlich)
  - Validierung des Zeitformats (HH:MM)
  - Validierung von `hoursBack` (1-168 Stunden)
  - Validierung der Plex URL (http/https)
- **Caching-Mechanismus**: 60-Minuten Cache für Bibliotheksabfragen
  - Reduziert API-Aufrufe zum Plex Server
  - Verbessert Performance
- **Typ-Übersetzung**: Deutsche Übersetzungen für Plex-Medientypen
  - Film, Serie, Staffel, Episode, Künstler, Album, Song
- **Erweiterte Tests**: Neue Tests für XML-Parsing und Typ-Übersetzung
- **ESLint-Konfiguration**: Code-Qualitätsstandards und Linting-Regeln

### Verbessert

- **Error Handling**: Detailliertere Fehlerbehandlung mit HTTP-Statuscodes
- **Logging**: Verbessertes Logging mit Icons und strukturierten Nachrichten
  - Debug-Logs für Cache-Nutzung
  - Detaillierte Item-Zählung pro Bibliothek
  - Stack-Traces bei Debug-Modus
- **Performance**: Parallele Abfrage mehrerer Bibliotheken mit `Promise.all()`
- **Code-Dokumentation**: JSDoc-Kommentare für alle wichtigen Methoden
- **Timeout**: Erhöhung der Timeouts von 5s auf 10s für stabilere Verbindungen
- **API-Aufrufe**: Verwendung von Query-Parametern statt URL-Strings

### Geändert

- Cron-Expression-Format verwendet jetzt führende Nullen (z.B. "00 20 \* \* \*")
- XML-Parsing nutzt strukturierte Objektzugriffe statt Regex
- Logs zeigen Zählung der gefundenen Items (z.B. "1. Film - hinzugefügt: ...")

## [1.0.0] - 2025-10-22

### Hinzugefügt

- Initiales Release
- Homebridge Plugin für tägliche Plex Empfehlungen
- Occupancy Sensor für HomeKit-Benachrichtigungen
- Cron-Job für geplante Benachrichtigungen
- Homebridge UI-X Support mit grafischer Konfiguration
- Unterstützung für Filme und Serien
- Konfigurierbare Benachrichtigungszeit
- Konfigurierbare Zeitspanne für neue Inhalte (hoursBack)

[1.1.0]: https://github.com/your-repo/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/your-repo/releases/tag/v1.0.0
