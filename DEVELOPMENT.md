# 🚀 Development Setup für Claude Code

Dieses Projekt ist vollständig für die Entwicklung mit Claude Code vorbereitet!

## 📁 Projektstruktur

```
homebridge-plex-daily-recommendations/
├── homebridge-plex-daily-recommendations.js  # Hauptplugin
├── test.js                                    # Test-Suite
├── package.json                               # Dependencies & Scripts
├── .eslintrc.json                             # Linting-Konfiguration
├── .prettierrc                                # Code-Formatting
├── .gitignore                                 # Git-Ignore Regeln
├── README.md                                  # Dokumentation
├── HOMEBRIDGE-UI-SETUP.md                    # UI-Setup Guide
├── UI-FEATURES.md                            # UI-Features
└── config-example.json                        # Beispiel-Konfiguration
```

## 🎯 Claude Code Workflow

### 1. Projekt öffnen

```bash
# Installation (falls noch nicht gemacht)
npm install -g @anthropic-ai/claude-code

# Projekt mit Claude Code öffnen
cd /mnt/user-data/outputs
claude-code .
```

### 2. Verfügbare Befehle

```bash
# Tests ausführen
npm test

# Linting (Syntax prüfen)
npm run lint

# Code automatisch formatieren
npm run format

# Development Mode (mit Auto-Reload)
npm run dev

# Homebridge starten
npm start
```

## ✨ Features der Development-Umgebung

### ESLint

- **Was:** Prüft Code auf Fehler und Style-Richtlinien
- **Config:** `.eslintrc.json`
- **Befehl:** `npm run lint`
- **Auto-Fix:** `npx eslint . --fix`

### Prettier

- **Was:** Formatiert Code automatisch
- **Config:** `.prettierrc`
- **Befehl:** `npm run format`
- **Feature:** Konsistentes Code-Format über das ganze Projekt

### Mocha Tests

- **Was:** Test-Framework für Unit-Tests
- **Tests:** `test.js`
- **Befehl:** `npm test`
- **Coverage:** Überprüft Config-Validierung, Cron-Planung, Content-Filtering

### Nodemon

- **Was:** Auto-Reload bei Datei-Änderungen
- **Befehl:** `npm run dev`
- **Feature:** Entwicklung ohne manuellen Neustart

## 🔧 Entwicklungs-Workflow mit Claude Code

### Schritt 1: Projekt laden

```bash
claude-code .
```

Claude öffnet das Projekt mit vollständigem Context.

### Schritt 2: Features beschreiben

Sag Claude Code, was du ändern möchtest:

```
"Füge eine neue Feature hinzu, die nur Horror-Filme filtert"
"Optimiere die XML-Parsing Performance"
"Füge E-Mail-Benachrichtigungen hinzu"
"Refaktoriere die getNewContent Funktion"
```

### Schritt 3: Claude entwickelt

Claude Code wird:

- Code modifizieren/erweitern
- Tests entsprechend anpassen
- Dokumentation aktualisieren
- Linting durchführen

### Schritt 4: Lokal testen

```bash
# Tests laufen lassen
npm test

# Code formatieren
npm run format

# In Homebridge testen
npm start
```

## 📝 Code-Struktur verstehen

### Plugin-Klasse: `PlexDailyRecommendations`

```javascript
// Initialisierung
constructor(log, config, api) {
  // Setup & Cron-Job
}

// Tägliche Benachrichtigung
async sendDailyNotification() { }

// Neue Inhalte abrufen
async getNewContent() { }

// Bibliotheken laden
async getLibraries() { }

// Items aus Bibliothek laden
async getLibraryItems(libraryKey) { }

// HomeKit Service
getServices() { }
```

### UI-Schema

```javascript
module.exports.schema = {
  type: 'object',
  properties: {
    name: { ... },
    plexUrl: { ... },
    plexToken: { ... },
    machineId: { ... },
    notificationTime: { ... },
    hoursBack: { ... }
  },
  layout: [ ... ]
}
```

## 🐛 Debugging mit Claude Code

### 1. Console Logs verwenden

```javascript
this.log("Debug Info:", variable);
```

### 2. Tests schreiben

```javascript
describe("Feature", () => {
  it("should do something", () => {
    assert.ok(result);
  });
});
```

### 3. Mit Homebridge Debug-Mode

```bash
homebridge -D
```

## 📚 Weitere Entwicklungs-Tipps

### Dependencies hinzufügen

```bash
npm install package-name
npm install --save-dev dev-package
```

### Neue Features dokumentieren

- Aktualisiere `README.md`
- Füge Tests in `test.js` hinzu
- Update `UI-FEATURES.md` falls UI betroffen

### Code-Stil beibehalten

```bash
# Vor jedem Commit
npm run format
npm run lint
npm test
```

### Git Setup (optional)

```bash
git init
git add .
git commit -m "Initial commit"
```

## 🚀 Häufige Entwicklungs-Szenarien

### Neue Feature hinzufügen

1. Feature beschreiben gegenüber Claude Code
2. `npm test` ausführen
3. Tests ggf. anpassen
4. `npm run format` + `npm run lint`
5. In Homebridge testen: `npm start`

### Bug fix

1. Bug reproduzieren & Test schreiben
2. Fix mit Claude Code entwickeln
3. `npm test` - Test sollte jetzt grün sein
4. Formatieren & Linting

### Refaktorierung

1. Claude Code auffordern zu refaktorieren
2. Tests sollten weiterhin grün sein
3. Vergleichen: alte vs. neue Performance

## ⚙️ VSCode Integration (optional)

Falls du VSCode nutzt, können diese Extensions helfen:

- **ESLint**: Inline Fehler anzeigen
- **Prettier**: Code-Formatting beim Speichern
- **Mocha Test Explorer**: Tests in UI ausführen

## 📞 Hilfe & Support

Falls Claude Code Fragen hat:

- **Plugin-Fragen?** Siehe `README.md`
- **UI-Fragen?** Siehe `HOMEBRIDGE-UI-SETUP.md`
- **Test-Fragen?** Siehe `test.js`
- **Homebridge-API?** Siehe Code-Comments

---

**Ready?** Starte mit:

```bash
claude-code .
```

Viel Spaß beim Entwickeln! 🎉
