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
const FILE_PATH_FORECAST_COMPARE = "../../../data/json/forecast/forecast-compare-data.json";

//vars
let eventPathParams;
let locationParam;
let period1Param;
let period2Param;
let axiosConfig;
let axiosResponse;

module.exports.handler = async (event) => {
    try {
        // Get path parameters
        eventPathParams = event.pathParameters;
        locationParam = eventPathParams.location;
        period1Param = eventPathParams.period1;
        period2Param = eventPathParams.period2;

        // Validate location parameter
        if (!locationParam || locationParam.trim() === "") {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "Location parameter is required",
                message: "Please provide a valid location name"
            });
        }

        // Validate period parameters
        const validPeriods = ["today", "tomorrow", "weekend", "next_week", "morning", "afternoon", "evening", "night"];
        if (!period1Param || !period2Param || 
            !validPeriods.includes(period1Param.toLowerCase()) || 
            !validPeriods.includes(period2Param.toLowerCase())) {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "Invalid period parameters",
                message: "Both periods must be one of: today, tomorrow, weekend, next_week, morning, afternoon, evening, night",
                validValues: validPeriods
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
        const cacheKey = `forecast:compare:${cleanedLocation}:${period1Param.toLowerCase()}:${period2Param.toLowerCase()}`;
        if (hasCachedWeatherData(cacheKey)) {
            const cachedData = getCachedWeatherData(cacheKey);
            console.log(`Cache hit for forecast compare: ${cacheKey}`);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_FORECAST_COMPARE, cachedData);
            
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

        // Compare forecast data between periods
        const comparisonData = compareForecastPeriods(axiosResponse.data, period1Param.toLowerCase(), period2Param.toLowerCase());
        
        if (!comparisonData || !comparisonData.period1Data || !comparisonData.period2Data) {
            return bodyResponse(BAD_REQUEST_CODE, {
                error: "No forecast data available for comparison",
                message: `No forecast data found for comparison between ${period1Param} and ${period2Param} in ${cleanedLocation}`,
                location: cleanedLocation,
                period1: period1Param,
                period2: period2Param
            });
        }

        // Generate comparison analysis
        const comparisonAnalysis = generateComparisonAnalysis(comparisonData, period1Param, period2Param);

        const responseData = {
            location: cleanedLocation,
            period1: period1Param,
            period2: period2Param,
            comparisonData: comparisonData,
            comparisonAnalysis: comparisonAnalysis,
            metadata: {
                location: cleanedLocation,
                period1: period1Param,
                period2: period2Param,
                generatedAt: new Date().toISOString(),
                source: "OpenWeatherMap API",
                endpoint: "forecast-compare"
            }
        };

        // Cache the result
        setCachedWeatherData(cacheKey, responseData);

        // Save to JSON file asynchronously
        createJson(FILE_PATH_FORECAST_COMPARE, responseData);

        return bodyResponse(OK_CODE, responseData);

    } catch (error) {
        console.error("Error in forecast compare handler:", error);
        
        return bodyResponse(INTERNAL_SERVER_ERROR, {
            error: "Internal server error",
            message: "Failed to process forecast compare request",
            details: error.message
        });
    }
};

/**
 * Compare forecast data between two periods
 * @param {Object} forecastData - Raw forecast data from OpenWeatherMap
 * @param {string} period1 - First period to compare
 * @param {string} period2 - Second period to compare
 * @returns {Object} Comparison data
 */
function compareForecastPeriods(forecastData, period1, period2) {
    if (!forecastData.list || !Array.isArray(forecastData.list)) {
        return null;
    }

    const currentDate = new Date();
    
    // Get data for both periods
    const period1Data = filterForecastByPeriod(forecastData, period1, currentDate);
    const period2Data = filterForecastByPeriod(forecastData, period2, currentDate);

    if (!period1Data || !period2Data) {
        return null;
    }

    return {
        period1Data: period1Data,
        period2Data: period2Data,
        period1: period1,
        period2: period2
    };
}

/**
 * Filter forecast data by period
 * @param {Object} forecastData - Raw forecast data
 * @param {string} period - Period to filter
 * @param {Date} currentDate - Current date
 * @returns {Array} Filtered forecast data
 */
function filterForecastByPeriod(forecastData, period, currentDate) {
    const filteredData = [];

    forecastData.list.forEach(forecast => {
        const forecastDate = new Date(forecast.dt * 1000);
        
        if (isPeriodDate(forecastDate, period, currentDate)) {
            filteredData.push({
                ...forecast,
                originalTime: forecastDate,
                period: period
            });
        }
    });

    return filteredData;
}

/**
 * Check if a date matches the period
 * @param {Date} forecastDate - Forecast date to check
 * @param {string} period - Period to match
 * @param {Date} currentDate - Current date
 * @returns {boolean} True if date matches period
 */
