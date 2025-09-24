const { bodyResponse } = require('../helpers/http/body-response');
const { TOO_MANY_REQUESTS_CODE } = require('../enums/http/status-code');

// In-memory rate limiting storage (in production, use Redis)
const rateLimitStore = new Map();

/**
 * Rate limiting configuration
 */
const RATE_LIMITS = {
  // Per API key limits
  apiKey: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000
  },
  // Per IP limits
  ip: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100
  }
};

/**
 * Clean up expired entries from rate limit store
 */
const cleanupExpiredEntries = () => {
  const now = Date.now();
  
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
};

/**
 * Get rate limit key for API key
 * @param {string} apiKey - API key
 * @returns {string} Rate limit key
 */
const getApiKeyRateLimitKey = (apiKey) => `api_key:${apiKey}`;

/**
 * Get rate limit key for IP address
 * @param {string} ip - IP address
 * @returns {string} Rate limit key
 */
const getIpRateLimitKey = (ip) => `ip:${ip}`;

/**
 * Check rate limit for a given key
 * @param {string} key - Rate limit key
 * @param {Object} config - Rate limit configuration
 * @returns {Object} Rate limit status
 */
const checkRateLimit = (key, config) => {
  const now = Date.now();
  const data = rateLimitStore.get(key);
  
  if (!data || now > data.resetTime) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs
    };
  }
  
  if (data.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: data.resetTime
    };
  }
  
  // Increment counter
  data.count++;
  rateLimitStore.set(key, data);
  
  return {
    allowed: true,
    remaining: config.maxRequests - data.count,
    resetTime: data.resetTime
  };
};

/**
 * Get client IP address from event
 * @param {Object} event - API Gateway event
 * @returns {string} Client IP address
 */
const getClientIp = (event) => {
  return event.requestContext?.identity?.sourceIp || 
         event.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
         event.headers?.['x-real-ip'] ||
         'unknown';
};

/**
 * Get API key from event
 * @param {Object} event - API Gateway event
 * @returns {string|null} API key
 */
const getApiKey = (event) => {
  return event.headers?.['x-api-key'] || 
         event.queryStringParameters?.api_key ||
         null;
};

/**
 * Rate limiting middleware
 * @param {Function} handler - Original handler function
 * @returns {Function} Wrapped handler with rate limiting
 */
const rateLimiterMiddleware = (handler) => {
  return async (event, context) => {
    try {
      // Clean up expired entries periodically
      if (Math.random() < 0.01) { // 1% chance
        cleanupExpiredEntries();
      }
      
      const clientIp = getClientIp(event);
      const apiKey = getApiKey(event);
      
      // Check IP-based rate limit
      const ipKey = getIpRateLimitKey(clientIp);
      const ipRateLimit = checkRateLimit(ipKey, RATE_LIMITS.ip);
      
      if (!ipRateLimit.allowed) {
        return bodyResponse({
          statusCode: TOO_MANY_REQUESTS_CODE,
          body: {
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests from this IP address',
            timestamp: new Date().toISOString(),
            details: {
              limit: RATE_LIMITS.ip.maxRequests,
              window: RATE_LIMITS.ip.windowMs,
              resetTime: new Date(ipRateLimit.resetTime).toISOString()
            }
          },
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS.ip.maxRequests,
            'X-RateLimit-Remaining': ipRateLimit.remaining,
            'X-RateLimit-Reset': Math.ceil(ipRateLimit.resetTime / 1000),
            'Retry-After': Math.ceil((ipRateLimit.resetTime - Date.now()) / 1000)
          }
        });
      }
      
      // Check API key-based rate limit (if API key is provided)
      if (apiKey) {
        const apiKeyRateLimit = checkRateLimit(
          getApiKeyRateLimitKey(apiKey), 
          RATE_LIMITS.apiKey
        );
        
        if (!apiKeyRateLimit.allowed) {
          return bodyResponse({
            statusCode: TOO_MANY_REQUESTS_CODE,
            body: {
              error: 'RATE_LIMIT_EXCEEDED',
              message: 'API key rate limit exceeded',
              timestamp: new Date().toISOString(),
              details: {
                limit: RATE_LIMITS.apiKey.maxRequests,
                window: RATE_LIMITS.apiKey.windowMs,
                resetTime: new Date(apiKeyRateLimit.resetTime).toISOString()
              }
            },
            headers: {
              'X-RateLimit-Limit': RATE_LIMITS.apiKey.maxRequests,
              'X-RateLimit-Remaining': apiKeyRateLimit.remaining,
              'X-RateLimit-Reset': Math.ceil(apiKeyRateLimit.resetTime / 1000),
              'Retry-After': Math.ceil((apiKeyRateLimit.resetTime - Date.now()) / 1000)
            }
          });
        }
      }
      
      // Execute the original handler
      const result = await handler(event, context);
      
      // Add rate limit headers to successful responses
      if (result && result.statusCode < 400) {
        const headers = {
          ...result.headers,
          'X-RateLimit-Limit-IP': RATE_LIMITS.ip.maxRequests,
          'X-RateLimit-Remaining-IP': ipRateLimit.remaining,
          'X-RateLimit-Reset-IP': Math.ceil(ipRateLimit.resetTime / 1000)
        };
        
        if (apiKey) {
          const apiKeyRateLimit = checkRateLimit(
            getApiKeyRateLimitKey(apiKey), 
            RATE_LIMITS.apiKey
          );
          headers['X-RateLimit-Limit-API'] = RATE_LIMITS.apiKey.maxRequests;
          headers['X-RateLimit-Remaining-API'] = apiKeyRateLimit.remaining;
          headers['X-RateLimit-Reset-API'] = Math.ceil(apiKeyRateLimit.resetTime / 1000);
        }
        
        result.headers = headers;
      }
      
      return result;
      
    } catch (error) {
      console.error('Rate limiter error:', error);
      // If rate limiter fails, allow the request to proceed
      return await handler(event, context);
    }
  };
};

module.exports = { rateLimiterMiddleware };
