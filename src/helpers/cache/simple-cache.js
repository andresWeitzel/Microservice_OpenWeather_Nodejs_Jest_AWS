"use strict";

/**
 * @description Simple in-memory cache for API responses
 */
class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.maxAge = 10 * 60 * 1000; // 10 minutes default
  }

  /**
   * @description Set cache entry with timestamp
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} maxAge - Maximum age in milliseconds (optional)
   */
  set(key, value, maxAge = this.maxAge) {
    const entry = {
      value,
      timestamp: Date.now(),
      maxAge
    };
    this.cache.set(key, entry);
    
    // Clean up expired entries
    this.cleanup();
  }

  /**
   * @description Get cache entry if not expired
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if expired/not found
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.maxAge) {
      // Entry expired, remove it
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * @description Check if key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists and is valid
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * @description Remove specific key from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * @description Clear all cache entries
   */
  clear() {
    this.cache.clear();
  }

  /**
   * @description Remove expired entries from cache
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.maxAge) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * @description Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxAge: this.maxAge
    };
  }
}

// Create singleton instance
const cache = new SimpleCache();

/**
 * @description Generate cache key for weather API calls
 * @param {string} endpoint - API endpoint
 * @param {string} location - Location parameter
 * @returns {string} Cache key
 */
const generateWeatherCacheKey = (endpoint, location) => {
  if (!endpoint || !location) {
    throw new Error('Both endpoint and location parameters are required');
  }
  return `weather:${endpoint}:${location.toLowerCase().replace(/\s+/g, '_')}`;
};

/**
 * @description Get cached weather data
 * @param {string} keyOrEndpoint - Cache key or API endpoint
 * @param {string} location - Location parameter (optional if keyOrEndpoint is a full key)
 * @returns {any|null} Cached data or null
 */
const getCachedWeatherData = (keyOrEndpoint, location) => {
  const key = location ? generateWeatherCacheKey(keyOrEndpoint, location) : keyOrEndpoint;
  return cache.get(key);
};

/**
 * @description Set cached weather data
 * @param {string} keyOrEndpoint - Cache key or API endpoint
 * @param {string|any} locationOrData - Location parameter or data to cache
 * @param {any} data - Data to cache (optional if locationOrData is the data)
 * @param {number} maxAge - Maximum age in milliseconds (optional)
 */
const setCachedWeatherData = (keyOrEndpoint, locationOrData, data, maxAge) => {
  let key, dataToCache, maxAgeToUse;
  
  if (typeof locationOrData === 'string') {
    // Called with (endpoint, location, data, maxAge)
    key = generateWeatherCacheKey(keyOrEndpoint, locationOrData);
    dataToCache = data;
    maxAgeToUse = maxAge;
  } else {
    // Called with (key, data, maxAge)
    key = keyOrEndpoint;
    dataToCache = locationOrData;
    maxAgeToUse = data;
  }
  
  cache.set(key, dataToCache, maxAgeToUse);
};

/**
 * @description Check if weather data is cached
 * @param {string} keyOrEndpoint - Cache key or API endpoint
 * @param {string} location - Location parameter (optional if keyOrEndpoint is a full key)
 * @returns {boolean} True if data is cached
 */
const hasCachedWeatherData = (keyOrEndpoint, location) => {
  const key = location ? generateWeatherCacheKey(keyOrEndpoint, location) : keyOrEndpoint;
  return cache.has(key);
};

module.exports = {
  cache,
  generateWeatherCacheKey,
  getCachedWeatherData,
  setCachedWeatherData,
  hasCachedWeatherData
}; 