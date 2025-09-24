"use strict";

const { handler } = require("../../../../controllers/weather/get-by-location-enhanced");

describe("Enhanced Weather Location API Integration Tests", () => {
  let mockEvent;

  beforeEach(() => {
    mockEvent = {
      pathParameters: {
        location: "London,uk"
      }
    };
  });

  test("should return enriched weather data for valid location", async () => {
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("location");
    expect(body).toHaveProperty("temperature");
    expect(body).toHaveProperty("weather");
    expect(body).toHaveProperty("atmosphere");
    expect(body).toHaveProperty("wind");
    expect(body).toHaveProperty("sun");
    expect(body).toHaveProperty("alerts");
    expect(body).toHaveProperty("recommendations");
    expect(body).toHaveProperty("comfort");
  });

  test("should return error for missing location", async () => {
    mockEvent.pathParameters = {};

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");
    expect(body.message).toContain("could not be obtained");
  });

  test("should return enriched weather data with correct structure", async () => {
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);

    // Check location structure
    expect(body.location).toHaveProperty("city");
    expect(body.location).toHaveProperty("country");
    expect(body.location).toHaveProperty("coordinates");
    expect(body.location).toHaveProperty("timezone");
    expect(body.location).toHaveProperty("localTime");
    expect(body.location).toHaveProperty("isDaytime");
    expect(body.location.coordinates).toHaveProperty("lat");
    expect(body.location.coordinates).toHaveProperty("lon");

    // Check temperature structure
    expect(body.temperature).toHaveProperty("kelvin");
    expect(body.temperature).toHaveProperty("celsius");
    expect(body.temperature).toHaveProperty("fahrenheit");
    expect(body.temperature).toHaveProperty("feels_like");
    expect(body.temperature.feels_like).toHaveProperty("kelvin");
    expect(body.temperature.feels_like).toHaveProperty("celsius");
    expect(body.temperature.feels_like).toHaveProperty("fahrenheit");

    // Check weather structure
    expect(body.weather).toHaveProperty("condition");
    expect(body.weather).toHaveProperty("description");
    expect(body.weather).toHaveProperty("icon");
    expect(body.weather).toHaveProperty("severity");
    expect(body.weather).toHaveProperty("recommendation");

    // Check atmosphere structure
    expect(body.atmosphere).toHaveProperty("pressure");
    expect(body.atmosphere).toHaveProperty("humidity");
    expect(body.atmosphere).toHaveProperty("visibility");
    expect(body.atmosphere).toHaveProperty("clouds");

    // Check wind structure
    expect(body.wind).toHaveProperty("speed");
    expect(body.wind).toHaveProperty("direction");
    expect(body.wind).toHaveProperty("description");

    // Check sun structure
    expect(body.sun).toHaveProperty("sunrise");
    expect(body.sun).toHaveProperty("sunset");
    expect(body.sun).toHaveProperty("dayLength");

    // Check alerts structure
    expect(Array.isArray(body.alerts)).toBe(true);

    // Check recommendations structure
    expect(body.recommendations).toHaveProperty("clothing");
    expect(body.recommendations).toHaveProperty("activities");
    expect(body.recommendations).toHaveProperty("transport");
    expect(body.recommendations).toHaveProperty("health");

    // Check comfort structure
    expect(body.comfort).toHaveProperty("index");
    expect(body.comfort).toHaveProperty("level");
    expect(typeof body.comfort.index).toBe("number");
    expect(typeof body.comfort.level).toBe("string");
  });

  test("should handle different location formats", async () => {
    const testLocations = [
      { location: "New York,us", name: "New York" },
      { location: "Tokyo,jp", name: "Tokyo" },
      { location: "Paris,fr", name: "Paris" },
      { location: "Sydney,au", name: "Sydney" },
      { location: "Buenos Aires,ar", name: "Buenos Aires" }
    ];

    for (const testLocation of testLocations) {
      mockEvent.pathParameters = {
        location: testLocation.location
      };

      const response = await handler(mockEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty("location");
      expect(body).toHaveProperty("temperature");
      expect(body).toHaveProperty("weather");
    }
  });

  test("should validate location data types", async () => {
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);

    // Check numeric values
    expect(typeof body.temperature.kelvin).toBe("number");
    expect(typeof body.temperature.celsius).toBe("number");
    expect(typeof body.temperature.fahrenheit).toBe("number");
    expect(typeof body.atmosphere.pressure).toBe("number");
    expect(typeof body.atmosphere.humidity).toBe("number");
    expect(typeof body.wind.speed).toBe("number");
    expect(typeof body.wind.direction).toBe("number");
    expect(typeof body.comfort.index).toBe("number");

    // Check string values
    expect(typeof body.location.city).toBe("string");
    expect(typeof body.location.country).toBe("string");
    expect(typeof body.weather.condition).toBe("string");
    expect(typeof body.weather.description).toBe("string");
    expect(typeof body.wind.description).toBe("string");
    expect(typeof body.comfort.level).toBe("string");

    // Check boolean values
    expect(typeof body.location.isDaytime).toBe("boolean");
  });

  test("should handle edge case locations", async () => {
    const edgeCases = [
      { location: "A", name: "Single character" },
      { location: "123", name: "Numeric location" },
      { location: "NonExistentCity,xx", name: "Non-existent city" }
    ];

    for (const testCase of edgeCases) {
      mockEvent.pathParameters = {
        location: testCase.location
      };

      const response = await handler(mockEvent);

      // These should not crash, even if they return no results
      expect(response.statusCode).toBeDefined();
      expect(response.body).toBeDefined();
    }
  });

  test("should handle special characters in location names", async () => {
    const specialCases = [
      { location: "São Paulo,br", name: "São Paulo" },
      { location: "München,de", name: "München" },
      { location: "Côte d'Ivoire,ci", name: "Côte d'Ivoire" }
    ];

    for (const testCase of specialCases) {
      mockEvent.pathParameters = {
        location: testCase.location
      };

      const response = await handler(mockEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty("location");
      expect(body).toHaveProperty("temperature");
    }
  });
});
