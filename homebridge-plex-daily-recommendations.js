// eslint-disable-next-line no-unused-vars
let Service, Characteristic;
const axios = require("axios");
const cron = require("node-cron");
const { XMLParser } = require("fast-xml-parser");
const nodemailer = require("nodemailer");

const PLUGIN_NAME = "homebridge-plex-daily-recommendations";
const PLATFORM_NAME = "PlexDailyRecommendations";

console.log("🎬 Plex Daily Recommendations Plugin v0.1.0 wird geladen...");

/**
 * Platform-Klasse für Homebridge
 * Diese wird von Homebridge beim Start instanziiert
 */
class PlexDailyRecommendationsPlatform {
  constructor(log, config, api) {
    console.log("🔧 DEBUG: Platform Constructor aufgerufen");
    console.log("🔧 DEBUG: Config:", JSON.stringify(config, null, 2));
    
    this.log = log;
    this.config = config;
    this.api = api;
    this.accessories = [];
    this.sensorInstances = []; // Speichere Instanzen für Cleanup

    this.log.info("🎬 Plex Daily Recommendations Platform wird initialisiert...");
    this.log.info(`📋 Konfiguration: ${config.name}`);
    this.log.info(`🌐 Plex Server: ${config.plexUrl}`);
    this.log.info(`🔑 Plex Token: ${config.plexToken ? "✅ Konfiguriert" : "❌ Fehlt"}`);
    this.log.info(`🆔 Machine ID: ${config.machineId ? "✅ Konfiguriert" : "❌ Fehlt"}`);

    // Warte bis Homebridge fertig ist mit laden
    this.api.on("didFinishLaunching", () => {
    this.log.info("🚀 Homebridge ist bereit - erstelle Accessories...");
      this.discoverDevices();
    });

    this.log.info("✅ Platform erfolgreich initialisiert");
  }

  // Cleanup-Methode für die Platform
  // Wird von Homebridge aufgerufen, wenn das Plugin entladen wird
  shutdown() {
    this.log.info("🔧 DEBUG: Plex Daily Recommendations Platform wird beendet...");
    this.sensorInstances.forEach(sensor => sensor.destroy());
    this.sensorInstances = [];
  }

  /**
   * Wird von Homebridge aufgerufen um gecachte Accessories wiederherzustellen
   */
  configureAccessory(accessory) {
    this.log.info("🔧 DEBUG: configureAccessory aufgerufen");
    this.log.info("Lade gecachtes Accessory:", accessory.displayName);
    this.accessories.push(accessory);
    
    // Stelle das PlexSensorAccessory wieder her, aber nur einmal
    if (!accessory.context.plexSensorConfigured) {
      this.log.info("🔧 DEBUG: Erstelle PlexSensorAccessory für gecachtes Accessory");
      const sensor = new PlexSensorAccessory(this, accessory, this.config);
      this.sensorInstances.push(sensor);
      accessory.context.plexSensorConfigured = true;
    }
  }

  /**
   * Erstellt oder aktualisiert das Plex Sensor Accessory
   */
  discoverDevices() {
    this.log.info("🔍 Suche nach Plex Sensor Accessory...");
    
    const uuid = this.api.hap.uuid.generate(
      "plex-daily-recommendations-sensor",
    );
    
    const existingAccessory = this.accessories.find((acc) => acc.UUID === uuid);

    if (existingAccessory) {
      // Accessory existiert bereits, prüfe ob es bereits konfiguriert ist
      this.log.info(`♻️ Verwende existierendes Accessory: ${existingAccessory.displayName}`);
      
      // Prüfe ob das Accessory bereits ein PlexSensorAccessory hat
      if (!existingAccessory.context.plexSensorConfigured) {
        this.log.info("🔧 Konfiguriere PlexSensorAccessory...");
        const sensor = new PlexSensorAccessory(this, existingAccessory, this.config);
        this.sensorInstances.push(sensor);
        existingAccessory.context.plexSensorConfigured = true;
      }
    } else {
      // Erstelle neues Accessory
      this.log.info("🆕 Erstelle neues Plex Sensor Accessory...");
      const accessory = new this.api.platformAccessory(
        "Plex Empfehlungen",
        uuid,
      );

      this.log.info("⚙️ Konfiguriere PlexSensorAccessory...");
      const sensor = new PlexSensorAccessory(this, accessory, this.config);
      this.sensorInstances.push(sensor);
      accessory.context.plexSensorConfigured = true;
      
      this.log.info("📝 Registriere Platform Accessories...");
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        accessory,
      ]);

