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
const API_AIR_POLLUTION_URL_BASE = "https://api.openweathermap.org/data/2.5/air_pollution?";
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;
const FILE_PATH_AIR_POLLUTION_COMPARE_ENHANCED = "../../../data/json/air-pollution/air-pollution-compare-enhanced-data.json";

//vars
let eventPathParams;
let city1Param;
let city2Param;
let axiosConfig;
let axiosResponse1;
let axiosResponse2;
let transformedData1;
let transformedData2;
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
        const cacheKey = `air-pollution:compare:enhanced:${cleanedCity1}:${cleanedCity2}`;
        if (hasCachedWeatherData(cacheKey)) {
            const cachedData = getCachedWeatherData(cacheKey);
            console.log(`Cache hit for air pollution compare enhanced: ${cacheKey}`);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_AIR_POLLUTION_COMPARE_ENHANCED, cachedData);
            
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

        console.log("Enhanced Air Pollution Compare API - Getting coordinates for:", cleanedCity1, "and", cleanedCity2);

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

        console.log("Enhanced Air Pollution Compare API - Requesting data for both cities");

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

        // Add location info to both responses
        const enrichedResponse1 = {
            ...airPollutionResponse1,
            location: {
                city: coordinates1.name,
                country: coordinates1.country,
                state: coordinates1.state,
                coordinates: {
                    lat: coordinates1.lat,
                    lon: coordinates1.lon
                }
            }
        };

        const enrichedResponse2 = {
            ...airPollutionResponse2,
            location: {
                city: coordinates2.name,
                country: coordinates2.country,
                state: coordinates2.state,
                coordinates: {
                    lat: coordinates2.lat,
                    lon: coordinates2.lon
                }
            }
        };

        // Transform both responses
        transformedData1 = await transformAirPollutionData(enrichedResponse1);
        transformedData2 = await transformAirPollutionData(enrichedResponse2);

        // Create enhanced comparison data
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
                airPollution: transformedData1
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
                airPollution: transformedData2
            },
            enhancedComparison: generateEnhancedComparison(transformedData1, transformedData2, cleanedCity1, cleanedCity2),
            metadata: {
                city1: cleanedCity1,
                city2: cleanedCity2,
                generatedAt: new Date().toISOString(),
                source: "OpenWeatherMap API",
                endpoint: "air-pollution-enhanced-compare"
            }
        };

        // Cache the result
        setCachedWeatherData(cacheKey, comparisonData);

        // Save to JSON file asynchronously
        createJson(FILE_PATH_AIR_POLLUTION_COMPARE_ENHANCED, comparisonData);

        return bodyResponse(OK_CODE, comparisonData);

    } catch (error) {
        console.error("Error in air pollution compare enhanced handler:", error);
        
        return bodyResponse(INTERNAL_SERVER_ERROR, {
            error: "Internal server error",
            message: "Failed to process air pollution compare enhanced request",
            details: error.message
        });
    }
};

/**
 * Generate enhanced comparison analysis between two cities' air pollution data
 * @param {Object} data1 - Transformed air pollution data for city 1
 * @param {Object} data2 - Transformed air pollution data for city 2
 * @param {string} city1Name - Name of city 1
 * @param {string} city2Name - Name of city 2
 * @returns {Object} Enhanced comparison analysis
 */
