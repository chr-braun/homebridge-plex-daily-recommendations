# 📧 E-Mail-Benachrichtigungen Setup - Plex Daily Recommendations

## Übersicht

Das Plugin unterstützt jetzt **E-Mail-Benachrichtigungen** für neue Plex-Inhalte! Du erhältst schöne HTML-E-Mails mit allen Details zu neuen Filmen und Serien.

## 🆕 Neue Features

### 1. E-Mail-Benachrichtigungen
- **HTML-E-Mails** mit schöner Formatierung
- **Detaillierte Informationen** zu jedem neuen Inhalt
- **Direkte Plex-Links** zum Öffnen in der Plex-App
- **Automatische Benachrichtigungen** zur konfigurierten Zeit

### 2. E-Mail-Konfiguration
- **SMTP-Server** Unterstützung (Gmail, Outlook, etc.)
- **SSL/TLS** Verschlüsselung
- **App-Passwörter** für Gmail
- **Test-Funktionen** für E-Mail-Konfiguration

## 🚀 Setup & Konfiguration

### Schritt 1: E-Mail-Provider konfigurieren

#### Gmail Setup:
1. **App-Passwort erstellen**:
   - Gehe zu [Google Account Settings](https://myaccount.google.com/)
   - Sicherheit → 2-Schritt-Verifizierung → App-Passwörter
   - Erstelle ein neues App-Passwort für "Homebridge"

2. **SMTP-Einstellungen**:
   - **Server**: `smtp.gmail.com`
   - **Port**: `587`
   - **Sicherheit**: TLS (nicht SSL)
   - **Benutzername**: Deine Gmail-Adresse
   - **Passwort**: Das App-Passwort (nicht dein normales Passwort!)

#### Outlook Setup:
1. **SMTP-Einstellungen**:
   - **Server**: `smtp-mail.outlook.com`
   - **Port**: `587`
   - **Sicherheit**: TLS

#### Andere Provider:
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **iCloud**: `smtp.mail.me.com:587`
- **Custom Server**: Verwende deine eigenen SMTP-Einstellungen

### Schritt 2: Plugin konfigurieren

1. **Homebridge UI öffnen**
2. **Plugins** → **Plex Daily Recommendations**
3. **Konfiguration** → **E-Mail-Benachrichtigungen** erweitern
4. **E-Mail-Benachrichtigungen aktivieren**: ✅
5. **SMTP-Einstellungen ausfüllen**:
   - **SMTP Server**: z.B. `smtp.gmail.com`
   - **SMTP Port**: z.B. `587`
   - **SMTP Secure (SSL)**: ❌ (für TLS)
   - **E-Mail Benutzername**: Deine E-Mail-Adresse
   - **E-Mail Passwort**: App-Passwort
   - **Absender E-Mail**: Deine E-Mail-Adresse
   - **Empfänger E-Mail**: Empfänger-E-Mail-Adresse

### Schritt 3: Test durchführen

1. **Test-E-Mail-Button** in der Konfiguration klicken
2. **E-Mail-Postfach prüfen**
3. **Logs überwachen** für Erfolg/Fehler-Meldungen

## 🧪 Test-Funktionen

### 1. Test-E-Mail-Button
- **Ort**: Plugin-Konfiguration → Test-Funktionen
- **Funktion**: Sendet eine Test-E-Mail mit Beispieldaten
- **Verwendung**: Klick auf "Test-E-Mail" Button

### 2. Test-Script
```bash
# E-Mail-Funktionalität testen
node test-email.js
```

### 3. Home App Test-Switch
- **Ort**: Home App → "Test Benachrichtigung" Switch
- **Funktion**: Sendet sowohl HomeKit- als auch E-Mail-Benachrichtigungen

## 📧 E-Mail-Format

### HTML-E-Mail mit:
- **Schöne Formatierung** mit CSS-Styling
- **Detaillierte Informationen** zu jedem Inhalt:
  - Titel und Typ (Film/Serie)
  - Hinzugefügt-Datum und -Zeit
  - Jahr, Bewertung, Dauer
  - Genre und Zusammenfassung
  - Direkter Plex-Link
- **Responsive Design** für alle Geräte
- **Automatische Footer** mit Plugin-Informationen

### Beispiel-E-Mail:
```
🎬 Plex Daily Recommendations
Es wurden 3 neue Inhalte auf deinem Plex Server gefunden!

1. The Matrix (Film)
   Hinzugefügt: 23.10.2024 um 20:30
   Jahr: 1999
   Bewertung: 8.7/10
   Dauer: 136 Minuten
   Genre: Action, Sci-Fi
   Zusammenfassung: Ein Computer-Hacker erfährt...
   🔗 In Plex öffnen
```

## 🔧 Troubleshooting

### Problem: E-Mail wird nicht gesendet
**Lösung**:
1. **App-Passwort verwenden** (nicht normales Passwort)
2. **2-Faktor-Authentifizierung aktivieren**
3. **SMTP-Einstellungen prüfen**
4. **Firewall/Port-Blockierung prüfen**

### Problem: "Authentication failed"
**Lösung**:
1. **App-Passwort generieren** für Gmail
2. **Benutzername korrekt** (vollständige E-Mail-Adresse)
3. **Passwort korrekt** (App-Passwort, nicht normales Passwort)

### Problem: "Connection timeout"
**Lösung**:
1. **SMTP-Server prüfen**
2. **Port prüfen** (587 für TLS, 465 für SSL)
3. **Netzwerk-Verbindung prüfen**
4. **Firewall-Einstellungen prüfen**

### Problem: E-Mail kommt im Spam an
**Lösung**:
1. **Absender-Adresse** zu Kontakten hinzufügen
2. **Spam-Filter** anpassen
3. **DKIM/SPF** für eigene Domain konfigurieren

## 📋 Verfügbare Benachrichtigungs-Methoden

### 1. E-Mail-Benachrichtigungen (NEU)
- **Vorteil**: Detaillierte HTML-E-Mails
- **Verwendung**: Automatisch zur konfigurierten Zeit
- **Test**: Test-E-Mail-Button in der Konfiguration

### 2. HomeKit-Benachrichtigungen
- **Vorteil**: Push-Benachrichtigungen auf iOS/macOS
- **Verwendung**: "Test Benachrichtigung" Switch in der Home App
- **Test**: Switch aktivieren

### 3. Kombinierte Benachrichtigungen
- **Vorteil**: Sowohl E-Mail als auch HomeKit
- **Verwendung**: Beide Methoden gleichzeitig aktivieren
- **Test**: Test-Switch in der Home App

## 🎯 Nächste Schritte

1. **E-Mail-Provider konfigurieren** (Gmail, Outlook, etc.)
2. **Plugin-Einstellungen** in der Homebridge UI anpassen
3. **Test-E-Mail senden** und Einstellungen prüfen
4. **Benachrichtigungszeit** konfigurieren
5. **E-Mail-Postfach** überwachen

## 📞 Support

Bei Problemen oder Fragen:
- **GitHub Issues**: [Plugin Repository](https://github.com/chr-braun/homebridge-plex-daily-recommendations)
- **Homebridge Community**: [Homebridge Discord](https://discord.gg/homebridge)
- **Logs prüfen**: Homebridge UI → Logs → Filter: "Plex Daily Recommendations"
- **E-Mail-Test**: `node test-email.js` ausführen
