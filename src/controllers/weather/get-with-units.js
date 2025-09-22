"use strict";

//helpers
const { sendGetRequest } = require("../../helpers/axios/request/get");
const { statusCode } = require("../../enums/http/status-code");
const { createJson } = require("../../helpers/file-system/create-json");
const { bodyResponse } = require("../../helpers/http/body-response");
const { getCachedWeatherData, setCachedWeatherData, hasCachedWeatherData } = require("../../helpers/cache/simple-cache");
const { validateAndCleanLocation } = require("../../helpers/weather/validate-location");

//const
const API_WEATHER_URL_BASE = "https://api.openweathermap.org/data/2.5/weather?";
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;
const FILE_PATH_WEATHER_UNITS = "../../../data/json/weather/weather-units-data.json";

//vars
let eventPathParams;
let locationParam;
let unitsParam;
let axiosConfig;
let axiosResponse;

module.exports.handler = async (event) => {
  try {
    eventPathParams = event.pathParameters;
    locationParam = eventPathParams.location;
    unitsParam = eventPathParams.units;

    // Validate location
    if (!locationParam) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        "Location parameter is required"
      );
    }

    // Validate and clean the location name
    const cleanedLocation = validateAndCleanLocation(locationParam);
    console.log(`Weather with units API - Cleaned location: ${cleanedLocation}`);

    // Validate units parameter
    const validUnits = ['metric', 'imperial', 'kelvin'];
    if (!unitsParam || !validUnits.includes(unitsParam.toLowerCase())) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        `Invalid units parameter. Must be one of: ${validUnits.join(', ')}`
      );
    }

    const units = unitsParam.toLowerCase();

    // Create cache key using location and units
    const cacheKey = `weather:units:${cleanedLocation}:${units}`;
    if (hasCachedWeatherData('units', cacheKey)) {
      console.log(`Using cached data for location: ${cleanedLocation} with units: ${units}`);
      const cachedData = getCachedWeatherData('units', cacheKey);
      return await bodyResponse(OK_CODE, cachedData);
    }

    const URL = `${API_WEATHER_URL_BASE}q=${encodeURIComponent(cleanedLocation)}&units=${units}&appid=${API_KEY}`;

    console.log(`Fetching weather data for location: ${cleanedLocation} with units: ${units}`);
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
        `Weather data could not be obtained for ${locationParam} with units ${units}`
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
    setCachedWeatherData('units', cacheKey, weatherData, 10 * 60 * 1000);
    console.log(`Cached data for location: ${cleanedLocation} with units: ${units}`);

    // Return response immediately
    const response = await bodyResponse(OK_CODE, weatherData);

    // Save data to JSON file asynchronously (fire and forget - don't wait for it)
    process.nextTick(() => {
      createJson(FILE_PATH_WEATHER_UNITS, weatherData).catch(error => {
        console.log("Warning: Failed to save weather units data to JSON:", error.message);
      });
    });

    return response;
  } catch (error) {
    console.log("ERROR in weather with units handler:", error);
    return await bodyResponse(
      INTERNAL_SERVER_ERROR,
      `Error processing weather data for ${locationParam} with units ${unitsParam}: ${error.message}`
    );
  }
}; 