# 🔧 Plex Plugin Development Environment

Lokale Entwicklungsumgebung für das Homebridge Plex Plugin mit detailliertem Debugging.

## 🚀 Schnellstart

### Option 1: Isolierter Test (Empfohlen)
```bash
# Teste das Plugin isoliert ohne Homebridge
node dev-test.js
```

### Option 2: Mit echtem Homebridge
```bash
# Starte Homebridge mit Debug-Plugin
./dev-start.sh
```

## 📁 Development Files

- `dev-test.js` - Isolierter Plugin-Test ohne Homebridge
- `dev-start.sh` - Startet Homebridge mit Debug-Plugin
- `dev-homebridge-config.json` - Homebridge-Konfiguration für Development
- `homebridge-plex-daily-recommendations-debug.js` - Debug-Version des Plugins

## 🔍 Debug Features

### Erweiterte Logs
- ✅ **Platform Constructor** - Zeigt wann die Platform erstellt wird
- ✅ **Config Validation** - Detaillierte Konfigurationsprüfung
- ✅ **Accessory Creation** - Schritt-für-Schritt Accessory-Erstellung
- ✅ **Service Setup** - HomeKit Service-Initialisierung
- ✅ **Cron Job** - Cron-Schedule und Ausführung
- ✅ **Plex API Calls** - Bibliotheken und Items abrufen

### Mock Environment
- ✅ **Mock Homebridge API** - Simuliert Homebridge ohne echte Installation
- ✅ **Mock Accessories** - Simuliert HomeKit Accessories
- ✅ **Mock Services** - Simuliert HomeKit Services
- ✅ **Mock Characteristics** - Simuliert HomeKit Characteristics

## 🧪 Test-Szenarien

### 1. Plugin Loading Test
```bash
node dev-test.js
```
**Was passiert:**
- Plugin wird geladen
- Platform wird registriert
- Platform wird instanziiert
- Accessory wird erstellt
- Services werden konfiguriert

### 2. Homebridge Integration Test
```bash
./dev-start.sh
```
**Was passiert:**
- Homebridge startet mit Debug-Plugin
- Plugin wird von Homebridge geladen
- Platform wird initialisiert
- Logs werden in Echtzeit angezeigt

## 🔧 Debug-Konfiguration

### Plex-Daten (bereits konfiguriert)
```json
{
  "plexUrl": "http://192.168.178.3:32400",
  "plexToken": "UGRWDb8BscxhByiEVL5S",
  "machineId": "72608c6d7f50411587ca59f8a91cc5fe19e5bc78"
}
```

### Debug-Logs aktivieren
Das Debug-Plugin erzeugt automatisch detaillierte Logs:
- `🔧 DEBUG:` - Debug-Informationen
- `[INFO]` - Standard Plugin-Logs
- `[ERROR]` - Fehler-Logs
- `[WARN]` - Warnungen

## 🐛 Troubleshooting

### Problem: Keine Logs
**Lösung:** Verwende das Debug-Plugin:
```bash
# Ersetze das normale Plugin mit der Debug-Version
cp homebridge-plex-daily-recommendations-debug.js homebridge-plex-daily-recommendations.js
```

### Problem: Platform wird nicht geladen
**Lösung:** Prüfe die Konfiguration:
```bash
# Validiere JSON-Syntax
cat dev-homebridge-config.json | jq .
```

### Problem: Plex-Verbindung
**Lösung:** Teste Plex-API direkt:
```bash
curl "http://192.168.178.3:32400/library/sections?X-Plex-Token=UGRWDb8BscxhByiEVL5S"
```

## 📋 Development Workflow

1. **Ändere Code** in `homebridge-plex-daily-recommendations.js`
2. **Teste isoliert** mit `node dev-test.js`
3. **Teste mit Homebridge** mit `./dev-start.sh`
4. **Debug Probleme** mit Debug-Logs
5. **Veröffentliche** mit `npm publish`

## 🎯 Erwartete Logs

### Bei erfolgreichem Start:
```
🔧 DEBUG: Plugin wird geladen...
🔧 DEBUG: Module.exports aufgerufen
🔧 DEBUG: Registriere Platform: homebridge-plex-daily-recommendations PlexDailyRecommendations
🔧 DEBUG: Platform registriert
🔧 DEBUG: Platform Constructor aufgerufen
[INFO] 🔧 DEBUG: Plex Daily Recommendations Platform wird initialisiert...
🔧 DEBUG: didFinishLaunching Event empfangen
[INFO] Homebridge fertig geladen, erstelle Accessory...
🔧 DEBUG: discoverDevices aufgerufen
[INFO] Erstelle neues Accessory: Plex Empfehlungen
🔧 DEBUG: PlexSensorAccessory Constructor aufgerufen
[INFO] ✓ Konfiguration erfolgreich validiert
```

### Bei Problemen:
- Prüfe ob alle Plex-Daten korrekt sind
- Prüfe ob Homebridge die Platform findet
- Prüfe ob die Konfiguration valide ist
- Prüfe ob Plex-Server erreichbar ist

## 🚀 Nächste Schritte

1. **Führe `node dev-test.js` aus** um das Plugin zu testen
2. **Führe `./dev-start.sh` aus** um mit Homebridge zu testen
3. **Überwache die Logs** für Debug-Informationen
4. **Behebe gefundene Probleme** basierend auf den Logs
5. **Veröffentliche die finale Version** wenn alles funktioniert

