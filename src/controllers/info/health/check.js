"use strict";

//helpers
const { sendGetRequest } = require("../../../helpers/axios/request/get");
const { statusCode } = require("../../../enums/http/status-code");
const { bodyResponse } = require("../../../helpers/http/body-response");
const { cache } = require("../../../helpers/cache/simple-cache");

//const
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;

module.exports.handler = async (event) => {
  try {
    const isTestEnv = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID != null;
    const startTime = Date.now();
    
    // Test OpenWeather API connectivity
    const testURL = `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${API_KEY}`;
    
    if (!isTestEnv) {
      console.log("Health Check - Testing OpenWeather API connectivity");
    }
    
    const axiosConfig = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const apiResponse = await sendGetRequest(testURL, null, axiosConfig, 1); // Only 1 retry for health check
    const apiLatency = Date.now() - startTime;

    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      api: {
        status: apiResponse ? "connected" : "disconnected",
        latency: apiLatency,
        testLocation: "London"
      },
      cache: {
        stats: cache.getStats(),
        entries: cache.cache.size
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    // Determine overall health status
    if (!apiResponse || apiLatency > 10000) {
      healthStatus.status = "degraded";
      healthStatus.api.status = "slow";
    }

    if (apiLatency > 15000) {
      healthStatus.status = "unhealthy";
      healthStatus.api.status = "timeout";
    }

    const statusCode = healthStatus.status === "healthy" ? OK_CODE : INTERNAL_SERVER_ERROR;

    return await bodyResponse(statusCode, healthStatus);
  } catch (error) {
    if (!isTestEnv) {
      console.log("ERROR in health check handler:", error);
    }
    
    const errorStatus = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      error: error.message,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };

    return await bodyResponse(INTERNAL_SERVER_ERROR, errorStatus);
  }
}; 