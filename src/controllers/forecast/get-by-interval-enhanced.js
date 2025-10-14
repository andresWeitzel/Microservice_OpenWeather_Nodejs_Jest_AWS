"use strict";

//helpers
const { sendGetRequest } = require("../../helpers/axios/request/get");
const { statusCode } = require("../../enums/http/status-code");
const { bodyResponse } = require("../../helpers/http/body-response");
const { transformForecastData } = require("../../helpers/weather/transform-forecast");
const { createJson } = require("../../helpers/file-system/create-json");
const { getCachedWeatherData, setCachedWeatherData, hasCachedWeatherData } = require("../../helpers/cache/simple-cache");
const { validateAndCleanLocation } = require("../../helpers/weather/validate-location");

//const
const API_FORECAST_URL_BASE = process.env.API_FORECAST_URL_BASE;
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;
const FILE_PATH_FORECAST_INTERVAL_ENHANCED = "../../../data/json/forecast/forecast-interval-enhanced-data.json";

//vars
let eventPathParams;
let locationParam;
let intervalParam;
let axiosConfig;
let axiosResponse;
let transformedData;

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
        const cacheKey = `forecast:interval:enhanced:${cleanedLocation}:${intervalParam}`;
        if (hasCachedWeatherData(cacheKey)) {
            const cachedData = getCachedWeatherData(cacheKey);
            console.log(`Cache hit for enhanced forecast interval: ${cleanedLocation} - ${intervalParam}`);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_FORECAST_INTERVAL_ENHANCED, cachedData);
            
            return bodyResponse(OK_CODE, cachedData);
        }

        // Validate environment variables
        if (!API_FORECAST_URL_BASE || !API_KEY) {
            return bodyResponse(INTERNAL_SERVER_ERROR, {
                error: "Configuration error",
                message: "API configuration is missing. Please check environment variables."
            });
        }

        // Prepare the URL for the API request
        const apiUrl = `${API_FORECAST_URL_BASE}q=${encodeURIComponent(cleanedLocation)}&appid=${API_KEY}`;

        // Make API request
        axiosResponse = await sendGetRequest(apiUrl, null, {});

        // Check if the response is an error string from the axios helper
        if (typeof axiosResponse === 'string' && axiosResponse.startsWith('ERROR:')) {
            console.error("OpenWeather API request failed:", axiosResponse);
            return bodyResponse(INTERNAL_SERVER_ERROR, {
                error: "Failed to fetch forecast data",
                message: "Unable to retrieve forecast information from OpenWeather API",
                details: axiosResponse
            });
        }

        if (axiosResponse && axiosResponse.status === OK_CODE && axiosResponse.data) {
            // Transform the complete OpenWeather data first
            transformedData = transformForecastData(axiosResponse.data);
            
            // Filter forecast data by interval
            const filteredData = filterForecastByInterval(axiosResponse.data, intervalParam);
            
            // Add interval-specific analysis
            const enhancedData = {
                ...transformedData,
                intervalAnalysis: analyzeIntervalData(filteredData, intervalParam)
            };
            
            // Cache the enhanced data
            setCachedWeatherData(cacheKey, enhancedData);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_FORECAST_INTERVAL_ENHANCED, enhancedData);
            
            return bodyResponse(OK_CODE, enhancedData);
        } else {
            console.error("Invalid response from OpenWeather API:", axiosResponse);
            return bodyResponse(INTERNAL_SERVER_ERROR, {
                error: "Failed to fetch forecast data",
                message: "Unable to retrieve forecast information from OpenWeather API",
                response: axiosResponse
            });
        }

    } catch (error) {
        console.error("Error in getForecastByIntervalEnhanced handler:", error);
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

function analyzeIntervalData(filteredData, interval) {
    if (!filteredData.forecasts || filteredData.forecasts.length === 0) {
        return {
            summary: "No forecast data available for the specified interval",
            recommendations: ["Try a different interval or location"]
        };
    }

    const forecasts = filteredData.forecasts;
    const temperatures = forecasts.map(f => f.main.temp);
    const humidities = forecasts.map(f => f.main.humidity);
    const windSpeeds = forecasts.map(f => f.wind.speed);
    const weatherConditions = forecasts.map(f => f.weather[0].main);

    const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;
    const avgWindSpeed = windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length;
    const maxTemp = Math.max(...temperatures);
    const minTemp = Math.min(...temperatures);

    // Weather condition frequency
    const conditionCount = {};
    weatherConditions.forEach(condition => {
        conditionCount[condition] = (conditionCount[condition] || 0) + 1;
    });

    const dominantCondition = Object.keys(conditionCount).reduce((a, b) => 
        conditionCount[a] > conditionCount[b] ? a : b
    );

    // Generate recommendations
    const recommendations = [];
    if (avgTemp < 10) recommendations.push("Dress warmly for cold temperatures");
    if (avgTemp > 25) recommendations.push("Stay hydrated and avoid prolonged sun exposure");
    if (avgWindSpeed > 10) recommendations.push("Windy conditions expected - secure loose objects");
    if (avgHumidity > 80) recommendations.push("High humidity - consider indoor activities");

    return {
        interval: interval,
        summary: {
            averageTemperature: Math.round(avgTemp * 100) / 100,
            temperatureRange: { min: Math.round(minTemp * 100) / 100, max: Math.round(maxTemp * 100) / 100 },
            averageHumidity: Math.round(avgHumidity),
            averageWindSpeed: Math.round(avgWindSpeed * 100) / 100,
            dominantWeatherCondition: dominantCondition,
            forecastCount: forecasts.length
        },
        weatherPatterns: {
            conditionBreakdown: conditionCount,
            temperatureTrend: maxTemp > minTemp + 5 ? "warming" : minTemp < maxTemp - 5 ? "cooling" : "stable"
        },
        recommendations: recommendations,
        planningAdvice: {
            suitableActivities: getSuitableActivities(avgTemp, dominantCondition, avgWindSpeed),
            travelAdvice: getTravelAdvice(avgTemp, avgWindSpeed, dominantCondition),
            timeOfDay: getTimeOfDayAnalysis(forecasts)
        }
    };
}

function getSuitableActivities(temp, condition, windSpeed) {
    const activities = [];
    
    if (temp > 20 && condition === "Clear" && windSpeed < 10) {
        activities.push("Outdoor sports", "Picnics", "Walking", "Cycling");
    } else if (temp > 15 && condition !== "Rain") {
        activities.push("Light outdoor activities", "Shopping", "Café visits");
    } else {
        activities.push("Indoor activities", "Museums", "Shopping centers", "Restaurants");
    }
    
    return activities;
}

function getTravelAdvice(temp, windSpeed, condition) {
    if (condition === "Rain" || condition === "Snow") {
        return "Allow extra travel time due to weather conditions";
    } else if (windSpeed > 15) {
        return "Strong winds may affect travel - check transport updates";
    } else if (temp < 0) {
        return "Cold conditions - ensure vehicle is prepared for winter weather";
    }
    return "Normal travel conditions expected";
}

function getTimeOfDayAnalysis(forecasts) {
    const morning = forecasts.filter(f => {
        const hour = new Date(f.dt * 1000).getHours();
        return hour >= 6 && hour < 12;
    });
    
    const afternoon = forecasts.filter(f => {
        const hour = new Date(f.dt * 1000).getHours();
        return hour >= 12 && hour < 18;
    });
    
    const evening = forecasts.filter(f => {
        const hour = new Date(f.dt * 1000).getHours();
        return hour >= 18 && hour < 22;
    });
    
    return {
        morning: morning.length > 0 ? "Morning forecasts available" : "No morning forecasts",
        afternoon: afternoon.length > 0 ? "Afternoon forecasts available" : "No afternoon forecasts",
        evening: evening.length > 0 ? "Evening forecasts available" : "No evening forecasts"
    };
} 