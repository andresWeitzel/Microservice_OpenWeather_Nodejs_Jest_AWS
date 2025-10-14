"use strict";

//helpers
const { sendGetRequest } = require("../../helpers/axios/request/get");
const { statusCode } = require("../../enums/http/status-code");
const { createJson } = require("../../helpers/file-system/create-json");
const { bodyResponse } = require("../../helpers/http/body-response");
const { getCachedWeatherData, setCachedWeatherData, hasCachedWeatherData } = require("../../helpers/cache/simple-cache");
const { validateAndCleanLocation } = require("../../helpers/weather/validate-location");

//const
const API_FORECAST_URL_BASE = process.env.API_FORECAST_URL_BASE;
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;
const FILE_PATH_FORECAST_WEEKLY = "../../../data/json/forecast/forecast-weekly-data.json";

//vars
let eventPathParams;
let locationParam;
let weeksParam;
let axiosConfig;
let axiosResponse;

module.exports.handler = async (event) => {
    try {
        // Get path parameters
        eventPathParams = event.pathParameters;
        locationParam = eventPathParams.location;
        weeksParam = eventPathParams.weeks;

        // Validate location parameter
        if (!locationParam || locationParam.trim() === "") {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "Location parameter is required",
                message: "Please provide a valid location name"
            });
        }

        // Validate weeks parameter
        const weeks = parseInt(weeksParam);
        if (isNaN(weeks) || weeks < 1 || weeks > 4) {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "Invalid weeks parameter",
                message: "Weeks must be a number between 1 and 4",
                validRange: "1-4"
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
        const cacheKey = `forecast:weekly:${cleanedLocation}:${weeks}`;
        if (hasCachedWeatherData(cacheKey)) {
            const cachedData = getCachedWeatherData(cacheKey);
            console.log(`Cache hit for forecast weekly: ${cacheKey}`);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_FORECAST_WEEKLY, cachedData);
            
            return bodyResponse(OK_CODE, cachedData);
        }

        // Validate environment variables
        if (!API_FORECAST_URL_BASE || !API_KEY) {
            return bodyResponse(INTERNAL_SERVER_ERROR, {
                error: "Configuration error",
                message: "API configuration is missing. Please check environment variables."
            });
        }

        // Prepare API request
        const encodedLocation = encodeURIComponent(cleanedLocation);
        const apiUrl = `${API_FORECAST_URL_BASE}q=${encodedLocation}&appid=${API_KEY}&units=metric`;

        axiosConfig = {
            headers: {
                "Content-Type": "application/json"
            }
        };

        // Make API request
        axiosResponse = await sendGetRequest(apiUrl, null, axiosConfig);

        // Check if the response is an error string from the axios helper
        if (typeof axiosResponse === 'string' && axiosResponse.startsWith('ERROR:')) {
            console.error("OpenWeather API request failed:", axiosResponse);
            return bodyResponse(INTERNAL_SERVER_ERROR, {
                error: "Failed to fetch forecast data",
                message: "Unable to retrieve forecast information from OpenWeather API",
                details: axiosResponse
            });
        }

        if (!axiosResponse || !axiosResponse.data) {
            return bodyResponse(INTERNAL_SERVER_ERROR, {
                error: "Failed to fetch forecast data",
                message: "No response from OpenWeatherMap API"
            });
        }

        // Group forecast data by weeks
        const weeklyData = groupForecastByWeeks(axiosResponse.data, weeks);
        
        if (!weeklyData || weeklyData.length === 0) {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "No forecast data available",
                message: `No forecast data found for ${weeks} week(s) in ${cleanedLocation}`,
                location: cleanedLocation,
                weeks: weeks
            });
        }

        // Generate weekly summary
        const weeklySummary = generateWeeklySummary(weeklyData, weeks);

        const responseData = {
            location: cleanedLocation,
            weeks: weeks,
            weeklyData: weeklyData,
            weeklySummary: weeklySummary,
            metadata: {
                location: cleanedLocation,
                weeks: weeks,
                totalWeeks: weeklyData.length,
                generatedAt: new Date().toISOString(),
                source: "OpenWeatherMap API",
                endpoint: "forecast-weekly"
            }
        };

        // Cache the result
        setCachedWeatherData(cacheKey, responseData);

        // Save to JSON file asynchronously
        createJson(FILE_PATH_FORECAST_WEEKLY, responseData);

        return bodyResponse(OK_CODE, responseData);

    } catch (error) {
        console.error("Error in forecast weekly handler:", error);
        
        return bodyResponse(INTERNAL_SERVER_ERROR, {
            error: "Internal server error",
            message: "Failed to process forecast weekly request",
            details: error.message
        });
    }
};

