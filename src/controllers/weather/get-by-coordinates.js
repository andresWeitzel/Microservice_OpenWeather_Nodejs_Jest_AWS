"use strict";

//helpers
const { sendGetRequest } = require("../../helpers/axios/request/get");
const { statusCode } = require("../../enums/http/status-code");
const { createJson } = require("../../helpers/file-system/create-json");
const { bodyResponse } = require("../../helpers/http/body-response");
const { getCachedWeatherData, setCachedWeatherData, hasCachedWeatherData } = require("../../helpers/cache/simple-cache");

//const
const API_WEATHER_URL_BASE = "https://api.openweathermap.org/data/2.5/weather?";
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;
const FILE_PATH_WEATHER_COORDINATES = "../../../data/json/weather/weather-coordinates-data.json";

//vars
let eventPathParams;
let latParam;
let lonParam;
let axiosConfig;
let axiosResponse;

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
    const cacheKey = `weather:${lat}:${lon}`;
    if (hasCachedWeatherData('coordinates', cacheKey)) {
      console.log(`Using cached data for coordinates: ${lat}, ${lon}`);
      const cachedData = getCachedWeatherData('coordinates', cacheKey);
      return await bodyResponse(OK_CODE, cachedData);
    }

    const URL = `${API_WEATHER_URL_BASE}lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    console.log(`Fetching weather data for coordinates: ${lat}, ${lon}`);
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
        `Weather data could not be obtained for coordinates ${lat}, ${lon}`
      );
    }

    // Extract the data from axios response
    const weatherData = axiosResponse?.data || axiosResponse;

    // Check if the response contains an error from OpenWeather API
    if (weatherData.cod && weatherData.cod !== 200) {
      console.log("OpenWeather API Error:", weatherData);
      return await bodyResponse(
        BAD_REQUEST_CODE,
        `OpenWeather API error: ${weatherData.message || 'Unknown error'}`
      );
    }

    // Cache the successful response for 10 minutes
    setCachedWeatherData('coordinates', cacheKey, weatherData, 10 * 60 * 1000);
    console.log(`Cached data for coordinates: ${lat}, ${lon}`);

    // Return response immediately
    const response = await bodyResponse(OK_CODE, weatherData);

    // Save data to JSON file asynchronously (fire and forget - don't wait for it)
    process.nextTick(() => {
      createJson(FILE_PATH_WEATHER_COORDINATES, weatherData).catch(error => {
        console.log("Warning: Failed to save weather coordinates data to JSON:", error.message);
      });
    });

    return response;
  } catch (error) {
    console.log("ERROR in weather by coordinates handler:", error);
    return await bodyResponse(
      INTERNAL_SERVER_ERROR,
      `Error processing weather data for coordinates ${latParam}, ${lonParam}: ${error.message}`
    );
  }
}; 