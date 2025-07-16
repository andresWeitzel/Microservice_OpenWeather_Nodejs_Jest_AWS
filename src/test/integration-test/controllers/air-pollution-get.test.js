"use strict";

const { handler } = require("../../../controllers/air-pollution/get");

describe("Air Pollution API Integration Tests", () => {
  let mockEvent;

  beforeEach(() => {
    mockEvent = {
      pathParameters: {
        country: "London"
      }
    };
  });

  test("should return air pollution data for valid city", async () => {
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("coord");
    expect(body).toHaveProperty("list");
    expect(body).toHaveProperty("location");
    expect(body.location).toHaveProperty("city");
    expect(body.location).toHaveProperty("country");
    expect(body.location).toHaveProperty("coordinates");
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

  test("should return air pollution data with correct structure", async () => {
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);

    // Check coord structure
    expect(body.coord).toHaveProperty("lon");
    expect(body.coord).toHaveProperty("lat");
    expect(typeof body.coord.lon).toBe("number");
    expect(typeof body.coord.lat).toBe("number");

    // Check list structure
    expect(Array.isArray(body.list)).toBe(true);
    expect(body.list.length).toBeGreaterThan(0);

    const firstItem = body.list[0];
    expect(firstItem).toHaveProperty("dt");
    expect(firstItem).toHaveProperty("main");
    expect(firstItem).toHaveProperty("components");

    // Check main structure
    expect(firstItem.main).toHaveProperty("aqi");
    expect(typeof firstItem.main.aqi).toBe("number");

    // Check components structure
    expect(firstItem.components).toHaveProperty("co");
    expect(firstItem.components).toHaveProperty("no");
    expect(firstItem.components).toHaveProperty("no2");
    expect(firstItem.components).toHaveProperty("o3");
    expect(firstItem.components).toHaveProperty("so2");
    expect(firstItem.components).toHaveProperty("pm2_5");
    expect(firstItem.components).toHaveProperty("pm10");
    expect(firstItem.components).toHaveProperty("nh3");

    // Check location structure
    expect(body.location).toHaveProperty("city");
    expect(body.location).toHaveProperty("country");
    expect(body.location).toHaveProperty("coordinates");
    expect(body.location.coordinates).toHaveProperty("lat");
    expect(body.location.coordinates).toHaveProperty("lon");
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