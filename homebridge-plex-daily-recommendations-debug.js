let Service, Characteristic;
const axios = require("axios");
const cron = require("node-cron");
const { XMLParser } = require("fast-xml-parser");

const PLUGIN_NAME = "homebridge-plex-daily-recommendations";
const PLATFORM_NAME = "PlexDailyRecommendations";

console.log("🔧 DEBUG: Plugin wird geladen...");

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

    this.log.info("🔧 DEBUG: Plex Daily Recommendations Platform wird initialisiert...");
    this.log.info("🔧 DEBUG: Config Name:", config.name);
    this.log.info("🔧 DEBUG: Plex URL:", config.plexUrl);
    this.log.info("🔧 DEBUG: Plex Token:", config.plexToken ? "✅ Vorhanden" : "❌ Fehlt");
    this.log.info("🔧 DEBUG: Machine ID:", config.machineId ? "✅ Vorhanden" : "❌ Fehlt");

    // Warte bis Homebridge fertig ist mit laden
    this.api.on("didFinishLaunching", () => {
      this.log.info("🔧 DEBUG: didFinishLaunching Event empfangen");
      this.log.info("Homebridge fertig geladen, erstelle Accessory...");
      this.discoverDevices();
    });

    this.log.info("🔧 DEBUG: Platform Constructor abgeschlossen");
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
      new PlexSensorAccessory(this, accessory, this.config);
      accessory.context.plexSensorConfigured = true;
    }
  }

  /**
   * Erstellt oder aktualisiert das Plex Sensor Accessory
   */
  discoverDevices() {
    this.log.info("🔧 DEBUG: discoverDevices aufgerufen");
    
    const uuid = this.api.hap.uuid.generate(
      "plex-daily-recommendations-sensor",
    );
    this.log.info("🔧 DEBUG: Generated UUID:", uuid);
    
    const existingAccessory = this.accessories.find((acc) => acc.UUID === uuid);
    this.log.info("🔧 DEBUG: Existing accessory gefunden:", !!existingAccessory);

    if (existingAccessory) {
      // Accessory existiert bereits, prüfe ob es bereits konfiguriert ist
      this.log.info(
        "Verwende existierendes Accessory:",
        existingAccessory.displayName,
      );
      
      // Prüfe ob das Accessory bereits ein PlexSensorAccessory hat
      if (!existingAccessory.context.plexSensorConfigured) {
        this.log.info("🔧 DEBUG: Erstelle PlexSensorAccessory für existierendes Accessory");
        new PlexSensorAccessory(this, existingAccessory, this.config);
        existingAccessory.context.plexSensorConfigured = true;
      }
    } else {
      // Erstelle neues Accessory
      this.log.info("🔧 DEBUG: Erstelle neues Accessory");
      this.log.info("Erstelle neues Accessory: Plex Empfehlungen");
      const accessory = new this.api.platformAccessory(
        "Plex Empfehlungen",
        uuid,
      );

      this.log.info("🔧 DEBUG: Erstelle PlexSensorAccessory für neues Accessory");
      new PlexSensorAccessory(this, accessory, this.config);
      accessory.context.plexSensorConfigured = true;
      
      this.log.info("🔧 DEBUG: Registriere Platform Accessories");
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        accessory,
      ]);
    }
    
    this.log.info("🔧 DEBUG: discoverDevices abgeschlossen");
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

    this.log.info("🔧 DEBUG: PlexSensorAccessory wird initialisiert");

    // Konfiguration
    this.name = config.name || "Plex Recommendations";
    this.plexUrl = config.plexUrl || "http://192.168.178.3:32400";
    this.plexToken = config.plexToken;
    this.machineId = config.machineId;
    this.notificationTime = config.notificationTime || "20:00"; // HH:MM Format
    this.hoursBack = config.hoursBack || 24; // Wie viele Stunden zurück nach neuen Inhalten suchen

    this.log.info("🔧 DEBUG: Konfiguration geladen");
    this.log.info("🔧 DEBUG: Name:", this.name);
    this.log.info("🔧 DEBUG: Plex URL:", this.plexUrl);
    this.log.info("🔧 DEBUG: Notification Time:", this.notificationTime);
    this.log.info("🔧 DEBUG: Hours Back:", this.hoursBack);

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
    this.log.info("🔧 DEBUG: Starte Konfigurationsvalidierung");
    this.validateConfig();

    this.log.info("🔧 DEBUG: Erstelle Accessory Information Service");
    // Accessory Information Service aktualisieren
    this.accessory
      .getService(Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, "Plex")
      .setCharacteristic(Characteristic.Model, "Daily Recommendations")
      .setCharacteristic(Characteristic.SerialNumber, "PR-001");

    this.log.info("🔧 DEBUG: Erstelle OccupancySensor Service");
    // HomeKit Service Setup - hole oder erstelle OccupancySensor
    this.service =
      this.accessory.getService(Service.OccupancySensor) ||
      this.accessory.addService(Service.OccupancySensor, this.name);

    this.service
      .getCharacteristic(Characteristic.OccupancyDetected)
      .onGet(this.getOccupancyDetected.bind(this));

    this.log.info("🔧 DEBUG: Erstelle Test Switch Service");
    // Test-Switch hinzufügen für manuelle Benachrichtigungen
    this.testSwitch =
      this.accessory.getService("Test Benachrichtigung") ||
      this.accessory.addService(
        Service.Switch,
        "Test Benachrichtigung",
        "test-switch",
      );

    this.testSwitch
      .getCharacteristic(Characteristic.On)
      .onGet(() => false) // Immer aus
      .onSet(async (value) => {
        if (value) {
          this.log.info("🧪 Test-Benachrichtigung manuell ausgelöst...");
          await this.sendDailyNotification();
          // Schalte Switch automatisch wieder aus
          setTimeout(() => {
            this.testSwitch.updateCharacteristic(Characteristic.On, false);
          }, 1000);
        }
      });

    // Cron Job für tägliche Benachrichtigung
    const [hours, minutes] = this.notificationTime.split(":");
    this.cronSchedule = `${minutes} ${hours} * * *`;

    this.log.info(
      `✓ Cron-Job konfiguriert für tägliche Benachrichtigungen um ${this.notificationTime}`,
    );
    this.log.info(
      "✓ Test-Switch verfügbar in HomeKit: \"Test Benachrichtigung\"",
    );
    
    this.log.info("🔧 DEBUG: Starte Cron Job");
    this.cronJob = cron.schedule(this.cronSchedule, () => {
      this.log.info("🔧 DEBUG: Cron Job ausgelöst");
      this.sendDailyNotification();
    });

    this.occupancyDetected = false;
    this.log.info("🔧 DEBUG: PlexSensorAccessory initialisiert");
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
    this.log.info("🔧 DEBUG: sendDailyNotification aufgerufen");
    this.log.info("Führe tägliche Plex-Empfehlungsabfrage durch...");

    try {
      const newContent = await this.getNewContent();
      this.log.info("🔧 DEBUG: Neue Inhalte abgerufen:", newContent.length);

      if (newContent.length > 0) {
        this.log.info(`✓ ${newContent.length} neue Inhalte gefunden!`);

        // Benachrichtigung durch Accessory-Status-Änderung triggern
        this.occupancyDetected = true;
        this.service.updateCharacteristic(
          Characteristic.OccupancyDetected,
          true,
        );

        // Nach 5 Sekunden wieder auf false setzen
        setTimeout(() => {
          this.occupancyDetected = false;
          this.service.updateCharacteristic(
            Characteristic.OccupancyDetected,
            false,
          );
        }, 5000);

        // Details loggen mit verbessertem Format
        newContent.forEach((item, index) => {
          this.log.info(
            `  ${index + 1}. ${item.title} (${item.type}) - hinzugefügt: ${item.addedAt}`,
          );
        });
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
};

