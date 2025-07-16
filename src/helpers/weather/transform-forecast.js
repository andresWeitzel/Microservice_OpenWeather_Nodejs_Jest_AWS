"use strict";

/**
 * @description Transform OpenWeather forecast data into enriched format
 * @param {Object} forecastData - Raw OpenWeather forecast API response
 * @returns {Object} Enriched forecast data
 */
const transformForecastData = async (forecastData) => {
  try {
    if (!forecastData || !forecastData.list || !forecastData.city) {
      throw new Error("Invalid forecast data");
    }

    const enrichedData = {
      location: {
        city: forecastData.city.name,
        country: forecastData.city.country,
        coordinates: forecastData.city.coord,
        timezone: forecastData.city.timezone,
        population: forecastData.city.population
      },
      forecast: {
        totalPeriods: forecastData.cnt,
        daily: groupByDay(forecastData.list),
        hourly: transformHourlyData(forecastData.list),
        summary: generateForecastSummary(forecastData.list),
        trends: analyzeTrends(forecastData.list),
        alerts: generateForecastAlerts(forecastData.list),
        recommendations: generateForecastRecommendations(forecastData.list)
      }
    };

    return enrichedData;
  } catch (error) {
    console.log("ERROR in transformForecastData() helper function:", error);
    throw error;
  }
};

/**
 * @description Group forecast data by day
 * @param {Array} forecastList - List of forecast periods
 * @returns {Array} Daily forecast data
 */
const groupByDay = (forecastList) => {
  const dailyData = {};
  
  forecastList.forEach(period => {
    const date = new Date(period.dt * 1000);
    const dayKey = date.toISOString().split('T')[0];
    
    if (!dailyData[dayKey]) {
      dailyData[dayKey] = {
        date: dayKey,
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
        periods: [],
        summary: {
          temp_min: Infinity,
          temp_max: -Infinity,
          humidity_avg: 0,
          pressure_avg: 0,
          wind_speed_avg: 0,
          rain_total: 0,
          snow_total: 0,
          conditions: new Set()
        }
      };
    }
    
    dailyData[dayKey].periods.push(transformPeriod(period));
    
    // Update summary
    const summary = dailyData[dayKey].summary;
    summary.temp_min = Math.min(summary.temp_min, period.main.temp_min);
    summary.temp_max = Math.max(summary.temp_max, period.main.temp_max);
    summary.humidity_avg += period.main.humidity;
    summary.pressure_avg += period.main.pressure;
    summary.wind_speed_avg += period.wind.speed;
    summary.rain_total += period.rain ? period.rain['3h'] || 0 : 0;
    summary.snow_total += period.snow ? period.snow['3h'] || 0 : 0;
    summary.conditions.add(period.weather[0].main);
  });
  
  // Calculate averages
  Object.values(dailyData).forEach(day => {
    const periodCount = day.periods.length;
    day.summary.humidity_avg = Math.round(day.summary.humidity_avg / periodCount);
    day.summary.pressure_avg = Math.round(day.summary.pressure_avg / periodCount);
    day.summary.wind_speed_avg = Math.round((day.summary.wind_speed_avg / periodCount) * 10) / 10;
    day.summary.conditions = Array.from(day.summary.conditions);
    day.summary.temp_min_celsius = Math.round((day.summary.temp_min - 273.15) * 10) / 10;
    day.summary.temp_max_celsius = Math.round((day.summary.temp_max - 273.15) * 10) / 10;
  });
  
  return Object.values(dailyData);
};

/**
 * @description Transform individual forecast period
 * @param {Object} period - Single forecast period
 * @returns {Object} Transformed period
 */
const transformPeriod = (period) => {
  const date = new Date(period.dt * 1000);
  
  return {
    timestamp: period.dt,
    datetime: period.dt_txt,
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    isDaytime: period.sys.pod === 'd',
    temperature: {
      kelvin: period.main.temp,
      celsius: Math.round((period.main.temp - 273.15) * 10) / 10,
      fahrenheit: Math.round(((period.main.temp - 273.15) * 9/5 + 32) * 10) / 10,
      feels_like: {
        kelvin: period.main.feels_like || period.main.temp,
        celsius: Math.round(((period.main.feels_like || period.main.temp) - 273.15) * 10) / 10,
        fahrenheit: Math.round((((period.main.feels_like || period.main.temp) - 273.15) * 9/5 + 32) * 10) / 10
      }
    },
    weather: {
      condition: period.weather[0].main,
      description: period.weather[0].description,
      icon: period.weather[0].icon,
      severity: getWeatherSeverity(period.weather[0].id)
    },
    atmosphere: {
      pressure: period.main.pressure,
      humidity: period.main.humidity,
      clouds: period.clouds.all
    },
    wind: {
      speed: period.wind.speed,
      direction: period.wind.deg,
      description: getWindDescription(period.wind.speed)
    },
    precipitation: {
      rain: period.rain ? period.rain['3h'] || 0 : 0,
      snow: period.snow ? period.snow['3h'] || 0 : 0
    }
  };
};

