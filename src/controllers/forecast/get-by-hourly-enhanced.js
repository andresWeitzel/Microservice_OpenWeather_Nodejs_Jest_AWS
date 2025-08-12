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
const API_FORECAST_URL_BASE = "https://api.openweathermap.org/data/2.5/forecast?";
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;
const FILE_PATH_FORECAST_HOURLY_ENHANCED = "../../../data/json/forecast/forecast-hourly-enhanced-data.json";

//vars
let eventPathParams;
let locationParam;
let hourParam;
let axiosConfig;
let axiosResponse;
let transformedData;

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
        if (!hourParam || !validHours.includes(hourParam.toLowerCase())) {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "Invalid hour parameter",
                message: "Hour must be one of: morning, afternoon, evening, night",
                validValues: validHours
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
        const cacheKey = `forecast:hourly:${cleanedLocation}:${hourParam.toLowerCase()}`;
        if (hasCachedWeatherData(cacheKey)) {
            const cachedData = getCachedWeatherData(cacheKey);
            console.log(`Cache hit for forecast hourly enhanced: ${cacheKey}`);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_FORECAST_HOURLY_ENHANCED, cachedData);
            
            return bodyResponse(OK_CODE, cachedData);
        }

        // Prepare API request
        const encodedLocation = encodeURIComponent(cleanedLocation);
        const apiUrl = `${API_FORECAST_URL_BASE}q=${encodedLocation}&appid=${API_KEY}&units=metric`;

        axiosConfig = {
            method: "GET",
            url: apiUrl,
            headers: {
                "Content-Type": "application/json"
            }
        };

        // Make API request
        axiosResponse = await sendGetRequest(axiosConfig);

        if (!axiosResponse || !axiosResponse.data) {
            return bodyResponse(INTERNAL_SERVER_ERROR, {
                error: "Failed to fetch forecast data",
                message: "No response from OpenWeatherMap API"
            });
        }

        // Filter forecast data by hour
        const filteredData = filterForecastByHour(axiosResponse.data, hourParam.toLowerCase());
        
        if (!filteredData || filteredData.length === 0) {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "No forecast data available",
                message: `No forecast data found for ${hourParam} period in ${cleanedLocation}`,
                location: cleanedLocation,
                hour: hourParam
            });
        }

        // Transform the filtered data
        transformedData = transformForecastData(filteredData);
        
        // Add hourly-specific analysis
        const hourlyAnalysis = analyzeHourlyData(filteredData, hourParam.toLowerCase());
        transformedData.hourlyAnalysis = hourlyAnalysis;

        // Add metadata
        transformedData.metadata = {
            location: cleanedLocation,
            hour: hourParam,
            totalForecasts: filteredData.length,
            timeRange: getTimeRangeForHour(hourParam.toLowerCase()),
            generatedAt: new Date().toISOString(),
            source: "OpenWeatherMap API",
            endpoint: "forecast-enhanced-hourly"
        };

        // Cache the result
        setCachedWeatherData(cacheKey, transformedData);

        // Save to JSON file asynchronously
        createJson(FILE_PATH_FORECAST_HOURLY_ENHANCED, transformedData);

        return bodyResponse(OK_CODE, transformedData);

    } catch (error) {
        console.error("Error in forecast hourly enhanced handler:", error);
        
        return bodyResponse(INTERNAL_SERVER_ERROR, {
            error: "Internal server error",
            message: "Failed to process forecast hourly enhanced request",
            details: error.message
        });
    }
};

/**
 * Filter forecast data by specific hourly period
 * @param {Object} forecastData - Raw forecast data from OpenWeatherMap
 * @param {string} hour - Hour period (morning, afternoon, evening, night)
 * @returns {Array} Filtered forecast data for the specified hour
 */
function filterForecastByHour(forecastData, hour) {
    if (!forecastData.list || !Array.isArray(forecastData.list)) {
        return [];
    }

    const timeRange = getTimeRangeForHour(hour);
    const filteredData = [];

    forecastData.list.forEach(forecast => {
        const forecastTime = new Date(forecast.dt * 1000);
        const forecastHour = forecastTime.getHours();

        if (forecastHour >= timeRange.start && forecastHour < timeRange.end) {
            filteredData.push({
                ...forecast,
                originalTime: forecastTime,
                period: hour
            });
        }
    });

    return filteredData;
}

/**
 * Generate hourly summary for filtered data
 * @param {Array} filteredData - Filtered forecast data
 * @param {string} hour - Hour period
 * @returns {Object} Hourly summary
 */
function generateHourlySummary(filteredData, hour) {
    if (!filteredData || filteredData.length === 0) {
        return {
            period: hour,
            totalForecasts: 0,
            message: `No forecast data available for ${hour} period`
        };
    }

    const temperatures = filteredData.map(f => f.main.temp);
    const humidities = filteredData.map(f => f.main.humidity);
    const pressures = filteredData.map(f => f.main.pressure);
    const windSpeeds = filteredData.map(f => f.wind.speed);

    return {
        period: hour,
        totalForecasts: filteredData.length,
        averageTemperature: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
        minTemperature: Math.min(...temperatures),
        maxTemperature: Math.max(...temperatures),
        averageHumidity: humidities.reduce((a, b) => a + b, 0) / humidities.length,
        averagePressure: pressures.reduce((a, b) => a + b, 0) / pressures.length,
        averageWindSpeed: windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length,
        timeRange: getTimeRangeForHour(hour)
    };
}

