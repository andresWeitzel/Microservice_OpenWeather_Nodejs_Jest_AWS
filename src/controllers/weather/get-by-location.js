"use strict";
//helpers
const { sendGetRequest } = require("../../helpers/axios/request/get");
const { statusCode } = require("../../enums/http/status-code");
const { createJson } = require("../../helpers/file-system/create-json");
const { bodyResponse } = require("../../helpers/http/body-response");
const { getCachedWeatherData, setCachedWeatherData, hasCachedWeatherData } = require("../../helpers/cache/simple-cache");
const { validateAndCleanLocation } = require("../../helpers/weather/validate-location");
//const
const API_WEATHER_URL_BASE = process.env.API_WEATHER_URL_BASE;
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;
const FILE_PATH_WEATHER_CONDITION =
  "../../../data/json/weather/weather-location-data.json";
//vars
let eventPathParams;
let countryParam;
let axiosConfig;
let axiosResponse;

module.exports.handler = async (event) => {
  try {
    eventPathParams = event.pathParameters;
    countryParam = eventPathParams.location;

    // Validate and clean the location name
    const cleanedLocation = validateAndCleanLocation(countryParam);
    console.log(`Weather API - Cleaned location: ${cleanedLocation}`);

    // Check cache first using the cleaned location
    const cacheKey = `weather:${cleanedLocation}`;
    if (hasCachedWeatherData('current', cleanedLocation)) {
      console.log(`Using cached data for: ${cleanedLocation}`);
      const cachedData = getCachedWeatherData('current', cleanedLocation);
      return await bodyResponse(OK_CODE, cachedData);
    }

    const URL = API_WEATHER_URL_BASE + cleanedLocation + "&appid=" + API_KEY;

    console.log(`Fetching fresh data for: ${cleanedLocation}`);
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
        `Data could not be obtained for ${countryParam}`
      );
    }

    // Cache the successful response for 10 minutes using the cleaned location
    setCachedWeatherData('current', cleanedLocation, axiosResponse.data, 10 * 60 * 1000);
    console.log(`Cached data for: ${cleanedLocation}`);

    // Return response immediately
    const response = await bodyResponse(OK_CODE, axiosResponse.data);

    // Save data to JSON file asynchronously (fire and forget - don't wait for it)
    process.nextTick(() => {
      createJson(FILE_PATH_WEATHER_CONDITION, axiosResponse.data).catch(error => {
        console.log("Warning: Failed to save weather data to JSON:", error.message);
      });
    });

    return response;
  } catch (error) {
    console.log(error);
  }
}; 