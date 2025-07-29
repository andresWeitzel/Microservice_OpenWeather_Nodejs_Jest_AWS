"use strict";

//helpers
const { sendGetRequest } = require("../../helpers/axios/request/get");
const { statusCode } = require("../../enums/http/status-code");
const { createJson } = require("../../helpers/file-system/create-json");
const { bodyResponse } = require("../../helpers/http/body-response");
const { validateAndCleanLocation, getLocationSuggestions } = require("../../helpers/weather/validate-location");

//const
const API_FORECAST_URL_BASE = "https://api.openweathermap.org/data/2.5/forecast?";
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;
const FILE_PATH_FORECAST = "../../../data/json/forecast/forecast-data.json";

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
    console.log("Forecast API - Cleaned location:", cleanedLocation);

    // Use the same approach as OpenWeather API - direct query with q parameter
    const forecastURL = `${API_FORECAST_URL_BASE}q=${encodeURIComponent(cleanedLocation)}&appid=${API_KEY}`;
    
    console.log("Forecast API - Requesting data for:", cleanedLocation);
    console.log("Forecast API - URL:", forecastURL);

    axiosConfig = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    axiosResponse = await sendGetRequest(forecastURL, null, axiosConfig);

    if (axiosResponse == (null || undefined)) {
      const suggestions = getLocationSuggestions(countryParam);
      const suggestionText = suggestions.length > 0 
        ? ` Try using a specific city instead: ${suggestions.join(', ')}`
        : '';
      
      return await bodyResponse(
        BAD_REQUEST_CODE,
        `Forecast data could not be obtained for ${countryParam}.${suggestionText}`
      );
    }

    // Add location info to the response based on the original request
    const enrichedResponse = {
      ...axiosResponse,
      location: {
        requestedLocation: countryParam,
        cleanedLocation: cleanedLocation,
        coordinates: {
          lat: axiosResponse.city?.coord?.lat,
          lon: axiosResponse.city?.coord?.lon
        }
      }
    };

    // Return response immediately
    const response = await bodyResponse(OK_CODE, enrichedResponse);

    // Save data to JSON file asynchronously (fire and forget - don't wait for it)
    process.nextTick(() => {
      createJson(FILE_PATH_FORECAST, enrichedResponse).catch(error => {
        console.log("Warning: Failed to save forecast data to JSON:", error.message);
      });
    });

    return response;
  } catch (error) {
    console.log("ERROR in forecast handler:", error);
    return await bodyResponse(
      INTERNAL_SERVER_ERROR,
      `Error processing forecast data for ${countryParam}: ${error.message}`
    );
  }
}; 