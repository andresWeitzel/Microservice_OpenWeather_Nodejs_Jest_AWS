"use strict";

const { handler } = require("../../../../controllers/forecast/get-by-days-enhanced");

describe("Enhanced Forecast Days API Integration Tests", () => {
  let mockEvent;

  beforeEach(() => {
    mockEvent = {
      pathParameters: {
        location: "London,uk",
        days: "3"
      }
    };
  });

  test("should return enriched forecast data for valid location and days", async () => {
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("daysAnalysis");
    expect(body.daysAnalysis).toHaveProperty("summary");
    expect(body.daysAnalysis).toHaveProperty("weatherPatterns");
    expect(body.daysAnalysis).toHaveProperty("recommendations");
  });

  test("should return error for missing location", async () => {
    mockEvent.pathParameters = {
      days: "3"
    };

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");
    expect(body.message).toHaveProperty("error");
    expect(body.message.error).toContain("Location parameter is required");
  });

  test("should return error for missing days parameter", async () => {
    mockEvent.pathParameters = {
      location: "London,uk"
    };

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");
    expect(body.message).toHaveProperty("error");
    expect(body.message.error).toContain("Invalid days parameter");
  });

  test("should return error for invalid days parameter", async () => {
    mockEvent.pathParameters = {
      location: "London,uk",
      days: "10"
    };

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");
    expect(body.message).toHaveProperty("error");
    expect(body.message.error).toContain("Invalid days parameter");
  });

  test("should return error for non-numeric days parameter", async () => {
    mockEvent.pathParameters = {
      location: "London,uk",
      days: "invalid"
    };

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");
    expect(body.message).toHaveProperty("error");
    expect(body.message.error).toContain("Invalid days parameter");
  });

  test("should return enriched forecast data with correct structure", async () => {
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);

    // Check daysAnalysis structure
    expect(body.daysAnalysis).toHaveProperty("requestedDays");
    expect(body.daysAnalysis).toHaveProperty("actualDays");
    expect(body.daysAnalysis).toHaveProperty("summary");
    expect(body.daysAnalysis).toHaveProperty("weatherPatterns");
    expect(body.daysAnalysis).toHaveProperty("recommendations");
    expect(body.daysAnalysis).toHaveProperty("planningAdvice");

    // Check summary structure
    expect(body.daysAnalysis.summary).toHaveProperty("averageTemperature");
    expect(body.daysAnalysis.summary).toHaveProperty("temperatureRange");
    expect(body.daysAnalysis.summary).toHaveProperty("averageHumidity");
    expect(body.daysAnalysis.summary).toHaveProperty("averageWindSpeed");
    expect(body.daysAnalysis.summary).toHaveProperty("dominantWeatherCondition");
    expect(body.daysAnalysis.summary).toHaveProperty("temperatureTrend");

    // Check weatherPatterns structure
    expect(body.daysAnalysis.weatherPatterns).toHaveProperty("conditionBreakdown");
    expect(body.daysAnalysis.weatherPatterns).toHaveProperty("dailyVariations");
    expect(Array.isArray(body.daysAnalysis.weatherPatterns.dailyVariations)).toBe(true);

    // Check planningAdvice structure
    expect(body.daysAnalysis.planningAdvice).toHaveProperty("bestDayForOutdoorActivities");
    expect(body.daysAnalysis.planningAdvice).toHaveProperty("worstDayForOutdoorActivities");
    expect(body.daysAnalysis.planningAdvice).toHaveProperty("clothingRecommendations");
    expect(body.daysAnalysis.planningAdvice).toHaveProperty("activitySuggestions");
  });

  test("should handle different location formats", async () => {
    const testLocations = [
      { location: "New York,us", days: "2" },
      { location: "Tokyo,jp", days: "4" },
      { location: "Paris,fr", days: "1" },
      { location: "Sydney,au", days: "5" }
    ];

    for (const testLocation of testLocations) {
      mockEvent.pathParameters = {
        location: testLocation.location,
        days: testLocation.days
      };

      const response = await handler(mockEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty("daysAnalysis");
      expect(body.daysAnalysis).toHaveProperty("summary");
      expect(body.daysAnalysis).toHaveProperty("weatherPatterns");
    }
  });

  test("should validate forecast data types", async () => {
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);

    // Check string values
    expect(typeof body.daysAnalysis.summary.dominantWeatherCondition).toBe("string");
    expect(typeof body.daysAnalysis.summary.temperatureTrend).toBe("string");

    // Check numeric values
    expect(typeof body.daysAnalysis.requestedDays).toBe("number");
    expect(typeof body.daysAnalysis.actualDays).toBe("number");
    expect(typeof body.daysAnalysis.summary.averageTemperature).toBe("number");
    expect(typeof body.daysAnalysis.summary.averageHumidity).toBe("number");
    expect(typeof body.daysAnalysis.summary.averageWindSpeed).toBe("number");

    // Check array values
    expect(Array.isArray(body.daysAnalysis.weatherPatterns.dailyVariations)).toBe(true);
    expect(Array.isArray(body.daysAnalysis.recommendations)).toBe(true);
    expect(Array.isArray(body.daysAnalysis.planningAdvice.clothingRecommendations)).toBe(true);
    expect(Array.isArray(body.daysAnalysis.planningAdvice.activitySuggestions)).toBe(true);

    // Check object values
    expect(typeof body.daysAnalysis).toBe("object");
    expect(typeof body.daysAnalysis.summary).toBe("object");
    expect(typeof body.daysAnalysis.weatherPatterns).toBe("object");
    expect(typeof body.daysAnalysis.planningAdvice).toBe("object");
  });

  test("should handle edge case days values", async () => {
    const edgeCases = [
      { days: "1", name: "Minimum days" },
      { days: "5", name: "Maximum days" }
    ];

    for (const testCase of edgeCases) {
      mockEvent.pathParameters = {
        location: "London,uk",
        days: testCase.days
      };

      const response = await handler(mockEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty("daysAnalysis");
      expect(body.daysAnalysis).toHaveProperty("summary");
    }
  });

  test("should return error for days outside valid range", async () => {
    const invalidDays = ["0", "-1", "6", "10"];

    for (const days of invalidDays) {
      mockEvent.pathParameters = {
        location: "London,uk",
        days: days
      };

      const response = await handler(mockEvent);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty("message");
      expect(body.message).toHaveProperty("error");
      expect(body.message.error).toContain("Invalid days parameter");
    }
  });
});
