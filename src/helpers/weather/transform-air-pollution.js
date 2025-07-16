"use strict";

/**
 * @description Transform OpenWeather air pollution data into enriched format
 * @param {Object} airPollutionData - Raw OpenWeather air pollution API response
 * @returns {Object} Enriched air pollution data
 */
const transformAirPollutionData = async (airPollutionData) => {
  try {
    if (!airPollutionData || !airPollutionData.list || !airPollutionData.list[0]) {
      throw new Error("Invalid air pollution data");
    }

    const currentData = airPollutionData.list[0];
    const components = currentData.components;
    const aqi = currentData.main.aqi;

    const enrichedData = {
      location: {
        city: airPollutionData.location?.city,
        country: airPollutionData.location?.country,
        state: airPollutionData.location?.state,
        coordinates: airPollutionData.coord,
        timestamp: new Date(currentData.dt * 1000).toISOString()
      },
      airQuality: {
        index: aqi,
        level: getAQILevel(aqi),
        description: getAQIDescription(aqi),
        color: getAQIColor(aqi),
        healthImplications: getHealthImplications(aqi)
      },
      pollutants: {
        carbonMonoxide: {
          value: components.co,
          unit: "μg/m³",
          level: getPollutantLevel("co", components.co),
          description: getPollutantDescription("co", components.co)
        },
        nitrogenOxide: {
          value: components.no,
          unit: "μg/m³",
          level: getPollutantLevel("no", components.no),
          description: getPollutantDescription("no", components.no)
        },
        nitrogenDioxide: {
          value: components.no2,
          unit: "μg/m³",
          level: getPollutantLevel("no2", components.no2),
          description: getPollutantDescription("no2", components.no2)
        },
        ozone: {
          value: components.o3,
          unit: "μg/m³",
          level: getPollutantLevel("o3", components.o3),
          description: getPollutantDescription("o3", components.o3)
        },
        sulfurDioxide: {
          value: components.so2,
          unit: "μg/m³",
          level: getPollutantLevel("so2", components.so2),
          description: getPollutantDescription("so2", components.so2)
        },
        particulateMatter25: {
          value: components.pm2_5,
          unit: "μg/m³",
          level: getPollutantLevel("pm2_5", components.pm2_5),
          description: getPollutantDescription("pm2_5", components.pm2_5)
        },
        particulateMatter10: {
          value: components.pm10,
          unit: "μg/m³",
          level: getPollutantLevel("pm10", components.pm10),
          description: getPollutantDescription("pm10", components.pm10)
        },
        ammonia: {
          value: components.nh3,
          unit: "μg/m³",
          level: getPollutantLevel("nh3", components.nh3),
          description: getPollutantDescription("nh3", components.nh3)
        }
      },
      alerts: generateAirPollutionAlerts(aqi, components),
      recommendations: generateAirPollutionRecommendations(aqi, components),
      health: {
        riskLevel: getHealthRiskLevel(aqi),
        vulnerableGroups: getVulnerableGroups(aqi),
        symptoms: getHealthSymptoms(aqi),
        prevention: getPreventionMeasures(aqi)
      },
      activities: {
        outdoor: getOutdoorActivityRecommendation(aqi),
        exercise: getExerciseRecommendation(aqi),
        ventilation: getVentilationRecommendation(aqi),
        transportation: getTransportationRecommendation(aqi)
      }
    };

    return enrichedData;
  } catch (error) {
    console.log("ERROR in transformAirPollutionData() helper function:", error);
    throw error;
  }
};

/**
 * @description Get AQI level based on index
 * @param {number} aqi - Air Quality Index
 * @returns {string} AQI level
 */
const getAQILevel = (aqi) => {
  if (aqi === 1) return "Good";
  if (aqi === 2) return "Fair";
  if (aqi === 3) return "Moderate";
  if (aqi === 4) return "Poor";
  if (aqi === 5) return "Very Poor";
  return "Unknown";
};

/**
 * @description Get AQI description
 * @param {number} aqi - Air Quality Index
 * @returns {string} AQI description
 */