/**
 * @description Transform hourly data
 * @param {Array} forecastList - List of forecast periods
 * @returns {Array} Hourly forecast data
 */
const transformHourlyData = (forecastList) => {
  return forecastList.map(period => transformPeriod(period));
};

/**
 * @description Generate forecast summary
 * @param {Array} forecastList - List of forecast periods
 * @returns {Object} Forecast summary
 */
const generateForecastSummary = (forecastList) => {
  const temps = forecastList.map(p => p.main.temp);
  const humidities = forecastList.map(p => p.main.humidity);
  const windSpeeds = forecastList.map(p => p.wind.speed);
  
  const tempCelsius = temps.map(t => t - 273.15);
  
  return {
    temperature: {
      average: Math.round((tempCelsius.reduce((a, b) => a + b, 0) / tempCelsius.length) * 10) / 10,
      min: Math.round((Math.min(...tempCelsius)) * 10) / 10,
      max: Math.round((Math.max(...tempCelsius)) * 10) / 10,
      range: Math.round((Math.max(...tempCelsius) - Math.min(...tempCelsius)) * 10) / 10
    },
    humidity: {
      average: Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length),
      min: Math.min(...humidities),
      max: Math.max(...humidities)
    },
    wind: {
      average: Math.round((windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length) * 10) / 10,
      max: Math.round((Math.max(...windSpeeds)) * 10) / 10
    },
    precipitation: {
      total_rain: forecastList.reduce((sum, p) => sum + (p.rain ? p.rain['3h'] || 0 : 0), 0),
      total_snow: forecastList.reduce((sum, p) => sum + (p.snow ? p.snow['3h'] || 0 : 0), 0),
      rainy_periods: forecastList.filter(p => p.rain && p.rain['3h'] > 0).length,
      snowy_periods: forecastList.filter(p => p.snow && p.snow['3h'] > 0).length
    }
  };
};

/**
 * @description Analyze temperature and weather trends
 * @param {Array} forecastList - List of forecast periods
 * @returns {Object} Trend analysis
 */
