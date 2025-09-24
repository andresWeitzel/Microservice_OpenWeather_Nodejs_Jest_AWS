"use strict";

const { handler } = require("../../../../controllers/weather/get-by-zipcode-enhanced");

describe("Enhanced Weather Zipcode API Integration Tests", () => {
  let mockEvent;

  beforeEach(() => {
    mockEvent = {
      pathParameters: {
        zipcode: "10001",
        countryCode: "us"
      }
    };
  });

  test("should return enriched weather data for valid zipcode and country code", async () => {
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

  test("should return error for missing zipcode", async () => {
    mockEvent.pathParameters = {
      countryCode: "us"
    };

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");
    expect(body.message).toContain("Zipcode parameter is required");
  });

  test("should return error for missing country code", async () => {
    mockEvent.pathParameters = {
      zipcode: "10001"
    };

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");
    expect(body.message).toContain("Country code parameter is required");
  });

  test("should return error for invalid zipcode format", async () => {
    mockEvent.pathParameters = {
      zipcode: "!@#$%",
      countryCode: "us"
    };

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");
    expect(body.message).toContain("Invalid zipcode format");
  });

  test("should return error for zipcode too short", async () => {
    mockEvent.pathParameters = {
      zipcode: "1",
      countryCode: "us"
    };

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");
    expect(body.message).toContain("Invalid zipcode format");
  });

  test("should return error for zipcode too long", async () => {
    mockEvent.pathParameters = {
      zipcode: "123456789012345678901",
      countryCode: "us"
    };

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");
    expect(body.message).toContain("Invalid zipcode format");
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

  test("should handle different zipcode formats", async () => {
    const testZipcodes = [
      { zipcode: "10001", countryCode: "us", name: "US ZIP code" },
      { zipcode: "SW1A 1AA", countryCode: "gb", name: "UK postal code" },
      { zipcode: "75001", countryCode: "fr", name: "French postal code" },
      { zipcode: "100-0001", countryCode: "jp", name: "Japanese postal code" },
      { zipcode: "2000", countryCode: "au", name: "Australian postal code" }
    ];

    for (const testZipcode of testZipcodes) {
      mockEvent.pathParameters = {
        zipcode: testZipcode.zipcode,
        countryCode: testZipcode.countryCode
      };

      const response = await handler(mockEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty("location");
      expect(body).toHaveProperty("temperature");
      expect(body).toHaveProperty("weather");
    }
  });

  test("should validate zipcode data types", async () => {
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

  test("should handle edge case zipcodes", async () => {
    const edgeCases = [
      { zipcode: "12", countryCode: "us", name: "Minimum length" },
      { zipcode: "12345678901234567890", countryCode: "us", name: "Maximum length" },
      { zipcode: "123-456", countryCode: "us", name: "With hyphen" },
      { zipcode: "123 456", countryCode: "us", name: "With space" },
      { zipcode: "123.456", countryCode: "us", name: "With dot" }
    ];

    for (const testCase of edgeCases) {
      mockEvent.pathParameters = {
        zipcode: testCase.zipcode,
        countryCode: testCase.countryCode
      };

      const response = await handler(mockEvent);

      // These should not crash, even if they return no results
      expect(response.statusCode).toBeDefined();
      expect(response.body).toBeDefined();
    }
  });

  test("should handle special characters in zipcodes", async () => {
    const specialCases = [
      { zipcode: "SW1A 1AA", countryCode: "gb", name: "UK format" },
      { zipcode: "100-0001", countryCode: "jp", name: "Japanese format" },
      { zipcode: "123-456", countryCode: "us", name: "US format with hyphen" }
    ];

    for (const testCase of specialCases) {
      mockEvent.pathParameters = {
        zipcode: testCase.zipcode,
        countryCode: testCase.countryCode
      };

      const response = await handler(mockEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty("location");
      expect(body).toHaveProperty("temperature");
    }
  });
});
