"use strict";

/**
 * @description Transform OpenWeather data into enriched format
 * @param {Object} weatherData - Raw OpenWeather API response
 * @returns {Object} Enriched weather data
 */
const transformWeatherData = async (weatherData) => {
  try {
 
    if (!weatherData) {
      throw new Error("Weather data is null or undefined");
    }
    
    if (!weatherData.main) {
      throw new Error(`Invalid weather data: missing 'main' property. Received keys: ${Object.keys(weatherData).join(', ')}`);
    }
    
    if (!weatherData.weather || !Array.isArray(weatherData.weather) || weatherData.weather.length === 0) {
      throw new Error("Invalid weather data: missing or empty 'weather' array");
    }

    const enrichedData = {
      location: {
        city: weatherData.name,
        country: weatherData.sys?.country,
        coordinates: weatherData.coord,
        timezone: weatherData.timezone,
        localTime: new Date().toISOString(),
        isDaytime: isDaytime(weatherData.sys?.sunrise, weatherData.sys?.sunset)
      },
      temperature: {
        kelvin: weatherData.main.temp,
        celsius: kelvinToCelsius(weatherData.main.temp),
        fahrenheit: kelvinToFahrenheit(weatherData.main.temp),
        feels_like: {
          kelvin: weatherData.main.feels_like,
          celsius: kelvinToCelsius(weatherData.main.feels_like),
          fahrenheit: kelvinToFahrenheit(weatherData.main.feels_like)
        }
      },
      weather: {
        condition: weatherData.weather[0]?.main,
        description: weatherData.weather[0]?.description,
        icon: weatherData.weather[0]?.icon,
        severity: getWeatherSeverity(weatherData.weather[0]?.id),
        recommendation: getWeatherRecommendation(weatherData.weather[0]?.id, weatherData.main.temp)
      },
      atmosphere: {
        pressure: weatherData.main.pressure,
        humidity: weatherData.main.humidity,
        visibility: weatherData.visibility,
        clouds: weatherData.clouds?.all
      },
      wind: {
        speed: weatherData.wind?.speed,
        direction: weatherData.wind?.deg,
        gust: weatherData.wind?.gust,
        description: getWindDescription(weatherData.wind?.speed)
      },
      sun: {
        sunrise: formatTimestamp(weatherData.sys?.sunrise),
        sunset: formatTimestamp(weatherData.sys?.sunset),
        dayLength: calculateDayLength(weatherData.sys?.sunrise, weatherData.sys?.sunset)
      },
      alerts: generateAlerts(weatherData),
      recommendations: generateRecommendations(weatherData),
      comfort: {
        index: calculateComfortIndex(weatherData.main.temp, weatherData.main.humidity, weatherData.wind?.speed),
        level: getComfortLevel(weatherData.main.temp, weatherData.main.humidity)
      }
    };

    return enrichedData;
  } catch (error) {
    console.log("ERROR in transformWeatherData() helper function:", error);
    throw error;
  }
};

/**
 * @description Convert Kelvin to Celsius
 * @param {number} kelvin - Temperature in Kelvin
 * @returns {number} Temperature in Celsius
 */
const kelvinToCelsius = (kelvin) => {
  return Math.round((kelvin - 273.15) * 100) / 100;
};

/**
 * @description Convert Kelvin to Fahrenheit
 * @param {number} kelvin - Temperature in Kelvin
 * @returns {number} Temperature in Fahrenheit
 */
const kelvinToFahrenheit = (kelvin) => {
  return Math.round(((kelvin - 273.15) * 9/5 + 32) * 100) / 100;
};

/**
 * @description Check if it's daytime
 * @param {number} sunrise - Sunrise timestamp
 * @param {number} sunset - Sunset timestamp
 * @returns {boolean} True if daytime
 */
const isDaytime = (sunrise, sunset) => {
  if (!sunrise || !sunset) return true;
  const now = Math.floor(Date.now() / 1000);
  return now >= sunrise && now <= sunset;
};

/**
 * @description Get weather severity level
 * @param {number} weatherId - OpenWeather condition ID
 * @returns {string} Severity level
 */