const getAQIDescription = (aqi) => {
  if (aqi === 1) return "Air quality is good, and air pollution poses little or no risk";
  if (aqi === 2) return "Air quality is acceptable, however some pollutants may be a concern for a small number of people";
  if (aqi === 3) return "Members of sensitive groups may experience health effects, but the general public is not likely to be affected";
  if (aqi === 4) return "Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects";
  if (aqi === 5) return "Health warnings of emergency conditions; the entire population is more likely to be affected";
  return "Unknown air quality level";
};

/**
 * @description Get AQI color
 * @param {number} aqi - Air Quality Index
 * @returns {string} AQI color
 */
const getAQIColor = (aqi) => {
  if (aqi === 1) return "#009966"; // Green
  if (aqi === 2) return "#ffde33"; // Yellow
  if (aqi === 3) return "#ff9933"; // Orange
  if (aqi === 4) return "#cc0033"; // Red
  if (aqi === 5) return "#660099"; // Purple
  return "#999999"; // Gray
};

/**
 * @description Get health implications
 * @param {number} aqi - Air Quality Index
 * @returns {string} Health implications
 */
const getHealthImplications = (aqi) => {
  if (aqi === 1) return "No health implications";
  if (aqi === 2) return "Minor health implications for sensitive individuals";
  if (aqi === 3) return "Moderate health implications for sensitive groups";
  if (aqi === 4) return "Significant health implications for everyone";
  if (aqi === 5) return "Severe health implications for the entire population";
  return "Unknown health implications";
};

/**
 * @description Get pollutant level
 * @param {string} pollutant - Pollutant name
 * @param {number} value - Pollutant value
 * @returns {string} Pollutant level
 */
const getPollutantLevel = (pollutant, value) => {
  const thresholds = {
    co: { low: 200, moderate: 1000, high: 2000 },
    no: { low: 0.5, moderate: 1, high: 2 },
    no2: { low: 10, moderate: 20, high: 40 },
    o3: { low: 50, moderate: 100, high: 150 },
    so2: { low: 5, moderate: 10, high: 20 },
    pm2_5: { low: 10, moderate: 25, high: 50 },
    pm10: { low: 20, moderate: 50, high: 100 },
    nh3: { low: 0.5, moderate: 1, high: 2 }
  };

  const threshold = thresholds[pollutant];
  if (!threshold) return "Unknown";

  if (value <= threshold.low) return "Low";
  if (value <= threshold.moderate) return "Moderate";
  if (value <= threshold.high) return "High";
  return "Very High";
};

/**
 * @description Get pollutant description
 * @param {string} pollutant - Pollutant name
 * @param {number} value - Pollutant value
 * @returns {string} Pollutant description
 */
const getPollutantDescription = (pollutant, value) => {
  const descriptions = {
    co: "Carbon monoxide - a colorless, odorless gas that can be harmful when inhaled",
    no: "Nitric oxide - a gas that contributes to air pollution",
    no2: "Nitrogen dioxide - a gas that can irritate the lungs",
    o3: "Ozone - a gas that can cause respiratory problems",
    so2: "Sulfur dioxide - a gas that can irritate the respiratory system",
    pm2_5: "Fine particulate matter - tiny particles that can penetrate deep into the lungs",
    pm10: "Coarse particulate matter - larger particles that can irritate the respiratory system",
    nh3: "Ammonia - a gas that can contribute to air pollution"
  };

  return descriptions[pollutant] || "Unknown pollutant";
};

/**
 * @description Generate air pollution alerts
 * @param {number} aqi - Air Quality Index
 * @param {Object} components - Air pollution components
 * @returns {Array} Array of alerts
 */
