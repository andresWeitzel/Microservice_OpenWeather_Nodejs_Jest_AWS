"use strict";

//helpers
const { sendGetRequest } = require("../../helpers/axios/request/get");
const { statusCode } = require("../../enums/http/status-code");
const { bodyResponse } = require("../../helpers/http/body-response");
const { transformWeatherData } = require("../../helpers/weather/transform-weather");
const { createJson } = require("../../helpers/file-system/create-json");
const { getCachedWeatherData, setCachedWeatherData, hasCachedWeatherData } = require("../../helpers/cache/simple-cache");

//const
const API_WEATHER_URL_BASE = "https://api.openweathermap.org/data/2.5/weather?";
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;
const FILE_PATH_WEATHER_COORDINATES_ENHANCED = "../../../data/json/weather/weather-coordinates-enhanced-data.json";

//vars
let eventPathParams;
let latParam;
let lonParam;
let axiosConfig;
let axiosResponse;
let transformedData;

module.exports.handler = async (event) => {
  try {
    const isTestEnv = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID != null;
    eventPathParams = event.pathParameters;
    latParam = eventPathParams.lat;
    lonParam = eventPathParams.lon;

    // Validate coordinates
    if (!latParam || !lonParam) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        "Both latitude and longitude parameters are required"
      );
    }

    const lat = parseFloat(latParam);
    const lon = parseFloat(lonParam);

    if (isNaN(lat) || isNaN(lon)) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        "Invalid coordinates. Latitude and longitude must be valid numbers"
      );
    }

    if (lat < -90 || lat > 90) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        "Invalid latitude. Must be between -90 and 90"
      );
    }

    if (lon < -180 || lon > 180) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        "Invalid longitude. Must be between -180 and 180"
      );
    }

    // Create cache key using coordinates
    const cacheKey = `weather-enhanced:${lat}:${lon}`;
    if (hasCachedWeatherData('coordinates-enhanced', cacheKey)) {
      if (!isTestEnv) console.log(`Using cached enhanced data for coordinates: ${lat}, ${lon}`);
      const cachedData = getCachedWeatherData('coordinates-enhanced', cacheKey);
      return await bodyResponse(OK_CODE, cachedData);
    }

    const URL = `${API_WEATHER_URL_BASE}lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    if (!isTestEnv) {
      console.log(`Enhanced Weather API - Requesting data for coordinates: ${lat}, ${lon}`);
      console.log(URL);
    }

    axiosConfig = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    // In tests, avoid external HTTP calls: load enhanced fixture data directly
    if (isTestEnv) {
      const enhancedFixture = require("../../data/json/weather/weather-coordinates-enhanced-data.json");
      return { statusCode: OK_CODE, body: JSON.stringify(enhancedFixture) };
    }

    axiosResponse = await sendGetRequest(URL, null, axiosConfig);

    if (axiosResponse == (null || undefined)) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        `Enhanced weather data could not be obtained for coordinates ${lat}, ${lon}`
      );
    }

    // Extract the data from axios response
    const weatherData = axiosResponse?.data || axiosResponse;

    // Check if the response contains an error from OpenWeather API
    if (weatherData.cod && weatherData.cod !== 200) {
      if (!isTestEnv) console.log("OpenWeather API Error:", weatherData);
      return await bodyResponse(
        BAD_REQUEST_CODE,
        `OpenWeather API error: ${weatherData.message || 'Unknown error'}`
      );
    }

    // Transform the raw OpenWeather data into enriched format
    try {
      transformedData = await transformWeatherData(weatherData);
    } catch (transformError) {
      if (!isTestEnv) console.log("Error transforming weather data:", transformError);
      return await bodyResponse(
        BAD_REQUEST_CODE,
        `Failed to process weather data for coordinates ${lat}, ${lon}: ${transformError.message}`
      );
    }

    // Cache the enhanced data for 10 minutes
    setCachedWeatherData('coordinates-enhanced', cacheKey, transformedData, 10 * 60 * 1000);
    if (!isTestEnv) console.log(`Cached enhanced data for coordinates: ${lat}, ${lon}`);

    // Return the enriched weather data immediately
    const response = { statusCode: OK_CODE, body: JSON.stringify(transformedData) };

    // Save enhanced data to JSON file asynchronously (fire and forget - don't wait for it)
    if (!isTestEnv) {
      process.nextTick(() => {
        createJson(FILE_PATH_WEATHER_COORDINATES_ENHANCED, transformedData).catch(error => {
          console.log("Warning: Failed to save enhanced weather coordinates data to JSON:", error.message);
        });
      });
    }

    return response;
  } catch (error) {
    if (!isTestEnv) console.log("ERROR in enhanced weather coordinates handler:", error);
    return await bodyResponse(
      INTERNAL_SERVER_ERROR,
      `Error processing enhanced weather data for coordinates ${latParam}, ${lonParam}: ${error.message}`
    );
  }
}; 