function isPeriodDate(forecastDate, period, currentDate) {
    const dayOfWeek = forecastDate.getDay(); // 0 = Sunday, 6 = Saturday
    const currentDayOfWeek = currentDate.getDay();
    const daysDiff = Math.floor((forecastDate - currentDate) / (1000 * 60 * 60 * 24));
    const hour = forecastDate.getHours();

    switch (period) {
        case "today":
            return daysDiff === 0;
        
        case "tomorrow":
            return daysDiff === 1;
        
        case "weekend":
            return (dayOfWeek === 0 || dayOfWeek === 6) && daysDiff >= 0 && daysDiff <= 7;
        
        case "next_week":
            return daysDiff >= 7 && daysDiff <= 14;
        
        case "morning":
            return hour >= 6 && hour < 12 && daysDiff >= 0 && daysDiff <= 5;
        
        case "afternoon":
            return hour >= 12 && hour < 18 && daysDiff >= 0 && daysDiff <= 5;
        
        case "evening":
            return hour >= 18 && hour < 22 && daysDiff >= 0 && daysDiff <= 5;
        
        case "night":
            return (hour >= 22 || hour < 6) && daysDiff >= 0 && daysDiff <= 5;
        
        default:
            return false;
    }
}

/**
 * Generate comparison analysis
 * @param {Object} comparisonData - Comparison data
 * @param {string} period1 - First period
 * @param {string} period2 - Second period
 * @returns {Object} Comparison analysis
 */
function generateComparisonAnalysis(comparisonData, period1, period2) {
    const period1Summary = generatePeriodSummary(comparisonData.period1Data, period1);
    const period2Summary = generatePeriodSummary(comparisonData.period2Data, period2);
    
    // Calculate differences
    const differences = calculatePeriodDifferences(period1Summary, period2Summary);
    
    // Generate insights
    const insights = generateComparisonInsights(period1Summary, period2Summary, period1, period2);
    
    // Determine better period
    const betterPeriod = determineBetterPeriod(period1Summary, period2Summary, period1, period2);

    return {
        period1Summary: period1Summary,
        period2Summary: period2Summary,
        differences: differences,
        insights: insights,
        betterPeriod: betterPeriod,
        recommendation: generateComparisonRecommendation(period1Summary, period2Summary, period1, period2)
    };
}

/**
 * Generate period summary
 * @param {Array} periodData - Period forecast data
 * @param {string} period - Period name
 * @returns {Object} Period summary
 */
function generatePeriodSummary(periodData, period) {
    if (!periodData || periodData.length === 0) {
        return {
            period: period,
            totalForecasts: 0,
            message: `No forecast data available for ${period}`
        };
    }

    const temperatures = periodData.map(f => f.main.temp);
    const humidities = periodData.map(f => f.main.humidity);
    const pressures = periodData.map(f => f.main.pressure);
    const windSpeeds = periodData.map(f => f.wind.speed);

    // Count weather conditions
    const conditions = {};
    periodData.forEach(forecast => {
        const condition = forecast.weather[0].main;
        conditions[condition] = (conditions[condition] || 0) + 1;
    });

    const predominantCondition = Object.keys(conditions).reduce((a, b) => 
        conditions[a] > conditions[b] ? a : b
    );

    return {
        period: period,
        totalForecasts: periodData.length,
        averageTemperature: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
        minTemperature: Math.min(...temperatures),
        maxTemperature: Math.max(...temperatures),
        averageHumidity: humidities.reduce((a, b) => a + b, 0) / humidities.length,
        averagePressure: pressures.reduce((a, b) => a + b, 0) / pressures.length,
        averageWindSpeed: windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length,
        predominantCondition: predominantCondition,
        conditionDistribution: conditions,
        temperatureRange: Math.max(...temperatures) - Math.min(...temperatures),
        comfortScore: calculateComfortScore(temperatures, humidities)
    };
}

/**
 * Calculate period differences
 * @param {Object} period1Summary - First period summary
 * @param {Object} period2Summary - Second period summary
 * @returns {Object} Differences between periods
 */
function calculatePeriodDifferences(period1Summary, period2Summary) {
    if (!period1Summary.averageTemperature || !period2Summary.averageTemperature) {
        return {
            message: "Cannot calculate differences - insufficient data"
        };
    }

    const tempDiff = period2Summary.averageTemperature - period1Summary.averageTemperature;
    const humidityDiff = period2Summary.averageHumidity - period1Summary.averageHumidity;
    const pressureDiff = period2Summary.averagePressure - period1Summary.averagePressure;
    const windDiff = period2Summary.averageWindSpeed - period1Summary.averageWindSpeed;
    const comfortDiff = period2Summary.comfortScore - period1Summary.comfortScore;

    return {
        temperature: {
            difference: tempDiff,
            percentage: ((tempDiff / period1Summary.averageTemperature) * 100).toFixed(1),
            description: tempDiff > 0 ? "warmer" : tempDiff < 0 ? "cooler" : "same"
        },
        humidity: {
            difference: humidityDiff,
            percentage: ((humidityDiff / period1Summary.averageHumidity) * 100).toFixed(1),
            description: humidityDiff > 0 ? "more humid" : humidityDiff < 0 ? "less humid" : "same"
        },
        pressure: {
            difference: pressureDiff,
            percentage: ((pressureDiff / period1Summary.averagePressure) * 100).toFixed(1),
            description: pressureDiff > 0 ? "higher pressure" : pressureDiff < 0 ? "lower pressure" : "same"
        },
        wind: {
            difference: windDiff,
            percentage: ((windDiff / period1Summary.averageWindSpeed) * 100).toFixed(1),
            description: windDiff > 0 ? "windier" : windDiff < 0 ? "calmer" : "same"
        },
        comfort: {
            difference: comfortDiff,
            description: comfortDiff > 0 ? "more comfortable" : comfortDiff < 0 ? "less comfortable" : "same"
        }
    };
}

