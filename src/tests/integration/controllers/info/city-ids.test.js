"use strict";

const { handler } = require("../../../../controllers/info/city-ids/get-city-ids");

describe("City IDs API Integration Tests", () => {
  let mockEvent;

  beforeEach(() => {
    mockEvent = {
      pathParameters: {
        cityName: "London"
      }
    };
  });

  test("should return city IDs for valid city name", async () => {
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("searchQuery");
    expect(body).toHaveProperty("countryCode");
    expect(body).toHaveProperty("limit");
    expect(body).toHaveProperty("totalResults");
    expect(body).toHaveProperty("cities");
    expect(body).toHaveProperty("source");
    expect(body).toHaveProperty("databaseInfo");
    expect(Array.isArray(body.cities)).toBe(true);
  });

  test("should return error for missing city name", async () => {
    mockEvent.pathParameters = {};

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");
    expect(body.message).toContain("City name parameter is required");
  });

  test("should return city IDs with country code filter", async () => {
    mockEvent.pathParameters = {
      cityName: "London",
      countryCode: "GB"
    };

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.countryCode).toBe("GB");
    expect(body.cities.length).toBeGreaterThan(0);
  });

  test("should return city IDs with custom limit", async () => {
    mockEvent.pathParameters = {
      cityName: "Paris",
      countryCode: "FR",
      limit: "3"
    };

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.limit).toBe(3);
    expect(body.cities.length).toBeLessThanOrEqual(3);
  });

  test("should return error for invalid limit", async () => {
    mockEvent.pathParameters = {
      cityName: "London",
      limit: "15"
    };

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");
    expect(body.message).toContain("Limit must be a number between 1 and 10");
  });

  test("should return error for non-numeric limit", async () => {
    mockEvent.pathParameters = {
      cityName: "London",
      limit: "invalid"
    };

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");
    expect(body.message).toContain("Limit must be a number between 1 and 10");
  });

  test("should return city data with correct structure", async () => {
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);

    // Check main structure
    expect(body).toHaveProperty("searchQuery");
    expect(body).toHaveProperty("countryCode");
    expect(body).toHaveProperty("limit");
    expect(body).toHaveProperty("totalResults");
    expect(body).toHaveProperty("cities");
    expect(body).toHaveProperty("source");
    expect(body).toHaveProperty("databaseInfo");

    // Check database info structure
    expect(body.databaseInfo).toHaveProperty("version");
    expect(body.databaseInfo).toHaveProperty("totalCities");
    expect(body.databaseInfo).toHaveProperty("lastUpdated");

    // Check cities array structure
    if (body.cities.length > 0) {
      const city = body.cities[0];
      expect(city).toHaveProperty("id");
      expect(city).toHaveProperty("name");
      expect(city).toHaveProperty("country");
      expect(city).toHaveProperty("coordinates");
      expect(city).toHaveProperty("displayName");
      expect(city.coordinates).toHaveProperty("lat");
      expect(city.coordinates).toHaveProperty("lon");
    }
  });

  test("should handle different city searches", async () => {
    const testCities = [
      { name: "New York", country: "US" },
      { name: "Tokyo", country: "JP" },
      { name: "Paris", country: "FR" },
      { name: "Sydney", country: "AU" }
    ];

    for (const city of testCities) {
      mockEvent.pathParameters = {
        cityName: city.name,
        countryCode: city.country
      };

      const response = await handler(mockEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.searchQuery).toBe(city.name);
      expect(body.countryCode).toBe(city.country);
      expect(body.cities.length).toBeGreaterThan(0);
    }
  });

  test("should validate city data types", async () => {
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);

    // Check string values
    expect(typeof body.searchQuery).toBe("string");
    expect(typeof body.countryCode).toBe("string");
    expect(typeof body.source).toBe("string");

    // Check numeric values
    expect(typeof body.limit).toBe("number");
    expect(typeof body.totalResults).toBe("number");

    // Check array
    expect(Array.isArray(body.cities)).toBe(true);

    // Check city object types if cities exist
    if (body.cities.length > 0) {
      const city = body.cities[0];
      expect(typeof city.id).toBe("number");
      expect(typeof city.name).toBe("string");
      expect(typeof city.country).toBe("string");
      expect(typeof city.coordinates.lat).toBe("number");
      expect(typeof city.coordinates.lon).toBe("number");
      expect(typeof city.displayName).toBe("string");
    }
  });

  test("should handle edge case searches", async () => {
    const edgeCases = [
      { name: "A", desc: "Single character search" },
      { name: "X", desc: "Non-existent city" },
      { name: "123", desc: "Numeric search" }
    ];

    for (const test of edgeCases) {
      mockEvent.pathParameters = {
        cityName: test.name
      };

      const response = await handler(mockEvent);

      // These should not crash, even if they return no results
      expect(response.statusCode).toBeDefined();
      expect(response.body).toBeDefined();
    }
  });

  test("should handle special characters in city names", async () => {
    const specialCases = [
      { name: "São Paulo", country: "BR" },
      { name: "München", country: "DE" },
      { name: "Côte d'Ivoire", country: "CI" }
    ];

    for (const city of specialCases) {
      mockEvent.pathParameters = {
        cityName: city.name,
        countryCode: city.country
      };

      const response = await handler(mockEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.searchQuery).toBe(city.name);
    }
  });

  test("should return source as local_database", async () => {
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.source).toBe("local_database");
  });

  test("should include database metadata", async () => {
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    
    expect(body.databaseInfo).toBeDefined();
    expect(typeof body.databaseInfo.version).toBe("string");
    expect(typeof body.databaseInfo.totalCities).toBe("number");
    expect(typeof body.databaseInfo.lastUpdated).toBe("string");
  });
}); 