const generateAirPollutionAlerts = (aqi, components) => {
  const alerts = [];

  // AQI-based alerts
  if (aqi >= 4) {
    alerts.push({
      type: "air_quality",
      level: "high",
      message: "Poor air quality detected - limit outdoor activities"
    });
  }

  if (aqi === 5) {
    alerts.push({
      type: "air_quality",
      level: "critical",
      message: "Very poor air quality - avoid outdoor activities"
    });
  }

  // Pollutant-specific alerts
  if (components.pm2_5 > 25) {
    alerts.push({
      type: "pm2_5",
      level: "moderate",
      message: "High levels of fine particulate matter detected"
    });
  }

  if (components.o3 > 100) {
    alerts.push({
      type: "ozone",
      level: "moderate",
      message: "Elevated ozone levels - sensitive individuals should limit outdoor activities"
    });
  }

  if (components.no2 > 20) {
    alerts.push({
      type: "nitrogen_dioxide",
      level: "moderate",
      message: "High nitrogen dioxide levels detected"
    });
  }

  return alerts;
};

/**
 * @description Generate air pollution recommendations
 * @param {number} aqi - Air Quality Index
 * @param {Object} components - Air pollution components
 * @returns {Object} Recommendations
 */
const generateAirPollutionRecommendations = (aqi, components) => {
  return {
    general: getGeneralRecommendations(aqi),
    outdoor: getOutdoorRecommendations(aqi),
    indoor: getIndoorRecommendations(aqi),
    health: getHealthRecommendations(aqi),
    transportation: getTransportationRecommendations(aqi)
  };
};

/**
 * @description Get general recommendations
 * @param {number} aqi - Air Quality Index
 * @returns {string} General recommendations
 */
const getGeneralRecommendations = (aqi) => {
  if (aqi <= 2) return "Air quality is good - normal activities can be performed";
  if (aqi === 3) return "Sensitive individuals should consider reducing outdoor activities";
  if (aqi === 4) return "Everyone should reduce outdoor activities, especially sensitive groups";
  if (aqi === 5) return "Avoid outdoor activities - stay indoors with air filtration if possible";
  return "Monitor air quality and follow local health advisories";
};

/**
 * @description Get outdoor recommendations
 * @param {number} aqi - Air Quality Index
 * @returns {string} Outdoor recommendations
 */
const getOutdoorRecommendations = (aqi) => {
  if (aqi <= 2) return "Outdoor activities are safe";
  if (aqi === 3) return "Limit prolonged outdoor activities";
  if (aqi === 4) return "Avoid outdoor activities, especially exercise";
  if (aqi === 5) return "Stay indoors - outdoor activities are not recommended";
  return "Check local air quality advisories before outdoor activities";
};

/**
 * @description Get indoor recommendations
 * @param {number} aqi - Air Quality Index
 * @returns {string} Indoor recommendations
 */
const getIndoorRecommendations = (aqi) => {
  if (aqi <= 2) return "Normal indoor activities";
  if (aqi === 3) return "Use air purifiers if available";
  if (aqi >= 4) return "Use air purifiers and keep windows closed";
  return "Consider using air filtration systems";
};

/**
 * @description Get health recommendations
 * @param {number} aqi - Air Quality Index
 * @returns {string} Health recommendations
 */
const getHealthRecommendations = (aqi) => {
  if (aqi <= 2) return "No special health precautions needed";
  if (aqi === 3) return "Monitor symptoms if you have respiratory conditions";
  if (aqi >= 4) return "Consult healthcare provider if experiencing respiratory symptoms";
  return "Seek medical attention for severe respiratory symptoms";
};

/**
 * @description Get transportation recommendations
 * @param {number} aqi - Air Quality Index
 * @returns {string} Transportation recommendations
 */
const getTransportationRecommendations = (aqi) => {
  if (aqi <= 2) return "Normal transportation methods";
  if (aqi === 3) return "Consider using public transportation";
  if (aqi >= 4) return "Use public transportation or carpool to reduce emissions";
  return "Avoid unnecessary travel and use public transportation";
};

/**
 * @description Get health risk level
 * @param {number} aqi - Air Quality Index
 * @returns {string} Health risk level
 */
