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
const FILE_PATH_FORECAST_EVENTS_ENHANCED = "../../../data/json/forecast/forecast-events-enhanced-data.json";

//vars
let eventPathParams;
let locationParam;
let eventTypeParam;
let axiosConfig;
let axiosResponse;
let transformedData;

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
        const cacheKey = `forecast:events:enhanced:${cleanedLocation}:${eventTypeParam.toLowerCase()}`;
        if (hasCachedWeatherData(cacheKey)) {
            const cachedData = getCachedWeatherData(cacheKey);
            console.log(`Cache hit for forecast events enhanced: ${cacheKey}`);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_FORECAST_EVENTS_ENHANCED, cachedData);
            
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

        // Transform the event data: build minimal forecast object expected by transformer
        const minimalForecast = {
            city: axiosResponse.data.city,
            list: eventData,
            cnt: eventData.length
        };
        transformedData = await transformForecastData(minimalForecast);
        
        // Add event-specific analysis
        const eventAnalysis = analyzeEventData(eventData, eventTypeParam.toLowerCase());
        transformedData.eventAnalysis = eventAnalysis;

        // Add metadata
        transformedData.metadata = {
            location: cleanedLocation,
            eventType: eventTypeParam,
            totalForecasts: eventData.length,
            generatedAt: new Date().toISOString(),
            source: "OpenWeatherMap API",
            endpoint: "forecast-enhanced-events"
        };

        // Cache the result
        setCachedWeatherData(cacheKey, transformedData);

        // Save to JSON file asynchronously
        createJson(FILE_PATH_FORECAST_EVENTS_ENHANCED, transformedData);

        return bodyResponse(OK_CODE, transformedData);

    } catch (error) {
        console.error("Error in forecast events enhanced handler:", error);
        
        return bodyResponse(INTERNAL_SERVER_ERROR, {
            error: "Internal server error",
            message: "Failed to process forecast events enhanced request",
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
 * Analyze event data for enhanced insights
 * @param {Array} eventData - Filtered forecast data for the event
 * @param {string} eventType - Type of event
 * @returns {Object} Enhanced event analysis
 */
function analyzeEventData(eventData, eventType) {
    const eventSummary = generateEventSummary(eventData, eventType);
    
    // Detailed event analysis
    const detailedAnalysis = getDetailedEventAnalysis(eventType, eventData);
    
    // Planning insights
    const planningInsights = getEventPlanningInsights(eventType, eventData);
    
    // Risk assessment
    const riskAssessment = assessEventRisks(eventType, eventData);
    
    // Alternative suggestions
    const alternatives = getEventAlternatives(eventType, eventData);

    return {
        summary: eventSummary,
        detailedAnalysis: detailedAnalysis,
        planningInsights: planningInsights,
        riskAssessment: riskAssessment,
        alternatives: alternatives,
        eventType: eventType
    };
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
        suitability: calculateEventSuitability(eventType, temperatures, conditions)
    };
}

/**
 * Get detailed event analysis
 * @param {string} eventType - Type of event
 * @param {Array} eventData - Event forecast data
 * @returns {Object} Detailed analysis
 */
function getDetailedEventAnalysis(eventType, eventData) {
    const analysis = {
        timing: {},
        conditions: {},
        recommendations: {},
        considerations: {}
    };

    const temperatures = eventData.map(f => f.main.temp);
    const conditions = {};
    eventData.forEach(forecast => {
        const condition = forecast.weather[0].main;
        conditions[condition] = (conditions[condition] || 0) + 1;
    });

    const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;

    // Timing analysis
    analysis.timing = {
        bestTime: getBestTimeForEvent(eventType, eventData),
        worstTime: getWorstTimeForEvent(eventType, eventData),
        duration: eventData.length * 3, // 3-hour intervals
        timeRange: getEventTimeRange(eventData)
    };

    // Conditions analysis
    analysis.conditions = {
        temperatureRange: Math.max(...temperatures) - Math.min(...temperatures),
        temperatureTrend: getTemperatureTrend(temperatures),
        weatherStability: calculateWeatherStability(conditions, eventData.length),
        windConditions: analyzeWindConditions(eventData)
    };

    // Event-specific recommendations
    analysis.recommendations = getEventSpecificRecommendations(eventType, avgTemp, conditions, eventData.length);

    // Considerations
    analysis.considerations = getEventConsiderations(eventType, avgTemp, conditions, eventData.length);

    return analysis;
}

/**
 * Get event planning insights
 * @param {string} eventType - Type of event
 * @param {Array} eventData - Event forecast data
 * @returns {Object} Planning insights
 */
function getEventPlanningInsights(eventType, eventData) {
    const insights = {
        preparation: [],
        timing: [],
        logistics: [],
        backup: []
    };

    const avgTemp = eventData.reduce((sum, f) => sum + f.main.temp, 0) / eventData.length;
    const conditions = {};
    eventData.forEach(forecast => {
        const condition = forecast.weather[0].main;
        conditions[condition] = (conditions[condition] || 0) + 1;
    });

    // Preparation insights
    if (avgTemp < 10) {
        insights.preparation.push("Plan for cold weather - bring warm clothing and heating options");
    } else if (avgTemp > 25) {
        insights.preparation.push("Plan for hot weather - bring cooling options and stay hydrated");
    }

    if (conditions.Rain && conditions.Rain > eventData.length * 0.3) {
        insights.preparation.push("High chance of rain - prepare rain gear and waterproof items");
    }

    // Timing insights
    const bestTime = getBestTimeForEvent(eventType, eventData);
    if (bestTime) {
        insights.timing.push(`Best time for ${eventType}: ${bestTime}`);
    }

    // Logistics insights
    if (eventType === "vacation" && eventData.length > 10) {
        insights.logistics.push("Long-term event - consider booking accommodations and activities in advance");
    }

    // Backup insights
    if (conditions.Rain && conditions.Rain > eventData.length * 0.4) {
        insights.backup.push("Consider indoor alternatives due to high chance of rain");
    }

    return insights;
}

/**
 * Assess event risks
 * @param {string} eventType - Type of event
 * @param {Array} eventData - Event forecast data
 * @returns {Object} Risk assessment
 */
function assessEventRisks(eventType, eventData) {
    const risks = {
        high: [],
        medium: [],
        low: [],
        overall: "low"
    };

    const avgTemp = eventData.reduce((sum, f) => sum + f.main.temp, 0) / eventData.length;
    const conditions = {};
    eventData.forEach(forecast => {
        const condition = forecast.weather[0].main;
        conditions[condition] = (conditions[condition] || 0) + 1;
    });

    // Temperature risks
    if (avgTemp < 0 || avgTemp > 35) {
        risks.high.push("Extreme temperatures may pose health risks");
        risks.overall = "high";
    } else if (avgTemp < 5 || avgTemp > 30) {
        risks.medium.push("Temperature may affect comfort and activities");
        if (risks.overall === "low") risks.overall = "medium";
    }

    // Weather condition risks
    if (conditions.Thunderstorm) {
        risks.high.push("Thunderstorms may pose safety risks");
        risks.overall = "high";
    }

    if (conditions.Snow && conditions.Snow > eventData.length * 0.2) {
        risks.medium.push("Snow may affect travel and activities");
        if (risks.overall === "low") risks.overall = "medium";
    }

    if (conditions.Rain && conditions.Rain > eventData.length * 0.5) {
        risks.medium.push("Heavy rain may affect outdoor activities");
        if (risks.overall === "low") risks.overall = "medium";
    }

    // Event-specific risks
    switch (eventType) {
        case "sports":
            if (avgTemp < 5 || avgTemp > 30) {
                risks.medium.push("Temperature may affect sports performance");
            }
            break;
        case "party":
            if (conditions.Rain && conditions.Rain > eventData.length * 0.3) {
                risks.medium.push("Rain may affect outdoor party plans");
            }
            break;
        case "vacation":
            if (avgTemp < 10 || avgTemp > 30) {
                risks.medium.push("Temperature may affect vacation enjoyment");
            }
            break;
    }

    return risks;
}

/**
 * Get event alternatives
 * @param {string} eventType - Type of event
 * @param {Array} eventData - Event forecast data
 * @returns {Object} Alternative suggestions
 */
function getEventAlternatives(eventType, eventData) {
    const alternatives = {
        indoor: [],
        outdoor: [],
        timing: [],
        location: []
    };

    const avgTemp = eventData.reduce((sum, f) => sum + f.main.temp, 0) / eventData.length;
    const conditions = {};
    eventData.forEach(forecast => {
        const condition = forecast.weather[0].main;
        conditions[condition] = (conditions[condition] || 0) + 1;
    });

    // Indoor alternatives
    if (avgTemp < 10 || (conditions.Rain && conditions.Rain > eventData.length * 0.3)) {
        switch (eventType) {
            case "sports":
                alternatives.indoor.push("Indoor sports facilities", "Gym activities", "Swimming pool");
                break;
            case "party":
                alternatives.indoor.push("Indoor venue", "Restaurant booking", "Community center");
                break;
            case "weekend":
                alternatives.indoor.push("Museums", "Shopping centers", "Movie theaters");
                break;
        }
    }

    // Outdoor alternatives
    if (avgTemp > 20 && conditions.Clear) {
        alternatives.outdoor.push("Parks and gardens", "Beach activities", "Hiking trails");
    }

    // Timing alternatives
    const bestTime = getBestTimeForEvent(eventType, eventData);
    if (bestTime) {
        alternatives.timing.push(`Reschedule to ${bestTime} for better conditions`);
    }

    // Location alternatives
    alternatives.location.push("Consider nearby indoor venues", "Check for covered outdoor areas");

    return alternatives;
}

/**
 * Get best time for event
 * @param {string} eventType - Type of event
 * @param {Array} eventData - Event forecast data
 * @returns {string} Best time description
 */
function getBestTimeForEvent(eventType, eventData) {
    // Find forecast with best conditions for the event type
    let bestForecast = eventData[0];
    let bestScore = 0;

    eventData.forEach(forecast => {
        const score = calculateEventScore(eventType, forecast);
        if (score > bestScore) {
            bestScore = score;
            bestForecast = forecast;
        }
    });

    if (bestForecast) {
        const date = new Date(bestForecast.originalTime);
        return `${date.toLocaleDateString()} at ${date.getHours()}:00`;
    }

    return null;
}

/**
 * Get worst time for event
 * @param {string} eventType - Type of event
 * @param {Array} eventData - Event forecast data
 * @returns {string} Worst time description
 */
function getWorstTimeForEvent(eventType, eventData) {
    let worstForecast = eventData[0];
    let worstScore = 10;

    eventData.forEach(forecast => {
        const score = calculateEventScore(eventType, forecast);
        if (score < worstScore) {
            worstScore = score;
            worstForecast = forecast;
        }
    });

    if (worstForecast) {
        const date = new Date(worstForecast.originalTime);
        return `${date.toLocaleDateString()} at ${date.getHours()}:00`;
    }

    return null;
}

/**
 * Calculate event score
 * @param {string} eventType - Type of event
 * @param {Object} forecast - Forecast data
 * @returns {number} Score (0-10)
 */
function calculateEventScore(eventType, forecast) {
    let score = 10;
    const temp = forecast.main.temp;
    const condition = forecast.weather[0].main;

    // Temperature penalties
    if (temp < 5 || temp > 30) score -= 3;
    else if (temp < 10 || temp > 25) score -= 1;

    // Weather condition penalties
    if (condition === 'Thunderstorm') score -= 3;
    else if (condition === 'Snow') score -= 2;
    else if (condition === 'Rain') score -= 1;

    // Event-specific adjustments
    switch (eventType) {
        case "sports":
            if (temp < 10 || temp > 25) score -= 1;
            if (condition === 'Rain') score -= 1;
            break;
        case "party":
            if (condition === 'Rain') score -= 1;
            break;
    }

    return Math.max(0, score);
}

/**
 * Get event time range
 * @param {Array} eventData - Event forecast data
 * @returns {Object} Time range
 */
function getEventTimeRange(eventData) {
    if (eventData.length === 0) return null;

    const startTime = new Date(eventData[0].originalTime);
    const endTime = new Date(eventData[eventData.length - 1].originalTime);

    return {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        duration: eventData.length * 3 // hours
    };
}

/**
 * Get temperature trend
 * @param {Array} temperatures - Temperature data
 * @returns {string} Trend description
 */
function getTemperatureTrend(temperatures) {
    if (temperatures.length < 2) return "stable";

    const firstHalf = temperatures.slice(0, Math.floor(temperatures.length / 2));
    const secondHalf = temperatures.slice(Math.floor(temperatures.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;

    if (diff > 2) return "warming";
    else if (diff < -2) return "cooling";
    else return "stable";
}

/**
 * Calculate weather stability
 * @param {Object} conditions - Weather conditions
 * @param {number} totalForecasts - Total number of forecasts
 * @returns {string} Stability description
 */
function calculateWeatherStability(conditions, totalForecasts) {
    const conditionCount = Object.keys(conditions).length;
    const maxConditionCount = Math.max(...Object.values(conditions));

    if (conditionCount === 1) return "very stable";
    else if (maxConditionCount > totalForecasts * 0.7) return "stable";
    else if (maxConditionCount > totalForecasts * 0.5) return "moderate";
    else return "unstable";
}

/**
 * Analyze wind conditions
 * @param {Array} eventData - Event forecast data
 * @returns {Object} Wind analysis
 */
function analyzeWindConditions(eventData) {
    const windSpeeds = eventData.map(f => f.wind.speed);
    const avgWindSpeed = windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length;
    const maxWindSpeed = Math.max(...windSpeeds);

    return {
        average: avgWindSpeed,
        maximum: maxWindSpeed,
        condition: avgWindSpeed < 5 ? "calm" : avgWindSpeed < 10 ? "light" : "moderate"
    };
}

/**
 * Get event-specific recommendations
 * @param {string} eventType - Type of event
 * @param {number} avgTemp - Average temperature
 * @param {Object} conditions - Weather conditions
 * @param {number} totalForecasts - Total forecasts
 * @returns {Object} Recommendations
 */
function getEventSpecificRecommendations(eventType, avgTemp, conditions, totalForecasts) {
    const recommendations = {
        clothing: [],
        equipment: [],
        timing: [],
        activities: []
    };

    // Temperature-based recommendations
    if (avgTemp < 10) {
        recommendations.clothing.push("Warm clothing essential");
        recommendations.equipment.push("Heating options if needed");
    } else if (avgTemp > 25) {
        recommendations.clothing.push("Light, breathable clothing");
        recommendations.equipment.push("Cooling options and hydration");
    }

    // Weather condition recommendations
    if (conditions.Rain && conditions.Rain > totalForecasts * 0.3) {
        recommendations.equipment.push("Rain gear and waterproof items");
        recommendations.activities.push("Consider indoor alternatives");
    }

    // Event-specific recommendations
    switch (eventType) {
        case "sports":
            if (avgTemp < 10) recommendations.activities.push("Warm up properly");
            if (conditions.Rain) recommendations.activities.push("Consider indoor sports");
            break;
        case "party":
            if (conditions.Rain) recommendations.equipment.push("Covered venue or tent");
            break;
        case "vacation":
            recommendations.timing.push("Plan activities around weather conditions");
            break;
    }

    return recommendations;
}

/**
 * Get event considerations
 * @param {string} eventType - Type of event
 * @param {number} avgTemp - Average temperature
 * @param {Object} conditions - Weather conditions
 * @param {number} totalForecasts - Total forecasts
 * @returns {Object} Considerations
 */
function getEventConsiderations(eventType, avgTemp, conditions, totalForecasts) {
    const considerations = {
        health: [],
        safety: [],
        comfort: [],
        logistics: []
    };

    // Health considerations
    if (avgTemp < 0 || avgTemp > 35) {
        considerations.health.push("Extreme temperatures may affect health");
    }

    // Safety considerations
    if (conditions.Thunderstorm) {
        considerations.safety.push("Thunderstorms pose safety risks");
    }

    // Comfort considerations
    if (avgTemp < 10 || avgTemp > 25) {
        considerations.comfort.push("Temperature may affect comfort");
    }

    // Logistics considerations
    if (conditions.Rain && conditions.Rain > totalForecasts * 0.4) {
        considerations.logistics.push("Rain may affect travel and setup");
    }

    return considerations;
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