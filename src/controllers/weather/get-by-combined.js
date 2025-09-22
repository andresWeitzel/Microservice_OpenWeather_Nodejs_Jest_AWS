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
const FILE_PATH_WEATHER_COMBINED = "../../../data/json/weather/weather-combined-data.json";

//vars
let eventPathParams;
let locationParam;
let unitsParam;
let languageParam;
let axiosConfig;
let axiosResponse;

module.exports.handler = async (event) => {
  try {
    eventPathParams = event.pathParameters;
    locationParam = eventPathParams.location;
    unitsParam = eventPathParams.units;
    languageParam = eventPathParams.language;

    // Validate location (required)
    if (!locationParam) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        "Location parameter is required"
      );
    }

    // Validate and clean the location name
    const cleanedLocation = validateAndCleanLocation(locationParam);
    console.log(`Weather combined API - Cleaned location: ${cleanedLocation}`);

    // Validate units parameter (optional, default to kelvin)
    const validUnits = ['metric', 'imperial', 'kelvin'];
    let units = 'kelvin'; // default
    if (unitsParam) {
      if (!validUnits.includes(unitsParam.toLowerCase())) {
        return await bodyResponse(
          BAD_REQUEST_CODE,
          `Invalid units parameter. Must be one of: ${validUnits.join(', ')}`
        );
      }
      units = unitsParam.toLowerCase();
    }

    // Validate language parameter (optional, default to english)
    const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh_cn', 'zh_tw', 'ar', 'hi', 'th', 'tr', 'vi'];
    let language = 'en'; // default
    if (languageParam) {
      if (!validLanguages.includes(languageParam.toLowerCase())) {
        return await bodyResponse(
          BAD_REQUEST_CODE,
          `Invalid language parameter. Must be one of: ${validLanguages.join(', ')}`
        );
      }
      language = languageParam.toLowerCase();
    }

    // Create cache key using all parameters
    const cacheKey = `weather:combined:${cleanedLocation}:${units}:${language}`;
    if (hasCachedWeatherData('combined', cacheKey)) {
      console.log(`Using cached data for location: ${cleanedLocation} with units: ${units} and language: ${language}`);
      const cachedData = getCachedWeatherData('combined', cacheKey);
      return await bodyResponse(OK_CODE, cachedData);
    }

    // Build URL with all parameters
    const URL = `${API_WEATHER_URL_BASE}q=${encodeURIComponent(cleanedLocation)}&units=${units}&lang=${language}&appid=${API_KEY}`;

    console.log(`Fetching weather data for location: ${cleanedLocation} with units: ${units} and language: ${language}`);
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
        `Weather data could not be obtained for ${locationParam} with units ${units} and language ${language}`
      );
    }

    // Cache the successful response for 10 minutes
    setCachedWeatherData('combined', cacheKey, axiosResponse.data, 10 * 60 * 1000);
    console.log(`Cached data for location: ${cleanedLocation} with units: ${units} and language: ${language}`);

    // Return response immediately
    const response = await bodyResponse(OK_CODE, axiosResponse.data);

    // Save data to JSON file asynchronously (fire and forget - don't wait for it)
    process.nextTick(() => {
      createJson(FILE_PATH_WEATHER_COMBINED, axiosResponse).catch(error => {
        console.log("Warning: Failed to save weather combined data to JSON:", error.message);
      });
    });

    return response;
  } catch (error) {
    console.log("ERROR in weather combined handler:", error);
    return await bodyResponse(
      INTERNAL_SERVER_ERROR,
      `Error processing weather data for ${locationParam}: ${error.message}`
    );
  }
}; 