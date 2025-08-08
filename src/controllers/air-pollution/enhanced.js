"use strict";

//helpers
const { sendGetRequest } = require("../../helpers/axios/request/get");
const { statusCode } = require("../../enums/http/status-code");
const { bodyResponse } = require("../../helpers/http/body-response");
const { transformAirPollutionData } = require("../../helpers/weather/transform-air-pollution");
const { createJson } = require("../../helpers/file-system/create-json");

//const
const API_AIR_POLLUTION_URL_BASE = "https://api.openweathermap.org/data/2.5/air_pollution?";
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;
const FILE_PATH_AIR_POLLUTION_ENHANCED = "../../../data/json/air-pollution/air-pollution-enhanced-data.json";

//vars
let eventPathParams;
let countryParam;
let axiosConfig;
let axiosResponse;
let transformedData;
let coordinates;

module.exports.handler = async (event) => {
  try {
    eventPathParams = event.pathParameters;
    countryParam = eventPathParams.location;

    // First, we need to get coordinates for the city using geocoding
    const geocodingURL = `https://api.openweathermap.org/geo/1.0/direct?q=${countryParam}&limit=1&appid=${API_KEY}`;
    
    console.log("Enhanced Air Pollution API - Getting coordinates for:", countryParam);

    axiosConfig = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Get coordinates first
    const geocodingResponse = await sendGetRequest(geocodingURL, null, axiosConfig);

    if (!geocodingResponse || !geocodingResponse[0]) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        `Could not find coordinates for ${countryParam}`
      );
    }

    coordinates = geocodingResponse[0];
    const lat = coordinates.lat;
    const lon = coordinates.lon;

    // Now get air pollution data using coordinates
    const airPollutionURL = `${API_AIR_POLLUTION_URL_BASE}lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    console.log("Enhanced Air Pollution API - Requesting data for coordinates:", lat, lon);

    axiosResponse = await sendGetRequest(airPollutionURL, null, axiosConfig);

    if (axiosResponse == (null || undefined)) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        `Enhanced air pollution data could not be obtained for ${countryParam}`
      );
    }

    // Add location info to the response
    const enrichedResponse = {
      ...axiosResponse,
      location: {
        city: coordinates.name,
        country: coordinates.country,
        state: coordinates.state,
        coordinates: {
          lat: coordinates.lat,
          lon: coordinates.lon
        }
      }
    };

    // Transform the raw OpenWeather air pollution data into enriched format
    transformedData = await transformAirPollutionData(enrichedResponse);

    // Return the enriched air pollution data immediately
    const response = await bodyResponse(OK_CODE, transformedData);

    // Save enhanced data to JSON file asynchronously (fire and forget - don't wait for it)
    process.nextTick(() => {
      createJson(FILE_PATH_AIR_POLLUTION_ENHANCED, transformedData).catch(error => {
        console.log("Warning: Failed to save enhanced air pollution data to JSON:", error.message);
      });
    });

    return response;
  } catch (error) {
    console.log("ERROR in enhanced air pollution handler:", error);
    return await bodyResponse(
      INTERNAL_SERVER_ERROR,
      `Error processing enhanced air pollution data for ${countryParam}: ${error.message}`
    );
  }
}; 