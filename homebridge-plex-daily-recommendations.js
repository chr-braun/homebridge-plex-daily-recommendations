let Service, Characteristic;
const axios = require("axios");
const cron = require("node-cron");
const { XMLParser } = require("fast-xml-parser");

module.exports = (api) => {
  Service = api.hap.Service;
  Characteristic = api.hap.Characteristic;
  api.registerAccessory(
    "homebridge-plex-daily-recommendations",
    "PlexDailyRecommendations",
    PlexDailyRecommendations,
  );
};

// UI Schema für Homebridge UI-X
module.exports.schema = {
  type: "object",
  properties: {
    name: {
      title: "Name",
      type: "string",
      default: "Plex Empfehlungen",
      description: "Name des Accessories in HomeKit",
    },
    plexUrl: {
      title: "Plex Server URL",
      type: "string",
      default: "http://192.168.178.3:32400",
      description: "URL deines Plex Servers (z.B. http://192.168.1.100:32400)",
      format: "uri",
    },
    plexToken: {
      title: "Plex API Token",
      type: "string",
      description:
        "Dein Plex API Token (https://support.plex.tv/articles/204059436)",
      "x-display": "password",
    },
    machineId: {
      title: "Plex Server Machine ID",
      type: "string",
      description: "Machine ID deines Plex Servers",
    },
    notificationTime: {
      title: "Benachrichtigungszeit",
      type: "string",
      default: "20:00",
      pattern: "^([0-1][0-9]|2[0-3]):[0-5][0-9]$",
      description:
        "Uhrzeit für tägliche Benachrichtigung (HH:MM Format, z.B. 20:00)",
    },
    hoursBack: {
      title: "Stunden zurückblicken",
      type: "integer",
      default: 24,
      minimum: 1,
      maximum: 168,
      description:
        "Wie viele Stunden zurück nach neuen Inhalten suchen (1-168)",
    },
  },
  required: ["plexToken", "machineId"],
  layout: [
    {
      type: "fieldset",
      items: ["name"],
    },
    {
      type: "fieldset",
      title: "Plex Server Verbindung",
      items: ["plexUrl", "plexToken", "machineId"],
    },
    {
      type: "fieldset",
      title: "Benachrichtigungen",
      items: ["notificationTime", "hoursBack"],
    },
  ],
};

class PlexDailyRecommendations {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;

    // Konfiguration
    this.name = config.name || "Plex Recommendations";
    this.plexUrl = config.plexUrl || "http://192.168.178.3:32400";
    this.plexToken = config.plexToken;
    this.machineId = config.machineId;
    this.notificationTime = config.notificationTime || "20:00"; // HH:MM Format
    this.hoursBack = config.hoursBack || 24; // Wie viele Stunden zurück nach neuen Inhalten suchen

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
    this.validateConfig();

    // HomeKit Service Setup
    this.service = new Service.OccupancySensor(this.name);
    this.service
      .getCharacteristic(Characteristic.OccupancyDetected)
      .onGet(this.getOccupancyDetected.bind(this));

    // Cron Job für tägliche Benachrichtigung
    const [hours, minutes] = this.notificationTime.split(":");
    this.cronSchedule = `${minutes} ${hours} * * *`;

    this.log(
      `Starte Cron-Job für tägliche Benachrichtigungen um ${this.notificationTime}`,
    );
    cron.schedule(this.cronSchedule, () => this.sendDailyNotification());