/**
 * Analyze hourly data for enhanced insights
 * @param {Array} filteredData - Filtered forecast data
 * @param {string} hour - Hour period
 * @returns {Object} Hourly analysis
 */
function analyzeHourlyData(filteredData, hour) {
    const summary = generateHourlySummary(filteredData, hour);
    
    // Weather condition analysis
    const conditions = {};
    filteredData.forEach(forecast => {
        const mainCondition = forecast.weather[0].main;
        conditions[mainCondition] = (conditions[mainCondition] || 0) + 1;
    });

    // Comfort analysis for the period
    const avgTemp = summary.averageTemperature;
    const avgHumidity = summary.averageHumidity;
    
    let comfortLevel = "comfortable";
    let comfortDescription = "Pleasant conditions for this time of day";
    
    if (avgTemp < 10) {
        comfortLevel = "cold";
        comfortDescription = "Cold conditions, consider warm clothing";
    } else if (avgTemp > 25) {
        comfortLevel = "hot";
        comfortDescription = "Warm conditions, stay hydrated";
    }
    
    if (avgHumidity > 80) {
        comfortLevel = avgTemp > 20 ? "humid" : "damp";
        comfortDescription = "High humidity may affect comfort";
    }

    // Activity recommendations based on hour and conditions
    const recommendations = getHourlyRecommendations(hour, avgTemp, avgHumidity, conditions);

    return {
        summary,
        conditions,
        comfort: {
            level: comfortLevel,
            description: comfortDescription,
            temperature: avgTemp,
            humidity: avgHumidity
        },
        recommendations,
        period: hour,
        timeRange: getTimeRangeForHour(hour)
    };
}

/**
 * Get time range for specific hour period
 * @param {string} hour - Hour period
 * @returns {Object} Time range with start and end hours
 */
function getTimeRangeForHour(hour) {
    const ranges = {
        morning: { start: 6, end: 12, description: "6:00 AM - 12:00 PM" },
        afternoon: { start: 12, end: 18, description: "12:00 PM - 6:00 PM" },
        evening: { start: 18, end: 22, description: "6:00 PM - 10:00 PM" },
        night: { start: 22, end: 6, description: "10:00 PM - 6:00 AM" }
    };
    
    return ranges[hour] || { start: 0, end: 24, description: "Full day" };
}

/**
 * Get activity recommendations based on hour and weather conditions
 * @param {string} hour - Hour period
 * @param {number} temperature - Average temperature
 * @param {number} humidity - Average humidity
 * @param {Object} conditions - Weather conditions frequency
 * @returns {Object} Activity recommendations
 */
function getHourlyRecommendations(hour, temperature, humidity, conditions) {
    const recommendations = {
        activities: [],
        precautions: [],
        clothing: []
    };

    // Morning recommendations
    if (hour === "morning") {
        if (temperature < 15) {
            recommendations.clothing.push("Wear warm clothing");
            recommendations.activities.push("Indoor activities recommended");
        } else if (temperature > 20) {
            recommendations.clothing.push("Light clothing appropriate");
            recommendations.activities.push("Good time for outdoor activities");
        }
        
        if (humidity > 70) {
            recommendations.precautions.push("High humidity in the morning");
        }
    }

    // Afternoon recommendations
    if (hour === "afternoon") {
        if (temperature > 25) {
            recommendations.clothing.push("Light, breathable clothing");
            recommendations.precautions.push("Stay hydrated");
            recommendations.activities.push("Avoid strenuous outdoor activities");
        } else {
            recommendations.activities.push("Ideal time for outdoor activities");
        }
    }

    // Evening recommendations
    if (hour === "evening") {
        if (temperature < 15) {
            recommendations.clothing.push("Bring a jacket or sweater");
        }
        recommendations.activities.push("Good time for evening walks");
    }

    // Night recommendations
    if (hour === "night") {
        if (temperature < 10) {
            recommendations.clothing.push("Warm clothing essential");
            recommendations.precautions.push("Cold conditions at night");
        }
        recommendations.activities.push("Indoor activities recommended");
    }

    // Weather condition specific recommendations
    if (conditions.Rain || conditions.Drizzle) {
        recommendations.precautions.push("Bring umbrella or rain gear");
        recommendations.activities.push("Indoor activities preferred");
    }
    
    if (conditions.Snow) {
        recommendations.precautions.push("Be careful of slippery conditions");
        recommendations.clothing.push("Warm, waterproof clothing");
    }
    
    if (conditions.Clouds) {
        recommendations.activities.push("Good conditions for outdoor activities");
    }
    
    if (conditions.Clear) {
        if (hour === "afternoon") {
            recommendations.precautions.push("Use sunscreen");
        }
        recommendations.activities.push("Excellent conditions for outdoor activities");
    }

    return recommendations;
} 