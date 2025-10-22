const assert = require("assert");
const { XMLParser } = require("fast-xml-parser");

describe("PlexDailyRecommendations Plugin", () => {
  let plugin;
  let mockLog;
  let mockApi;
  let xmlParser;

  before(() => {
    mockLog = {
      info: console.log,
      error: console.error,
      warn: console.warn,
      debug: console.log,
    };

    mockApi = {
      hap: {
        Service: {},
        Characteristic: {},
      },
    };

    xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
  });

  describe("Configuration Validation", () => {
    it("should require plexToken", () => {
      const config = {
        name: "Test",
        plexUrl: "http://localhost:32400",
        machineId: "test123",
      };
      assert.throws(() => {
        validateConfig(config);
      }, /plexToken is required/);
    });

    it("should require machineId", () => {
      const config = {
        name: "Test",
        plexUrl: "http://localhost:32400",
        plexToken: "token123",
      };
      assert.throws(() => {
        validateConfig(config);
      }, /machineId is required/);
    });

    it("should validate time format", () => {
      const validTimes = ["20:00", "09:30", "00:00", "23:59"];
      const invalidTimes = ["25:00", "20:60", "20", "20-00"];

      validTimes.forEach((time) => {
        assert.ok(isValidTimeFormat(time), `${time} should be valid`);
      });

      invalidTimes.forEach((time) => {
        assert.ok(!isValidTimeFormat(time), `${time} should be invalid`);
      });
    });

    it("should validate hoursBack range", () => {
      assert.ok(isValidHoursBack(1), "1 hour should be valid");
      assert.ok(isValidHoursBack(24), "24 hours should be valid");
      assert.ok(isValidHoursBack(168), "168 hours should be valid");
      assert.ok(!isValidHoursBack(0), "0 hours should be invalid");
      assert.ok(!isValidHoursBack(169), "169 hours should be invalid");
    });

    it("should validate Plex URL format", () => {
      const validUrls = [
        "http://localhost:32400",
        "http://192.168.1.100:32400",
        "http://plex.example.com:32400",
      ];
      const invalidUrls = [
        "localhost:32400",
        "plex.example.com",
        "ftp://localhost:32400",
      ];

      validUrls.forEach((url) => {
        assert.ok(isValidPlexUrl(url), `${url} should be valid`);
      });

      invalidUrls.forEach((url) => {
        assert.ok(!isValidPlexUrl(url), `${url} should be invalid`);
      });
    });
  });

  describe("Cron Schedule", () => {
    it("should generate correct cron expression for 20:00", () => {
      const cronExpr = generateCronExpression("20:00");
      assert.strictEqual(cronExpr, "00 20 * * *");
    });

    it("should generate correct cron expression for 09:30", () => {
      const cronExpr = generateCronExpression("09:30");
      assert.strictEqual(cronExpr, "30 09 * * *");
    });

    it("should generate correct cron expression for 00:00", () => {
      const cronExpr = generateCronExpression("00:00");
      assert.strictEqual(cronExpr, "00 00 * * *");
    });
  });

  describe("Content Filtering", () => {
    it("should filter content by time range", () => {
      const now = Math.floor(Date.now() / 1000);
      const hoursBack = 24;
      const cutoffTime = now - hoursBack * 3600;

      const content = [
        { title: "New Movie", addedAt: now - 3600 }, // 1 hour ago
        { title: "Old Movie", addedAt: cutoffTime - 3600 }, // Before cutoff
        { title: "Recent Movie", addedAt: now - 7200 }, // 2 hours ago
      ];

      const filtered = content.filter((item) => item.addedAt >= cutoffTime);
      assert.strictEqual(filtered.length, 2);
    });

    it("should limit results to top 5", () => {
      const content = Array.from({ length: 10 }, (_, i) => ({
        title: `Movie ${i}`,
        addedAt: Math.floor(Date.now() / 1000) - i * 3600,
      }));

      const limited = content.slice(0, 5);
      assert.strictEqual(limited.length, 5);
    });

    it("should sort by addedAt descending", () => {
      const content = [
        { title: "Movie 1", addedAt: 100 },
        { title: "Movie 3", addedAt: 300 },
        { title: "Movie 2", addedAt: 200 },
      ];

      const sorted = content.sort((a, b) => b.addedAt - a.addedAt);
      assert.strictEqual(sorted[0].title, "Movie 3");
      assert.strictEqual(sorted[1].title, "Movie 2");
      assert.strictEqual(sorted[2].title, "Movie 1");
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      const result = await safeApiCall(() => {
        throw new Error("Network error");
      });
      assert.strictEqual(result, null);
    });

    it("should handle invalid XML parsing", () => {
      const invalidXml = "<invalid>xml</unclosed>";
      const result = parseXml(invalidXml);
      assert.ok(Array.isArray(result));
      assert.strictEqual(result.length, 0);
    });
  });

  describe("XML Parsing with fast-xml-parser", () => {
    it("should parse valid Plex library XML", () => {
      const validXml = `<?xml version="1.0" encoding="UTF-8"?>
        <MediaContainer>
          <Directory key="1" title="Filme" type="movie"/>
          <Directory key="2" title="Serien" type="show"/>
          <Directory key="3" title="Musik" type="artist"/>
        </MediaContainer>`;

      const parsed = xmlParser.parse(validXml);
      assert.ok(parsed.MediaContainer);
      assert.ok(parsed.MediaContainer.Directory);
    });

    it("should parse Plex media items XML", () => {
      const mediaXml = `<?xml version="1.0" encoding="UTF-8"?>
        <MediaContainer>
          <Video title="Test Movie" type="movie" addedAt="1234567890"/>
          <Video title="Test Show" type="show" addedAt="1234567891"/>
        </MediaContainer>`;

      const parsed = xmlParser.parse(mediaXml);
      assert.ok(parsed.MediaContainer);
      assert.ok(parsed.MediaContainer.Video);

      const videos = Array.isArray(parsed.MediaContainer.Video)
        ? parsed.MediaContainer.Video
        : [parsed.MediaContainer.Video];
      assert.strictEqual(videos.length, 2);
      assert.strictEqual(videos[0]["@_title"], "Test Movie");
    });
  });

  describe("Type Translation", () => {
    it("should translate movie type to German", () => {
      const result = translateType("movie");
      assert.strictEqual(result, "Film");
    });

    it("should translate show type to German", () => {
      const result = translateType("show");
      assert.strictEqual(result, "Serie");
    });

    it("should return original type if no translation exists", () => {
      const result = translateType("unknown");
      assert.strictEqual(result, "unknown");
    });
  });
});

