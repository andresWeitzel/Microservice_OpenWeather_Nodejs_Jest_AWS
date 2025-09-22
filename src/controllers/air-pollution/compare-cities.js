"use strict";

//helpers
const { sendGetRequest } = require("../../helpers/axios/request/get");
const { statusCode } = require("../../enums/http/status-code");
const { createJson } = require("../../helpers/file-system/create-json");
const { bodyResponse } = require("../../helpers/http/body-response");
const { getCachedWeatherData, setCachedWeatherData, hasCachedWeatherData } = require("../../helpers/cache/simple-cache");
const { validateAndCleanLocation } = require("../../helpers/weather/validate-location");

//const
const API_AIR_POLLUTION_URL_BASE = "https://api.openweathermap.org/data/2.5/air_pollution?";
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;
const FILE_PATH_AIR_POLLUTION_COMPARE = "../../../data/json/air-pollution/air-pollution-compare-data.json";

//vars
let eventPathParams;
let city1Param;
let city2Param;
let axiosConfig;
let axiosResponse1;
let axiosResponse2;
let coordinates1;
let coordinates2;

module.exports.handler = async (event) => {
    try {
        // Get path parameters
        eventPathParams = event.pathParameters;
        city1Param = eventPathParams.city1;
        city2Param = eventPathParams.city2;

        // Validate city1 parameter
        if (!city1Param || city1Param.trim() === "") {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "City1 parameter is required",
                message: "Please provide a valid city name for the first city"
            });
        }

        // Validate city2 parameter
        if (!city2Param || city2Param.trim() === "") {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "City2 parameter is required",
                message: "Please provide a valid city name for the second city"
            });
        }

        // Clean and validate locations
        const cleanedCity1 = validateAndCleanLocation(city1Param);
        const cleanedCity2 = validateAndCleanLocation(city2Param);
        
        if (!cleanedCity1) {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "Invalid city1 format",
                message: "City1 contains invalid characters"
            });
        }

        if (!cleanedCity2) {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "Invalid city2 format",
                message: "City2 contains invalid characters"
            });
        }

        // Check cache first
        const cacheKey = `air-pollution:compare:${cleanedCity1}:${cleanedCity2}`;
        if (hasCachedWeatherData(cacheKey)) {
            const cachedData = getCachedWeatherData(cacheKey);
            console.log(`Cache hit for air pollution compare: ${cacheKey}`);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_AIR_POLLUTION_COMPARE, cachedData);
            
            return bodyResponse(OK_CODE, cachedData);
        }

        axiosConfig = {
            headers: {
                "Content-Type": "application/json"
            }
        };

        // Get coordinates for both cities
        const encodedCity1 = encodeURIComponent(cleanedCity1);
        const encodedCity2 = encodeURIComponent(cleanedCity2);
        
        const geocodingURL1 = `https://api.openweathermap.org/geo/1.0/direct?q=${encodedCity1}&limit=1&appid=${API_KEY}`;
        const geocodingURL2 = `https://api.openweathermap.org/geo/1.0/direct?q=${encodedCity2}&limit=1&appid=${API_KEY}`;

        console.log("Air Pollution Compare API - Getting coordinates for:", cleanedCity1, "and", cleanedCity2);

        // Get coordinates for both cities in parallel
        const [geocodingResponse1, geocodingResponse2] = await Promise.all([
            sendGetRequest(geocodingURL1, null, axiosConfig),
            sendGetRequest(geocodingURL2, null, axiosConfig)
        ]);

        if (!geocodingResponse1 || !geocodingResponse1[0]) {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "City1 not found",
                message: `Could not find coordinates for ${cleanedCity1}`
            });
        }

        if (!geocodingResponse2 || !geocodingResponse2[0]) {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "City2 not found",
                message: `Could not find coordinates for ${cleanedCity2}`
            });
        }

        coordinates1 = geocodingResponse1[0];
        coordinates2 = geocodingResponse2[0];

        // Get air pollution data for both cities in parallel
        const airPollutionURL1 = `${API_AIR_POLLUTION_URL_BASE}lat=${coordinates1.lat}&lon=${coordinates1.lon}&appid=${API_KEY}`;
        const airPollutionURL2 = `${API_AIR_POLLUTION_URL_BASE}lat=${coordinates2.lat}&lon=${coordinates2.lon}&appid=${API_KEY}`;

        console.log("Air Pollution Compare API - Requesting data for both cities");

        const [airPollutionResponse1, airPollutionResponse2] = await Promise.all([
            sendGetRequest(airPollutionURL1, null, axiosConfig),
            sendGetRequest(airPollutionURL2, null, axiosConfig)
        ]);

        if (!airPollutionResponse1 || !airPollutionResponse1.data) {
            return bodyResponse(INTERNAL_SERVER_ERROR, {
                error: "Failed to fetch air pollution data",
                message: `No air pollution data available for ${cleanedCity1}`
            });
        }

        if (!airPollutionResponse2 || !airPollutionResponse2.data) {
            return bodyResponse(INTERNAL_SERVER_ERROR, {
                error: "Failed to fetch air pollution data",
                message: `No air pollution data available for ${cleanedCity2}`
            });
        }

        // Create comparison data
        const comparisonData = {
            city1: {
                name: cleanedCity1,
                location: {
                    city: coordinates1.name,
                    country: coordinates1.country,
                    state: coordinates1.state,
                    coordinates: {
                        lat: coordinates1.lat,
                        lon: coordinates1.lon
                    }
                },
                airPollution: airPollutionResponse1
            },
            city2: {
                name: cleanedCity2,
                location: {
                    city: coordinates2.name,
                    country: coordinates2.country,
                    state: coordinates2.state,
                    coordinates: {
                        lat: coordinates2.lat,
                        lon: coordinates2.lon
                    }
                },
                airPollution: airPollutionResponse2
            },
            comparison: generateComparison(airPollutionResponse1, airPollutionResponse2, cleanedCity1, cleanedCity2),
            metadata: {
                city1: cleanedCity1,
                city2: cleanedCity2,
                generatedAt: new Date().toISOString(),
                source: "OpenWeatherMap API",
                endpoint: "air-pollution-compare"
            }
        };

        // Cache the result
        setCachedWeatherData(cacheKey, comparisonData);

        // Save to JSON file asynchronously
        createJson(FILE_PATH_AIR_POLLUTION_COMPARE, comparisonData);

        return bodyResponse(OK_CODE, comparisonData);

    } catch (error) {
        console.error("Error in air pollution compare handler:", error);
        
        return bodyResponse(INTERNAL_SERVER_ERROR, {
            error: "Internal server error",
            message: "Failed to process air pollution compare request",
            details: error.message
        });
    }
};

