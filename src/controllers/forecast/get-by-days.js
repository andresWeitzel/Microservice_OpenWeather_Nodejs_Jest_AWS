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
const FILE_PATH_FORECAST_DAYS = "../../../data/json/forecast/forecast-days-data.json";

//vars
let eventPathParams;
let locationParam;
let daysParam;
let axiosConfig;
let axiosResponse;

module.exports.handler = async (event) => {
    try {
        // Get path parameters
        eventPathParams = event.pathParameters;
        locationParam = eventPathParams.location;
        daysParam = eventPathParams.days;

        // Validate location parameter
        if (!locationParam || locationParam.trim() === "") {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "Location parameter is required",
                message: "Please provide a valid location name"
            });
        }

        // Validate days parameter
        const days = parseInt(daysParam);
        if (isNaN(days) || days < 1 || days > 5) {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "Invalid days parameter",
                message: "Days must be a number between 1 and 5",
                validRange: { min: 1, max: 5 }
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
        const cacheKey = `forecast:days:${cleanedLocation}:${days}`;
        if (hasCachedWeatherData(cacheKey)) {
            const cachedData = getCachedWeatherData(cacheKey);
            console.log(`Cache hit for forecast days: ${cleanedLocation} - ${days} days`);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_FORECAST_DAYS, cachedData);
            
            return bodyResponse(OK_CODE, cachedData);
        }

        // Prepare the URL for the API request
        const apiUrl = `${API_FORECAST_URL_BASE}q=${encodeURIComponent(cleanedLocation)}&appid=${API_KEY}`;

        // Make API request
        axiosResponse = await sendGetRequest(apiUrl, null, {});

        if (axiosResponse && axiosResponse.status === OK_CODE && axiosResponse.data) {
            // Filter forecast data by days
            const filteredData = filterForecastByDays(axiosResponse.data, days);
            
            // Cache the filtered data
            setCachedWeatherData(cacheKey, filteredData);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_FORECAST_DAYS, filteredData);
            
            return bodyResponse(OK_CODE, filteredData);
        } else {
            return bodyResponse(INTERNAL_SERVER_ERROR, {
                error: "Failed to fetch forecast data",
                message: "Unable to retrieve forecast information from OpenWeather API"
            });
        }

    } catch (error) {
        console.error("Error in getForecastByDays handler:", error);
        return bodyResponse(INTERNAL_SERVER_ERROR, {
            error: "Internal server error",
            message: "An unexpected error occurred while processing the request"
        });
    }
};

function filterForecastByDays(forecastData, days) {
    const filteredList = [];
    const dailySummaries = [];
    
    // Get current date
    const now = new Date();
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Group forecasts by day
    const forecastsByDay = {};
    
    for (let i = 0; i < forecastData.list.length; i++) {
        const forecast = forecastData.list[i];
        const forecastDate = new Date(forecast.dt * 1000);
        const dayKey = new Date(forecastDate.getFullYear(), forecastDate.getMonth(), forecastDate.getDate());
        
        if (!forecastsByDay[dayKey.getTime()]) {
            forecastsByDay[dayKey.getTime()] = [];
        }
        forecastsByDay[dayKey.getTime()].push(forecast);
    }
    
    // Get the next N days
    const sortedDays = Object.keys(forecastsByDay).sort((a, b) => parseInt(a) - parseInt(b));
    const selectedDays = sortedDays.slice(0, days);
    
    // Process each selected day
    selectedDays.forEach((dayTimestamp, index) => {
        const dayForecasts = forecastsByDay[dayTimestamp];
        const dayDate = new Date(parseInt(dayTimestamp));
        
        // Add all forecasts for this day to the main list
        filteredList.push(...dayForecasts);
        
        // Generate daily summary
        const dailySummary = generateDailySummary(dayForecasts, dayDate, index + 1);
        dailySummaries.push(dailySummary);
    });
    
    return {
        location: forecastData.city,
        requestedDays: days,
        actualDays: dailySummaries.length,
        dailySummaries: dailySummaries,
        forecasts: filteredList,
        metadata: {
            originalCount: forecastData.list.length,
            filteredCount: filteredList.length,
            filterApplied: `Forecasts for next ${days} days`,
            timestamp: new Date().toISOString()
        }
    };
}

function generateDailySummary(dayForecasts, dayDate, dayNumber) {
    if (!dayForecasts || dayForecasts.length === 0) {
        return {
            dayNumber: dayNumber,
            date: dayDate.toISOString().split('T')[0],
            dayName: dayDate.toLocaleDateString('en-US', { weekday: 'long' }),
            summary: "No forecast data available",
            forecastCount: 0
        };
    }
    
    const temperatures = dayForecasts.map(f => f.main.temp);
    const humidities = dayForecasts.map(f => f.main.humidity);
    const windSpeeds = dayForecasts.map(f => f.wind.speed);
    const weatherConditions = dayForecasts.map(f => f.weather[0].main);
    const descriptions = dayForecasts.map(f => f.weather[0].description);
    
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
    
    return {
        dayNumber: dayNumber,
        date: dayDate.toISOString().split('T')[0],
        dayName: dayDate.toLocaleDateString('en-US', { weekday: 'long' }),
        summary: {
            averageTemperature: Math.round(avgTemp * 100) / 100,
            temperatureRange: { min: Math.round(minTemp * 100) / 100, max: Math.round(maxTemp * 100) / 100 },
            averageHumidity: Math.round(avgHumidity),
            averageWindSpeed: Math.round(avgWindSpeed * 100) / 100,
            dominantWeatherCondition: dominantCondition,
            weatherDescriptions: uniqueDescriptions,
            forecastCount: dayForecasts.length
        },
        weatherBreakdown: conditionCount,
        hourlyForecasts: dayForecasts.map(forecast => ({
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