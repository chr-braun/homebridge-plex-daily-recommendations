#!/usr/bin/env node

/**
 * Test-Script für E-Mail-Funktionalität
 * Testet die E-Mail-Benachrichtigungen des Plugins
 */

const nodemailer = require("nodemailer");

console.log("📧 Teste E-Mail-Funktionalität...\n");

// Test-Konfiguration (ersetze mit deinen Werten)
const testConfig = {
  emailSmtpHost: "smtp.gmail.com",
  emailSmtpPort: 587,
  emailSmtpSecure: false,
  emailUser: "your-email@gmail.com",
  emailPassword: "your-app-password",
  emailFrom: "your-email@gmail.com",
  emailTo: "recipient@example.com"
};

async function testEmailConnection() {
  console.log("1️⃣ Teste E-Mail-Verbindung...");
  
  try {
    const transporter = nodemailer.createTransporter({
      host: testConfig.emailSmtpHost,
      port: testConfig.emailSmtpPort,
      secure: testConfig.emailSmtpSecure,
      auth: {
        user: testConfig.emailUser,
        pass: testConfig.emailPassword,
      },
    });

    // Verbindung testen
    await transporter.verify();
    console.log("✅ E-Mail-Verbindung erfolgreich");
    return true;
  } catch (error) {
    console.log("❌ E-Mail-Verbindung fehlgeschlagen:", error.message);
    return false;
  }
}

async function testEmailSending() {
  console.log("\n2️⃣ Teste E-Mail-Versand...");
  
  try {
    const transporter = nodemailer.createTransporter({
      host: testConfig.emailSmtpHost,
      port: testConfig.emailSmtpPort,
      secure: testConfig.emailSmtpSecure,
      auth: {
        user: testConfig.emailUser,
        pass: testConfig.emailPassword,
      },
    });

    // Test-E-Mail erstellen
    const testContent = [{
      title: "Test Film",
      type: "Film",
      addedAt: Math.floor(Date.now() / 1000),
      year: "2024",
      rating: "8.5",
      duration: 7200000, // 120 Minuten
      genre: "Action, Drama",
      summary: "Dies ist ein Test-Film für die E-Mail-Benachrichtigung.",
      plexUrl: "plex://movie/test"
    }];

    const subject = `🎬 Plex Daily Recommendations - ${testContent.length} neue Inhalte gefunden!`;
    
    let htmlContent = `
      <h2>🎬 Plex Daily Recommendations</h2>
      <p>Es wurden <strong>${testContent.length}</strong> neue Inhalte auf deinem Plex Server gefunden!</p>
      <hr>
    `;

    testContent.forEach((item, index) => {
      const addedDate = new Date(item.addedAt * 1000).toLocaleDateString("de-DE");
      const addedTime = new Date(item.addedAt * 1000).toLocaleTimeString("de-DE");
      
      htmlContent += `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
          <h3>${index + 1}. ${item.title} (${item.type})</h3>
          <p><strong>Hinzugefügt:</strong> ${addedDate} um ${addedTime}</p>
      `;
      
      if (item.year) {
        htmlContent += `<p><strong>Jahr:</strong> ${item.year}</p>`;
      }
      if (item.rating) {
        htmlContent += `<p><strong>Bewertung:</strong> ${item.rating}/10</p>`;
      }
      if (item.duration) {
        const minutes = Math.floor(item.duration / 60000);
        htmlContent += `<p><strong>Dauer:</strong> ${minutes} Minuten</p>`;
      }
      if (item.genre) {
        htmlContent += `<p><strong>Genre:</strong> ${item.genre}</p>`;
      }
      if (item.summary) {
        htmlContent += `<p><strong>Zusammenfassung:</strong> ${item.summary}</p>`;
      }
      if (item.plexUrl) {
        htmlContent += `<p><a href="${item.plexUrl}" style="color: #007bff; text-decoration: none;">🔗 In Plex öffnen</a></p>`;
      }
      
      htmlContent += `</div>`;
    });

    htmlContent += `
      <hr>
      <p><small>Diese E-Mail wurde automatisch von deinem Homebridge Plex Daily Recommendations Plugin gesendet.</small></p>
    `;

    // E-Mail senden
    const mailOptions = {
      from: testConfig.emailFrom,
      to: testConfig.emailTo,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Test-E-Mail erfolgreich gesendet:", info.messageId);
    return true;
    
  } catch (error) {
    console.log("❌ E-Mail-Versand fehlgeschlagen:", error.message);
    return false;
  }
}

async function runTests() {
  console.log("⚠️  WICHTIG: Bitte konfiguriere die E-Mail-Einstellungen in diesem Script!");
  console.log("📧 Aktuelle Konfiguration:");
  console.log(`   SMTP Server: ${testConfig.emailSmtpHost}:${testConfig.emailSmtpPort}`);
  console.log(`   Benutzer: ${testConfig.emailUser}`);
  console.log(`   Empfänger: ${testConfig.emailTo}`);
  console.log("\n🔧 Um den Test zu verwenden:");
  console.log("1. Bearbeite die testConfig-Variablen in diesem Script");
  console.log("2. Verwende ein App-Passwort für Gmail");
  console.log("3. Führe das Script erneut aus\n");

  const connectionOk = await testEmailConnection();
  if (connectionOk) {
    await testEmailSending();
  }

  console.log("\n🎉 E-Mail-Test abgeschlossen!");
  console.log("\n📋 Nächste Schritte:");
  console.log("1. Konfiguriere E-Mail-Einstellungen in der Homebridge UI");
  console.log("2. Aktiviere E-Mail-Benachrichtigungen");
  console.log("3. Teste über den Test-E-Mail-Button");
  console.log("4. Prüfe dein E-Mail-Postfach");
}

runTests().catch(console.error);
