"use strict";

const fs = require('fs');
const path = require('path');

// Path to the local city IDs database
const CITY_IDS_DATABASE_PATH = path.join(__dirname, '../../../data/city-ids/city-ids-database.json');

/**
 * Load the local city IDs database
 * @returns {Object} The city IDs database
 */
function loadCityIdsDatabase() {
  try {
    const databasePath = path.resolve(CITY_IDS_DATABASE_PATH);
    const databaseContent = fs.readFileSync(databasePath, 'utf8');
    return JSON.parse(databaseContent);
  } catch (error) {
    console.error('Error loading city IDs database:', error.message);
    return { cities: {} };
  }
}

/**
 * Search for city IDs in the local database
 * @param {string} cityName - The name of the city to search for
 * @param {string} countryCode - Optional country code to filter results
 * @param {number} limit - Maximum number of results to return
 * @returns {Array} Array of city objects with IDs
 */
function searchCityIds(cityName, countryCode = null, limit = 5) {
  try {
    const database = loadCityIdsDatabase();
    const cities = database.cities;
    
    // Normalize city name for case-insensitive search
    const normalizedCityName = cityName.toLowerCase().trim();
    
    // Find cities that match the search query
    const matchingCities = [];
    
    for (const [dbCityName, countryData] of Object.entries(cities)) {
      const normalizedDbCityName = dbCityName.toLowerCase();
      
      // Check if city name matches (partial match)
      if (normalizedDbCityName.includes(normalizedCityName) || 
          normalizedCityName.includes(normalizedDbCityName)) {
        
        // If country code is specified, only return cities from that country
        if (countryCode) {
          if (countryData[countryCode]) {
            matchingCities.push(...countryData[countryCode]);
          }
        } else {
          // Return cities from all countries
          for (const [code, cityList] of Object.entries(countryData)) {
            matchingCities.push(...cityList);
          }
        }
      }
    }
    
    // Apply limit and return results
    return matchingCities.slice(0, limit);
    
  } catch (error) {
    console.error('Error searching city IDs:', error.message);
    return [];
  }
}

/**
 * Get all cities from the database (for debugging/development)
 * @returns {Object} All cities in the database
 */
function getAllCities() {
  try {
    const database = loadCityIdsDatabase();
    return database.cities;
  } catch (error) {
    console.error('Error getting all cities:', error.message);
    return {};
  }
}

/**
 * Get database metadata
 * @returns {Object} Database metadata
 */
function getDatabaseMetadata() {
  try {
    const database = loadCityIdsDatabase();
    return database.metadata || {};
  } catch (error) {
    console.error('Error getting database metadata:', error.message);
    return {};
  }
}

/**
 * Check if a city exists in the database
 * @param {string} cityName - The name of the city to check
 * @param {string} countryCode - Optional country code
 * @returns {boolean} True if city exists, false otherwise
 */
function cityExists(cityName, countryCode = null) {
  const results = searchCityIds(cityName, countryCode, 1);
  return results.length > 0;
}

/**
 * Get city by exact ID
 * @param {number} cityId - The city ID to search for
 * @returns {Object|null} City object if found, null otherwise
 */
function getCityById(cityId) {
  try {
    const database = loadCityIdsDatabase();
    const cities = database.cities;
    
    for (const [cityName, countryData] of Object.entries(cities)) {
      for (const [countryCode, cityList] of Object.entries(countryData)) {
        const city = cityList.find(c => c.id === cityId);
        if (city) {
          return city;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting city by ID:', error.message);
    return null;
  }
}

/**
 * Get statistics about the database
 * @returns {Object} Database statistics
 */
function getDatabaseStats() {
  try {
    const database = loadCityIdsDatabase();
    const cities = database.cities;
    
    let totalCities = 0;
    let totalCountries = 0;
    const countries = new Set();
    
    for (const [cityName, countryData] of Object.entries(cities)) {
      for (const [countryCode, cityList] of Object.entries(countryData)) {
        totalCities += cityList.length;
        countries.add(countryCode);
      }
    }
    
    return {
      totalCities,
      totalCountries: countries.size,
      totalCityNames: Object.keys(cities).length,
      countries: Array.from(countries).sort()
    };
  } catch (error) {
    console.error('Error getting database stats:', error.message);
    return {};
  }
}

module.exports = {
  searchCityIds,
  getAllCities,
  getDatabaseMetadata,
  cityExists,
  getCityById,
  getDatabaseStats,
  loadCityIdsDatabase
}; 