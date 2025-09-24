"use strict";

const { handler } = require("../../../../controllers/weather/get-by-coordinates-enhanced");

describe("Enhanced Weather Coordinates API Integration Tests", () => {
  let mockEvent;

  beforeEach(() => {
    mockEvent = {
      pathParameters: {
        lat: "51.5074",
        lon: "-0.1276"
      }
    };
  });

  test("should return enriched weather data for valid coordinates", async () => {
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

  test("should return error for invalid latitude", async () => {
    mockEvent.pathParameters.lat = "91"; // Invalid latitude

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");
    expect(body.message).toContain("Invalid latitude");
  });

  test("should return error for invalid longitude", async () => {
    mockEvent.pathParameters.lon = "181"; // Invalid longitude

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");
    expect(body.message).toContain("Invalid longitude");
  });

  test("should return error for non-numeric coordinates", async () => {
    mockEvent.pathParameters.lat = "invalid";
    mockEvent.pathParameters.lon = "123";

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");
    expect(body.message).toContain("Invalid coordinates");
  });

  test("should return error for missing latitude", async () => {
    mockEvent.pathParameters = {
      lon: "-0.1276"
    };

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");
    expect(body.message).toContain("Both latitude and longitude parameters are required");
  });

  test("should return error for missing longitude", async () => {
    mockEvent.pathParameters = {
      lat: "51.5074"
    };

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");
    expect(body.message).toContain("Both latitude and longitude parameters are required");
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

  test("should handle different coordinate ranges", async () => {
    const testCoordinates = [
      { lat: "40.7128", lon: "-74.0060", name: "New York" },
      { lat: "35.6762", lon: "139.6503", name: "Tokyo" },
      { lat: "48.8566", lon: "2.3522", name: "Paris" },
      { lat: "-34.6132", lon: "-58.3772", name: "Buenos Aires" },
      { lat: "-33.8688", lon: "151.2093", name: "Sydney" }
    ];

    for (const coords of testCoordinates) {
      mockEvent.pathParameters = {
        lat: coords.lat,
        lon: coords.lon
      };

      const response = await handler(mockEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty("location");
      expect(body).toHaveProperty("temperature");
      expect(body).toHaveProperty("weather");
    }
  });

  test("should validate coordinate data types", async () => {
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

  test("should handle edge case coordinates", async () => {
    const edgeCases = [
      { lat: "90", lon: "180", name: "North Pole edge" },
      { lat: "-90", lon: "-180", name: "South Pole edge" },
      { lat: "0", lon: "0", name: "Equator/Prime Meridian" }
    ];

    for (const coords of edgeCases) {
      mockEvent.pathParameters = {
        lat: coords.lat,
        lon: coords.lon
      };

      const response = await handler(mockEvent);

      // These might fail due to API limitations, but should not crash
      expect(response.statusCode).toBeDefined();
      expect(response.body).toBeDefined();
    }
  });
}); 