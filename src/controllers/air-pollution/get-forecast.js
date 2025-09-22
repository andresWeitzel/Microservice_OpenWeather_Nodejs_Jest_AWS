"use strict";

//helpers
const { sendGetRequest } = require("../../helpers/axios/request/get");
const { statusCode } = require("../../enums/http/status-code");
const { createJson } = require("../../helpers/file-system/create-json");
const { bodyResponse } = require("../../helpers/http/body-response");
const { getCachedWeatherData, setCachedWeatherData, hasCachedWeatherData } = require("../../helpers/cache/simple-cache");
const { validateAndCleanLocation } = require("../../helpers/weather/validate-location");

//const
const API_AIR_POLLUTION_FORECAST_URL_BASE = "https://api.openweathermap.org/data/2.5/air_pollution/forecast?";
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;
const FILE_PATH_AIR_POLLUTION_FORECAST = "../../../data/json/air-pollution/air-pollution-forecast-data.json";

//vars
let eventPathParams;
let locationParam;
let axiosConfig;
let axiosResponse;
let coordinates;

module.exports.handler = async (event) => {
    try {
        // Get path parameters
        eventPathParams = event.pathParameters;
        locationParam = eventPathParams.location;

        // Validate location parameter
        if (!locationParam || locationParam.trim() === "") {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "Location parameter is required",
                message: "Please provide a valid location name"
            });
        }

        // Clean and validate location
        const cleanedLocation = validateAndCleanLocation(locationParam);
        if (!cleanedLocation) {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "Invalid location format",
                message: "Location contains invalid characters"
            });
        }

        // Check cache first
        const cacheKey = `air-pollution:forecast:${cleanedLocation}`;
        if (hasCachedWeatherData(cacheKey)) {
            const cachedData = getCachedWeatherData(cacheKey);
            console.log(`Cache hit for air pollution forecast: ${cacheKey}`);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_AIR_POLLUTION_FORECAST, cachedData);
            
            return bodyResponse(OK_CODE, cachedData);
        }

        // First, get coordinates for the location using geocoding
        const encodedLocation = encodeURIComponent(cleanedLocation);
        const geocodingURL = `https://api.openweathermap.org/geo/1.0/direct?q=${encodedLocation}&limit=1&appid=${API_KEY}`;
        
        console.log("Air Pollution Forecast API - Getting coordinates for:", cleanedLocation);

        axiosConfig = {
            headers: {
                "Content-Type": "application/json"
            }
        };

        // Get coordinates first
        const geocodingResponse = await sendGetRequest(geocodingURL, null, axiosConfig);

        if (!geocodingResponse || !geocodingResponse[0]) {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "Location not found",
                message: `Could not find coordinates for ${cleanedLocation}`
            });
        }

        coordinates = geocodingResponse[0];
        const lat = coordinates.lat;
        const lon = coordinates.lon;

        // Now get air pollution forecast data using coordinates
        const airPollutionForecastURL = `${API_AIR_POLLUTION_FORECAST_URL_BASE}lat=${lat}&lon=${lon}&appid=${API_KEY}`;

        console.log("Air Pollution Forecast API - Requesting forecast data for coordinates:", lat, lon);

        axiosResponse = await sendGetRequest(airPollutionForecastURL, null, axiosConfig);

        if (!axiosResponse || !axiosResponse.data) {
            return bodyResponse(INTERNAL_SERVER_ERROR, {
                error: "Failed to fetch air pollution forecast data",
                message: "No response from OpenWeatherMap API"
            });
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
            },
            metadata: {
                location: cleanedLocation,
                coordinates: { lat, lon },
                generatedAt: new Date().toISOString(),
                source: "OpenWeatherMap API",
                endpoint: "air-pollution-forecast"
            }
        };

        // Cache the result
        setCachedWeatherData(cacheKey, enrichedResponse);

        // Save to JSON file asynchronously
        createJson(FILE_PATH_AIR_POLLUTION_FORECAST, enrichedResponse);

        return bodyResponse(OK_CODE, enrichedResponse);

    } catch (error) {
        console.error("Error in air pollution forecast handler:", error);
        
        return bodyResponse(INTERNAL_SERVER_ERROR, {
            error: "Internal server error",
            message: "Failed to process air pollution forecast request",
            details: error.message
        });
    }
};
