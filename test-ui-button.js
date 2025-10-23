#!/usr/bin/env node

/**
 * Test-Script für UI Button-Funktionalität
 * Testet die neue Homebridge UI Button-Integration
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Teste UI Button-Funktionalität...\n');

// Test 1: Prüfe ob Config Schema korrekt ist
console.log('1️⃣ Teste Config Schema...');
try {
  const configSchema = JSON.parse(fs.readFileSync('config.schema.json', 'utf8'));
  
  // Prüfe ob testNotification Button im Schema definiert ist
  const hasTestButton = configSchema.form && configSchema.form.some(item => 
    item.key === 'testNotification' && item.type === 'button'
  );
  
  if (hasTestButton) {
    console.log('✅ Config Schema: Test-Button korrekt definiert');
  } else {
    console.log('❌ Config Schema: Test-Button nicht gefunden');
  }
  
  // Prüfe ob customUi aktiviert ist
  if (configSchema.customUi === true) {
    console.log('✅ Config Schema: customUi aktiviert');
  } else {
    console.log('⚠️ Config Schema: customUi nicht aktiviert');
  }
  
} catch (error) {
  console.log('❌ Config Schema: Fehler beim Laden:', error.message);
}

// Test 2: Prüfe Plugin-Code
console.log('\n2️⃣ Teste Plugin-Code...');
try {
  const pluginCode = fs.readFileSync('homebridge-plex-daily-recommendations.js', 'utf8');
  
  // Prüfe ob UI-Handler-Methoden vorhanden sind
  const hasUiButton = pluginCode.includes('uiButton');
  const hasUiEvent = pluginCode.includes('uiEvent');
  const hasTestNotification = pluginCode.includes('testNotification');
  
  if (hasUiButton) {
    console.log('✅ Plugin-Code: uiButton-Methode vorhanden');
  } else {
    console.log('❌ Plugin-Code: uiButton-Methode fehlt');
  }
  
  if (hasUiEvent) {
    console.log('✅ Plugin-Code: uiEvent-Methode vorhanden');
  } else {
    console.log('❌ Plugin-Code: uiEvent-Methode fehlt');
  }
  
  if (hasTestNotification) {
    console.log('✅ Plugin-Code: testNotification-Methode vorhanden');
  } else {
    console.log('❌ Plugin-Code: testNotification-Methode fehlt');
  }
  
} catch (error) {
  console.log('❌ Plugin-Code: Fehler beim Laden:', error.message);
}

// Test 3: Prüfe Package.json
console.log('\n3️⃣ Teste Package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.homebridge && packageJson.homebridge.customUi === true) {
    console.log('✅ Package.json: customUi aktiviert');
  } else {
    console.log('❌ Package.json: customUi nicht aktiviert');
  }
  
} catch (error) {
  console.log('❌ Package.json: Fehler beim Laden:', error.message);
}

console.log('\n🎉 UI Button-Test abgeschlossen!');
console.log('\n📋 Nächste Schritte:');
console.log('1. Starte Homebridge neu');
console.log('2. Gehe zur Plugin-Konfiguration in der Homebridge UI');
console.log('3. Klicke auf den "Test starten" Button');
console.log('4. Prüfe die Logs auf Erfolg/Fehler-Meldungen');