/**
 * Generate comparison analysis between two cities' air pollution data
 * @param {Object} data1 - Air pollution data for city 1
 * @param {Object} data2 - Air pollution data for city 2
 * @param {string} city1Name - Name of city 1
 * @param {string} city2Name - Name of city 2
 * @returns {Object} Comparison analysis
 */
function generateComparison(data1, data2, city1Name, city2Name) {
    const aqi1 = data1.list?.[0]?.main?.aqi || 0;
    const aqi2 = data2.list?.[0]?.main?.aqi || 0;
    
    const components1 = data1.list?.[0]?.components || {};
    const components2 = data2.list?.[0]?.components || {};

    const comparison = {
        aqi: {
            city1: aqi1,
            city2: aqi2,
            difference: aqi1 - aqi2,
            betterCity: aqi1 < aqi2 ? city1Name : aqi2 < aqi1 ? city2Name : "Equal",
            level1: getAQILevel(aqi1),
            level2: getAQILevel(aqi2)
        },
        components: {
            pm2_5: {
                city1: components1.pm2_5 || 0,
                city2: components2.pm2_5 || 0,
                difference: (components1.pm2_5 || 0) - (components2.pm2_5 || 0),
                betterCity: (components1.pm2_5 || 0) < (components2.pm2_5 || 0) ? city1Name : (components2.pm2_5 || 0) < (components1.pm2_5 || 0) ? city2Name : "Equal"
            },
            pm10: {
                city1: components1.pm10 || 0,
                city2: components2.pm10 || 0,
                difference: (components1.pm10 || 0) - (components2.pm10 || 0),
                betterCity: (components1.pm10 || 0) < (components2.pm10 || 0) ? city1Name : (components2.pm10 || 0) < (components1.pm10 || 0) ? city2Name : "Equal"
            },
            no2: {
                city1: components1.no2 || 0,
                city2: components2.no2 || 0,
                difference: (components1.no2 || 0) - (components2.no2 || 0),
                betterCity: (components1.no2 || 0) < (components2.no2 || 0) ? city1Name : (components2.no2 || 0) < (components1.no2 || 0) ? city2Name : "Equal"
            },
            o3: {
                city1: components1.o3 || 0,
                city2: components2.o3 || 0,
                difference: (components1.o3 || 0) - (components2.o3 || 0),
                betterCity: (components1.o3 || 0) < (components2.o3 || 0) ? city1Name : (components2.o3 || 0) < (components1.o3 || 0) ? city2Name : "Equal"
            }
        },
        summary: {
            overallBetterCity: aqi1 < aqi2 ? city1Name : aqi2 < aqi1 ? city2Name : "Similar air quality",
            airQualityDifference: Math.abs(aqi1 - aqi2),
            recommendation: generateComparisonRecommendation(aqi1, aqi2, city1Name, city2Name)
        }
    };

    return comparison;
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
 * Generate comparison recommendation
 * @param {number} aqi1 - AQI for city 1
 * @param {number} aqi2 - AQI for city 2
 * @param {string} city1Name - Name of city 1
 * @param {string} city2Name - Name of city 2
 * @returns {string} Recommendation
 */
function generateComparisonRecommendation(aqi1, aqi2, city1Name, city2Name) {
    const difference = Math.abs(aqi1 - aqi2);
    
    if (difference <= 0.5) {
        return "Both cities have similar air quality conditions";
    }
    
    if (aqi1 < aqi2) {
        if (difference > 2) {
            return `${city1Name} has significantly better air quality than ${city2Name}`;
        } else {
            return `${city1Name} has better air quality than ${city2Name}`;
        }
    } else {
        if (difference > 2) {
            return `${city2Name} has significantly better air quality than ${city1Name}`;
        } else {
            return `${city2Name} has better air quality than ${city1Name}`;
        }
    }
}
