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
const FILE_PATH_FORECAST_HOURLY = "../../../data/json/forecast/forecast-hourly-data.json";

//vars
let eventPathParams;
let locationParam;
let hourParam;
let axiosConfig;
let axiosResponse;

module.exports.handler = async (event) => {
    try {
        // Get path parameters
        eventPathParams = event.pathParameters;
        locationParam = eventPathParams.location;
        hourParam = eventPathParams.hour;

        // Validate location parameter
        if (!locationParam || locationParam.trim() === "") {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "Location parameter is required",
                message: "Please provide a valid location name"
            });
        }

        // Validate hour parameter
        const validHours = ["morning", "afternoon", "evening", "night"];
        if (!hourParam || !validHours.includes(hourParam)) {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "Invalid hour parameter",
                message: "Hour must be one of: morning, afternoon, evening, night",
                validHours: validHours
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
        const cacheKey = `forecast:hourly:${cleanedLocation}:${hourParam}`;
        if (hasCachedWeatherData(cacheKey)) {
            const cachedData = getCachedWeatherData(cacheKey);
            console.log(`Cache hit for forecast hourly: ${cleanedLocation} - ${hourParam}`);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_FORECAST_HOURLY, cachedData);
            
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
            // Filter forecast data by hour
            const filteredData = filterForecastByHour(axiosResponse.data, hourParam);
            
            // Cache the filtered data
            setCachedWeatherData(cacheKey, filteredData);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_FORECAST_HOURLY, filteredData);
            
            return bodyResponse(OK_CODE, filteredData);
        } else {
            return bodyResponse(INTERNAL_SERVER_ERROR, {
                error: "Failed to fetch forecast data",
                message: "Unable to retrieve forecast information from OpenWeather API"
            });
        }

    } catch (error) {
        console.error("Error in getForecastByHourly handler:", error);
        return bodyResponse(INTERNAL_SERVER_ERROR, {
            error: "Internal server error",
            message: "An unexpected error occurred while processing the request"
        });
    }
};

function filterForecastByHour(forecastData, hour) {
    const filteredList = [];
    const timeRange = getTimeRangeForHour(hour);
    
    // Filter forecast entries based on hour
    for (let i = 0; i < forecastData.list.length; i++) {
        const forecast = forecastData.list[i];
        const forecastDate = new Date(forecast.dt * 1000);
        const forecastHour = forecastDate.getHours();
        
        // Check if the forecast hour falls within the specified time range
        if (forecastHour >= timeRange.start && forecastHour < timeRange.end) {
            filteredList.push(forecast);
        }
    }
    
    // Generate hourly summary
    const hourlySummary = generateHourlySummary(filteredList, hour);
    
    return {
        location: forecastData.city,
        requestedHour: hour,
        timeRange: timeRange,
        hourlySummary: hourlySummary,
        forecasts: filteredList,
        metadata: {
            originalCount: forecastData.list.length,
            filteredCount: filteredList.length,
            filterApplied: `Forecasts for ${hour} (${timeRange.start}:00-${timeRange.end}:00)`,
            timestamp: new Date().toISOString()
        }
    };
}

function getTimeRangeForHour(hour) {
    switch (hour) {
        case "morning":
            return { start: 6, end: 12, description: "6:00 AM - 12:00 PM" };
        case "afternoon":
            return { start: 12, end: 18, description: "12:00 PM - 6:00 PM" };
        case "evening":
            return { start: 18, end: 22, description: "6:00 PM - 10:00 PM" };
        case "night":
            return { start: 22, end: 6, description: "10:00 PM - 6:00 AM" };
        default:
            return { start: 0, end: 24, description: "All day" };
    }
}

function generateHourlySummary(forecasts, hour) {
    if (!forecasts || forecasts.length === 0) {
        return {
            hour: hour,
            summary: "No forecast data available for this time period",
            forecastCount: 0
        };
    }
    
    const temperatures = forecasts.map(f => f.main.temp);
    const humidities = forecasts.map(f => f.main.humidity);
    const windSpeeds = forecasts.map(f => f.wind.speed);
    const weatherConditions = forecasts.map(f => f.weather[0].main);
    const descriptions = forecasts.map(f => f.weather[0].description);
    
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
    
    // Get unique descriptions
    const uniqueDescriptions = [...new Set(descriptions)];
    
    // Group by day
    const forecastsByDay = {};
    forecasts.forEach(forecast => {
        const forecastDate = new Date(forecast.dt * 1000);
        const dayKey = forecastDate.toISOString().split('T')[0];
        
        if (!forecastsByDay[dayKey]) {
            forecastsByDay[dayKey] = [];
        }
        forecastsByDay[dayKey].push(forecast);
    });
    
    return {
        hour: hour,
        summary: {
            averageTemperature: Math.round(avgTemp * 100) / 100,
            temperatureRange: { min: Math.round(minTemp * 100) / 100, max: Math.round(maxTemp * 100) / 100 },
            averageHumidity: Math.round(avgHumidity),
            averageWindSpeed: Math.round(avgWindSpeed * 100) / 100,
            dominantWeatherCondition: dominantCondition,
            weatherDescriptions: uniqueDescriptions,
            forecastCount: forecasts.length,
            daysWithForecasts: Object.keys(forecastsByDay).length
        },
        weatherBreakdown: conditionCount,
        dailyBreakdown: Object.keys(forecastsByDay).map(day => ({
            date: day,
            dayName: new Date(day).toLocaleDateString('en-US', { weekday: 'long' }),
            forecastCount: forecastsByDay[day].length,
            averageTemperature: Math.round(
                forecastsByDay[day].reduce((sum, f) => sum + f.main.temp, 0) / forecastsByDay[day].length * 100
            ) / 100,
            dominantCondition: forecastsByDay[day].reduce((acc, f) => {
                const condition = f.weather[0].main;
                acc[condition] = (acc[condition] || 0) + 1;
                return acc;
            }, {})
        })),
        hourlyForecasts: forecasts.map(forecast => ({
            date: new Date(forecast.dt * 1000).toISOString().split('T')[0],
            time: new Date(forecast.dt * 1000).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            }),
            temperature: Math.round(forecast.main.temp * 100) / 100,
            condition: forecast.weather[0].main,
            description: forecast.weather[0].description,
            humidity: forecast.main.humidity,
            windSpeed: Math.round(forecast.wind.speed * 100) / 100
        }))
    };
} 