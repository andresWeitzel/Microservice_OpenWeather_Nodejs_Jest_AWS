"use strict";

const { handler } = require("../../../controllers/air-pollution/enhanced");

describe("Enhanced Air Pollution API Integration Tests", () => {
  let mockEvent;

  beforeEach(() => {
    mockEvent = {
      pathParameters: {
        country: "London"
      }
    };
  });

  test("should return enriched air pollution data for valid city", async () => {
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("location");
    expect(body).toHaveProperty("airQuality");
    expect(body).toHaveProperty("pollutants");
    expect(body).toHaveProperty("alerts");
    expect(body).toHaveProperty("recommendations");
    expect(body).toHaveProperty("health");
    expect(body).toHaveProperty("activities");
  });

  test("should return error for invalid city", async () => {
    mockEvent.pathParameters.country = "InvalidCity12345";

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");
    expect(body.message).toContain("Could not find coordinates");
  });

  test("should return error for missing country parameter", async () => {
    mockEvent.pathParameters = {};

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(500);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");
  });

  test("should return enriched air pollution data with correct structure", async () => {
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);

    // Check location structure
    expect(body.location).toHaveProperty("city");
    expect(body.location).toHaveProperty("country");
    expect(body.location).toHaveProperty("coordinates");
    expect(body.location).toHaveProperty("timestamp");
    expect(body.location.coordinates).toHaveProperty("lat");
    expect(body.location.coordinates).toHaveProperty("lon");

    // Check airQuality structure
    expect(body.airQuality).toHaveProperty("index");
    expect(body.airQuality).toHaveProperty("level");
    expect(body.airQuality).toHaveProperty("description");
    expect(body.airQuality).toHaveProperty("color");
    expect(body.airQuality).toHaveProperty("healthImplications");
    expect(typeof body.airQuality.index).toBe("number");
    expect(typeof body.airQuality.level).toBe("string");

    // Check pollutants structure
    expect(body.pollutants).toHaveProperty("carbonMonoxide");
    expect(body.pollutants).toHaveProperty("nitrogenOxide");
    expect(body.pollutants).toHaveProperty("nitrogenDioxide");
    expect(body.pollutants).toHaveProperty("ozone");
    expect(body.pollutants).toHaveProperty("sulfurDioxide");
    expect(body.pollutants).toHaveProperty("particulateMatter25");
    expect(body.pollutants).toHaveProperty("particulateMatter10");
    expect(body.pollutants).toHaveProperty("ammonia");

    // Check each pollutant has required properties
    const pollutants = Object.values(body.pollutants);
    pollutants.forEach(pollutant => {
      expect(pollutant).toHaveProperty("value");
      expect(pollutant).toHaveProperty("unit");
      expect(pollutant).toHaveProperty("level");
      expect(pollutant).toHaveProperty("description");
      expect(typeof pollutant.value).toBe("number");
      expect(typeof pollutant.unit).toBe("string");
      expect(typeof pollutant.level).toBe("string");
    });

    // Check alerts structure
    expect(Array.isArray(body.alerts)).toBe(true);

    // Check recommendations structure
    expect(body.recommendations).toHaveProperty("general");
    expect(body.recommendations).toHaveProperty("outdoor");
    expect(body.recommendations).toHaveProperty("indoor");
    expect(body.recommendations).toHaveProperty("health");
    expect(body.recommendations).toHaveProperty("transportation");

    // Check health structure
    expect(body.health).toHaveProperty("riskLevel");
    expect(body.health).toHaveProperty("vulnerableGroups");
    expect(body.health).toHaveProperty("symptoms");
    expect(body.health).toHaveProperty("prevention");
    expect(Array.isArray(body.health.vulnerableGroups)).toBe(true);
    expect(Array.isArray(body.health.symptoms)).toBe(true);
    expect(Array.isArray(body.health.prevention)).toBe(true);

    // Check activities structure
    expect(body.activities).toHaveProperty("outdoor");
    expect(body.activities).toHaveProperty("exercise");
    expect(body.activities).toHaveProperty("ventilation");
    expect(body.activities).toHaveProperty("transportation");
  });

  test("should return valid AQI levels", async () => {
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);

    const validLevels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
    expect(validLevels).toContain(body.airQuality.level);
  });

  test("should return valid pollutant levels", async () => {
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);

    const validPollutantLevels = ["Low", "Moderate", "High", "Very High"];
    const pollutants = Object.values(body.pollutants);
    
    pollutants.forEach(pollutant => {
      expect(validPollutantLevels).toContain(pollutant.level);
    });
  });

  test("should return valid health risk levels", async () => {
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);

    const validRiskLevels = ["Low", "Low to Moderate", "Moderate", "High", "Very High"];
    expect(validRiskLevels).toContain(body.health.riskLevel);
  });

  test("should handle API errors gracefully", async () => {
    // Mock a scenario where the API returns an error
    const originalEnv = process.env.API_KEY;
    process.env.API_KEY = "invalid_key";

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");

    // Restore original API key
    process.env.API_KEY = originalEnv;
  });
}); 