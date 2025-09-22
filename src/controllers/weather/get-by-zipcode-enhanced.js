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
const FILE_PATH_WEATHER_ZIPCODE_ENHANCED = "../../../data/json/weather/weather-zipcode-enhanced-data.json";

//vars
let eventPathParams;
let zipcodeParam;
let countryCodeParam;
let axiosConfig;
let axiosResponse;
let transformedData;

module.exports.handler = async (event) => {
  try {
    eventPathParams = event.pathParameters;
    zipcodeParam = eventPathParams.zipcode;
    countryCodeParam = eventPathParams.countryCode;

    // Validate zipcode
    if (!zipcodeParam) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        "Zipcode parameter is required"
      );
    }

    // Validate zipcode format (more flexible validation for international zipcodes)
    if (!/^[A-Za-z0-9\s\-\.\,]+$/.test(zipcodeParam) || zipcodeParam.length < 2 || zipcodeParam.length > 20) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        "Invalid zipcode format. Please provide a valid zipcode (2-20 characters, letters, numbers, spaces, hyphens, dots, and commas allowed)"
      );
    }

    // Validate country code (required)
    if (!countryCodeParam) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        "Country code parameter is required"
      );
    }

    // Create cache key using zipcode and country code
    const cacheKey = `weather-enhanced:zip:${zipcodeParam}:${countryCodeParam}`;
    if (hasCachedWeatherData('zipcode-enhanced', cacheKey)) {
      console.log(`Using cached enhanced data for zipcode: ${zipcodeParam}`);
      const cachedData = getCachedWeatherData('zipcode-enhanced', cacheKey);
      return await bodyResponse(OK_CODE, cachedData);
    }

    // Build URL with country code
    const URL = `${API_WEATHER_URL_BASE}zip=${zipcodeParam},${countryCodeParam}&appid=${API_KEY}`;

    console.log(`Enhanced Weather API - Requesting data for zipcode: ${zipcodeParam}`);
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
        `Enhanced weather data could not be obtained for zipcode ${zipcodeParam}`
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
        `Failed to process weather data for zipcode ${zipcodeParam}: ${transformError.message}`
      );
    }

    // Cache the enhanced data for 10 minutes
    setCachedWeatherData('zipcode-enhanced', cacheKey, transformedData, 10 * 60 * 1000);
    console.log(`Cached enhanced data for zipcode: ${zipcodeParam}`);

    // Return the enriched weather data immediately
    const response = await bodyResponse(OK_CODE, transformedData);

    // Save enhanced data to JSON file asynchronously (fire and forget - don't wait for it)
    process.nextTick(() => {
      createJson(FILE_PATH_WEATHER_ZIPCODE_ENHANCED, transformedData).catch(error => {
        console.log("Warning: Failed to save enhanced weather zipcode data to JSON:", error.message);
      });
    });

    return response;
  } catch (error) {
    console.log("ERROR in enhanced weather zipcode handler:", error);
    return await bodyResponse(
      INTERNAL_SERVER_ERROR,
      `Error processing enhanced weather data for zipcode ${zipcodeParam}: ${error.message}`
    );
  }
}; 