const getWeatherSeverity = (weatherId) => {
  if (!weatherId) return "unknown";
  
  // Thunderstorm
  if (weatherId >= 200 && weatherId < 300) {
    if (weatherId >= 200 && weatherId < 210) return "light";
    if (weatherId >= 210 && weatherId < 230) return "moderate";
    return "heavy";
  }
  
  // Drizzle
  if (weatherId >= 300 && weatherId < 400) {
    if (weatherId >= 300 && weatherId < 310) return "light";
    if (weatherId >= 310 && weatherId < 320) return "moderate";
    return "heavy";
  }
  
  // Rain
  if (weatherId >= 500 && weatherId < 600) {
    if (weatherId >= 500 && weatherId < 510) return "light";
    if (weatherId >= 510 && weatherId < 520) return "moderate";
    return "heavy";
  }
  
  // Snow
  if (weatherId >= 600 && weatherId < 700) {
    if (weatherId >= 600 && weatherId < 610) return "light";
    if (weatherId >= 610 && weatherId < 620) return "moderate";
    return "heavy";
  }
  
  // Atmosphere (fog, mist, etc.)
  if (weatherId >= 700 && weatherId < 800) return "moderate";
  
  // Clear/Clouds
  if (weatherId >= 800 && weatherId < 900) return "light";
  
  return "unknown";
};

/**
 * @description Get weather recommendation
 * @param {number} weatherId - OpenWeather condition ID
 * @param {number} temperature - Temperature in Kelvin
 * @returns {string} Recommendation
 */
const getWeatherRecommendation = (weatherId, temperature) => {
  const tempCelsius = kelvinToCelsius(temperature);
  
  // Thunderstorm
  if (weatherId >= 200 && weatherId < 300) {
    return "Stay indoors, avoid outdoor activities";
  }
  
  // Rain/Drizzle
  if ((weatherId >= 300 && weatherId < 400) || (weatherId >= 500 && weatherId < 600)) {
    return "Bring an umbrella or raincoat";
  }
  
  // Snow
  if (weatherId >= 600 && weatherId < 700) {
    return "Wear warm clothing and boots";
  }
  
  // Cold weather
  if (tempCelsius < 10) {
    return "Wear warm clothing";
  }
  
  // Hot weather
  if (tempCelsius > 30) {
    return "Stay hydrated and avoid prolonged sun exposure";
  }
  
  return "Enjoy the weather!";
};

/**
 * @description Get wind description
 * @param {number} speed - Wind speed in m/s
 * @returns {string} Wind description
 */
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

/**
 * @description Format timestamp to readable time
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted time
 */
