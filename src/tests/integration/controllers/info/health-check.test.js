"use strict";

const { handler } = require("../../../../controllers/info/health/check");

describe("Health Check API Integration Tests", () => {
  let mockEvent;

  beforeEach(() => {
    mockEvent = {
      pathParameters: {},
      queryStringParameters: null
    };
  });

  test("should return health status with system information", async () => {
    const response = await handler(mockEvent);

    expect(response.statusCode).toBeDefined();
    expect(response.body).toBeDefined();

    const body = JSON.parse(response.body);
    
    // Check main structure
    expect(body).toHaveProperty("message");
    expect(body.message).toHaveProperty("status");
    expect(body.message).toHaveProperty("timestamp");
    expect(body.message).toHaveProperty("uptime");
    expect(body.message).toHaveProperty("memory");
    expect(body.message).toHaveProperty("api");
    expect(body.message).toHaveProperty("cache");
    expect(body.message).toHaveProperty("environment");

    // Check memory structure
    expect(body.message.memory).toHaveProperty("used");
    expect(body.message.memory).toHaveProperty("total");
    expect(body.message.memory).toHaveProperty("external");

    // Check API structure
    expect(body.message.api).toHaveProperty("status");
    expect(body.message.api).toHaveProperty("latency");
    expect(body.message.api).toHaveProperty("testLocation");

    // Check cache structure
    expect(body.message.cache).toHaveProperty("stats");
    expect(body.message.cache).toHaveProperty("entries");

    // Check environment structure
    expect(body.message.environment).toHaveProperty("nodeVersion");
    expect(body.message.environment).toHaveProperty("platform");
    expect(body.message.environment).toHaveProperty("arch");
  });

  test("should return valid data types", async () => {
    const response = await handler(mockEvent);
    const body = JSON.parse(response.body);

    // Check string values
    expect(typeof body.message.status).toBe("string");
    expect(typeof body.message.timestamp).toBe("string");
    expect(typeof body.message.api.status).toBe("string");
    expect(typeof body.message.api.testLocation).toBe("string");
    expect(typeof body.message.environment.nodeVersion).toBe("string");
    expect(typeof body.message.environment.platform).toBe("string");
    expect(typeof body.message.environment.arch).toBe("string");

    // Check numeric values
    expect(typeof body.message.uptime).toBe("number");
    expect(typeof body.message.api.latency).toBe("number");
    expect(typeof body.message.memory.used).toBe("number");
    expect(typeof body.message.memory.total).toBe("number");
    expect(typeof body.message.memory.external).toBe("number");
    expect(typeof body.message.cache.entries).toBe("number");

    // Check object values
    expect(typeof body.message.memory).toBe("object");
    expect(typeof body.message.api).toBe("object");
    expect(typeof body.message.cache).toBe("object");
    expect(typeof body.message.environment).toBe("object");
  });

  test("should return valid status values", async () => {
    const response = await handler(mockEvent);
    const body = JSON.parse(response.body);

    // Status should be one of the expected values
    expect(["healthy", "degraded", "unhealthy"]).toContain(body.message.status);
    
    // API status should be one of the expected values
    expect(["connected", "disconnected", "slow", "timeout"]).toContain(body.message.api.status);
  });

  test("should return valid timestamp format", async () => {
    const response = await handler(mockEvent);
    const body = JSON.parse(response.body);

    // Timestamp should be a valid ISO string
    expect(() => new Date(body.message.timestamp)).not.toThrow();
    expect(new Date(body.message.timestamp).toISOString()).toBe(body.message.timestamp);
  });

  test("should return positive numeric values", async () => {
    const response = await handler(mockEvent);
    const body = JSON.parse(response.body);

    // All numeric values should be positive
    expect(body.message.uptime).toBeGreaterThanOrEqual(0);
    expect(body.message.api.latency).toBeGreaterThanOrEqual(0);
    expect(body.message.memory.used).toBeGreaterThanOrEqual(0);
    expect(body.message.memory.total).toBeGreaterThanOrEqual(0);
    expect(body.message.memory.external).toBeGreaterThanOrEqual(0);
    expect(body.message.cache.entries).toBeGreaterThanOrEqual(0);
  });

  test("should handle errors gracefully", async () => {
    // Test with invalid event structure
    const invalidEvent = null;
    
    const response = await handler(invalidEvent);
    
    expect(response.statusCode).toBeDefined();
    expect(response.body).toBeDefined();
    
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("message");
    expect(body.message).toHaveProperty("status");
    expect(body.message).toHaveProperty("timestamp");
    // The health check handler is robust and doesn't fail with null events
    // It returns a healthy status even with invalid input
    expect(body.message.status).toBeDefined();
  });
});
