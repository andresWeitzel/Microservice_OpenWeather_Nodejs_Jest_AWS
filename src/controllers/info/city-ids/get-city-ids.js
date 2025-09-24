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
const FILE_PATH_CITY_IDS = "../../../data/json/info/city-ids/city-ids-data.json";

//vars
let eventPathParams;
let cityNameParam;
let countryCodeParam;
let limitParam;

module.exports.handler = async (event) => {
  try {
    const isTestEnv = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID != null;
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
      if (!isTestEnv) console.log(`Using cached data for city search: ${cityNameParam}`);
      const cachedData = getCachedWeatherData('cityIds', cacheKey);
      return { statusCode: OK_CODE, body: JSON.stringify(cachedData) };
    }

    if (!isTestEnv) console.log(`Searching local database for city IDs: ${cityNameParam}`);

    // Search in local database
    const matchingCities = searchCityIds(cityNameParam, countryCodeParam, limit);

    // Get database metadata
    const metadata = getDatabaseMetadata();

    // Build full response structure expected by tests
    const responseBody = {
      searchQuery: cityNameParam,
      countryCode: countryCodeParam ? String(countryCodeParam) : "",
      limit: limit,
      totalResults: matchingCities.length,
      cities: matchingCities,
      source: "local_database",
      databaseInfo: metadata
    };

    // Cache the response for 60 minutes (local data doesn't change often)
    setCachedWeatherData('cityIds', cacheKey, responseBody, 60 * 60 * 1000);
    if (!isTestEnv) console.log(`Cached city IDs data for: ${cityNameParam}`);

    // Return response immediately
    const response = { statusCode: OK_CODE, body: JSON.stringify(responseBody) };

    // Save data to JSON file asynchronously (fire and forget - don't wait for it)
    if (!isTestEnv) {
      process.nextTick(() => {
        createJson(FILE_PATH_CITY_IDS, responseBody).catch(error => {
          console.log("Warning: Failed to save city IDs data to JSON:", error.message);
        });
      });
    }

    return response;
  } catch (error) {
    if (!(process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID != null)) {
      console.log("ERROR in city IDs handler:", error);
    }
    return await bodyResponse(
      INTERNAL_SERVER_ERROR,
      `Error processing city data for ${cityNameParam}: ${error.message}`
    );
  }
}; 