const formatTimestamp = (timestamp) => {
  if (!timestamp) return null;
  return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * @description Calculate day length
 * @param {number} sunrise - Sunrise timestamp
 * @param {number} sunset - Sunset timestamp
 * @returns {string} Day length in hours and minutes
 */
const calculateDayLength = (sunrise, sunset) => {
  if (!sunrise || !sunset) return null;
  const dayLengthSeconds = sunset - sunrise;
  const hours = Math.floor(dayLengthSeconds / 3600);
  const minutes = Math.floor((dayLengthSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

/**
 * @description Generate weather alerts
 * @param {Object} weatherData - Weather data
 * @returns {Array} Array of alerts
 */
const generateAlerts = (weatherData) => {
  const alerts = [];
  const tempCelsius = kelvinToCelsius(weatherData.main.temp);
  
  // Temperature alerts
  if (tempCelsius < 0) {
    alerts.push({
      type: "temperature",
      level: "moderate",
      message: "Freezing temperatures expected"
    });
  }
  
  if (tempCelsius > 35) {
    alerts.push({
      type: "temperature",
      level: "high",
      message: "Extreme heat warning"
    });
  }
  
  // Wind alerts
  if (weatherData.wind?.speed > 10) {
    alerts.push({
      type: "wind",
      level: "moderate",
      message: "Strong winds expected"
    });
  }
  
  // Visibility alerts
  if (weatherData.visibility < 5000) {
    alerts.push({
      type: "visibility",
      level: "high",
      message: "Poor visibility conditions"
    });
  }
  
  return alerts;
};

/**
 * @description Generate recommendations
 * @param {Object} weatherData - Weather data
 * @returns {Object} Recommendations object
 */
const generateRecommendations = (weatherData) => {
  const tempCelsius = kelvinToCelsius(weatherData.main.temp);
  const humidity = weatherData.main.humidity;
  
  return {
    clothing: getClothingRecommendation(tempCelsius),
    activities: getActivityRecommendation(weatherData),
    transport: getTransportRecommendation(weatherData),
    health: getHealthRecommendation(tempCelsius, humidity)
  };
};

/**
 * @description Get clothing recommendation
 * @param {number} tempCelsius - Temperature in Celsius
 * @returns {string} Clothing recommendation
 */
const getClothingRecommendation = (tempCelsius) => {
  if (tempCelsius < 0) return "Heavy winter coat, gloves, scarf, and hat";
  if (tempCelsius < 10) return "Warm jacket or coat";
  if (tempCelsius < 20) return "Light jacket or sweater";
  if (tempCelsius < 30) return "Light clothing";
  return "Very light clothing, stay hydrated";
};

/**
 * @description Get activity recommendation
 * @param {Object} weatherData - Weather data
 * @returns {string} Activity recommendation
 */
const getActivityRecommendation = (weatherData) => {
  const weatherId = weatherData.weather[0]?.id;
  
  if (weatherId >= 200 && weatherId < 300) return "Indoor activities only";
  if (weatherId >= 300 && weatherId < 600) return "Indoor activities preferred";
  if (weatherId >= 600 && weatherId < 700) return "Winter sports or indoor activities";
  
  return "Outdoor activities suitable";
};

/**
 * @description Get transport recommendation
 * @param {Object} weatherData - Weather data
 * @returns {string} Transport recommendation
 */
const getTransportRecommendation = (weatherData) => {
  const weatherId = weatherData.weather[0]?.id;
  const windSpeed = weatherData.wind?.speed;
  
  if (weatherId >= 200 && weatherId < 300) return "Avoid driving during storms";
  if (weatherId >= 600 && weatherId < 700) return "Public transport may be affected";
  if (windSpeed > 10) return "High winds may affect transport";
  
  return "Normal transport conditions";
};

/**
 * @description Get health recommendation
 * @param {number} tempCelsius - Temperature in Celsius
 * @param {number} humidity - Humidity percentage
 * @returns {string} Health recommendation
 */
const getHealthRecommendation = (tempCelsius, humidity) => {
  if (tempCelsius > 30) return "Stay hydrated and avoid prolonged sun exposure";
  if (tempCelsius < 0) return "Protect against cold-related illnesses";
  if (humidity > 80) return "High humidity may cause discomfort";
  
  return "Comfortable conditions for outdoor activities";
};

/**
 * @description Calculate comfort index
 * @param {number} tempKelvin - Temperature in Kelvin
 * @param {number} humidity - Humidity percentage
 * @param {number} windSpeed - Wind speed in m/s
 * @returns {number} Comfort index (0-10)
 */
const calculateComfortIndex = (tempKelvin, humidity, windSpeed) => {
  const tempCelsius = kelvinToCelsius(tempKelvin);
  
  // Base comfort score
  let comfort = 5;
  
  // Temperature factor (ideal range: 18-24°C)
  if (tempCelsius >= 18 && tempCelsius <= 24) {
    comfort += 3;
  } else if (tempCelsius >= 15 && tempCelsius <= 27) {
    comfort += 1;
  } else if (tempCelsius < 0 || tempCelsius > 35) {
    comfort -= 3;
  }
  
  // Humidity factor (ideal range: 30-60%)
  if (humidity >= 30 && humidity <= 60) {
    comfort += 1;
  } else if (humidity > 80) {
    comfort -= 1;
  }
  
  // Wind factor (moderate wind can be refreshing)
  if (windSpeed >= 1 && windSpeed <= 5) {
    comfort += 0.5;
  } else if (windSpeed > 10) {
    comfort -= 1;
  }
  
  return Math.max(0, Math.min(10, Math.round(comfort * 10) / 10));
};

/**
 * @description Get comfort level
 * @param {number} tempKelvin - Temperature in Kelvin
 * @param {number} humidity - Humidity percentage
 * @returns {string} Comfort level
 */
const getComfortLevel = (tempKelvin, humidity) => {
  const tempCelsius = kelvinToCelsius(tempKelvin);
  
  if (tempCelsius < 0) return "very_cold";
  if (tempCelsius < 10) return "cold";
  if (tempCelsius < 20) return "cool";
  if (tempCelsius < 25) return "comfortable";
  if (tempCelsius < 30) return "warm";
  if (tempCelsius < 35) return "hot";
  return "very_hot";
};

module.exports = {
  transformWeatherData
}; 