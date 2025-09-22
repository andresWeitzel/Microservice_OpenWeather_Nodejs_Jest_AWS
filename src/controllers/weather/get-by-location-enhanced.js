"use strict";

//helpers
const { sendGetRequest } = require("../../helpers/axios/request/get");
const { statusCode } = require("../../enums/http/status-code");
const { bodyResponse } = require("../../helpers/http/body-response");
const { transformWeatherData } = require("../../helpers/weather/transform-weather");
const { createJson } = require("../../helpers/file-system/create-json");

//const
const API_WEATHER_URL_BASE = process.env.API_WEATHER_URL_BASE;
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;
const FILE_PATH_WEATHER_ENHANCED = "../../../data/json/weather/weather-location-enhanced-data.json";

//vars
let eventPathParams;
let countryParam;
let axiosConfig;
let axiosResponse;
let transformedData;

module.exports.handler = async (event) => {
  try {
    eventPathParams = event.pathParameters;
    countryParam = eventPathParams.location;

    const URL = API_WEATHER_URL_BASE + countryParam + "&appid=" + API_KEY;

    console.log("Enhanced Weather API - Requesting data for:", countryParam);

    axiosConfig = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    axiosResponse = await sendGetRequest(URL, null, axiosConfig);

    if (axiosResponse == (null || undefined)) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        `Enhanced weather data could not be obtained for ${countryParam}`
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
        `Failed to process weather data for location ${countryParam}: ${transformError.message}`
      );
    }

    // Return the enriched weather data immediately
    const response = await bodyResponse(OK_CODE, transformedData);

    // Save enhanced data to JSON file asynchronously (fire and forget - don't wait for it)
    process.nextTick(() => {
      createJson(FILE_PATH_WEATHER_ENHANCED, transformedData).catch(error => {
        console.log("Warning: Failed to save enhanced weather data to JSON:", error.message);
      });
    });

    return response;
  } catch (error) {
    console.log("ERROR in enhanced weather handler:", error);
    return await bodyResponse(
      INTERNAL_SERVER_ERROR,
      `Error processing enhanced weather data for ${countryParam}: ${error.message}`
    );
  }
}; 