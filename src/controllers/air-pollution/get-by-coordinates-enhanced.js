"use strict";

//helpers
const { sendGetRequest } = require("../../helpers/axios/request/get");
const { statusCode } = require("../../enums/http/status-code");
const { bodyResponse } = require("../../helpers/http/body-response");
const { transformAirPollutionData } = require("../../helpers/weather/transform-air-pollution");
const { createJson } = require("../../helpers/file-system/create-json");
const { getCachedWeatherData, setCachedWeatherData, hasCachedWeatherData } = require("../../helpers/cache/simple-cache");

//const
const API_AIR_POLLUTION_URL_BASE = "https://api.openweathermap.org/data/2.5/air_pollution?";
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;
const FILE_PATH_AIR_POLLUTION_COORDINATES_ENHANCED = "../../../data/json/air-pollution/air-pollution-coordinates-enhanced-data.json";

//vars
let eventPathParams;
let latParam;
let lonParam;
let axiosConfig;
let axiosResponse;
let transformedData;

module.exports.handler = async (event) => {
    try {
        // Get path parameters
        eventPathParams = event.pathParameters;
        latParam = eventPathParams.lat;
        lonParam = eventPathParams.lon;

        // Validate latitude parameter
        const lat = parseFloat(latParam);
        if (isNaN(lat) || lat < -90 || lat > 90) {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "Invalid latitude parameter",
                message: "Latitude must be a number between -90 and 90",
                validRange: "-90 to 90"
            });
        }

        // Validate longitude parameter
        const lon = parseFloat(lonParam);
        if (isNaN(lon) || lon < -180 || lon > 180) {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "Invalid longitude parameter",
                message: "Longitude must be a number between -180 and 180",
                validRange: "-180 to 180"
            });
        }

        // Check cache first
        const cacheKey = `air-pollution:coordinates:enhanced:${lat}:${lon}`;
        if (hasCachedWeatherData(cacheKey)) {
            const cachedData = getCachedWeatherData(cacheKey);
            console.log(`Cache hit for air pollution coordinates enhanced: ${cacheKey}`);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_AIR_POLLUTION_COORDINATES_ENHANCED, cachedData);
            
            return bodyResponse(OK_CODE, cachedData);
        }

        // Prepare API request
        const apiUrl = `${API_AIR_POLLUTION_URL_BASE}lat=${lat}&lon=${lon}&appid=${API_KEY}`;

        axiosConfig = {
            headers: {
                "Content-Type": "application/json"
            }
        };

        // Make API request
        axiosResponse = await sendGetRequest(apiUrl, null, axiosConfig);

        if (!axiosResponse || !axiosResponse.data) {
            return bodyResponse(INTERNAL_SERVER_ERROR, {
                error: "Failed to fetch air pollution data",
                message: "No response from OpenWeatherMap API"
            });
        }

        // Add coordinates info to the response
        const enrichedResponse = {
            ...axiosResponse,
            location: {
                coordinates: {
                    lat: lat,
                    lon: lon
                }
            }
        };

        // Transform the raw OpenWeather air pollution data into enriched format
        transformedData = await transformAirPollutionData(enrichedResponse);

        // Add metadata
        transformedData.metadata = {
            coordinates: { lat, lon },
            generatedAt: new Date().toISOString(),
            source: "OpenWeatherMap API",
            endpoint: "air-pollution-enhanced-coordinates"
        };

        // Cache the result
        setCachedWeatherData(cacheKey, transformedData);

        // Save to JSON file asynchronously
        createJson(FILE_PATH_AIR_POLLUTION_COORDINATES_ENHANCED, transformedData);

        return bodyResponse(OK_CODE, transformedData);

    } catch (error) {
        console.error("Error in air pollution coordinates enhanced handler:", error);
        
        return bodyResponse(INTERNAL_SERVER_ERROR, {
            error: "Internal server error",
            message: "Failed to process air pollution coordinates enhanced request",
            details: error.message
        });
    }
};
