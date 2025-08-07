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
      console.log(`Using cached enhanced data for coordinates: ${lat}, ${lon}`);
      const cachedData = getCachedWeatherData('coordinates-enhanced', cacheKey);
      return await bodyResponse(OK_CODE, cachedData);
    }

    const URL = `${API_WEATHER_URL_BASE}lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    console.log(`Enhanced Weather API - Requesting data for coordinates: ${lat}, ${lon}`);
    console.log(URL);

    axiosConfig = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    axiosResponse = await sendGetRequest(URL, null, axiosConfig);

    if (axiosResponse == (null || undefined)) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        `Enhanced weather data could not be obtained for coordinates ${lat}, ${lon}`
      );
    }

    // Transform the raw OpenWeather data into enriched format
    transformedData = await transformWeatherData(axiosResponse);

    // Cache the enhanced data for 10 minutes
    setCachedWeatherData('coordinates-enhanced', cacheKey, transformedData, 10 * 60 * 1000);
    console.log(`Cached enhanced data for coordinates: ${lat}, ${lon}`);

    // Save enhanced data to JSON file asynchronously (don't wait for it)
    createJson(FILE_PATH_WEATHER_COORDINATES_ENHANCED, transformedData).catch(error => {
      console.log("Warning: Failed to save enhanced weather coordinates data to JSON:", error.message);
    });

    // Return the enriched weather data immediately
    return await bodyResponse(OK_CODE, transformedData);
  } catch (error) {
    console.log("ERROR in enhanced weather coordinates handler:", error);
    return await bodyResponse(
      INTERNAL_SERVER_ERROR,
      `Error processing enhanced weather data for coordinates ${latParam}, ${lonParam}: ${error.message}`
    );
  }
}; 