/**
 * Generate comparison insights
 * @param {Object} period1Summary - First period summary
 * @param {Object} period2Summary - Second period summary
 * @param {string} period1 - First period name
 * @param {string} period2 - Second period name
 * @returns {Object} Comparison insights
 */
function generateComparisonInsights(period1Summary, period2Summary, period1, period2) {
    const insights = {
        temperature: [],
        conditions: [],
        activities: [],
        planning: []
    };

    const tempDiff = period2Summary.averageTemperature - period1Summary.averageTemperature;
    const comfortDiff = period2Summary.comfortScore - period1Summary.comfortScore;

    // Temperature insights
    if (Math.abs(tempDiff) > 5) {
        insights.temperature.push(`${period2} will be significantly ${tempDiff > 0 ? 'warmer' : 'cooler'} than ${period1}`);
    } else if (Math.abs(tempDiff) > 2) {
        insights.temperature.push(`${period2} will be ${tempDiff > 0 ? 'warmer' : 'cooler'} than ${period1}`);
    }

    // Condition insights
    if (period1Summary.predominantCondition !== period2Summary.predominantCondition) {
        insights.conditions.push(`Weather conditions will change from ${period1Summary.predominantCondition} to ${period2Summary.predominantCondition}`);
    }

    // Activity insights
    if (comfortDiff > 2) {
        insights.activities.push(`${period2} will be better for outdoor activities`);
    } else if (comfortDiff < -2) {
        insights.activities.push(`${period1} will be better for outdoor activities`);
    }

    // Planning insights
    if (tempDiff > 5) {
        insights.planning.push(`Consider lighter clothing for ${period2}`);
    } else if (tempDiff < -5) {
        insights.planning.push(`Consider warmer clothing for ${period2}`);
    }

    return insights;
}

/**
 * Determine better period
 * @param {Object} period1Summary - First period summary
 * @param {Object} period2Summary - Second period summary
 * @param {string} period1 - First period name
 * @param {string} period2 - Second period name
 * @returns {Object} Better period analysis
 */
function determineBetterPeriod(period1Summary, period2Summary, period1, period2) {
    const comfortDiff = period2Summary.comfortScore - period1Summary.comfortScore;
    
    if (comfortDiff > 1) {
        return {
            period: period2,
            reason: "Better comfort score",
            difference: comfortDiff
        };
    } else if (comfortDiff < -1) {
        return {
            period: period1,
            reason: "Better comfort score",
            difference: Math.abs(comfortDiff)
        };
    } else {
        return {
            period: "similar",
            reason: "Both periods have similar conditions",
            difference: Math.abs(comfortDiff)
        };
    }
}

/**
 * Generate comparison recommendation
 * @param {Object} period1Summary - First period summary
 * @param {Object} period2Summary - Second period summary
 * @param {string} period1 - First period name
 * @param {string} period2 - Second period name
 * @returns {Object} Recommendation
 */
function generateComparisonRecommendation(period1Summary, period2Summary, period1, period2) {
    const tempDiff = period2Summary.averageTemperature - period1Summary.averageTemperature;
    const comfortDiff = period2Summary.comfortScore - period1Summary.comfortScore;

    let recommendation = {
        action: "consider",
        message: "",
        priority: "medium"
    };

    if (Math.abs(tempDiff) > 5) {
        recommendation.message = `Significant temperature difference: ${period2} will be ${tempDiff > 0 ? 'warmer' : 'cooler'} than ${period1}`;
        recommendation.priority = "high";
    } else if (Math.abs(comfortDiff) > 2) {
        recommendation.message = `${comfortDiff > 0 ? period2 : period1} offers better comfort conditions`;
        recommendation.priority = "medium";
    } else {
        recommendation.message = "Both periods have similar conditions - choose based on your schedule";
        recommendation.priority = "low";
    }

    return recommendation;
}

/**
 * Calculate comfort score
 * @param {Array} temperatures - Temperature data
 * @param {Array} humidities - Humidity data
 * @returns {number} Comfort score (0-10)
 */
function calculateComfortScore(temperatures, humidities) {
    if (temperatures.length === 0) return 0;

    const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;

    let score = 10;
    
    // Temperature penalty
    if (avgTemp < 10 || avgTemp > 30) score -= 3;
    else if (avgTemp < 15 || avgTemp > 25) score -= 1;
    
    // Humidity penalty
    if (avgHumidity > 80) score -= 2;
    else if (avgHumidity > 70) score -= 1;
    
    return Math.max(0, score);
} 