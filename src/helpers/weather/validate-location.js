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
    'brasil': 'Brazil, BR',
    'brazil': 'Brazil, BR',
    'méxico': 'Mexico, MX',
    'mexico': 'Mexico, MX',
    'españa': 'Spain, ES',
    'spain': 'Spain, ES',
    'francia': 'France, FR',
    'france': 'France, FR',
    'alemania': 'Germany, DE',
    'germany': 'Germany, DE',
    'italia': 'Italy, IT',
    'italy': 'Italy, IT',
    'portugal': 'Portugal, PT',
    'argentina': 'Argentina, AR',
    'chile': 'Chile, CL',
    'colombia': 'Colombia, CO',
    'peru': 'Peru, PE',
    'venezuela': 'Venezuela, VE',
    'ecuador': 'Ecuador, EC',
    'bolivia': 'Bolivia, BO',
    'paraguay': 'Paraguay, PY',
    'uruguay': 'Uruguay, UY',
    'guyana': 'Guyana, GY',
    'suriname': 'Suriname, SR',
    'guyana francesa': 'French Guiana, GF',
    'french guiana': 'French Guiana, GF'
  };

  // Check if it's a known country mapping
  const lowerLocation = cleaned.toLowerCase();
  if (countryMappings[lowerLocation]) {
    return countryMappings[lowerLocation];
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
    'russia': ['Moscow, Russia', 'Saint Petersburg, Russia', 'Novosibirsk, Russia'],
    'china': ['Beijing, China', 'Shanghai, China', 'Guangzhou, China'],
    'india': ['Mumbai, India', 'Delhi, India', 'Bangalore, India'],
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