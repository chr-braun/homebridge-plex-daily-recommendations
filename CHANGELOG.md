# Changelog

Alle wesentlichen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

## [0.0.8-alpha] - 2025-10-22

### 🔧 FIX: Circular Reference Error behoben

**Problem behoben:** "Failed to save cached accessories to disk: Converting circular structure to JSON"

### Was war das Problem?

Die `PlexSensorAccessory` Klasse speicherte eine Referenz auf die gesamte `platform`:
```javascript
this.platform = platform; // ❌ Circular reference!
```

Da die Platform ein Array von Accessories hat und jedes Accessory zurück auf die Platform zeigt, entstand eine **zirkuläre Referenz** die Homebridge nicht serialisieren konnte.

### Was wurde geändert

- ❌ `this.platform = platform` entfernt
- ✅ Nur noch benötigte Referenzen gespeichert (`this.log`, `this.config`)
- ✅ Kommentar hinzugefügt zur Vermeidung zukünftiger circular references
- ✅ Accessories können jetzt korrekt gespeichert werden

### Jetzt funktioniert:

- ✅ Accessories werden zwischen Neustarts gespeichert
- ✅ Keine "Failed to save cached accessories" Fehler mehr
- ✅ Plugin lädt stabil

## [0.0.7-alpha] - 2025-10-22

### 🔥 KRITISCHER FIX: Plugin lädt jetzt endlich!

**Problem behoben:** Plugin erzeugte keine Logs und lud überhaupt nicht!

### Was war das Problem?

**ROOT CAUSE:** Es gab **ZWEI** Schema-Definitionen:
1. ✅ `config.schema.json` (korrekt, ohne fehlerhafte Attribute)
2. ❌ **Inline Schema** in der JS-Datei (mit alten fehlerhaften Definitionen)

Das **inline Schema in der JS-Datei überschrieb die config.schema.json** und blockierte das Plugin komplett!

### Was wurde geändert

- 🔥 **Inline `module.exports.schema` aus JS-Datei entfernt** (Zeile 21-103)
- ✅ Nur noch `config.schema.json` wird verwendet (sauberer Standard)
- ✅ Plugin lädt jetzt korrekt
- ✅ Logs werden erzeugt
- ✅ Konfiguration speichert

### Jetzt funktioniert alles!

- ✅ **Plugin lädt** und zeigt Logs an
- ✅ **Konfiguration wird gespeichert**
- ✅ **Alle Felder editierbar**
- ✅ **Child Bridge über Standard-UI aktivierbar**
- ✅ **Test-Switch funktioniert**

## [0.0.6-alpha] - 2025-10-22

### 🔧 Kritischer Fix: Konfiguration wird jetzt gespeichert

**Problem behoben:** Eingaben in der GUI wurden nicht gespeichert!

### Was war das Problem?

- `_bridge` Objekt im Schema verhinderte das Speichern
- `placeholder` Attribute interferierten mit dem Formular
- `format: "uri"` Validierung zu strikt
- Layout-Struktur war zu komplex

### Was wurde geändert

- ❌ `_bridge` Schema entfernt (wird automatisch von Homebridge verwaltet)
- ❌ `placeholder` Attribute entfernt
- ❌ `format: "uri"` entfernt
- ✅ `form: null` hinzugefügt für sauberes Rendering
- ✅ `name` zu required hinzugefügt
- ✅ Layout vereinfacht und korrigiert
- ✅ Child Bridge Info in Hilfetext verschoben

### Wie aktiviere ich jetzt Child Bridge?

Da `_bridge` nicht mehr im Schema ist, nutze die Homebridge UI-X Standard-Methode:

1. Plugin Settings öffnen
2. **Zahnrad-Symbol** (⚙️) oben rechts klicken
3. **"Bridge Settings"** → **"Run this plugin as a separate child bridge"** aktivieren
4. Speichern & Homebridge neu starten

### Jetzt sollte alles funktionieren!

- ✅ Konfiguration wird gespeichert
- ✅ Alle Felder editierbar
- ✅ Child Bridge über Standard-UI aktivierbar
- ✅ Test-Switch funktioniert

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
