#!/bin/bash
# Quick Start Script für Claude Code Development

echo "🚀 Claude Code Setup für Homebridge Plex Daily Recommendations"
echo "=============================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js nicht gefunden. Bitte installieren: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js Version: $(node -v)"
echo "✓ NPM Version: $(npm -v)"
echo ""

# Check if Claude Code is installed
if ! command -v claude-code &> /dev/null; then
    echo "📦 Installiere Claude Code..."
    npm install -g @anthropic-ai/claude-code
else
    echo "✓ Claude Code bereits installiert"
fi

echo ""
echo "📦 Installiere Dependencies..."
npm install

echo ""
echo "✅ Setup abgeschlossen!"
echo ""
echo "🎯 Nächste Schritte:"
echo "   1. Öffne das Projekt: claude-code ."
echo "   2. Beschreibe die Änderung, die du machen möchtest"
echo "   3. Claude Code wird den Code aktualisieren"
echo ""
echo "📋 Verfügbare Commands:"
echo "   npm test        - Tests ausführen"
echo "   npm run lint    - Code-Qualität prüfen"
echo "   npm run format  - Code formatieren"
echo "   npm run dev     - Development Mode"
echo "   npm start       - Homebridge starten"
echo ""
echo "📚 Dokumentation:"
echo "   - DEVELOPMENT.md         (Entwickler Guide)"
echo "   - README.md              (Plugin Guide)"
echo "   - HOMEBRIDGE-UI-SETUP.md (UI Setup)"
echo ""
