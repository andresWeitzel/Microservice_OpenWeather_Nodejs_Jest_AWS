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
const FILE_PATH_FORECAST_EVENTS = "../../../data/json/forecast/forecast-events-data.json";

//vars
let eventPathParams;
let locationParam;
let eventTypeParam;
let axiosConfig;
let axiosResponse;

module.exports.handler = async (event) => {
    try {
        // Get path parameters
        eventPathParams = event.pathParameters;
        locationParam = eventPathParams.location;
        eventTypeParam = eventPathParams.eventType;

        // Validate location parameter
        if (!locationParam || locationParam.trim() === "") {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "Location parameter is required",
                message: "Please provide a valid location name"
            });
        }

        // Validate event type parameter
        const validEventTypes = ["weekend", "holiday", "workday", "vacation", "party", "sports"];
        if (!eventTypeParam || !validEventTypes.includes(eventTypeParam.toLowerCase())) {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "Invalid event type parameter",
                message: "Event type must be one of: weekend, holiday, workday, vacation, party, sports",
                validValues: validEventTypes
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
        const cacheKey = `forecast:events:${cleanedLocation}:${eventTypeParam.toLowerCase()}`;
        if (hasCachedWeatherData(cacheKey)) {
            const cachedData = getCachedWeatherData(cacheKey);
            console.log(`Cache hit for forecast events: ${cacheKey}`);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_FORECAST_EVENTS, cachedData);
            
            return bodyResponse(OK_CODE, cachedData);
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

        if (!axiosResponse || !axiosResponse.data) {
            return bodyResponse(INTERNAL_SERVER_ERROR, {
                error: "Failed to fetch forecast data",
                message: "No response from OpenWeatherMap API"
            });
        }

        // Filter forecast data by event type
        const eventData = filterForecastByEvent(axiosResponse.data, eventTypeParam.toLowerCase());
        
        if (!eventData || eventData.length === 0) {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "No forecast data available",
                message: `No forecast data found for ${eventTypeParam} event in ${cleanedLocation}`,
                location: cleanedLocation,
                eventType: eventTypeParam
            });
        }

        // Generate event-specific summary
        const eventSummary = generateEventSummary(eventData, eventTypeParam.toLowerCase());

        const responseData = {
            location: cleanedLocation,
            eventType: eventTypeParam,
            eventData: eventData,
            eventSummary: eventSummary,
            metadata: {
                location: cleanedLocation,
                eventType: eventTypeParam,
                totalForecasts: eventData.length,
                generatedAt: new Date().toISOString(),
                source: "OpenWeatherMap API",
                endpoint: "forecast-events"
            }
        };

        // Cache the result
        setCachedWeatherData(cacheKey, responseData);

        // Save to JSON file asynchronously
        createJson(FILE_PATH_FORECAST_EVENTS, responseData);

        return bodyResponse(OK_CODE, responseData);

    } catch (error) {
        console.error("Error in forecast events handler:", error);
        
        return bodyResponse(INTERNAL_SERVER_ERROR, {
            error: "Internal server error",
            message: "Failed to process forecast events request",
            details: error.message
        });
    }
};

/**
 * Filter forecast data by event type
 * @param {Object} forecastData - Raw forecast data from OpenWeatherMap
 * @param {string} eventType - Type of event (weekend, holiday, workday, etc.)
 * @returns {Array} Filtered forecast data for the event
 */
function filterForecastByEvent(forecastData, eventType) {
    if (!forecastData.list || !Array.isArray(forecastData.list)) {
        return [];
    }

    const currentDate = new Date();
    const filteredData = [];

    forecastData.list.forEach(forecast => {
        const forecastDate = new Date(forecast.dt * 1000);
        
        if (isEventDate(forecastDate, eventType, currentDate)) {
            filteredData.push({
                ...forecast,
                originalTime: forecastDate,
                eventType: eventType
            });
        }
    });

    return filteredData;
}

/**
 * Check if a date matches the event type
 * @param {Date} forecastDate - Forecast date to check
 * @param {string} eventType - Type of event
 * @param {Date} currentDate - Current date
 * @returns {boolean} True if date matches event type
 */
function isEventDate(forecastDate, eventType, currentDate) {
    const dayOfWeek = forecastDate.getDay(); // 0 = Sunday, 6 = Saturday
    const currentDayOfWeek = currentDate.getDay();
    const daysDiff = Math.floor((forecastDate - currentDate) / (1000 * 60 * 60 * 24));

    switch (eventType) {
        case "weekend":
            // Next weekend (Saturday and Sunday)
            return (dayOfWeek === 0 || dayOfWeek === 6) && daysDiff >= 0 && daysDiff <= 7;
        
        case "workday":
            // Next workdays (Monday to Friday)
            return dayOfWeek >= 1 && dayOfWeek <= 5 && daysDiff >= 0 && daysDiff <= 5;
        
        case "holiday":
            // Simulate holiday dates (weekends + some weekdays)
            return (dayOfWeek === 0 || dayOfWeek === 6 || dayOfWeek === 1) && daysDiff >= 0 && daysDiff <= 7;
        
        case "vacation":
            // Extended period (next 7-14 days)
            return daysDiff >= 0 && daysDiff <= 14;
        
        case "party":
            // Evening hours on weekends
            const hour = forecastDate.getHours();
            return (dayOfWeek === 0 || dayOfWeek === 6) && hour >= 18 && hour <= 23 && daysDiff >= 0 && daysDiff <= 7;
        
        case "sports":
            // Daytime hours on weekends
            const sportsHour = forecastDate.getHours();
            return (dayOfWeek === 0 || dayOfWeek === 6) && sportsHour >= 10 && sportsHour <= 17 && daysDiff >= 0 && daysDiff <= 7;
        
        default:
            return false;
    }
}