      // Erstelle separaten Test-Switch als eigenes Accessory
      this.createTestSwitchAccessory();
    }
    
    this.log.info("🔧 DEBUG: discoverDevices abgeschlossen");
  }

  /**
   * Handler für UI Button-Klicks
   * Wird von der Homebridge UI aufgerufen, wenn der Test-Button gedrückt wird
   */
  async testNotification() {
    this.log.info("🧪 Test-Benachrichtigung über Homebridge UI Button ausgelöst...");
    
    // Finde das erste PlexSensorAccessory und führe Test durch
    const sensorInstance = this.sensorInstances.find(instance => 
      instance.constructor.name === "PlexSensorAccessory"
    );
    
    if (sensorInstance) {
      try {
        await sensorInstance.sendDailyNotification();
        this.log.info("✅ Test-Benachrichtigung erfolgreich gesendet");
        return { success: true, message: "Test-Benachrichtigung erfolgreich gesendet" };
      } catch (error) {
        this.log.error(`❌ Fehler beim Senden der Test-Benachrichtigung: ${error.message}`);
        return { success: false, message: `Fehler: ${error.message}` };
      }
    } else {
      this.log.error("❌ Kein PlexSensorAccessory gefunden");
      return { success: false, message: "Kein PlexSensorAccessory gefunden" };
    }
  }

  /**
   * Sendet Test-E-Mail-Benachrichtigung
   */
  async testEmailNotification() {
    this.log.info("📧 Test-E-Mail-Benachrichtigung wird gesendet...");
    
    // Finde das erste PlexSensorAccessory und führe E-Mail-Test durch
    const sensorInstance = this.sensorInstances.find(instance => 
      instance.constructor.name === "PlexSensorAccessory"
    );
    
    if (sensorInstance) {
      try {
        // Erstelle Test-Inhalt
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
        
        await sensorInstance.sendEmailNotification(testContent);
        this.log.info("✅ Test-E-Mail erfolgreich gesendet");
        return { success: true, message: "Test-E-Mail erfolgreich gesendet" };
      } catch (error) {
        this.log.error(`❌ Fehler beim Senden der Test-E-Mail: ${error.message}`);
        return { success: false, message: `Fehler: ${error.message}` };
      }
    } else {
      this.log.error("❌ Kein PlexSensorAccessory gefunden");
      return { success: false, message: "Kein PlexSensorAccessory gefunden" };
    }
  }

  /**
   * UI Event Handler - wird von der Homebridge UI aufgerufen
   */
  async uiEvent(event) {
    this.log.info(`🔧 DEBUG: UI Event empfangen: ${event.type}`);
    
    switch (event.type) {
      case "testNotification":
        return await this.testNotification();
      case "testEmail":
        return await this.testEmailNotification();
      default:
        this.log.warn(`Unbekanntes UI Event: ${event.type}`);
        return { success: false, message: `Unbekanntes Event: ${event.type}` };
    }
  }

  /**
   * UI Button Handler - wird von der Homebridge UI aufgerufen
   */
  async uiButton(button) {
    this.log.info(`🔧 DEBUG: UI Button gedrückt: ${button.key}`);
    
    switch (button.key) {
      case "testNotification":
        return await this.testNotification();
      case "testEmail":
        return await this.testEmailNotification();
      default:
        this.log.warn(`Unbekannter UI Button: ${button.key}`);
        return { success: false, message: `Unbekannter Button: ${button.key}` };
    }
  }

  /**
   * Homebridge UI API Handler - für Test-Funktionalität
   */
  async testNotificationAPI() {
    this.log.info("🧪 Test-Benachrichtigung über Homebridge UI API ausgelöst...");
    return await this.testNotification();
  }

  /**
   * Erstellt einen separaten Test-Switch als eigenes Accessory
   */
  createTestSwitchAccessory() {
    this.log.info("🔧 DEBUG: Erstelle separaten Test-Switch Accessory");
    
    const testSwitchUuid = this.api.hap.uuid.generate("plex-test-switch");
    const existingTestSwitch = this.accessories.find((acc) => acc.UUID === testSwitchUuid);

    if (existingTestSwitch) {
      this.log.info("🔧 DEBUG: Test-Switch Accessory existiert bereits");
      return;
    }

    // Erstelle neues Test-Switch Accessory
    const testSwitchAccessory = new this.api.platformAccessory(
      "Plex Test Switch",
      testSwitchUuid,
    );

    // Accessory Information Service
    testSwitchAccessory
      .getService(this.api.hap.Service.AccessoryInformation)
      .setCharacteristic(this.api.hap.Characteristic.Manufacturer, "Plex Daily Recommendations")
      .setCharacteristic(this.api.hap.Characteristic.Model, "Test Switch")
      .setCharacteristic(this.api.hap.Characteristic.SerialNumber, "TEST-001");

    // Switch Service
    const switchService = testSwitchAccessory.addService(
      this.api.hap.Service.Switch,
      "Test Benachrichtigung",
      "test-switch"
    );

    switchService
      .getCharacteristic(this.api.hap.Characteristic.On)
      .onGet(() => false) // Immer aus
      .onSet(async (value) => {
        if (value) {
          this.log.info("🧪 Test-Benachrichtigung über separaten Switch ausgelöst...");
          this.log.info("🔧 DEBUG: Starte manuelle Benachrichtigung...");
          await this.sendDailyNotification();
          // Schalte Switch automatisch wieder aus
          setTimeout(() => {
            switchService.updateCharacteristic(this.api.hap.Characteristic.On, false);
            this.log.info("✅ Test-Benachrichtigung abgeschlossen - Switch zurückgesetzt");
          }, 2000);
        }
      });

    // Registriere den Test-Switch
    this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
      testSwitchAccessory,
    ]);

    this.accessories.push(testSwitchAccessory);
    this.log.info("✅ Test-Switch Accessory erstellt und registriert");
  }
}

