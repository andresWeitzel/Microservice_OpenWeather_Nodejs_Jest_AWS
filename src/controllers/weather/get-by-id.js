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
const FILE_PATH_WEATHER_ID = "../../../data/json/weather/weather-id-data.json";

//vars
let eventPathParams;
let cityIdParam;
let axiosConfig;
let axiosResponse;

module.exports.handler = async (event) => {
  try {
    eventPathParams = event.pathParameters;
    cityIdParam = eventPathParams.cityId;

    // Validate city ID
    if (!cityIdParam) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        "City ID parameter is required"
      );
    }

    const cityId = parseInt(cityIdParam);

    if (isNaN(cityId) || cityId <= 0) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        "Invalid city ID. Must be a positive number"
      );
    }

    // Create cache key using city ID
    const cacheKey = `weather:id:${cityId}`;
    if (hasCachedWeatherData('cityId', cacheKey)) {
      console.log(`Using cached data for city ID: ${cityId}`);
      const cachedData = getCachedWeatherData('cityId', cacheKey);
      return await bodyResponse(OK_CODE, cachedData);
    }

    const URL = `${API_WEATHER_URL_BASE}id=${cityId}&appid=${API_KEY}`;

    console.log(`Fetching weather data for city ID: ${cityId}`);
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
        `Weather data could not be obtained for city ID ${cityId}`
      );
    }

    // Cache the successful response for 10 minutes
    setCachedWeatherData('cityId', cacheKey, axiosResponse, 10 * 60 * 1000);
    console.log(`Cached data for city ID: ${cityId}`);

    // Return response immediately
    const response = await bodyResponse(OK_CODE, axiosResponse);

    // Save data to JSON file asynchronously (fire and forget - don't wait for it)
    process.nextTick(() => {
      createJson(FILE_PATH_WEATHER_ID, axiosResponse).catch(error => {
        console.log("Warning: Failed to save weather ID data to JSON:", error.message);
      });
    });

    return response;
  } catch (error) {
    console.log("ERROR in weather by city ID handler:", error);
    return await bodyResponse(
      INTERNAL_SERVER_ERROR,
      `Error processing weather data for city ID ${cityIdParam}: ${error.message}`
    );
  }
}; 