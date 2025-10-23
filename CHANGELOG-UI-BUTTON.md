# 🧪 UI Button Changelog - Plex Daily Recommendations

## Version 0.1.1 - UI Button Integration

### 🆕 Neue Features

#### 1. Homebridge UI Test-Button
- **Hinzugefügt**: Test-Button direkt in der Homebridge UI
- **Ort**: Plugin-Konfiguration → "🧪 Test-Benachrichtigung senden"
- **Funktion**: Sofortige Test-Benachrichtigung ohne Home App

#### 2. Verbesserte Benutzerfreundlichkeit
- **Hinzugefügt**: Direkter Zugriff über Homebridge UI
- **Hinzugefügt**: Sofortige Rückmeldung über Erfolg/Fehler
- **Hinzugefügt**: Keine Notwendigkeit, Home App zu öffnen

### 🔧 Technische Änderungen

#### Config Schema (`config.schema.json`)
```json
{
  "customUi": true,
  "form": [
    {
      "key": "testNotification",
      "type": "button",
      "title": "🧪 Test-Benachrichtigung senden",
      "description": "Sende eine Test-Benachrichtigung mit aktuellen Plex-Inhalten",
      "buttonText": "Test starten",
      "buttonClass": "btn-primary"
    }
  ]
}
```

#### Plugin-Code (`homebridge-plex-daily-recommendations.js`)
```javascript
// Neue Methoden hinzugefügt:
- uiButton(button)           // Handler für UI Button-Klicks
- uiEvent(event)            // Handler für UI Events  
- testNotification()         // Führt Test-Benachrichtigung aus
```

#### Package.json
```json
{
  "homebridge": {
    "customUi": true
  }
}
```

### 📁 Neue Dateien

1. **`test-ui-button.js`** - Test-Script für UI-Funktionalität
2. **`UI-BUTTON-SETUP.md`** - Detaillierte Setup-Anleitung
3. **`CHANGELOG-UI-BUTTON.md`** - Diese Changelog-Datei

### 🐛 Bugfixes

- **Behoben**: Config Schema customUi war nicht aktiviert
- **Behoben**: UI Button-Integration war nicht vollständig implementiert

### 🚀 Installation

```bash
# Plugin aktualisieren
npm install -g homebridge-plex-daily-recommendations@latest

# Homebridge neu starten
sudo systemctl restart homebridge
```

### 🧪 Testing

```bash
# UI-Funktionalität testen
node test-ui-button.js
```

### 📋 Verfügbare Test-Methoden

1. **Homebridge UI Button** (NEU) - Direkt in der Konfiguration
2. **Home App Switch** - Über "Test Benachrichtigung" Switch
3. **Manueller Test** - Über Logs und API-Aufrufe

### 🔍 Log-Output

#### Erfolgreiche Test-Benachrichtigung
```
🧪 Test-Benachrichtigung über Homebridge UI Button ausgelöst...
🎬 Führe tägliche Plex-Empfehlungsabfrage durch...
🔍 3 neue Inhalte gefunden!
✅ Test-Benachrichtigung erfolgreich gesendet
```

#### Fehlerhafte Test-Benachrichtigung
```
❌ Fehler beim Senden der Test-Benachrichtigung: Plex Server nicht erreichbar
```

### 🎯 Nächste Schritte

1. **Plugin neu starten** - Homebridge neu starten
2. **UI Button testen** - In der Homebridge UI konfigurieren
3. **Logs überwachen** - Erfolg/Fehler-Meldungen prüfen
4. **Feedback geben** - Bei Problemen oder Verbesserungsvorschlägen

### 📞 Support

- **GitHub**: [Plugin Repository](https://github.com/chr-braun/homebridge-plex-daily-recommendations)
- **Logs**: Homebridge UI → Logs → Filter: "Plex Daily Recommendations"
- **Community**: [Homebridge Discord](https://discord.gg/homebridge)