const analyzeTrends = (forecastList) => {
  const temps = forecastList.map(p => p.main.temp - 273.15);
  const firstHalf = temps.slice(0, Math.floor(temps.length / 2));
  const secondHalf = temps.slice(Math.floor(temps.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const tempTrend = secondAvg > firstAvg ? 'warming' : secondAvg < firstAvg ? 'cooling' : 'stable';
  const tempChange = Math.round((secondAvg - firstAvg) * 10) / 10;
  
  return {
    temperature: {
      trend: tempTrend,
      change: tempChange,
      description: getTrendDescription(tempTrend, tempChange)
    },
    weather: {
      conditions: getWeatherTrends(forecastList),
      precipitation: getPrecipitationTrends(forecastList)
    }
  };
};

/**
 * @description Generate forecast alerts
 * @param {Array} forecastList - List of forecast periods
 * @returns {Array} Array of alerts
 */
const generateForecastAlerts = (forecastList) => {
  const alerts = [];
  
  // Temperature alerts
  const temps = forecastList.map(p => p.main.temp - 273.15);
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  
  if (maxTemp > 35) {
    alerts.push({
      type: "temperature",
      level: "high",
      message: "Extreme heat expected in the forecast period"
    });
  } else if (minTemp < 0) {
    alerts.push({
      type: "temperature",
      level: "moderate",
      message: "Freezing temperatures expected"
    });
  }
  
  // Wind alerts
  const maxWind = Math.max(...forecastList.map(p => p.wind.speed));
  if (maxWind > 15) {
    alerts.push({
      type: "wind",
      level: "moderate",
      message: "Strong winds expected"
    });
  }
  
  // Precipitation alerts
  const totalRain = forecastList.reduce((sum, p) => sum + (p.rain ? p.rain['3h'] || 0 : 0), 0);
  if (totalRain > 20) {
    alerts.push({
      type: "precipitation",
      level: "moderate",
      message: "Heavy rainfall expected"
    });
  }
  
  return alerts;
};

/**
 * @description Generate forecast recommendations
 * @param {Array} forecastList - List of forecast periods
 * @returns {Object} Recommendations
 */
const generateForecastRecommendations = (forecastList) => {
  const temps = forecastList.map(p => p.main.temp - 273.15);
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
  const hasRain = forecastList.some(p => p.rain && p.rain['3h'] > 0);
  const hasSnow = forecastList.some(p => p.snow && p.snow['3h'] > 0);
  
  return {
    clothing: getClothingRecommendation(avgTemp, hasRain, hasSnow),
    activities: getActivityRecommendation(forecastList),
    planning: getPlanningRecommendation(forecastList),
    health: getHealthRecommendation(avgTemp, forecastList)
  };
};

// Helper functions (reusing from transform-weather.js)
const getWeatherSeverity = (weatherId) => {
  if (!weatherId) return "unknown";
  
  if (weatherId >= 200 && weatherId < 300) {
    if (weatherId >= 200 && weatherId < 210) return "light";
    if (weatherId >= 210 && weatherId < 230) return "moderate";
    return "heavy";
  }
  
  if (weatherId >= 300 && weatherId < 400) {
    if (weatherId >= 300 && weatherId < 310) return "light";
    if (weatherId >= 310 && weatherId < 320) return "moderate";
    return "heavy";
  }
  
  if (weatherId >= 500 && weatherId < 600) {
    if (weatherId >= 500 && weatherId < 510) return "light";
    if (weatherId >= 510 && weatherId < 520) return "moderate";
    return "heavy";
  }
  
  if (weatherId >= 600 && weatherId < 700) {
    if (weatherId >= 600 && weatherId < 610) return "light";
    if (weatherId >= 610 && weatherId < 620) return "moderate";
    return "heavy";
  }
  
  if (weatherId >= 700 && weatherId < 800) return "moderate";
  if (weatherId >= 800 && weatherId < 900) return "light";
  
  return "unknown";
};

const getWindDescription = (speed) => {
  if (!speed) return "Calm";
  if (speed < 0.5) return "Calm";
  if (speed < 1.5) return "Light air";
  if (speed < 3.3) return "Light breeze";
  if (speed < 5.5) return "Gentle breeze";
  if (speed < 8.0) return "Moderate breeze";
  if (speed < 10.8) return "Fresh breeze";
  if (speed < 13.9) return "Strong breeze";
  if (speed < 17.2) return "High wind";
  if (speed < 20.8) return "Gale";
  if (speed < 24.5) return "Strong gale";
  if (speed < 28.5) return "Storm";
  if (speed < 32.7) return "Violent storm";
  return "Hurricane";
};

const getTrendDescription = (trend, change) => {
  if (trend === 'warming') {
    return `Temperatures warming by ${Math.abs(change)}°C`;
  } else if (trend === 'cooling') {
    return `Temperatures cooling by ${Math.abs(change)}°C`;
  }
  return "Temperatures remaining stable";
};

const getWeatherTrends = (forecastList) => {
  const conditions = forecastList.map(p => p.weather[0].main);
  const uniqueConditions = [...new Set(conditions)];
  return uniqueConditions;
};

const getPrecipitationTrends = (forecastList) => {
  const hasRain = forecastList.some(p => p.rain && p.rain['3h'] > 0);
  const hasSnow = forecastList.some(p => p.snow && p.snow['3h'] > 0);
  
  if (hasRain && hasSnow) return "mixed";
  if (hasRain) return "rainy";
  if (hasSnow) return "snowy";
  return "dry";
};

const getClothingRecommendation = (avgTemp, hasRain, hasSnow) => {
  if (hasSnow) return "Warm winter clothing with waterproof boots";
  if (hasRain) return "Waterproof jacket and umbrella recommended";
  if (avgTemp < 10) return "Warm jacket or coat";
  if (avgTemp < 20) return "Light jacket or sweater";
  if (avgTemp < 30) return "Light clothing";
  return "Very light clothing, stay hydrated";
};

const getActivityRecommendation = (forecastList) => {
  const hasSevereWeather = forecastList.some(p => 
    p.weather[0].id >= 200 && p.weather[0].id < 300 || // Thunderstorm
    p.weather[0].id >= 600 && p.weather[0].id < 700    // Snow
  );
  
  if (hasSevereWeather) return "Indoor activities recommended";
  
  const hasRain = forecastList.some(p => p.rain && p.rain['3h'] > 0);
  if (hasRain) return "Indoor activities preferred, outdoor activities weather-dependent";
  
  return "Outdoor activities suitable";
};

const getPlanningRecommendation = (forecastList) => {
  const temps = forecastList.map(p => p.main.temp - 273.15);
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
  const hasRain = forecastList.some(p => p.rain && p.rain['3h'] > 0);
  
  if (avgTemp > 30) return "Plan outdoor activities for early morning or evening";
  if (hasRain) return "Have backup indoor plans ready";
  
  return "Weather suitable for most activities";
};

const getHealthRecommendation = (avgTemp, forecastList) => {
  if (avgTemp > 30) return "Stay hydrated and avoid prolonged sun exposure";
  if (avgTemp < 0) return "Protect against cold-related illnesses";
  
  const hasRain = forecastList.some(p => p.rain && p.rain['3h'] > 0);
  if (hasRain) return "High humidity may cause discomfort";
  
  return "Comfortable conditions for outdoor activities";
};

module.exports = {
  transformForecastData
}; 