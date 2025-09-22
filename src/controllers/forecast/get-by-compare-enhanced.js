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
const FILE_PATH_FORECAST_COMPARE_ENHANCED = "../../../data/json/forecast/forecast-compare-enhanced-data.json";

//vars
let eventPathParams;
let locationParam;
let period1Param;
let period2Param;
let axiosConfig;
let axiosResponse;
let transformedData;

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
        const cacheKey = `forecast:compare:enhanced:${cleanedLocation}:${period1Param.toLowerCase()}:${period2Param.toLowerCase()}`;
        if (hasCachedWeatherData(cacheKey)) {
            const cachedData = getCachedWeatherData(cacheKey);
            console.log(`Cache hit for forecast compare enhanced: ${cacheKey}`);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_FORECAST_COMPARE_ENHANCED, cachedData);
            
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

        // Transform the comparison data: build a minimal forecast object expected by transformer
        const allData = [...comparisonData.period1Data, ...comparisonData.period2Data];
        const minimalForecast = {
            city: axiosResponse.data.city,
            list: allData,
            cnt: allData.length
        };
        transformedData = await transformForecastData(minimalForecast);
        
        // Add enhanced comparison analysis
        const enhancedAnalysis = analyzeEnhancedComparison(comparisonData, period1Param, period2Param);
        transformedData.enhancedComparison = enhancedAnalysis;

        // Add metadata
        transformedData.metadata = {
            location: cleanedLocation,
            period1: period1Param,
            period2: period2Param,
            totalForecasts: allData.length,
            generatedAt: new Date().toISOString(),
            source: "OpenWeatherMap API",
            endpoint: "forecast-enhanced-compare"
        };

        // Cache the result
        setCachedWeatherData(cacheKey, transformedData);

        // Save to JSON file asynchronously
        createJson(FILE_PATH_FORECAST_COMPARE_ENHANCED, transformedData);

        return bodyResponse(OK_CODE, transformedData);

    } catch (error) {
        console.error("Error in forecast compare enhanced handler:", error);
        
        return bodyResponse(INTERNAL_SERVER_ERROR, {
            error: "Internal server error",
            message: "Failed to process forecast compare enhanced request",
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
 * Analyze enhanced comparison
 * @param {Object} comparisonData - Comparison data
 * @param {string} period1 - First period
 * @param {string} period2 - Second period
 * @returns {Object} Enhanced comparison analysis
 */
function analyzeEnhancedComparison(comparisonData, period1, period2) {
    const period1Summary = generatePeriodSummary(comparisonData.period1Data, period1);
    const period2Summary = generatePeriodSummary(comparisonData.period2Data, period2);
    
    // Calculate differences
    const differences = calculatePeriodDifferences(period1Summary, period2Summary);
    
    // Generate enhanced insights
    const enhancedInsights = generateEnhancedInsights(period1Summary, period2Summary, period1, period2);
    
    // Determine better period
    const betterPeriod = determineBetterPeriod(period1Summary, period2Summary, period1, period2);
    
    // Generate detailed recommendations
    const detailedRecommendations = generateDetailedRecommendations(period1Summary, period2Summary, period1, period2);
    
    // Risk assessment
    const riskAssessment = assessComparisonRisks(period1Summary, period2Summary, period1, period2);
    
    // Planning insights
    const planningInsights = generatePlanningInsights(period1Summary, period2Summary, period1, period2);

    return {
        period1Summary: period1Summary,
        period2Summary: period2Summary,
        differences: differences,
        enhancedInsights: enhancedInsights,
        betterPeriod: betterPeriod,
        detailedRecommendations: detailedRecommendations,
        riskAssessment: riskAssessment,
        planningInsights: planningInsights,
        comparisonScore: calculateComparisonScore(period1Summary, period2Summary)
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
        comfortScore: calculateComfortScore(temperatures, humidities),
        stabilityScore: calculateStabilityScore(conditions, periodData.length)
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
    const stabilityDiff = period2Summary.stabilityScore - period1Summary.stabilityScore;

    return {
        temperature: {
            difference: tempDiff,
            percentage: ((tempDiff / period1Summary.averageTemperature) * 100).toFixed(1),
            description: tempDiff > 0 ? "warmer" : tempDiff < 0 ? "cooler" : "same",
            significance: Math.abs(tempDiff) > 5 ? "high" : Math.abs(tempDiff) > 2 ? "medium" : "low"
        },
        humidity: {
            difference: humidityDiff,
            percentage: ((humidityDiff / period1Summary.averageHumidity) * 100).toFixed(1),
            description: humidityDiff > 0 ? "more humid" : humidityDiff < 0 ? "less humid" : "same",
            significance: Math.abs(humidityDiff) > 15 ? "high" : Math.abs(humidityDiff) > 8 ? "medium" : "low"
        },
        pressure: {
            difference: pressureDiff,
            percentage: ((pressureDiff / period1Summary.averagePressure) * 100).toFixed(1),
            description: pressureDiff > 0 ? "higher pressure" : pressureDiff < 0 ? "lower pressure" : "same",
            significance: Math.abs(pressureDiff) > 10 ? "high" : Math.abs(pressureDiff) > 5 ? "medium" : "low"
        },
        wind: {
            difference: windDiff,
            percentage: ((windDiff / period1Summary.averageWindSpeed) * 100).toFixed(1),
            description: windDiff > 0 ? "windier" : windDiff < 0 ? "calmer" : "same",
            significance: Math.abs(windDiff) > 3 ? "high" : Math.abs(windDiff) > 1.5 ? "medium" : "low"
        },
        comfort: {
            difference: comfortDiff,
            description: comfortDiff > 0 ? "more comfortable" : comfortDiff < 0 ? "less comfortable" : "same",
            significance: Math.abs(comfortDiff) > 2 ? "high" : Math.abs(comfortDiff) > 1 ? "medium" : "low"
        },
        stability: {
            difference: stabilityDiff,
            description: stabilityDiff > 0 ? "more stable" : stabilityDiff < 0 ? "less stable" : "same",
            significance: Math.abs(stabilityDiff) > 0.3 ? "high" : Math.abs(stabilityDiff) > 0.1 ? "medium" : "low"
        }
    };
}

/**
 * Generate enhanced insights
 * @param {Object} period1Summary - First period summary
 * @param {Object} period2Summary - Second period summary
 * @param {string} period1 - First period name
 * @param {string} period2 - Second period name
 * @returns {Object} Enhanced insights
 */
function generateEnhancedInsights(period1Summary, period2Summary, period1, period2) {
    const insights = {
        temperature: [],
        conditions: [],
        activities: [],
        planning: [],
        health: [],
        travel: []
    };

    const tempDiff = period2Summary.averageTemperature - period1Summary.averageTemperature;
    const comfortDiff = period2Summary.comfortScore - period1Summary.comfortScore;
    const stabilityDiff = period2Summary.stabilityScore - period1Summary.stabilityScore;

    // Temperature insights
    if (Math.abs(tempDiff) > 8) {
        insights.temperature.push(`Major temperature shift: ${period2} will be ${tempDiff > 0 ? 'significantly warmer' : 'significantly cooler'} than ${period1}`);
        insights.health.push(`Prepare for temperature change - may affect comfort and health`);
    } else if (Math.abs(tempDiff) > 5) {
        insights.temperature.push(`Notable temperature difference: ${period2} will be ${tempDiff > 0 ? 'warmer' : 'cooler'} than ${period1}`);
    }

    // Condition insights
    if (period1Summary.predominantCondition !== period2Summary.predominantCondition) {
        insights.conditions.push(`Weather pattern change: from ${period1Summary.predominantCondition} to ${period2Summary.predominantCondition}`);
        
        if (period2Summary.predominantCondition === 'Rain' || period2Summary.predominantCondition === 'Snow') {
            insights.travel.push(`Travel may be affected by ${period2Summary.predominantCondition} conditions`);
        }
    }

    // Activity insights
    if (comfortDiff > 3) {
        insights.activities.push(`${period2} offers much better conditions for outdoor activities`);
    } else if (comfortDiff > 1) {
        insights.activities.push(`${period2} will be better for outdoor activities`);
    } else if (comfortDiff < -3) {
        insights.activities.push(`${period1} offers much better conditions for outdoor activities`);
    }

    // Stability insights
    if (stabilityDiff > 0.3) {
        insights.planning.push(`${period2} will have more predictable weather conditions`);
    } else if (stabilityDiff < -0.3) {
        insights.planning.push(`${period1} will have more predictable weather conditions`);
    }

    // Health insights
    if (tempDiff > 10) {
        insights.health.push(`Significant warming - stay hydrated and avoid heat stress`);
    } else if (tempDiff < -10) {
        insights.health.push(`Significant cooling - dress warmly and protect against cold`);
    }

    return insights;
}

/**
 * Generate detailed recommendations
 * @param {Object} period1Summary - First period summary
 * @param {Object} period2Summary - Second period summary
 * @param {string} period1 - First period name
 * @param {string} period2 - Second period name
 * @returns {Object} Detailed recommendations
 */
function generateDetailedRecommendations(period1Summary, period2Summary, period1, period2) {
    const recommendations = {
        clothing: [],
        activities: [],
        preparation: [],
        timing: [],
        alternatives: []
    };

    const tempDiff = period2Summary.averageTemperature - period1Summary.averageTemperature;
    const comfortDiff = period2Summary.comfortScore - period1Summary.comfortScore;

    // Clothing recommendations
    if (tempDiff > 8) {
        recommendations.clothing.push(`Switch to lighter clothing for ${period2}`);
        recommendations.clothing.push(`Consider summer attire and sun protection`);
    } else if (tempDiff < -8) {
        recommendations.clothing.push(`Switch to warmer clothing for ${period2}`);
        recommendations.clothing.push(`Consider winter attire and thermal protection`);
    }

    // Activity recommendations
    if (comfortDiff > 2) {
        recommendations.activities.push(`Schedule outdoor activities for ${period2}`);
        recommendations.activities.push(`Plan sports and recreation during ${period2}`);
    } else if (comfortDiff < -2) {
        recommendations.activities.push(`Schedule outdoor activities for ${period1}`);
        recommendations.activities.push(`Consider indoor alternatives for ${period2}`);
    }

    // Preparation recommendations
    if (period2Summary.predominantCondition === 'Rain') {
        recommendations.preparation.push(`Prepare rain gear and waterproof items for ${period2}`);
        recommendations.alternatives.push(`Have indoor backup plans for ${period2}`);
    } else if (period2Summary.predominantCondition === 'Snow') {
        recommendations.preparation.push(`Prepare winter gear and snow equipment for ${period2}`);
        recommendations.alternatives.push(`Consider indoor activities for ${period2}`);
    }

    // Timing recommendations
    if (Math.abs(tempDiff) > 5) {
        recommendations.timing.push(`Plan activities around temperature changes`);
        recommendations.timing.push(`Consider gradual adaptation to new conditions`);
    }

    return recommendations;
}

/**
 * Assess comparison risks
 * @param {Object} period1Summary - First period summary
 * @param {Object} period2Summary - Second period summary
 * @param {string} period1 - First period name
 * @param {string} period2 - Second period name
 * @returns {Object} Risk assessment
 */
function assessComparisonRisks(period1Summary, period2Summary, period1, period2) {
    const risks = {
        high: [],
        medium: [],
        low: [],
        overall: "low"
    };

    const tempDiff = period2Summary.averageTemperature - period1Summary.averageTemperature;

    // Temperature risks
    if (Math.abs(tempDiff) > 15) {
        risks.high.push(`Extreme temperature change may pose health risks`);
        risks.overall = "high";
    } else if (Math.abs(tempDiff) > 10) {
        risks.medium.push(`Significant temperature change may affect comfort`);
        if (risks.overall === "low") risks.overall = "medium";
    }

    // Weather condition risks
    if (period2Summary.predominantCondition === 'Thunderstorm') {
        risks.high.push(`Thunderstorms in ${period2} pose safety risks`);
        risks.overall = "high";
    }

    if (period2Summary.predominantCondition === 'Snow' && period1Summary.predominantCondition !== 'Snow') {
        risks.medium.push(`Snow conditions in ${period2} may affect travel and activities`);
        if (risks.overall === "low") risks.overall = "medium";
    }

    // Stability risks
    if (period2Summary.stabilityScore < 0.5) {
        risks.medium.push(`Unstable weather in ${period2} may require flexible planning`);
        if (risks.overall === "low") risks.overall = "medium";
    }

    return risks;
}

/**
 * Generate planning insights
 * @param {Object} period1Summary - First period summary
 * @param {Object} period2Summary - Second period summary
 * @param {string} period1 - First period name
 * @param {string} period2 - Second period name
 * @returns {Object} Planning insights
 */
function generatePlanningInsights(period1Summary, period2Summary, period1, period2) {
    const insights = {
        scheduling: [],
        logistics: [],
        contingency: [],
        optimization: []
    };

    const comfortDiff = period2Summary.comfortScore - period1Summary.comfortScore;
    const stabilityDiff = period2Summary.stabilityScore - period1Summary.stabilityScore;

    // Scheduling insights
    if (comfortDiff > 2) {
        insights.scheduling.push(`Prioritize outdoor activities for ${period2}`);
        insights.optimization.push(`Schedule important outdoor events during ${period2}`);
    } else if (comfortDiff < -2) {
        insights.scheduling.push(`Prioritize indoor activities for ${period2}`);
        insights.optimization.push(`Schedule important outdoor events during ${period1}`);
    }

    // Logistics insights
    if (period2Summary.predominantCondition === 'Rain' || period2Summary.predominantCondition === 'Snow') {
        insights.logistics.push(`Plan for weather-related delays during ${period2}`);
        insights.contingency.push(`Have backup transportation options for ${period2}`);
    }

    // Stability insights
    if (stabilityDiff > 0.3) {
        insights.optimization.push(`${period2} offers more predictable conditions for planning`);
    } else if (stabilityDiff < -0.3) {
        insights.contingency.push(`${period2} may require flexible planning due to weather variability`);
    }

    return insights;
}

/**
 * Calculate comparison score
 * @param {Object} period1Summary - First period summary
 * @param {Object} period2Summary - Second period summary
 * @returns {number} Comparison score (0-10)
 */
function calculateComparisonScore(period1Summary, period2Summary) {
    let score = 5; // Neutral starting point
    
    const comfortDiff = period2Summary.comfortScore - period1Summary.comfortScore;
    const stabilityDiff = period2Summary.stabilityScore - period1Summary.stabilityScore;
    
    // Comfort contribution
    if (comfortDiff > 2) score += 2;
    else if (comfortDiff > 0) score += 1;
    else if (comfortDiff < -2) score -= 2;
    else if (comfortDiff < 0) score -= 1;
    
    // Stability contribution
    if (stabilityDiff > 0.3) score += 1;
    else if (stabilityDiff < -0.3) score -= 1;
    
    // Temperature range consideration
    if (period2Summary.temperatureRange < period1Summary.temperatureRange) score += 0.5;
    else if (period2Summary.temperatureRange > period1Summary.temperatureRange) score -= 0.5;
    
    return Math.max(0, Math.min(10, score));
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
    const stabilityDiff = period2Summary.stabilityScore - period1Summary.stabilityScore;
    
    let betterPeriod = "similar";
    let reason = "Both periods have similar conditions";
    let confidence = "low";
    
    if (comfortDiff > 2 && stabilityDiff > 0.2) {
        betterPeriod = period2;
        reason = "Significantly better comfort and stability";
        confidence = "high";
    } else if (comfortDiff > 1) {
        betterPeriod = period2;
        reason = "Better comfort conditions";
        confidence = "medium";
    } else if (comfortDiff < -2 && stabilityDiff < -0.2) {
        betterPeriod = period1;
        reason = "Significantly better comfort and stability";
        confidence = "high";
    } else if (comfortDiff < -1) {
        betterPeriod = period1;
        reason = "Better comfort conditions";
        confidence = "medium";
    }
    
    return {
        period: betterPeriod,
        reason: reason,
        confidence: confidence,
        comfortDifference: comfortDiff,
        stabilityDifference: stabilityDiff
    };
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

/**
 * Calculate stability score
 * @param {Object} conditions - Weather conditions
 * @param {number} totalForecasts - Total number of forecasts
 * @returns {number} Stability score (0-1)
 */
function calculateStabilityScore(conditions, totalForecasts) {
    if (totalForecasts === 0) return 0;

    const conditionCount = Object.keys(conditions).length;
    const maxConditionCount = Math.max(...Object.values(conditions));
    
    // More conditions = less stable
    const conditionStability = 1 - (conditionCount - 1) / Math.max(1, totalForecasts - 1);
    
    // More dominant condition = more stable
    const dominanceStability = maxConditionCount / totalForecasts;
    
    return (conditionStability + dominanceStability) / 2;
} 