"use strict";

//helpers
const { sendGetRequest } = require("../../helpers/axios/request/get");
const { statusCode } = require("../../enums/http/status-code");
const { bodyResponse } = require("../../helpers/http/body-response");
const { transformAirPollutionData } = require("../../helpers/weather/transform-air-pollution");
const { createJson } = require("../../helpers/file-system/create-json");
const { getCachedWeatherData, setCachedWeatherData, hasCachedWeatherData } = require("../../helpers/cache/simple-cache");
const { validateAndCleanLocation } = require("../../helpers/weather/validate-location");

//const
const API_AIR_POLLUTION_FORECAST_URL_BASE = "https://api.openweathermap.org/data/2.5/air_pollution/forecast?";
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;
const FILE_PATH_AIR_POLLUTION_FORECAST_ENHANCED = "../../../data/json/air-pollution/air-pollution-forecast-enhanced-data.json";

//vars
let eventPathParams;
let locationParam;
let axiosConfig;
let axiosResponse;
let transformedData;
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
        const cacheKey = `air-pollution:forecast:enhanced:${cleanedLocation}`;
        if (hasCachedWeatherData(cacheKey)) {
            const cachedData = getCachedWeatherData(cacheKey);
            console.log(`Cache hit for air pollution forecast enhanced: ${cacheKey}`);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_AIR_POLLUTION_FORECAST_ENHANCED, cachedData);
            
            return bodyResponse(OK_CODE, cachedData);
        }

        // First, get coordinates for the location using geocoding
        const encodedLocation = encodeURIComponent(cleanedLocation);
        const geocodingURL = `https://api.openweathermap.org/geo/1.0/direct?q=${encodedLocation}&limit=1&appid=${API_KEY}`;
        
        console.log("Enhanced Air Pollution Forecast API - Getting coordinates for:", cleanedLocation);

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

        console.log("Enhanced Air Pollution Forecast API - Requesting forecast data for coordinates:", lat, lon);

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
            }
        };

        // Transform the raw OpenWeather air pollution forecast data into enriched format
        transformedData = await transformAirPollutionData(enrichedResponse);

        // Add forecast-specific analysis
        const forecastAnalysis = analyzeAirPollutionForecast(transformedData);
        transformedData.forecastAnalysis = forecastAnalysis;

        // Add metadata
        transformedData.metadata = {
            location: cleanedLocation,
            coordinates: { lat, lon },
            generatedAt: new Date().toISOString(),
            source: "OpenWeatherMap API",
            endpoint: "air-pollution-enhanced-forecast"
        };

        // Cache the result
        setCachedWeatherData(cacheKey, transformedData);

        // Save to JSON file asynchronously
        createJson(FILE_PATH_AIR_POLLUTION_FORECAST_ENHANCED, transformedData);

        return bodyResponse(OK_CODE, transformedData);

    } catch (error) {
        console.error("Error in air pollution forecast enhanced handler:", error);
        
        return bodyResponse(INTERNAL_SERVER_ERROR, {
            error: "Internal server error",
            message: "Failed to process air pollution forecast enhanced request",
            details: error.message
        });
    }
};

/**
 * Analyze air pollution forecast data for enhanced insights
 * @param {Object} forecastData - Transformed air pollution forecast data
 * @returns {Object} Forecast analysis
 */
function analyzeAirPollutionForecast(forecastData) {
    if (!forecastData.list || !Array.isArray(forecastData.list)) {
        return {
            message: "No forecast data available for analysis"
        };
    }

    const forecasts = forecastData.list;
    const aqiValues = forecasts.map(item => item.main?.aqi || 0);
    const pm25Values = forecasts.map(item => item.components?.pm2_5 || 0);
    const pm10Values = forecasts.map(item => item.components?.pm10 || 0);
    const no2Values = forecasts.map(item => item.components?.no2 || 0);
    const o3Values = forecasts.map(item => item.components?.o3 || 0);

    // Calculate trends
    const aqiTrend = calculateTrend(aqiValues);
    const pm25Trend = calculateTrend(pm25Values);
    const pm10Trend = calculateTrend(pm10Values);

    // Find worst and best days
    const worstDay = forecasts.reduce((worst, current) => 
        (current.main?.aqi || 0) > (worst.main?.aqi || 0) ? current : worst
    );
    const bestDay = forecasts.reduce((best, current) => 
        (current.main?.aqi || 0) < (best.main?.aqi || 0) ? current : best
    );

    // Generate recommendations
    const recommendations = generateForecastRecommendations(forecasts);

    return {
        summary: {
            totalForecastDays: forecasts.length,
            averageAQI: aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length,
            maxAQI: Math.max(...aqiValues),
            minAQI: Math.min(...aqiValues),
            averagePM25: pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length,
            averagePM10: pm10Values.reduce((a, b) => a + b, 0) / pm10Values.length
        },
        trends: {
            aqiTrend: aqiTrend,
            pm25Trend: pm25Trend,
            pm10Trend: pm10Trend,
            overallTrend: aqiTrend > 0 ? "Deteriorating" : aqiTrend < 0 ? "Improving" : "Stable"
        },
        extremes: {
            worstDay: {
                date: worstDay.dt_txt,
                aqi: worstDay.main?.aqi,
                level: getAQILevel(worstDay.main?.aqi)
            },
            bestDay: {
                date: bestDay.dt_txt,
                aqi: bestDay.main?.aqi,
                level: getAQILevel(bestDay.main?.aqi)
            }
        },
        recommendations: recommendations
    };
}

/**
 * Calculate trend for a series of values
 * @param {Array} values - Array of numeric values
 * @returns {number} Trend value (positive = increasing, negative = decreasing)
 */
function calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    return secondAvg - firstAvg;
}

/**
 * Get AQI level description
 * @param {number} aqi - AQI value
 * @returns {string} AQI level description
 */
function getAQILevel(aqi) {
    if (aqi <= 1) return "Good";
    if (aqi <= 2) return "Fair";
    if (aqi <= 3) return "Moderate";
    if (aqi <= 4) return "Poor";
    return "Very Poor";
}

/**
 * Generate forecast recommendations
 * @param {Array} forecasts - Array of forecast data
 * @returns {Object} Recommendations
 */
function generateForecastRecommendations(forecasts) {
    const recommendations = {
        outdoor: [],
        health: [],
        planning: []
    };

    const highPollutionDays = forecasts.filter(f => (f.main?.aqi || 0) >= 4).length;
    const totalDays = forecasts.length;
    const highPollutionPercentage = (highPollutionDays / totalDays) * 100;

    if (highPollutionPercentage > 50) {
        recommendations.outdoor.push("Limit outdoor activities - high pollution expected");
        recommendations.health.push("Consider wearing masks for outdoor activities");
        recommendations.planning.push("Plan indoor activities for most days");
    } else if (highPollutionPercentage > 25) {
        recommendations.outdoor.push("Moderate outdoor activity recommended");
        recommendations.health.push("Sensitive individuals should limit outdoor time");
    } else {
        recommendations.outdoor.push("Good conditions for outdoor activities");
        recommendations.planning.push("Ideal time for outdoor events and activities");
    }

    return recommendations;
}
