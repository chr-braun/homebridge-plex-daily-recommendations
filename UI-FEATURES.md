# 🎨 UI-Features Update

Das Plugin wurde mit einer vollständigen Homebridge UI-X Oberfläche ausgestattet!

## Was ist neu?

### ✨ Visuelle Konfiguration in Homebridge UI-X

Statt manuell die `config.json` zu bearbeiten, kannst du jetzt:

- 📝 Ein schönes Formular ausfüllen
- 🔒 Sensitive Daten (wie Tokens) sicher eingeben (Password-Feld)
- ✓ Eingaben validieren (z.B. Zeit im Format `HH:MM`)
- 💾 Mit einem Klick speichern
- 🔄 Homebridge wird automatisch neu gestartet

### 📋 Strukturiertes Formular

Das Formular ist in Bereiche eingeteilt:

1. **Allgemein**
   - Name des Accessories

2. **Plex Server Verbindung**
   - Plex Server URL
   - Plex API Token (verschlüsselt)
   - Plex Server Machine ID

3. **Benachrichtigungen**
   - Benachrichtigungszeit
   - Stunden zurückblicken

### 🛡️ Sicherheit

- Tokens werden als Passwort-Feld angezeigt (nicht sichtbar)
- Daten werden verschlüsselt in der config.json gespeichert
- Validierung auf Client- und Server-Seite

### 🚀 Benutzerfreundlichkeit

- **Intuitive Felder:** Klare Beschreibungen für jedes Feld
- **Hilfreiche Beispiele:** Zeigen, wie man Werte eingibt
- **Validierung:** Verhindert ungültige Eingaben
- **Fehlerbehandlung:** Aussagekräftige Fehlermeldungen

## Wie nutze ich es?

### 1. Plugin installieren

```bash
sudo npm install -g homebridge-plex-daily-recommendations
```

### 2. Homebridge UI-X öffnen

Gehe zu: `http://localhost:8581` (oder deine Homebridge URL)

### 3. Neues Accessory hinzufügen

1. Gehe zu **Accessories**
2. Klick auf **"+"** (Add Accessory)
3. Wähle **"Plex Daily Recommendations"**
4. Fülle das Formular aus
5. Klick **"Save"**

### 4. In der Home App

Nach dem Speichern siehst du das Accessory in der Home App und kannst Automationen einrichten!

## Formular-Details

### Name

Text-Eingabe für den Namen des Accessories

### Plex Server URL

- Validiert gegen `uri` Format
- Beispiel: `http://192.168.178.3:32400`
- Fehler, wenn ungültiges Format

### Plex API Token

- Password-Feld (Text wird nicht angezeigt)
- Wird sicher gespeichert
- Erforderlich

### Plex Server Machine ID

- Text-Eingabe
- Erforderlich
- Hexadecimal-Format (32-64 Zeichen)

### Benachrichtigungszeit

- Regex-validiert: `HH:MM` Format
- Erlaubt nur gültige Zeiten (00:00 - 23:59)
- Beispiel: `20:00`

### Stunden zurückblicken

- Zahleneingabe
- Bereich: 1-168
- Slider oder Direct Input
- Standard: 24

## Technische Details

Das UI-Schema wird automatisch von Homebridge UI-X erkannt und angezeigt:

```javascript
module.exports.schema = {
  type: 'object',
  properties: {
    name: { ... },
    plexUrl: { ... },
    plexToken: { ... },
    // ...
  },
  layout: [ ... ] // Definiert die Anordnung
}
```

## Kompatibilität

✅ Homebridge UI-X
✅ Homebridge UI
✅ Homebridge Config UI-X
✅ Manuelle config.json (funktioniert weiterhin)

## Migrieren von alter zu neuer Version

Falls du die alte Version ohne UI nutzt:

1. Installiere die neue Version
2. Öffne Homebridge UI-X
3. Dein bestehendes Accessory wird angezeigt
4. Du kannst es nun über die UI bearbeiten
5. Alte config.json-Einträge funktionieren weiterhin

## Feedback & Troubleshooting

Falls das Formular nicht angezeigt wird:

- Stelle sicher, dass Homebridge UI-X installiert ist
- Aktualisiere deine Homebridge Installation
- Starte Homebridge neu
- Überprüfe, ob die package.json `homebridge`-Feld hat

## Nächste Schritte

Siehe [HOMEBRIDGE-UI-SETUP.md](HOMEBRIDGE-UI-SETUP.md) für die komplette Schritt-für-Schritt Anleitung!
