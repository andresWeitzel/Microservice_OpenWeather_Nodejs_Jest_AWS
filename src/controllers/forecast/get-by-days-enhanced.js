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
const FILE_PATH_FORECAST_DAYS_ENHANCED = "../../../data/json/forecast/forecast-days-enhanced-data.json";

//vars
let eventPathParams;
let locationParam;
let daysParam;
let axiosConfig;
let axiosResponse;
let transformedData;

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
        const cacheKey = `forecast:days:enhanced:${cleanedLocation}:${days}`;
        if (hasCachedWeatherData(cacheKey)) {
            const cachedData = getCachedWeatherData(cacheKey);
            console.log(`Cache hit for enhanced forecast days: ${cleanedLocation} - ${days} days`);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_FORECAST_DAYS_ENHANCED, cachedData);
            
            return bodyResponse(OK_CODE, cachedData);
        }

        // Prepare axios configuration
        axiosConfig = {
            method: "GET",
            url: `${API_FORECAST_URL_BASE}q=${encodeURIComponent(cleanedLocation)}&appid=${API_KEY}`,
            headers: {
                "Content-Type": "application/json"
            }
        };

        // Make API request
        axiosResponse = await sendGetRequest(axiosConfig);

        if (axiosResponse.status === OK_CODE && axiosResponse.data) {
            // Filter forecast data by days
            const filteredData = filterForecastByDays(axiosResponse.data, days);
            
            // Transform the filtered data
            transformedData = transformForecastData(filteredData);
            
            // Add days-specific analysis
            const enhancedData = {
                ...transformedData,
                daysAnalysis: analyzeDaysData(filteredData, days)
            };
            
            // Cache the enhanced data
            setCachedWeatherData(cacheKey, enhancedData);
            
            // Save to JSON file asynchronously
            createJson(FILE_PATH_FORECAST_DAYS_ENHANCED, enhancedData);
            
            return bodyResponse(OK_CODE, enhancedData);
        } else {
            return bodyResponse(INTERNAL_SERVER_ERROR, {
                error: "Failed to fetch forecast data",
                message: "Unable to retrieve forecast information from OpenWeather API"
            });
        }

    } catch (error) {
        console.error("Error in getForecastByDaysEnhanced handler:", error);
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

function analyzeDaysData(filteredData, days) {
    if (!filteredData.dailySummaries || filteredData.dailySummaries.length === 0) {
        return {
            summary: "No forecast data available for the specified days",
            recommendations: ["Try a different number of days or location"]
        };
    }

    const dailySummaries = filteredData.dailySummaries;
    const allTemperatures = [];
    const allConditions = [];
    const allHumidities = [];
    const allWindSpeeds = [];

    // Collect all data across days
    dailySummaries.forEach(day => {
        if (day.summary && typeof day.summary === 'object') {
            allTemperatures.push(day.summary.averageTemperature);
            allConditions.push(day.summary.dominantWeatherCondition);
            allHumidities.push(day.summary.averageHumidity);
            allWindSpeeds.push(day.summary.averageWindSpeed);
        }
    });

    if (allTemperatures.length === 0) {
        return {
            summary: "Insufficient data for analysis",
            recommendations: ["Try a different location or time period"]
        };
    }

    const avgTemp = allTemperatures.reduce((a, b) => a + b, 0) / allTemperatures.length;
    const avgHumidity = allHumidities.reduce((a, b) => a + b, 0) / allHumidities.length;
    const avgWindSpeed = allWindSpeeds.reduce((a, b) => a + b, 0) / allWindSpeeds.length;
    const maxTemp = Math.max(...allTemperatures);
    const minTemp = Math.min(...allTemperatures);

    // Weather condition frequency across days
    const conditionCount = {};
    allConditions.forEach(condition => {
        conditionCount[condition] = (conditionCount[condition] || 0) + 1;
    });

    const dominantCondition = Object.keys(conditionCount).reduce((a, b) => 
        conditionCount[a] > conditionCount[b] ? a : b
    );

    // Temperature trend analysis
    const tempTrend = analyzeTemperatureTrend(allTemperatures);
    
    // Generate recommendations
    const recommendations = [];
    if (avgTemp < 10) recommendations.push("Pack warm clothing for the entire period");
    if (avgTemp > 25) recommendations.push("Prepare for warm weather - bring sunscreen and stay hydrated");
    if (avgWindSpeed > 10) recommendations.push("Windy conditions expected - secure outdoor items");
    if (avgHumidity > 80) recommendations.push("High humidity period - consider indoor activities");
    if (tempTrend === "warming") recommendations.push("Temperatures are trending upward - plan accordingly");
    if (tempTrend === "cooling") recommendations.push("Temperatures are trending downward - bring extra layers");

    return {
        requestedDays: days,
        actualDays: dailySummaries.length,
        summary: {
            averageTemperature: Math.round(avgTemp * 100) / 100,
            temperatureRange: { min: Math.round(minTemp * 100) / 100, max: Math.round(maxTemp * 100) / 100 },
            averageHumidity: Math.round(avgHumidity),
            averageWindSpeed: Math.round(avgWindSpeed * 100) / 100,
            dominantWeatherCondition: dominantCondition,
            temperatureTrend: tempTrend
        },
        weatherPatterns: {
            conditionBreakdown: conditionCount,
            dailyVariations: dailySummaries.map(day => ({
                day: day.dayName,
                temperature: day.summary.averageTemperature,
                condition: day.summary.dominantWeatherCondition,
                humidity: day.summary.averageHumidity
            }))
        },
        recommendations: recommendations,
        planningAdvice: {
            bestDayForOutdoorActivities: findBestDayForOutdoorActivities(dailySummaries),
            worstDayForOutdoorActivities: findWorstDayForOutdoorActivities(dailySummaries),
            clothingRecommendations: getClothingRecommendations(avgTemp, tempTrend),
            activitySuggestions: getActivitySuggestions(avgTemp, dominantCondition, avgWindSpeed)
        }
    };
}

function analyzeTemperatureTrend(temperatures) {
    if (temperatures.length < 2) return "stable";
    
    let increasing = 0;
    let decreasing = 0;
    
    for (let i = 1; i < temperatures.length; i++) {
        if (temperatures[i] > temperatures[i-1]) {
            increasing++;
        } else if (temperatures[i] < temperatures[i-1]) {
            decreasing++;
        }
    }
    
    if (increasing > decreasing && increasing >= temperatures.length * 0.6) {
        return "warming";
    } else if (decreasing > increasing && decreasing >= temperatures.length * 0.6) {
        return "cooling";
    } else {
        return "stable";
    }
}

function findBestDayForOutdoorActivities(dailySummaries) {
    let bestDay = null;
    let bestScore = -1;
    
    dailySummaries.forEach(day => {
        if (day.summary && typeof day.summary === 'object') {
            const score = calculateOutdoorScore(day.summary);
            if (score > bestScore) {
                bestScore = score;
                bestDay = day;
            }
        }
    });
    
    return bestDay ? {
        day: bestDay.dayName,
        date: bestDay.date,
        score: bestScore,
        reason: getOutdoorScoreReason(bestDay.summary)
    } : null;
}

function findWorstDayForOutdoorActivities(dailySummaries) {
    let worstDay = null;
    let worstScore = 100;
    
    dailySummaries.forEach(day => {
        if (day.summary && typeof day.summary === 'object') {
            const score = calculateOutdoorScore(day.summary);
            if (score < worstScore) {
                worstScore = score;
                worstDay = day;
            }
        }
    });
    
    return worstDay ? {
        day: worstDay.dayName,
        date: worstDay.date,
        score: worstScore,
        reason: getOutdoorScoreReason(worstDay.summary)
    } : null;
}

function calculateOutdoorScore(summary) {
    let score = 50; // Base score
    
    // Temperature factor (ideal: 15-25°C)
    if (summary.averageTemperature >= 15 && summary.averageTemperature <= 25) {
        score += 30;
    } else if (summary.averageTemperature >= 10 && summary.averageTemperature <= 30) {
        score += 15;
    } else {
        score -= 20;
    }
    
    // Weather condition factor
    if (summary.dominantWeatherCondition === "Clear") {
        score += 20;
    } else if (summary.dominantWeatherCondition === "Clouds") {
        score += 10;
    } else if (summary.dominantWeatherCondition === "Rain" || summary.dominantWeatherCondition === "Snow") {
        score -= 30;
    }
    
    // Wind factor
    if (summary.averageWindSpeed < 10) {
        score += 10;
    } else if (summary.averageWindSpeed > 20) {
        score -= 20;
    }
    
    return Math.max(0, Math.min(100, score));
}

function getOutdoorScoreReason(summary) {
    const reasons = [];
    
    if (summary.averageTemperature < 10) reasons.push("cold temperatures");
    if (summary.averageTemperature > 30) reasons.push("hot temperatures");
    if (summary.dominantWeatherCondition === "Rain" || summary.dominantWeatherCondition === "Snow") {
        reasons.push("precipitation expected");
    }
    if (summary.averageWindSpeed > 20) reasons.push("strong winds");
    
    return reasons.length > 0 ? reasons.join(", ") : "good conditions";
}

function getClothingRecommendations(avgTemp, tempTrend) {
    const recommendations = [];
    
    if (avgTemp < 5) {
        recommendations.push("Heavy winter coat", "Thermal underwear", "Warm hat and gloves");
    } else if (avgTemp < 15) {
        recommendations.push("Light jacket or sweater", "Long pants", "Closed shoes");
    } else if (avgTemp < 25) {
        recommendations.push("Light clothing", "T-shirt and shorts acceptable", "Comfortable shoes");
    } else {
        recommendations.push("Light, breathable clothing", "Sunscreen essential", "Hat for sun protection");
    }
    
    if (tempTrend === "warming") {
        recommendations.push("Prepare for warming trend - layer clothing");
    } else if (tempTrend === "cooling") {
        recommendations.push("Prepare for cooling trend - bring extra layers");
    }
    
    return recommendations;
}

function getActivitySuggestions(avgTemp, dominantCondition, avgWindSpeed) {
    const suggestions = [];
    
    if (avgTemp > 20 && dominantCondition === "Clear" && avgWindSpeed < 10) {
        suggestions.push("Outdoor sports", "Picnics", "Hiking", "Cycling", "Beach activities");
    } else if (avgTemp > 15 && dominantCondition !== "Rain") {
        suggestions.push("Light outdoor activities", "Walking tours", "Café visits", "Shopping");
    } else {
        suggestions.push("Indoor activities", "Museums", "Shopping centers", "Restaurants", "Cinema");
    }
    
    return suggestions;
} 