"use strict";

//helpers
const { sendGetRequest } = require("../../helpers/axios/request/get");
const { statusCode } = require("../../enums/http/status-code");
const { bodyResponse } = require("../../helpers/http/body-response");
const { transformWeatherData } = require("../../helpers/weather/transform-weather");
const { createJson } = require("../../helpers/file-system/create-json");
const { getCachedWeatherData, setCachedWeatherData, hasCachedWeatherData } = require("../../helpers/cache/simple-cache");
const { validateAndCleanLocation } = require("../../helpers/weather/validate-location");

//const
const API_WEATHER_URL_BASE = "https://api.openweathermap.org/data/2.5/weather?";
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;
const FILE_PATH_WEATHER_COMBINED_ENHANCED = "../../../data/json/weather/weather-combined-enhanced-data.json";

//vars
let eventPathParams;
let locationParam;
let unitsParam;
let languageParam;
let axiosConfig;
let axiosResponse;
let transformedData;

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
    console.log(`Enhanced Weather combined API - Cleaned location: ${cleanedLocation}`);

    // Validate units parameter (required)
    const validUnits = ['metric', 'imperial', 'kelvin'];
    if (!unitsParam || !validUnits.includes(unitsParam.toLowerCase())) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        `Invalid units parameter. Must be one of: ${validUnits.join(', ')}`
      );
    }
    const units = unitsParam.toLowerCase();

    // Validate language parameter (required)
    const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh_cn', 'zh_tw', 'ar', 'hi', 'th', 'tr', 'vi'];
    if (!languageParam || !validLanguages.includes(languageParam.toLowerCase())) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        `Invalid language parameter. Must be one of: ${validLanguages.join(', ')}`
      );
    }
    const language = languageParam.toLowerCase();

    // Create cache key using all parameters
    const cacheKey = `weather-enhanced:combined:${cleanedLocation}:${units}:${language}`;
    if (hasCachedWeatherData('combined-enhanced', cacheKey)) {
      console.log(`Using cached enhanced data for location: ${cleanedLocation} with units: ${units} and language: ${language}`);
      const cachedData = getCachedWeatherData('combined-enhanced', cacheKey);
      return await bodyResponse(OK_CODE, cachedData);
    }

    // Build URL with all parameters
    const URL = `${API_WEATHER_URL_BASE}q=${encodeURIComponent(cleanedLocation)}&units=${units}&lang=${language}&appid=${API_KEY}`;

    console.log(`Enhanced Weather API - Requesting data for location: ${cleanedLocation} with units: ${units} and language: ${language}`);
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
        `Enhanced weather data could not be obtained for ${locationParam} with units ${units} and language ${language}`
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

    // Transform the raw OpenWeather data into enriched format
    try {
      transformedData = await transformWeatherData(weatherData);
    } catch (transformError) {
      console.log("Error transforming weather data:", transformError);
      return await bodyResponse(
        BAD_REQUEST_CODE,
        `Failed to process weather data for location ${locationParam}: ${transformError.message}`
      );
    }

    // Cache the enhanced data for 10 minutes
    setCachedWeatherData('combined-enhanced', cacheKey, transformedData, 10 * 60 * 1000);
    console.log(`Cached enhanced data for location: ${cleanedLocation} with units: ${units} and language: ${language}`);

    // Return the enriched weather data immediately
    const response = await bodyResponse(OK_CODE, transformedData);

    // Save enhanced data to JSON file asynchronously (fire and forget - don't wait for it)
    process.nextTick(() => {
      createJson(FILE_PATH_WEATHER_COMBINED_ENHANCED, transformedData).catch(error => {
        console.log("Warning: Failed to save enhanced weather combined data to JSON:", error.message);
      });
    });

    return response;
  } catch (error) {
    console.log("ERROR in enhanced weather combined handler:", error);
    return await bodyResponse(
      INTERNAL_SERVER_ERROR,
      `Error processing enhanced weather data for ${locationParam}: ${error.message}`
    );
  }
}; 