/**
 * Group forecast data by weeks
 * @param {Object} forecastData - Raw forecast data from OpenWeatherMap
 * @param {number} weeks - Number of weeks to group
 * @returns {Array} Weekly grouped forecast data
 */
function groupForecastByWeeks(forecastData, weeks) {
    if (!forecastData.list || !Array.isArray(forecastData.list)) {
        return [];
    }

    const weeklyGroups = [];
    const currentDate = new Date();
    
    for (let week = 0; week < weeks; week++) {
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() + (week * 7));
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const weekData = {
            weekNumber: week + 1,
            weekStart: weekStart.toISOString().split('T')[0],
            weekEnd: weekEnd.toISOString().split('T')[0],
            forecasts: [],
            dailyAverages: []
        };

        // Group forecasts by day within the week
        const dailyGroups = {};
        
        forecastData.list.forEach(forecast => {
            const forecastDate = new Date(forecast.dt * 1000);
            const forecastDateStr = forecastDate.toISOString().split('T')[0];
            
            if (forecastDate >= weekStart && forecastDate <= weekEnd) {
                if (!dailyGroups[forecastDateStr]) {
                    dailyGroups[forecastDateStr] = [];
                }
                dailyGroups[forecastDateStr].push(forecast);
            }
        });

        // Calculate daily averages for the week
        Object.keys(dailyGroups).forEach(date => {
            const dayForecasts = dailyGroups[date];
            const temperatures = dayForecasts.map(f => f.main.temp);
            const humidities = dayForecasts.map(f => f.main.humidity);
            const pressures = dayForecasts.map(f => f.main.pressure);
            const windSpeeds = dayForecasts.map(f => f.wind.speed);
            
            // Count weather conditions
            const conditions = {};
            dayForecasts.forEach(forecast => {
                const condition = forecast.weather[0].main;
                conditions[condition] = (conditions[condition] || 0) + 1;
            });

            const dailyAverage = {
                date: date,
                averageTemperature: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
                minTemperature: Math.min(...temperatures),
                maxTemperature: Math.max(...temperatures),
                averageHumidity: humidities.reduce((a, b) => a + b, 0) / humidities.length,
                averagePressure: pressures.reduce((a, b) => a + b, 0) / pressures.length,
                averageWindSpeed: windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length,
                predominantCondition: Object.keys(conditions).reduce((a, b) => conditions[a] > conditions[b] ? a : b),
                conditionCounts: conditions,
                totalForecasts: dayForecasts.length
            };

            weekData.dailyAverages.push(dailyAverage);
            weekData.forecasts.push(...dayForecasts);
        });

        weeklyGroups.push(weekData);
    }

    return weeklyGroups;
}

/**
 * Generate weekly summary
 * @param {Array} weeklyData - Weekly grouped forecast data
 * @param {number} weeks - Number of weeks
 * @returns {Object} Weekly summary
 */
function generateWeeklySummary(weeklyData, weeks) {
    if (!weeklyData || weeklyData.length === 0) {
        return {
            totalWeeks: 0,
            message: "No weekly data available"
        };
    }

    const allTemperatures = [];
    const allHumidities = [];
    const allConditions = {};

    weeklyData.forEach(week => {
        week.dailyAverages.forEach(day => {
            allTemperatures.push(day.averageTemperature);
            allHumidities.push(day.averageHumidity);
            
            if (allConditions[day.predominantCondition]) {
                allConditions[day.predominantCondition]++;
            } else {
                allConditions[day.predominantCondition] = 1;
            }
        });
    });

    const overallPredominantCondition = Object.keys(allConditions).reduce((a, b) => 
        allConditions[a] > allConditions[b] ? a : b
    );

    return {
        totalWeeks: weeks,
        averageTemperature: allTemperatures.reduce((a, b) => a + b, 0) / allTemperatures.length,
        minTemperature: Math.min(...allTemperatures),
        maxTemperature: Math.max(...allTemperatures),
        averageHumidity: allHumidities.reduce((a, b) => a + b, 0) / allHumidities.length,
        predominantCondition: overallPredominantCondition,
        conditionDistribution: allConditions,
        totalDays: allTemperatures.length,
        temperatureRange: Math.max(...allTemperatures) - Math.min(...allTemperatures)
    };
} 