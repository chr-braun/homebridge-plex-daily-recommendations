# Changelog

Alle wesentlichen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

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