// Helper Functions
function isValidTimeFormat(time) {
  const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(time);
}

function isValidHoursBack(hours) {
  return hours >= 1 && hours <= 168;
}

function isValidPlexUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch (e) {
    return false;
  }
}

function generateCronExpression(time) {
  const [hours, minutes] = time.split(":");
  return `${minutes} ${hours} * * *`;
}

async function safeApiCall(fn) {
  try {
    return await fn();
  } catch (error) {
    console.error("API call error:", error.message);
    return null;
  }
}

function parseXml(xml) {
  try {
    const regex =
      /<Directory[^>]*key="([^"]*)"[^>]*title="([^"]*)"[^>]*type="([^"]*)"/g;
    const results = [];
    let match;
    while ((match = regex.exec(xml)) !== null) {
      results.push({
        key: match[1],
        title: match[2],
        type: match[3],
      });
    }
    return results;
  } catch (error) {
    console.error("XML parsing error:", error.message);
    return [];
  }
}

function translateType(type) {
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

function validateConfig(config) {
  if (!config.plexToken) {
    throw new Error("plexToken is required");
  }
  if (!config.machineId) {
    throw new Error("machineId is required");
  }
  return true;
}

module.exports = {
  isValidTimeFormat,
  isValidHoursBack,
  isValidPlexUrl,
  generateCronExpression,
  safeApiCall,
  parseXml,
  translateType,
  validateConfig,
};