function generateEnhancedComparison(data1, data2, city1Name, city2Name) {
    const aqi1 = data1.current?.aqi || 0;
    const aqi2 = data2.current?.aqi || 0;
    
    const components1 = data1.current?.components || {};
    const components2 = data2.current?.components || {};

    const healthImpact1 = data1.healthImpact || {};
    const healthImpact2 = data2.healthImpact || {};

    const comparison = {
        aqi: {
            city1: aqi1,
            city2: aqi2,
            difference: aqi1 - aqi2,
            betterCity: aqi1 < aqi2 ? city1Name : aqi2 < aqi1 ? city2Name : "Equal",
            level1: getAQILevel(aqi1),
            level2: getAQILevel(aqi2),
            percentageDifference: calculatePercentageDifference(aqi1, aqi2)
        },
        components: {
            pm2_5: {
                city1: components1.pm2_5 || 0,
                city2: components2.pm2_5 || 0,
                difference: (components1.pm2_5 || 0) - (components2.pm2_5 || 0),
                betterCity: (components1.pm2_5 || 0) < (components2.pm2_5 || 0) ? city1Name : (components2.pm2_5 || 0) < (components1.pm2_5 || 0) ? city2Name : "Equal",
                healthImpact: compareHealthImpact(components1.pm2_5, components2.pm2_5, "PM2.5")
            },
            pm10: {
                city1: components1.pm10 || 0,
                city2: components2.pm10 || 0,
                difference: (components1.pm10 || 0) - (components2.pm10 || 0),
                betterCity: (components1.pm10 || 0) < (components2.pm10 || 0) ? city1Name : (components2.pm10 || 0) < (components1.pm10 || 0) ? city2Name : "Equal",
                healthImpact: compareHealthImpact(components1.pm10, components2.pm10, "PM10")
            },
            no2: {
                city1: components1.no2 || 0,
                city2: components2.no2 || 0,
                difference: (components1.no2 || 0) - (components2.no2 || 0),
                betterCity: (components1.no2 || 0) < (components2.no2 || 0) ? city1Name : (components2.no2 || 0) < (components1.no2 || 0) ? city2Name : "Equal",
                healthImpact: compareHealthImpact(components1.no2, components2.no2, "NO2")
            },
            o3: {
                city1: components1.o3 || 0,
                city2: components2.o3 || 0,
                difference: (components1.o3 || 0) - (components2.o3 || 0),
                betterCity: (components1.o3 || 0) < (components2.o3 || 0) ? city1Name : (components2.o3 || 0) < (components1.o3 || 0) ? city2Name : "Equal",
                healthImpact: compareHealthImpact(components1.o3, components2.o3, "O3")
            }
        },
        healthImpact: {
            city1: healthImpact1,
            city2: healthImpact2,
            comparison: compareOverallHealthImpact(healthImpact1, healthImpact2, city1Name, city2Name)
        },
        recommendations: {
            city1: data1.recommendations || {},
            city2: data2.recommendations || {},
            comparative: generateComparativeRecommendations(aqi1, aqi2, city1Name, city2Name)
        },
        summary: {
            overallBetterCity: aqi1 < aqi2 ? city1Name : aqi2 < aqi1 ? city2Name : "Similar air quality",
            airQualityDifference: Math.abs(aqi1 - aqi2),
            healthRiskLevel: calculateOverallHealthRisk(aqi1, aqi2),
            recommendation: generateComparisonRecommendation(aqi1, aqi2, city1Name, city2Name),
            travelAdvice: generateTravelAdvice(aqi1, aqi2, city1Name, city2Name)
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
 * Calculate percentage difference between two values
 * @param {number} value1 - First value
 * @param {number} value2 - Second value
 * @returns {number} Percentage difference
 */
function calculatePercentageDifference(value1, value2) {
    if (value2 === 0) return value1 > 0 ? 100 : 0;
    return ((value1 - value2) / value2) * 100;
}

/**
 * Compare health impact of a pollutant
 * @param {number} value1 - First value
 * @param {number} value2 - Second value
 * @param {string} pollutant - Pollutant name
 * @returns {string} Health impact comparison
 */
function compareHealthImpact(value1, value2, pollutant) {
    const diff = Math.abs(value1 - value2);
    if (diff < 5) return `Similar ${pollutant} levels - minimal health impact difference`;
    if (value1 < value2) return `Lower ${pollutant} in city 1 - reduced health risks`;
    return `Lower ${pollutant} in city 2 - reduced health risks`;
}

/**
 * Compare overall health impact
 * @param {Object} health1 - Health impact for city 1
 * @param {Object} health2 - Health impact for city 2
 * @param {string} city1Name - Name of city 1
 * @param {string} city2Name - Name of city 2
 * @returns {Object} Health impact comparison
 */
function compareOverallHealthImpact(health1, health2, city1Name, city2Name) {
    return {
        respiratoryRisk: health1.respiratoryRisk < health2.respiratoryRisk ? 
            `${city1Name} has lower respiratory risk` : 
            health2.respiratoryRisk < health1.respiratoryRisk ? 
            `${city2Name} has lower respiratory risk` : 
            "Similar respiratory risk levels",
        cardiovascularRisk: health1.cardiovascularRisk < health2.cardiovascularRisk ? 
            `${city1Name} has lower cardiovascular risk` : 
            health2.cardiovascularRisk < health1.cardiovascularRisk ? 
            `${city2Name} has lower cardiovascular risk` : 
            "Similar cardiovascular risk levels",
        overallRisk: health1.overallRisk < health2.overallRisk ? 
            `${city1Name} has lower overall health risk` : 
            health2.overallRisk < health1.overallRisk ? 
            `${city2Name} has lower overall health risk` : 
            "Similar overall health risk levels"
    };
}

/**
 * Calculate overall health risk
 * @param {number} aqi1 - AQI for city 1
 * @param {number} aqi2 - AQI for city 2
 * @returns {string} Overall health risk level
 */
function calculateOverallHealthRisk(aqi1, aqi2) {
    const avgAQI = (aqi1 + aqi2) / 2;
    if (avgAQI <= 2) return "Low";
    if (avgAQI <= 3) return "Moderate";
    if (avgAQI <= 4) return "High";
    return "Very High";
}

/**
 * Generate comparative recommendations
 * @param {number} aqi1 - AQI for city 1
 * @param {number} aqi2 - AQI for city 2
 * @param {string} city1Name - Name of city 1
 * @param {string} city2Name - Name of city 2
 * @returns {Object} Comparative recommendations
 */
function generateComparativeRecommendations(aqi1, aqi2, city1Name, city2Name) {
    const recommendations = {
        outdoor: [],
        health: [],
        travel: []
    };

    if (aqi1 < aqi2) {
        recommendations.outdoor.push(`${city1Name} is better for outdoor activities`);
        recommendations.health.push(`Sensitive individuals should prefer ${city1Name}`);
        recommendations.travel.push(`Consider ${city1Name} for better air quality`);
    } else if (aqi2 < aqi1) {
        recommendations.outdoor.push(`${city2Name} is better for outdoor activities`);
        recommendations.health.push(`Sensitive individuals should prefer ${city2Name}`);
        recommendations.travel.push(`Consider ${city2Name} for better air quality`);
    } else {
        recommendations.outdoor.push("Both cities have similar outdoor conditions");
        recommendations.health.push("Health considerations are similar for both cities");
        recommendations.travel.push("Air quality is comparable in both cities");
    }

    return recommendations;
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

/**
 * Generate travel advice
 * @param {number} aqi1 - AQI for city 1
 * @param {number} aqi2 - AQI for city 2
 * @param {string} city1Name - Name of city 1
 * @param {string} city2Name - Name of city 2
 * @returns {string} Travel advice
 */
function generateTravelAdvice(aqi1, aqi2, city1Name, city2Name) {
    if (aqi1 < aqi2) {
        return `For travelers with respiratory conditions, ${city1Name} would be a better choice`;
    } else if (aqi2 < aqi1) {
        return `For travelers with respiratory conditions, ${city2Name} would be a better choice`;
    } else {
        return "Both cities offer similar air quality conditions for travelers";
    }
}