/**
 * Accessory-Klasse für den Plex Sensor
 * Enthält die eigentliche Logik
 */
class PlexSensorAccessory {
  constructor(platform, accessory, config) {
    console.log("🔧 DEBUG: PlexSensorAccessory Constructor aufgerufen");
    
    // WICHTIG: Speichere NICHT die gesamte platform (circular reference!)
    // Speichere nur die benötigten Referenzen
    this.accessory = accessory;
    this.log = platform.log;
    this.config = config;
    // Speichere API-Referenzen separat, nicht die gesamte API
    this.Service = platform.api.hap.Service;
    this.Characteristic = platform.api.hap.Characteristic;

    this.log.info("🎬 PlexSensorAccessory wird initialisiert...");

    // Konfiguration
    this.name = config.name || "Plex Recommendations";
    this.plexUrl = config.plexUrl || "http://192.168.178.3:32400";
    this.plexToken = config.plexToken;
    this.machineId = config.machineId;
    this.notificationTime = config.notificationTime || "20:00"; // HH:MM Format
    this.hoursBack = config.hoursBack || 24; // Wie viele Stunden zurück nach neuen Inhalten suchen
    
    // E-Mail-Konfiguration
    this.emailEnabled = config.emailEnabled || false;
    this.emailSmtpHost = config.emailSmtpHost;
    this.emailSmtpPort = config.emailSmtpPort || 587;
    this.emailSmtpSecure = config.emailSmtpSecure || false;
    this.emailUser = config.emailUser;
    this.emailPassword = config.emailPassword;
    this.emailFrom = config.emailFrom;
    this.emailTo = config.emailTo;

    this.log.info(`📋 Name: ${this.name}`);
    this.log.info(`🌐 Plex URL: ${this.plexUrl}`);
    this.log.info(`⏰ Benachrichtigungszeit: ${this.notificationTime}`);
    this.log.info(`🕐 Zeitraum: ${this.hoursBack} Stunden zurück`);
    this.log.info(`📧 E-Mail-Benachrichtigungen: ${this.emailEnabled ? "✅ Aktiviert" : "❌ Deaktiviert"}`);
    if (this.emailEnabled) {
      this.log.info(`📧 E-Mail Empfänger: ${this.emailTo}`);
      this.log.info(`📧 SMTP Server: ${this.emailSmtpHost}:${this.emailSmtpPort}`);
    }

    // XML Parser initialisieren
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });

    // Cache für Bibliotheken (60 Minuten)
    this.libraryCache = {
      data: null,
      timestamp: 0,
      ttl: 60 * 60 * 1000, // 60 Minuten
    };

    // Validierung
    this.log.info("🔍 Validiere Konfiguration...");
    this.validateConfig();

    this.log.info("📱 Konfiguriere Accessory Information Service...");
    // Accessory Information Service aktualisieren
    const accessoryInfo = this.accessory.getService(this.Service.AccessoryInformation);
    if (accessoryInfo) {
      accessoryInfo.setCharacteristic(this.Characteristic.Manufacturer, "Plex");
      accessoryInfo.setCharacteristic(this.Characteristic.Model, "Daily Recommendations");
      accessoryInfo.setCharacteristic(this.Characteristic.SerialNumber, "PR-001");
    }

    this.log.info("🔔 Konfiguriere OccupancySensor Service...");
    // HomeKit Service Setup - hole oder erstelle OccupancySensor
    this.service =
      this.accessory.getService(this.Service.OccupancySensor) ||
      this.accessory.addService(this.Service.OccupancySensor, this.name);

    this.service
      .getCharacteristic(this.Characteristic.OccupancyDetected)
      .onGet(this.getOccupancyDetected.bind(this));

    this.log.info("🎛️ Konfiguriere Test Switch Service...");
    // Test-Switch hinzufügen für manuelle Benachrichtigungen
    this.testSwitch =
      this.accessory.getService("Test Benachrichtigung") ||
      this.accessory.addService(
        this.Service.Switch,
        "Test Benachrichtigung",
        "test-switch",
      );

    // Setze Service-Informationen für bessere UI-Darstellung
    this.testSwitch
      .setCharacteristic(this.Characteristic.Name, "Test Benachrichtigung")
      .setCharacteristic(this.Characteristic.ConfiguredName, "Test Benachrichtigung");

    this.testSwitch
      .getCharacteristic(this.Characteristic.On)
      .onGet(() => false) // Immer aus
      .onSet(async (value) => {
        if (value) {
          this.log.info("🧪 Test-Benachrichtigung über Homebridge UI ausgelöst...");
          this.log.info("🔧 DEBUG: Starte manuelle Benachrichtigung...");
          await this.sendDailyNotification();
          // Schalte Switch automatisch wieder aus
          setTimeout(() => {
            this.testSwitch.updateCharacteristic(this.Characteristic.On, false);
            this.log.info("✅ Test-Benachrichtigung abgeschlossen - Switch zurückgesetzt");
          }, 2000);
        }
      });

    // Cron Job für tägliche Benachrichtigung
    const [hours, minutes] = this.notificationTime.split(":");
    this.cronSchedule = `${minutes} ${hours} * * *`;

    this.log.info(`⏰ Cron-Job konfiguriert für tägliche Benachrichtigungen um ${this.notificationTime}`);
    this.log.info("🎛️ Test-Switch verfügbar in HomeKit: \"Test Benachrichtigung\"");
    this.log.info("🖥️ Test-Switch auch in Homebridge UI verfügbar für manuelle Tests");
    
    this.log.info("🚀 Starte Cron Job...");
    this.cronJob = cron.schedule(this.cronSchedule, () => {
      this.log.info("⏰ Cron Job ausgelöst - führe tägliche Benachrichtigung durch...");
      this.sendDailyNotification();
    });

    this.occupancyDetected = false;
    this.log.info("✅ PlexSensorAccessory erfolgreich initialisiert");
  }

  /**
   * Validiert die Konfiguration
   */
  validateConfig() {
    this.log.info("🔧 DEBUG: Validiere Konfiguration");
    const errors = [];

    if (!this.plexToken) {
      errors.push("plexToken ist erforderlich");
    }

    if (!this.machineId) {
      errors.push("machineId ist erforderlich");
    }

    // Validiere Zeitformat
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(this.notificationTime)) {
      errors.push(
        `Ungültiges Zeitformat: ${this.notificationTime} (erwartet: HH:MM)`,
      );
    }

    // Validiere hoursBack
    if (this.hoursBack < 1 || this.hoursBack > 168) {
      errors.push(
        `hoursBack muss zwischen 1 und 168 liegen (ist: ${this.hoursBack})`,
      );
    }

    // Validiere Plex URL
    try {
      new URL(this.plexUrl);
    } catch {
      errors.push(`Ungültige Plex URL: ${this.plexUrl}`);
    }

    // Validiere E-Mail-Konfiguration
    if (this.emailEnabled) {
      if (!this.emailSmtpHost) {
        errors.push("emailSmtpHost ist erforderlich wenn E-Mail aktiviert ist");
      }
      if (!this.emailUser) {
        errors.push("emailUser ist erforderlich wenn E-Mail aktiviert ist");
      }
      if (!this.emailPassword) {
        errors.push("emailPassword ist erforderlich wenn E-Mail aktiviert ist");
      }
      if (!this.emailFrom) {
        errors.push("emailFrom ist erforderlich wenn E-Mail aktiviert ist");
      }
      if (!this.emailTo) {
        errors.push("emailTo ist erforderlich wenn E-Mail aktiviert ist");
      }
      
      // Validiere E-Mail-Format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (this.emailFrom && !emailRegex.test(this.emailFrom)) {
        errors.push(`Ungültige E-Mail-Adresse (From): ${this.emailFrom}`);
      }
      if (this.emailTo && !emailRegex.test(this.emailTo)) {
        errors.push(`Ungültige E-Mail-Adresse (To): ${this.emailTo}`);
      }
    }

    if (errors.length > 0) {
      this.log.error("🔧 DEBUG: Konfigurationsfehler:", errors);
      throw new Error(
        `Konfigurationsvalidierung fehlgeschlagen: ${errors.join(", ")}`,
      );
    }

    this.log.info("✓ Konfiguration erfolgreich validiert");
  }

  /**
   * Sendet tägliche Benachrichtigung über neue Inhalte
   */
  async sendDailyNotification() {
    this.log.info("🎬 Führe tägliche Plex-Empfehlungsabfrage durch...");

    try {
      const newContent = await this.getNewContent();
      this.log.info(`🔍 ${newContent.length} neue Inhalte gefunden!`);

      if (newContent.length > 0) {
        this.log.info(`🎉 ${newContent.length} neue Inhalte gefunden!`);

        // Benachrichtigung durch Accessory-Status-Änderung triggern
        this.occupancyDetected = true;
        this.service.updateCharacteristic(
          this.Characteristic.OccupancyDetected,
          true,
        );

        // Nach 5 Sekunden wieder auf false setzen
        setTimeout(() => {
          this.occupancyDetected = false;
          this.service.updateCharacteristic(
            this.Characteristic.OccupancyDetected,
            false,
          );
        }, 5000);

        // Details loggen mit verbessertem Format und Plex-Links
        newContent.forEach((item, index) => {
          this.log.info(
            `  ${index + 1}. ${item.title} (${item.type}) - hinzugefügt: ${item.addedAt}`,
          );
          if (item.year) {
            this.log.info(`     🎬 Jahr: ${item.year}`);
          }
          if (item.rating) {
            this.log.info(`     ⭐ Bewertung: ${item.rating}/10`);
          }
          if (item.duration) {
            const minutes = Math.floor(item.duration / 60000);
            this.log.info(`     ⏱️ Dauer: ${minutes} Minuten`);
          }
          if (item.genre) {
            this.log.info(`     🎭 Genre: ${item.genre}`);
          }
          if (item.summary) {
            this.log.info(`     📝 ${item.summary.substring(0, 120)}${item.summary.length > 120 ? "..." : ""}`);
          }
          if (item.plexUrl) {
            this.log.info(`     🔗 Plex öffnen: ${item.plexUrl}`);
          }
          this.log.info("     ─────────────────────────────────────────");
        });

        // E-Mail-Benachrichtigung senden
        if (this.emailEnabled) {
          await this.sendEmailNotification(newContent);
        }
      } else {
        this.log.info(
          `ℹ Keine neuen Inhalte in den letzten ${this.hoursBack} Stunden.`,
        );
      }
    } catch (error) {
      this.log.error(`❌ Fehler bei der Abfrage: ${error.message}`);
    }
  }

  /**
   * Sendet E-Mail-Benachrichtigung über neue Inhalte
   */
  async sendEmailNotification(newContent) {
    this.log.info("📧 Sende E-Mail-Benachrichtigung...");
    
    try {
      // SMTP-Transporter erstellen
      const transporter = nodemailer.createTransporter({
        host: this.emailSmtpHost,
        port: this.emailSmtpPort,
        secure: this.emailSmtpSecure,
        auth: {
          user: this.emailUser,
          pass: this.emailPassword,
        },
      });

      // E-Mail-Inhalt erstellen
      const subject = `🎬 Plex Daily Recommendations - ${newContent.length} neue Inhalte gefunden!`;
      
      let htmlContent = `
        <h2>🎬 Plex Daily Recommendations</h2>
        <p>Es wurden <strong>${newContent.length}</strong> neue Inhalte auf deinem Plex Server gefunden!</p>
        <hr>
      `;

      newContent.forEach((item, index) => {
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
        
        htmlContent += "</div>";
      });

      htmlContent += `
        <hr>
        <p><small>Diese E-Mail wurde automatisch von deinem Homebridge Plex Daily Recommendations Plugin gesendet.</small></p>
      `;

      // E-Mail senden
      const mailOptions = {
        from: this.emailFrom,
        to: this.emailTo,
        subject: subject,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      this.log.info(`✅ E-Mail erfolgreich gesendet: ${info.messageId}`);
      
    } catch (error) {
      this.log.error(`❌ Fehler beim Senden der E-Mail: ${error.message}`);
    }
  }

  /**
   * Holt neue Inhalte von Plex
   */
  async getNewContent() {
    this.log.info("🔧 DEBUG: getNewContent aufgerufen");
    try {
      // Hole alle Bibliotheken
      const libraries = await this.getLibraries();
      this.log.info("🔧 DEBUG: Bibliotheken abgerufen:", libraries.length);
      const allItems = [];

      // Durchlaufe alle Bibliotheken
      for (const library of libraries) {
        const items = await this.getLibraryItems(library.key);
        this.log.info("🔧 DEBUG: Items aus Bibliothek", library.key, ":", items.length);
        allItems.push(...items);
      }

      // Filtere nach Zeitraum
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - this.hoursBack);

      const newItems = allItems
        .filter((item) => {
          const addedAt = new Date(item.addedAt * 1000);
          return addedAt > cutoffTime;
        })
        .sort((a, b) => b.addedAt - a.addedAt)
        .slice(0, 5); // Top 5

      this.log.info("🔧 DEBUG: Gefilterte neue Items:", newItems.length);
      return newItems;
    } catch (error) {
      this.log.error(`Fehler beim Abrufen neuer Inhalte: ${error.message}`);
      return [];
    }
  }

  /**
   * Holt alle Plex-Bibliotheken
   */
  async getLibraries() {
    this.log.info("🔧 DEBUG: getLibraries aufgerufen");
      // Cache prüfen
      if (
        this.libraryCache.data &&
      Date.now() - this.libraryCache.timestamp < this.libraryCache.ttl
      ) {
      this.log.info("🔧 DEBUG: Verwende gecachte Bibliotheken");
        return this.libraryCache.data;
      }

    try {
      this.log.info("🔧 DEBUG: Lade Bibliotheken von Plex");
      const response = await axios.get(
        `${this.plexUrl}/library/sections?X-Plex-Token=${this.plexToken}`,
        { timeout: 10000 },
      );

      const parsed = this.xmlParser.parse(response.data);
      const libraries = parsed.MediaContainer.Directory.filter(
        (dir) => dir.type === "movie" || dir.type === "show",
      );

      // Cache aktualisieren
      this.libraryCache.data = libraries;
      this.libraryCache.timestamp = Date.now();

      this.log.debug(`✓ ${libraries.length} Bibliotheken geladen`);
      return libraries;
    } catch (error) {
      this.log.error(`Fehler beim Abrufen der Bibliotheken: ${error.message}`);
      return [];
    }
  }

  /**
   * Holt Items aus einer spezifischen Bibliothek
   */
  async getLibraryItems(libraryKey) {
    this.log.info("🔧 DEBUG: getLibraryItems aufgerufen für Bibliothek:", libraryKey);
    try {
      const response = await axios.get(
        `${this.plexUrl}/library/sections/${libraryKey}/all?X-Plex-Token=${this.plexToken}`,
        { timeout: 10000 },
      );

      const parsed = this.xmlParser.parse(response.data);
      const items = [];

      const extractItems = (mediaItems) => {
        if (!mediaItems) return;
        if (!Array.isArray(mediaItems)) mediaItems = [mediaItems];

        mediaItems.forEach((item) => {
          if (item["@_addedAt"]) {
            items.push({
              title: item["@_title"] || "Unbekannt",
              type: this.translateType(item["@_type"]),
              addedAt: parseInt(item["@_addedAt"]),
              year: item["@_year"] || "",
              summary: item["@_summary"] || "",
              plexUrl: this.generatePlexUrl(item),
              rating: item["@_rating"] || "",
              duration: item["@_duration"] || "",
              genre: item["@_genre"] || "",
            });
          }
        });
      };

      // Videos (Filme, Serien, Episoden)
      extractItems(parsed.MediaContainer.Video);

      // Tracks (Musik)
      extractItems(parsed.MediaContainer.Track);

      this.log.debug(
        `✓ ${items.length} Items aus Bibliothek ${libraryKey} geladen`,
      );
      return items;
    } catch (error) {
      this.log.error(
        `❌ Fehler beim Abrufen von Bibliothek ${libraryKey}: ${error.message}`,
      );
      if (error.response) {
        this.log.error(`HTTP Status: ${error.response.status}`);
      }
      return [];
    }
  }

  /**
   * Übersetzt Plex-Typen ins Deutsche
   */
  translateType(type) {
    const translations = {
      movie: "Film",
      show: "Serie",
      episode: "Episode",
      track: "Musik",
    };
    return translations[type] || type;
  }

  /**
   * Generiert Plex-URL für direkten Zugriff
   */
  generatePlexUrl(item) {
    const baseUrl = this.plexUrl.replace("http://", "").replace("https://", "");
    const itemKey = item["@_key"];
    const itemType = item["@_type"];
    
    if (itemType === "movie") {
      return `plex://movie/${itemKey}`;
    } else if (itemType === "show") {
      return `plex://show/${itemKey}`;
    } else if (itemType === "episode") {
      return `plex://episode/${itemKey}`;
    } else {
      return `plex://server/${baseUrl}/details?key=${itemKey}`;
    }
  }

  getOccupancyDetected() {
    return this.occupancyDetected;
  }

  /**
   * Cleanup-Methode für ordnungsgemäße Freigabe von Ressourcen
   */
  destroy() {
    if (this.cronJob) {
      this.cronJob.destroy();
      this.cronJob = null;
    }
    this.log.info("PlexSensorAccessory wurde ordnungsgemäß beendet");
  }
}