    this.occupancyDetected = false;
  }

  /**
   * Validiert die Konfiguration
   */
  validateConfig() {
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
      const url = new URL(this.plexUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        errors.push(`Ungültiges Protokoll in plexUrl: ${url.protocol}`);
      }
    } catch (e) {
      errors.push(`Ungültige plexUrl: ${this.plexUrl}`);
    }

    if (errors.length > 0) {
      this.log.error("Konfigurationsfehler:");
      errors.forEach((error) => this.log.error(`  - ${error}`));
      throw new Error(
        `Konfigurationsvalidierung fehlgeschlagen: ${errors.join(", ")}`,
      );
    }

    this.log("✓ Konfiguration erfolgreich validiert");
  }

  /**
   * Sendet tägliche Benachrichtigung über neue Inhalte
   */
  async sendDailyNotification() {
    this.log("Führe tägliche Plex-Empfehlungsabfrage durch...");

    try {
      const newContent = await this.getNewContent();

      if (newContent.length > 0) {
        this.log(`✓ ${newContent.length} neue Inhalte gefunden!`);

        // Benachrichtigung durch Accessory-Status-Änderung triggern
        this.occupancyDetected = true;
        this.service.updateCharacteristic(
          Characteristic.OccupancyDetected,
          true,
        );

        // Später wieder zurücksetzen
        setTimeout(() => {
          this.occupancyDetected = false;
          this.service.updateCharacteristic(
            Characteristic.OccupancyDetected,
            false,
          );
        }, 5000);

        // Details loggen mit verbessertem Format
        newContent.forEach((item, index) => {
          this.log(
            `  ${index + 1}. ${item.title} (${item.type}) - hinzugefügt: ${item.addedAt}`,
          );
        });
      } else {
        this.log(
          `ℹ Keine neuen Inhalte in den letzten ${this.hoursBack} Stunden.`,
        );
      }
    } catch (error) {
      this.log.error(`❌ Fehler bei der Abfrage: ${error.message}`);
      if (error.stack) {
        this.log.debug(error.stack);
      }
    }
  }

  /**
   * Holt neue Inhalte von Plex Server
   * @returns {Promise<Array>} Liste der neuen Inhalte
   */
  async getNewContent() {
    try {
      const nowUtc = Math.floor(Date.now() / 1000);
      const hoursBackSeconds = this.hoursBack * 3600;
      const cutoffTime = nowUtc - hoursBackSeconds;

      this.log.debug(
        `Suche nach Inhalten seit: ${new Date(cutoffTime * 1000).toLocaleString("de-DE")}`,
      );

      // Hole alle Bibliotheken (mit Cache)
      const libraries = await this.getLibraries();

      if (!libraries || libraries.length === 0) {
        this.log.warn("⚠ Keine Bibliotheken gefunden");
        return [];
      }

      this.log.debug(
        `Durchsuche ${libraries.length} Bibliothek(en): ${libraries.map((l) => l.title).join(", ")}`,
      );

      let allNewContent = [];

      // Parallel alle Bibliotheken abfragen für bessere Performance
      const libraryPromises = libraries.map((library) =>
        this.getLibraryItems(library.key).catch((error) => {
          this.log.error(
            `Fehler bei Bibliothek ${library.title}:`,
            error.message,
          );
          return [];
        }),
      );

      const libraryResults = await Promise.all(libraryPromises);

      // Flatten und filtern
      for (const items of libraryResults) {
        const newItems = items.filter((item) => {
          const addedAt = parseInt(item.addedAt) || 0;
          return addedAt >= cutoffTime;
        });
        allNewContent = allNewContent.concat(newItems);
      }

      // Sortiere nach addedAt (neueste zuerst)
      allNewContent.sort((a, b) => parseInt(b.addedAt) - parseInt(a.addedAt));

      // Limitiere auf Top 5
      const topContent = allNewContent.slice(0, 5).map((item) => ({
        title: item.title,
        type: this.translateType(item.type),
        addedAt: new Date(parseInt(item.addedAt) * 1000).toLocaleString(
          "de-DE",
        ),
      }));

      return topContent;
    } catch (error) {
      this.log.error(`❌ Fehler bei getNewContent: ${error.message}`);
      return [];
    }
  }

  /**
   * Übersetzt Plex-Typen ins Deutsche
   * @param {string} type - Plex Typ
   * @returns {string} Deutscher Typ
   */
  translateType(type) {
    const translations = {
      movie: "Film",
      show: "Serie",
      season: "Staffel",
      episode: "Episode",
      artist: "Künstler",
      album: "Album",
      track: "Song",
    };
    return translations[type] || type;
  }

  /**
   * Holt alle verfügbaren Bibliotheken vom Plex Server (mit Caching)
   * @returns {Promise<Array>} Liste der Bibliotheken
   */
  async getLibraries() {
    try {
      // Cache prüfen
      const now = Date.now();
      if (
        this.libraryCache.data &&
        now - this.libraryCache.timestamp < this.libraryCache.ttl
      ) {
        this.log.debug("✓ Verwende gecachte Bibliotheken");
        return this.libraryCache.data;
      }

      this.log.debug("Lade Bibliotheken von Plex Server...");

      const response = await axios.get(`${this.plexUrl}/library/sections`, {
        params: {
          "X-Plex-Token": this.plexToken,
        },
        timeout: 10000,
        headers: {
          Accept: "application/xml",
        },
      });

      // Parse XML mit fast-xml-parser
      const parsed = this.xmlParser.parse(response.data);
      const libraries = [];

      // Extrahiere Directories
      if (parsed.MediaContainer && parsed.MediaContainer.Directory) {
        const dirs = Array.isArray(parsed.MediaContainer.Directory)
          ? parsed.MediaContainer.Directory
          : [parsed.MediaContainer.Directory];

        for (const dir of dirs) {
          const type = dir["@_type"];
          // Nur Movie und Show Libraries
          if (type === "movie" || type === "show") {
            libraries.push({
              key: dir["@_key"],
              title: dir["@_title"],
              type: type,
            });
          }
        }
      }

      // Cache aktualisieren
      this.libraryCache.data = libraries;
      this.libraryCache.timestamp = now;

      this.log.debug(
        `✓ ${libraries.length} Bibliothek(en) gefunden und gecached`,
      );
      return libraries;
    } catch (error) {
      this.log.error(
        `❌ Fehler beim Abrufen der Bibliotheken: ${error.message}`,
      );
      if (error.response) {
        this.log.error(`HTTP Status: ${error.response.status}`);
      }
      return [];
    }
  }

  /**
   * Holt Items einer spezifischen Bibliothek
   * @param {string} libraryKey - Bibliotheks-ID
   * @returns {Promise<Array>} Liste der Items
   */
  async getLibraryItems(libraryKey) {
    try {
      const response = await axios.get(
        `${this.plexUrl}/library/sections/${libraryKey}/all`,
        {
          params: {
            "X-Plex-Token": this.plexToken,
            sort: "addedAt:desc",
            limit: 50,
          },
          timeout: 10000,
          headers: {
            Accept: "application/xml",
          },
        },
      );

      // Parse XML mit fast-xml-parser
      const parsed = this.xmlParser.parse(response.data);
      const items = [];

      if (!parsed.MediaContainer) {
        return items;
      }

      // Extrahiere Video und Track Elemente
      const extractItems = (elements) => {
        if (!elements) return;

        const elementArray = Array.isArray(elements) ? elements : [elements];
        for (const element of elementArray) {
          if (element["@_title"] && element["@_addedAt"]) {
            items.push({
              title: element["@_title"],
              addedAt: element["@_addedAt"],
              type: element["@_type"] || "unknown",
            });
          }
        }
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

  getOccupancyDetected() {
    return this.occupancyDetected;
  }

  getServices() {
    const informationService = new Service.AccessoryInformation()
      .setCharacteristic(Characteristic.Manufacturer, "Plex")
      .setCharacteristic(Characteristic.Model, "Daily Recommendations")
      .setCharacteristic(Characteristic.SerialNumber, "PR-001");

    return [informationService, this.service];
  }
}
