# 🧪 UI Button Setup - Plex Daily Recommendations

## Übersicht

Dieses Plugin bietet jetzt einen **Test-Button direkt in der Homebridge UI**, mit dem Sie sofort eine Test-Benachrichtigung senden können, ohne die Home App zu verwenden.

## 🆕 Neue Features

### 1. Homebridge UI Test-Button
- **Ort**: Plugin-Konfiguration in der Homebridge UI
- **Button**: "🧪 Test-Benachrichtigung senden"
- **Funktion**: Sendet sofort eine Test-Benachrichtigung mit aktuellen Plex-Inhalten

### 2. Verbesserte Benutzerfreundlichkeit
- Keine Notwendigkeit, die Home App zu öffnen
- Direkter Zugriff über die Homebridge UI
- Sofortige Rückmeldung über Erfolg/Fehler

## 🚀 Installation & Setup

### Schritt 1: Plugin aktualisieren
```bash
# Falls das Plugin bereits installiert ist, aktualisieren Sie es:
npm install -g homebridge-plex-daily-recommendations@latest

# Oder für lokale Entwicklung:
cd /path/to/your/plugin
npm install
```

### Schritt 2: Homebridge neu starten
```bash
# Homebridge neu starten, damit die neuen UI-Features geladen werden
sudo systemctl restart homebridge
# Oder falls als Service:
sudo systemctl restart homebridge-ui
```

### Schritt 3: Plugin konfigurieren
1. Öffnen Sie die Homebridge UI
2. Gehen Sie zu **Plugins** → **Plex Daily Recommendations**
3. Klicken Sie auf **Konfiguration**
4. Füllen Sie die erforderlichen Felder aus:
   - **Plex Server URL**: z.B. `http://192.168.1.100:32400`
   - **Plex API Token**: Ihr Plex API Token
   - **Machine ID**: Ihre Plex Server Machine ID
   - **Benachrichtigungszeit**: z.B. `20:00`
   - **Stunden zurückblicken**: z.B. `24`

### Schritt 4: Test-Button verwenden
1. Scrollen Sie nach unten zur Sektion **"🧪 Test-Benachrichtigung"**
2. Klicken Sie auf den Button **"Test starten"**
3. Warten Sie auf die Rückmeldung
4. Prüfen Sie die Homebridge Logs für Details

## 🔧 Technische Details

### UI Button-Integration
```javascript
// Config Schema erweitert um:
{
  "key": "testNotification",
  "type": "button",
  "title": "🧪 Test-Benachrichtigung senden",
  "description": "Sende eine Test-Benachrichtigung mit aktuellen Plex-Inhalten",
  "buttonText": "Test starten",
  "buttonClass": "btn-primary"
}
```

### Plugin-Code Erweiterungen
- **`uiButton()`**: Handler für UI Button-Klicks
- **`uiEvent()`**: Handler für UI Events
- **`testNotification()`**: Führt die eigentliche Test-Benachrichtigung aus

## 🐛 Troubleshooting

### Problem: Button erscheint nicht
**Lösung**: 
1. Homebridge neu starten
2. Plugin neu installieren
3. Browser-Cache leeren

### Problem: Button funktioniert nicht
**Lösung**:
1. Prüfen Sie die Homebridge Logs
2. Stellen Sie sicher, dass alle Konfigurationsfelder ausgefüllt sind
3. Testen Sie die Plex-Verbindung manuell

### Problem: Keine Benachrichtigung erhalten
**Lösung**:
1. Prüfen Sie die Plex-Server-Verbindung
2. Überprüfen Sie die API-Token
3. Stellen Sie sicher, dass neue Inhalte in Plex vorhanden sind

## 📋 Verfügbare Test-Methoden

### 1. Homebridge UI Button (NEU)
- **Vorteil**: Direkt in der Konfiguration verfügbar
- **Verwendung**: Klick auf "Test starten" Button

### 2. Home App Switch
- **Vorteil**: Funktioniert auch über Siri
- **Verwendung**: "Test Benachrichtigung" Switch in der Home App

### 3. Manueller Test
- **Vorteil**: Vollständige Kontrolle
- **Verwendung**: Direkte API-Aufrufe oder Log-Analyse

## 🔍 Log-Analyse

### Erfolgreiche Test-Benachrichtigung
```
🧪 Test-Benachrichtigung über Homebridge UI Button ausgelöst...
🎬 Führe tägliche Plex-Empfehlungsabfrage durch...
🔍 3 neue Inhalte gefunden!
✅ Test-Benachrichtigung erfolgreich gesendet
```

### Fehlerhafte Test-Benachrichtigung
```
❌ Fehler beim Senden der Test-Benachrichtigung: Plex Server nicht erreichbar
```

## 🎯 Nächste Schritte

1. **Testen Sie den neuen UI-Button**
2. **Konfigurieren Sie Ihre bevorzugte Benachrichtigungszeit**
3. **Überwachen Sie die Logs für Optimierungen**
4. **Geben Sie Feedback für weitere Verbesserungen**

## 📞 Support

Bei Problemen oder Fragen:
- **GitHub Issues**: [Plugin Repository](https://github.com/chr-braun/homebridge-plex-daily-recommendations)
- **Homebridge Community**: [Homebridge Discord](https://discord.gg/homebridge)
- **Logs prüfen**: Homebridge UI → Logs → Filter: "Plex Daily Recommendations"