console.log("🔧 DEBUG: Registriere Platform...");

module.exports = (api) => {
  console.log("🔧 DEBUG: Module.exports aufgerufen");
  Service = api.hap.Service;
  Characteristic = api.hap.Characteristic;

  console.log("🔧 DEBUG: Registriere Platform:", PLUGIN_NAME, PLATFORM_NAME);
  api.registerPlatform(
    PLUGIN_NAME,
    PLATFORM_NAME,
    PlexDailyRecommendationsPlatform,
  );
  console.log("🔧 DEBUG: Platform registriert");
  
  // Exportiere die Platform-Klasse für UI-Zugriff
  module.exports.PlexDailyRecommendationsPlatform = PlexDailyRecommendationsPlatform;
  
  // Exportiere UI-Handler für Homebridge UI
  module.exports.uiButton = async (button, platform) => {
    if (platform && typeof platform.uiButton === "function") {
      return await platform.uiButton(button);
    }
    return { success: false, message: "Platform nicht verfügbar" };
  };
  
  // Exportiere UI-Event-Handler für Homebridge UI
  module.exports.uiEvent = async (event, platform) => {
    if (platform && typeof platform.uiEvent === "function") {
      return await platform.uiEvent(event);
    }
    return { success: false, message: "Platform nicht verfügbar" };
  };
  
  // Exportiere Test-API für Homebridge UI
  module.exports.testNotification = async (platform) => {
    if (platform && typeof platform.testNotificationAPI === "function") {
      return await platform.testNotificationAPI();
    }
    return { success: false, message: "Platform nicht verfügbar" };
  };
  
  // Exportiere Test-API für Homebridge UI (alternative Methode)
  module.exports.testNotificationAPI = async (platform) => {
    if (platform && typeof platform.testNotificationAPI === "function") {
      return await platform.testNotificationAPI();
    }
    return { success: false, message: "Platform nicht verfügbar" };
  };
  
  // Exportiere Test-API für Homebridge UI (direkte Methode)
  module.exports.testNotificationDirect = async (platform) => {
    if (platform && typeof platform.testNotification === "function") {
      return await platform.testNotification();
    }
    return { success: false, message: "Platform nicht verfügbar" };
  };
  
  // Exportiere Test-API für Homebridge UI (einfache Methode)
  module.exports.test = async (platform) => {
    if (platform && typeof platform.testNotification === "function") {
      return await platform.testNotification();
    }
    return { success: false, message: "Platform nicht verfügbar" };
  };
  
  // Exportiere E-Mail-Test-API für Homebridge UI
  module.exports.testEmail = async (platform) => {
    if (platform && typeof platform.testEmailNotification === "function") {
      return await platform.testEmailNotification();
    }
    return { success: false, message: "Platform nicht verfügbar" };
  };
};
