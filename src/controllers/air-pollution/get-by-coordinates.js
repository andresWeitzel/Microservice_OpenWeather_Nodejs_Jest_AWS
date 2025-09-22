  "use strict";

//helpers
const { sendGetRequest } = require("../../helpers/axios/request/get");
const { statusCode } = require("../../enums/http/status-code");
const { createJson } = require("../../helpers/file-system/create-json");
const { bodyResponse } = require("../../helpers/http/body-response");
const { getCachedWeatherData, setCachedWeatherData, hasCachedWeatherData } = require("../../helpers/cache/simple-cache");

//const
const API_AIR_POLLUTION_URL_BASE = "https://api.openweathermap.org/data/2.5/air_pollution?";
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;
const FILE_PATH_AIR_POLLUTION_COORDINATES = "../../../data/json/air-pollution/air-pollution-coordinates-data.json";

//vars
let eventPathParams;
let latParam;
let lonParam;
let axiosConfig;
let axiosResponse;

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
        const cacheKey = `air-pollution:coordinates:${lat}:${lon}`;
        if (hasCachedWeatherData(cacheKey)) {
            const cachedData = getCachedWeatherData(cacheKey);
            console.log(`Cache hit for air pollution coordinates: ${cacheKey}`);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_AIR_POLLUTION_COORDINATES, cachedData);
            
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
            },
            metadata: {
                coordinates: { lat, lon },
                generatedAt: new Date().toISOString(),
                source: "OpenWeatherMap API",
                endpoint: "air-pollution-coordinates"
            }
        };

        // Cache the result
        setCachedWeatherData(cacheKey, enrichedResponse);

        // Save to JSON file asynchronously
        createJson(FILE_PATH_AIR_POLLUTION_COORDINATES, enrichedResponse);

        return bodyResponse(OK_CODE, enrichedResponse);

    } catch (error) {
        console.error("Error in air pollution coordinates handler:", error);
        
        return bodyResponse(INTERNAL_SERVER_ERROR, {
            error: "Internal server error",
            message: "Failed to process air pollution coordinates request",
            details: error.message
        });
    }
};
