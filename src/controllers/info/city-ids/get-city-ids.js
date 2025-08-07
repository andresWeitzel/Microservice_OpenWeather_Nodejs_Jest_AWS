"use strict";

//helpers
const { statusCode } = require("../../../enums/http/status-code");
const { createJson } = require("../../../helpers/file-system/create-json");
const { bodyResponse } = require("../../../helpers/http/body-response");
const { getCachedWeatherData, setCachedWeatherData, hasCachedWeatherData } = require("../../../helpers/cache/simple-cache");
const { searchCityIds, getDatabaseMetadata } = require("../../../helpers/info/city-ids/city-ids-database");

//const
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;
const FILE_PATH_CITY_IDS = "../../../data/json/city-ids/city-ids-data.json";

//vars
let eventPathParams;
let cityNameParam;
let countryCodeParam;
let limitParam;

module.exports.handler = async (event) => {
  try {
    eventPathParams = event.pathParameters;
    cityNameParam = eventPathParams.cityName;
    countryCodeParam = eventPathParams.countryCode;
    limitParam = eventPathParams.limit || "5"; // Default limit of 5 results

    // Validate city name
    if (!cityNameParam) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        "City name parameter is required"
      );
    }

    // Validate limit parameter
    const limit = parseInt(limitParam);
    if (isNaN(limit) || limit < 1 || limit > 10) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        "Limit must be a number between 1 and 10"
      );
    }

    // Create cache key using city name, country code and limit
    const cacheKey = `city-ids:${cityNameParam}:${countryCodeParam || 'any'}:${limit}`;
    if (hasCachedWeatherData('cityIds', cacheKey)) {
      console.log(`Using cached data for city search: ${cityNameParam}`);
      const cachedData = getCachedWeatherData('cityIds', cacheKey);
      return await bodyResponse(OK_CODE, cachedData);
    }

    console.log(`Searching local database for city IDs: ${cityNameParam}`);

    // Search in local database
    const matchingCities = searchCityIds(cityNameParam, countryCodeParam, limit);

    // Get database metadata
    const metadata = getDatabaseMetadata();

    // Transform the response to return only the ID
    const transformedData = {
      id: matchingCities.length > 0 ? matchingCities[0].id : null
    };

    // Cache the transformed response for 60 minutes (local data doesn't change often)
    setCachedWeatherData('cityIds', cacheKey, transformedData, 60 * 60 * 1000);
    console.log(`Cached city IDs data for: ${cityNameParam}`);

    // Return response immediately
    const response = await bodyResponse(OK_CODE, transformedData);

    // Save data to JSON file asynchronously (fire and forget - don't wait for it)
    process.nextTick(() => {
      createJson(FILE_PATH_CITY_IDS, transformedData).catch(error => {
        console.log("Warning: Failed to save city IDs data to JSON:", error.message);
      });
    });

    return response;
  } catch (error) {
    console.log("ERROR in city IDs handler:", error);
    return await bodyResponse(
      INTERNAL_SERVER_ERROR,
      `Error processing city data for ${cityNameParam}: ${error.message}`
    );
  }
}; 