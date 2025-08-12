"use strict";

//helpers
const { sendGetRequest } = require("../../helpers/axios/request/get");
const { statusCode } = require("../../enums/http/status-code");
const { createJson } = require("../../helpers/file-system/create-json");
const { bodyResponse } = require("../../helpers/http/body-response");
const { getCachedWeatherData, setCachedWeatherData, hasCachedWeatherData } = require("../../helpers/cache/simple-cache");
const { validateAndCleanLocation } = require("../../helpers/weather/validate-location");

//const
const API_FORECAST_URL_BASE = "https://api.openweathermap.org/data/2.5/forecast?";
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;
const FILE_PATH_FORECAST_INTERVAL = "../../../data/json/forecast/forecast-interval-data.json";

//vars
let eventPathParams;
let locationParam;
let intervalParam;
let axiosConfig;
let axiosResponse;

module.exports.handler = async (event) => {
    try {
        // Get path parameters
        eventPathParams = event.pathParameters;
        locationParam = eventPathParams.location;
        intervalParam = eventPathParams.interval;

        // Validate location parameter
        if (!locationParam || locationParam.trim() === "") {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "Location parameter is required",
                message: "Please provide a valid location name"
            });
        }

        // Validate interval parameter
        const validIntervals = ["3h", "6h", "12h", "24h"];
        if (!intervalParam || !validIntervals.includes(intervalParam)) {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "Invalid interval parameter",
                message: "Interval must be one of: 3h, 6h, 12h, 24h",
                validIntervals: validIntervals
            });
        }

        // Clean and validate location
        const cleanedLocation = validateAndCleanLocation(locationParam);
        if (!cleanedLocation) {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "Invalid location format",
                message: "Please provide a valid location name"
            });
        }

        // Check cache first
        const cacheKey = `forecast:interval:${cleanedLocation}:${intervalParam}`;
        if (hasCachedWeatherData(cacheKey)) {
            const cachedData = getCachedWeatherData(cacheKey);
            console.log(`Cache hit for forecast interval: ${cleanedLocation} - ${intervalParam}`);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_FORECAST_INTERVAL, cachedData);
            
            return bodyResponse(OK_CODE, cachedData);
        }

        // Prepare axios configuration
        axiosConfig = {
            method: "GET",
            url: `${API_FORECAST_URL_BASE}q=${encodeURIComponent(cleanedLocation)}&appid=${API_KEY}`,
            headers: {
                "Content-Type": "application/json"
            }
        };

        // Make API request
        axiosResponse = await sendGetRequest(axiosConfig);

        if (axiosResponse.status === OK_CODE && axiosResponse.data) {
            // Filter forecast data by interval
            const filteredData = filterForecastByInterval(axiosResponse.data, intervalParam);
            
            // Cache the filtered data
            setCachedWeatherData(cacheKey, filteredData);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_FORECAST_INTERVAL, filteredData);
            
            return bodyResponse(OK_CODE, filteredData);
        } else {
            return bodyResponse(INTERNAL_SERVER_ERROR, {
                error: "Failed to fetch forecast data",
                message: "Unable to retrieve forecast information from OpenWeather API"
            });
        }

    } catch (error) {
        console.error("Error in getForecastByInterval handler:", error);
        return bodyResponse(INTERNAL_SERVER_ERROR, {
            error: "Internal server error",
            message: "An unexpected error occurred while processing the request"
        });
    }
};

function filterForecastByInterval(forecastData, interval) {
    const intervalHours = parseInt(interval.replace('h', ''));
    const filteredList = [];
    
    // Get current time
    const now = new Date();
    const currentTime = now.getTime() / 1000; // Convert to Unix timestamp
    
    // Filter forecast entries based on interval
    for (let i = 0; i < forecastData.list.length; i++) {
        const forecastTime = forecastData.list[i].dt;
        const timeDiff = forecastTime - currentTime;
        const hoursDiff = timeDiff / 3600; // Convert seconds to hours
        
        // Include forecasts that are within the specified interval
        if (hoursDiff >= 0 && hoursDiff <= intervalHours) {
            filteredList.push(forecastData.list[i]);
        }
    }
    
    return {
        location: forecastData.city,
        interval: interval,
        intervalHours: intervalHours,
        filteredCount: filteredList.length,
        forecasts: filteredList,
        metadata: {
            originalCount: forecastData.list.length,
            filterApplied: `Forecasts within ${interval} from now`,
            timestamp: new Date().toISOString()
        }
    };
} 