const getHealthRiskLevel = (aqi) => {
  if (aqi === 1) return "Low";
  if (aqi === 2) return "Low to Moderate";
  if (aqi === 3) return "Moderate";
  if (aqi === 4) return "High";
  if (aqi === 5) return "Very High";
  return "Unknown";
};

/**
 * @description Get vulnerable groups
 * @param {number} aqi - Air Quality Index
 * @returns {Array} Vulnerable groups
 */
const getVulnerableGroups = (aqi) => {
  const groups = ["Children", "Elderly", "People with respiratory conditions"];
  
  if (aqi >= 3) {
    groups.push("People with heart conditions");
  }
  
  if (aqi >= 4) {
    groups.push("Pregnant women");
    groups.push("People with diabetes");
  }
  
  return groups;
};

/**
 * @description Get health symptoms
 * @param {number} aqi - Air Quality Index
 * @returns {Array} Health symptoms
 */
const getHealthSymptoms = (aqi) => {
  if (aqi <= 2) return ["None expected"];
  
  const symptoms = ["Coughing", "Throat irritation"];
  
  if (aqi >= 3) {
    symptoms.push("Shortness of breath");
    symptoms.push("Chest tightness");
  }
  
  if (aqi >= 4) {
    symptoms.push("Wheezing");
    symptoms.push("Eye irritation");
  }
  
  if (aqi === 5) {
    symptoms.push("Severe respiratory distress");
    symptoms.push("Chest pain");
  }
  
  return symptoms;
};

/**
 * @description Get prevention measures
 * @param {number} aqi - Air Quality Index
 * @returns {Array} Prevention measures
 */
const getPreventionMeasures = (aqi) => {
  const measures = ["Monitor air quality regularly"];
  
  if (aqi >= 3) {
    measures.push("Limit outdoor activities");
    measures.push("Use air purifiers indoors");
  }
  
  if (aqi >= 4) {
    measures.push("Keep windows and doors closed");
    measures.push("Avoid outdoor exercise");
  }
  
  if (aqi === 5) {
    measures.push("Stay indoors as much as possible");
    measures.push("Use N95 masks if going outside");
  }
  
  return measures;
};

/**
 * @description Get outdoor activity recommendation
 * @param {number} aqi - Air Quality Index
 * @returns {string} Outdoor activity recommendation
 */
const getOutdoorActivityRecommendation = (aqi) => {
  if (aqi <= 2) return "Safe for all outdoor activities";
  if (aqi === 3) return "Limit prolonged outdoor activities";
  if (aqi === 4) return "Avoid outdoor activities, especially exercise";
  if (aqi === 5) return "Stay indoors - outdoor activities not recommended";
  return "Check local air quality before outdoor activities";
};

/**
 * @description Get exercise recommendation
 * @param {number} aqi - Air Quality Index
 * @returns {string} Exercise recommendation
 */
const getExerciseRecommendation = (aqi) => {
  if (aqi <= 2) return "Outdoor exercise is safe";
  if (aqi === 3) return "Consider indoor exercise or reduce intensity";
  if (aqi >= 4) return "Exercise indoors only";
  return "Avoid outdoor exercise when air quality is poor";
};

/**
 * @description Get ventilation recommendation
 * @param {number} aqi - Air Quality Index
 * @returns {string} Ventilation recommendation
 */
const getVentilationRecommendation = (aqi) => {
  if (aqi <= 2) return "Normal ventilation is fine";
  if (aqi === 3) return "Use air purifiers if available";
  if (aqi >= 4) return "Keep windows closed and use air purifiers";
  return "Minimize outdoor air intake and use filtration";
};

/**
 * @description Get transportation recommendation
 * @param {number} aqi - Air Quality Index
 * @returns {string} Transportation recommendation
 */
const getTransportationRecommendation = (aqi) => {
  if (aqi <= 2) return "All transportation methods are fine";
  if (aqi === 3) return "Consider public transportation";
  if (aqi >= 4) return "Use public transportation to reduce emissions";
  return "Minimize travel and use public transportation";
};

module.exports = {
  transformAirPollutionData
}; 