/**
 * Generate event-specific summary
 * @param {Array} eventData - Filtered forecast data for the event
 * @param {string} eventType - Type of event
 * @returns {Object} Event summary
 */
function generateEventSummary(eventData, eventType) {
    if (!eventData || eventData.length === 0) {
        return {
            eventType: eventType,
            totalForecasts: 0,
            message: `No forecast data available for ${eventType} event`
        };
    }

    const temperatures = eventData.map(f => f.main.temp);
    const humidities = eventData.map(f => f.main.humidity);
    const pressures = eventData.map(f => f.main.pressure);
    const windSpeeds = eventData.map(f => f.wind.speed);

    // Count weather conditions
    const conditions = {};
    eventData.forEach(forecast => {
        const condition = forecast.weather[0].main;
        conditions[condition] = (conditions[condition] || 0) + 1;
    });

    const predominantCondition = Object.keys(conditions).reduce((a, b) => 
        conditions[a] > conditions[b] ? a : b
    );

    // Event-specific analysis
    const eventAnalysis = getEventAnalysis(eventType, temperatures, conditions);

    return {
        eventType: eventType,
        totalForecasts: eventData.length,
        averageTemperature: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
        minTemperature: Math.min(...temperatures),
        maxTemperature: Math.max(...temperatures),
        averageHumidity: humidities.reduce((a, b) => a + b, 0) / humidities.length,
        averagePressure: pressures.reduce((a, b) => a + b, 0) / pressures.length,
        averageWindSpeed: windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length,
        predominantCondition: predominantCondition,
        conditionDistribution: conditions,
        eventAnalysis: eventAnalysis,
        suitability: calculateEventSuitability(eventType, temperatures, conditions)
    };
}

/**
 * Get event-specific analysis
 * @param {string} eventType - Type of event
 * @param {Array} temperatures - Temperature data
 * @param {Object} conditions - Weather conditions
 * @returns {Object} Event analysis
 */
function getEventAnalysis(eventType, temperatures, conditions) {
    const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const analysis = {
        suitability: "good",
        recommendations: [],
        considerations: []
    };

    switch (eventType) {
        case "weekend":
            if (avgTemp < 10) {
                analysis.suitability = "fair";
                analysis.recommendations.push("Consider indoor activities");
                analysis.considerations.push("Cold weather may limit outdoor activities");
            } else if (avgTemp > 25) {
                analysis.recommendations.push("Stay hydrated and seek shade");
                analysis.considerations.push("Hot weather - plan activities early morning or evening");
            }
            break;

        case "workday":
            if (conditions.Rain && conditions.Rain > temperatures.length * 0.3) {
                analysis.suitability = "fair";
                analysis.recommendations.push("Bring umbrella and rain gear");
                analysis.considerations.push("Rain may affect commute");
            }
            break;

        case "holiday":
            if (avgTemp > 20 && conditions.Clear) {
                analysis.suitability = "excellent";
                analysis.recommendations.push("Perfect weather for holiday activities");
            }
            break;

        case "vacation":
            if (avgTemp < 5 || avgTemp > 30) {
                analysis.suitability = "poor";
                analysis.considerations.push("Extreme temperatures may affect vacation plans");
            }
            break;

        case "party":
            if (conditions.Rain && conditions.Rain > temperatures.length * 0.2) {
                analysis.suitability = "fair";
                analysis.recommendations.push("Consider indoor venue or covered area");
                analysis.considerations.push("Rain may affect outdoor party plans");
            }
            break;

        case "sports":
            if (avgTemp < 5 || avgTemp > 30) {
                analysis.suitability = "poor";
                analysis.considerations.push("Temperature may affect sports performance");
            } else if (conditions.Rain && conditions.Rain > temperatures.length * 0.4) {
                analysis.suitability = "fair";
                analysis.recommendations.push("Consider indoor sports or reschedule");
                analysis.considerations.push("Rain may affect outdoor sports");
            }
            break;
    }

    return analysis;
}

/**
 * Calculate event suitability score
 * @param {string} eventType - Type of event
 * @param {Array} temperatures - Temperature data
 * @param {Object} conditions - Weather conditions
 * @returns {number} Suitability score (0-10)
 */
function calculateEventSuitability(eventType, temperatures, conditions) {
    let score = 10;
    const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const totalForecasts = temperatures.length;

    // Temperature penalties
    if (avgTemp < 5 || avgTemp > 30) score -= 3;
    else if (avgTemp < 10 || avgTemp > 25) score -= 1;

    // Weather condition penalties
    if (conditions.Rain && conditions.Rain > totalForecasts * 0.3) score -= 2;
    if (conditions.Snow && conditions.Snow > totalForecasts * 0.2) score -= 3;
    if (conditions.Thunderstorm) score -= 2;

    // Event-specific adjustments
    switch (eventType) {
        case "sports":
            if (avgTemp < 10 || avgTemp > 25) score -= 1;
            break;
        case "party":
            if (conditions.Rain && conditions.Rain > totalForecasts * 0.2) score -= 1;
            break;
        case "vacation":
            if (avgTemp < 10 || avgTemp > 30) score -= 2;
            break;
    }

    return Math.max(0, score);
} 