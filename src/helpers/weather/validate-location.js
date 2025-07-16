"use strict";

/**
 * @description Validate and clean location names for better geocoding results
 * @param {string} location - Raw location name
 * @returns {string} Cleaned location name
 */
const validateAndCleanLocation = (location) => {
  if (!location || typeof location !== 'string') {
    throw new Error('Location must be a non-empty string');
  }

  // Remove extra whitespace and trim
  let cleaned = location.trim().replace(/\s+/g, ' ');

  // Handle common country names that might cause issues
  const countryMappings = {
    'brasil': 'Brazil',
    'brazil': 'Brazil',
    'méxico': 'Mexico',
    'mexico': 'Mexico',
    'españa': 'Spain',
    'spain': 'Spain',
    'francia': 'France',
    'france': 'France',
    'alemania': 'Germany',
    'germany': 'Germany',
    'italia': 'Italy',
    'italy': 'Italy',
    'portugal': 'Portugal',
    'argentina': 'Argentina',
    'chile': 'Chile',
    'colombia': 'Colombia',
    'peru': 'Peru',
    'venezuela': 'Venezuela',
    'ecuador': 'Ecuador',
    'bolivia': 'Bolivia',
    'paraguay': 'Paraguay',
    'uruguay': 'Uruguay',
    'guyana': 'Guyana',
    'suriname': 'Suriname',
    'guyana francesa': 'French Guiana',
    'french guiana': 'French Guiana'
  };

  // Check if it's a known country mapping
  const lowerLocation = cleaned.toLowerCase();
  if (countryMappings[lowerLocation]) {
    return countryMappings[lowerLocation];
  }

  // For large countries, suggest specific cities
  const largeCountries = {
    'brazil': 'São Paulo, Brazil',
    'china': 'Beijing, China',
    'india': 'Mumbai, India',
    'russia': 'Moscow, Russia',
    'canada': 'Toronto, Canada',
    'australia': 'Sydney, Australia',
    'united states': 'New York, United States',
    'usa': 'New York, United States',
    'us': 'New York, United States'
  };

  if (largeCountries[lowerLocation]) {
    return largeCountries[lowerLocation];
  }

  return cleaned;
};

/**
 * @description Get better location suggestions for problematic locations
 * @param {string} location - Original location
 * @returns {Array} Array of suggested locations
 */
const getLocationSuggestions = (location) => {
  const suggestions = {
    'brasil': ['São Paulo, Brazil', 'Rio de Janeiro, Brazil', 'Brasília, Brazil'],
    'brazil': ['São Paulo, Brazil', 'Rio de Janeiro, Brazil', 'Brasília, Brazil'],
    'china': ['Beijing, China', 'Shanghai, China', 'Guangzhou, China'],
    'india': ['Mumbai, India', 'Delhi, India', 'Bangalore, India'],
    'russia': ['Moscow, Russia', 'Saint Petersburg, Russia', 'Novosibirsk, Russia'],
    'canada': ['Toronto, Canada', 'Vancouver, Canada', 'Montreal, Canada'],
    'australia': ['Sydney, Australia', 'Melbourne, Australia', 'Brisbane, Australia'],
    'united states': ['New York, United States', 'Los Angeles, United States', 'Chicago, United States'],
    'usa': ['New York, United States', 'Los Angeles, United States', 'Chicago, United States'],
    'us': ['New York, United States', 'Los Angeles, United States', 'Chicago, United States']
  };

  const lowerLocation = location.toLowerCase();
  return suggestions[lowerLocation] || [];
};

module.exports = {
  validateAndCleanLocation,
  getLocationSuggestions
}; 