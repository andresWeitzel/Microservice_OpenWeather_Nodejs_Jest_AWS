"use strict";
//helpers
const { sendGetRequest } = require("../../helpers/axios/request/get");
const { statusCode } = require("../../enums/http/status-code");
const { createJson } = require("../../helpers/file-system/create-json");
const { bodyResponse } = require("../../helpers/http/body-response");
const { getCachedWeatherData, setCachedWeatherData, hasCachedWeatherData } = require("../../helpers/cache/simple-cache");
//const
const API_WEATHER_URL_BASE = process.env.API_WEATHER_URL_BASE;
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;
const FILE_PATH_WEATHER_CONDITION =
  "../../../data/json/weather/weather-data.json";
//vars
let eventPathParams;
let countryParam;
let axiosConfig;
let axiosResponse;
let jsonResponse;

module.exports.handler = async (event) => {
  try {
    eventPathParams = event.pathParameters;
    countryParam = eventPathParams.location;

    // Check cache first
    const cacheKey = `weather:${countryParam}`;
    if (hasCachedWeatherData('current', countryParam)) {
      console.log(`Using cached data for: ${countryParam}`);
      const cachedData = getCachedWeatherData('current', countryParam);
      return await bodyResponse(OK_CODE, cachedData);
    }

    const URL = API_WEATHER_URL_BASE + countryParam + "&appid=" + API_KEY;

    console.log(`Fetching fresh data for: ${countryParam}`);
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
        `Data could not be obtained by country ${countryParam}`
      );
    }

    // Cache the successful response for 10 minutes
    setCachedWeatherData('current', countryParam, axiosResponse, 10 * 60 * 1000);
    console.log(`Cached data for: ${countryParam}`);

    // Save data to JSON file asynchronously (don't wait for it)
    createJson(FILE_PATH_WEATHER_CONDITION, axiosResponse).catch(error => {
      console.log("Warning: Failed to save weather data to JSON:", error.message);
    });

    return await bodyResponse(OK_CODE, axiosResponse);
  } catch (error) {
    console.log(error);
  }
}; 