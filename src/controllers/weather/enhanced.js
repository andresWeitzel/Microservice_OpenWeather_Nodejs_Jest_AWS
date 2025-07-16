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
const FILE_PATH_WEATHER_ENHANCED = "../../../data/json/weather/weather-enhanced-data.json";

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

    // Transform the raw OpenWeather data into enriched format
    transformedData = await transformWeatherData(axiosResponse);

    // Save enhanced data to JSON file asynchronously (don't wait for it)
    createJson(FILE_PATH_WEATHER_ENHANCED, transformedData).catch(error => {
      console.log("Warning: Failed to save enhanced weather data to JSON:", error.message);
    });

    // Return the enriched weather data immediately
    return await bodyResponse(OK_CODE, transformedData);
  } catch (error) {
    console.log("ERROR in enhanced weather handler:", error);
    return await bodyResponse(
      INTERNAL_SERVER_ERROR,
      `Error processing enhanced weather data for ${countryParam}: ${error.message}`
    );
  }
}; 