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
const FILE_PATH_WEATHER_LANGUAGE = "../../../data/json/weather/weather-language-data.json";

//vars
let eventPathParams;
let locationParam;
let languageParam;
let axiosConfig;
let axiosResponse;

module.exports.handler = async (event) => {
  try {
    eventPathParams = event.pathParameters;
    locationParam = eventPathParams.location;
    languageParam = eventPathParams.language;

    // Validate location
    if (!locationParam) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        "Location parameter is required"
      );
    }

    // Validate and clean the location name
    const cleanedLocation = validateAndCleanLocation(locationParam);
    console.log(`Weather with language API - Cleaned location: ${cleanedLocation}`);

    // Validate language parameter
    const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh_cn', 'zh_tw', 'ar', 'hi', 'th', 'tr', 'vi'];
    if (!languageParam || !validLanguages.includes(languageParam.toLowerCase())) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        `Invalid language parameter. Must be one of: ${validLanguages.join(', ')}`
      );
    }

    const language = languageParam.toLowerCase();

    // Create cache key using location and language
    const cacheKey = `weather:lang:${cleanedLocation}:${language}`;
    if (hasCachedWeatherData('language', cacheKey)) {
      console.log(`Using cached data for location: ${cleanedLocation} with language: ${language}`);
      const cachedData = getCachedWeatherData('language', cacheKey);
      return await bodyResponse(OK_CODE, cachedData);
    }

    const URL = `${API_WEATHER_URL_BASE}q=${encodeURIComponent(cleanedLocation)}&lang=${language}&appid=${API_KEY}`;

    console.log(`Fetching weather data for location: ${cleanedLocation} with language: ${language}`);
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
        `Weather data could not be obtained for ${locationParam} with language ${language}`
      );
    }

    // Cache the successful response for 10 minutes
    setCachedWeatherData('language', cacheKey, axiosResponse, 10 * 60 * 1000);
    console.log(`Cached data for location: ${cleanedLocation} with language: ${language}`);

    // Return response immediately
    const response = await bodyResponse(OK_CODE, axiosResponse);

    // Save data to JSON file asynchronously (fire and forget - don't wait for it)
    process.nextTick(() => {
      createJson(FILE_PATH_WEATHER_LANGUAGE, axiosResponse).catch(error => {
        console.log("Warning: Failed to save weather language data to JSON:", error.message);
      });
    });

    return response;
  } catch (error) {
    console.log("ERROR in weather with language handler:", error);
    return await bodyResponse(
      INTERNAL_SERVER_ERROR,
      `Error processing weather data for ${locationParam} with language ${languageParam}: ${error.message}`
    );
  }
}; 