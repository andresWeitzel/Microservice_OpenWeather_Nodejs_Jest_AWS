const { bodyResponse } = require('../helpers/http/body-response');
const { BAD_REQUEST_CODE } = require('../enums/http/status-code');

/**
 * Validation schemas for different endpoints
 */
const VALIDATION_SCHEMAS = {
  '/weather/current/{cityId}': {
    pathParameters: {
      cityId: {
        type: 'integer',
        minimum: 1,
        required: true
      }
    },
    queryParameters: {
      units: {
        type: 'string',
        enum: ['metric', 'imperial', 'kelvin'],
        default: 'metric'
      },
      lang: {
        type: 'string',
        enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'],
        default: 'en'
      }
    }
  },
  
  '/weather/current/coordinates': {
    queryParameters: {
      lat: {
        type: 'number',
        minimum: -90,
        maximum: 90,
        required: true
      },
      lon: {
        type: 'number',
        minimum: -180,
        maximum: 180,
        required: true
      },
      units: {
        type: 'string',
        enum: ['metric', 'imperial', 'kelvin'],
        default: 'metric'
      },
      lang: {
        type: 'string',
        enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'],
        default: 'en'
      }
    }
  },
  
  '/weather/current/location': {
    queryParameters: {
      q: {
        type: 'string',
        pattern: '^[a-zA-Z\\s]+,[A-Z]{2}$',
        required: true
      },
      units: {
        type: 'string',
        enum: ['metric', 'imperial', 'kelvin'],
        default: 'metric'
      },
      lang: {
        type: 'string',
        enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'],
        default: 'en'
      }
    }
  },
  
  '/weather/current/zipcode': {
    queryParameters: {
      zip: {
        type: 'string',
        pattern: '^[A-Za-z0-9\\s\\-\\.\\,]+$',
        required: true
      },
      country: {
        type: 'string',
        pattern: '^[A-Z]{2}$',
        required: true
      },
      units: {
        type: 'string',
        enum: ['metric', 'imperial', 'kelvin'],
        default: 'metric'
      },
      lang: {
        type: 'string',
        enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'],
        default: 'en'
      }
    }
  },
  
  '/forecast/days': {
    queryParameters: {
      q: {
        type: 'string',
        pattern: '^[a-zA-Z\\s]+,[A-Z]{2}$',
        required: true
      },
      days: {
        type: 'integer',
        minimum: 1,
        maximum: 5,
        required: true
      },
      units: {
        type: 'string',
        enum: ['metric', 'imperial', 'kelvin'],
        default: 'metric'
      },
      lang: {
        type: 'string',
        enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'],
        default: 'en'
      }
    }
  }
};

/**
 * Validate a value against a schema
 * @param {*} value - Value to validate
 * @param {Object} schema - Validation schema
 * @param {string} fieldName - Field name for error messages
 * @returns {Object} Validation result
 */
const validateValue = (value, schema, fieldName) => {
  const errors = [];
  
  // Check required fields
  if (schema.required && (value === undefined || value === null || value === '')) {
    errors.push(`${fieldName} is required`);
    return { valid: false, errors };
  }
  
  // Skip validation if value is not provided and not required
  if (value === undefined || value === null || value === '') {
    return { valid: true, errors: [] };
  }
  
  // Type validation
  if (schema.type === 'string' && typeof value !== 'string') {
    errors.push(`${fieldName} must be a string`);
  } else if (schema.type === 'integer' && !Number.isInteger(Number(value))) {
    errors.push(`${fieldName} must be an integer`);
  } else if (schema.type === 'number' && isNaN(Number(value))) {
    errors.push(`${fieldName} must be a number`);
  }
  
  // String validations
  if (schema.type === 'string' && typeof value === 'string') {
    if (schema.minLength && value.length < schema.minLength) {
      errors.push(`${fieldName} must be at least ${schema.minLength} characters long`);
    }
    if (schema.maxLength && value.length > schema.maxLength) {
      errors.push(`${fieldName} must be no more than ${schema.maxLength} characters long`);
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(`${fieldName} format is invalid`);
    }
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(`${fieldName} must be one of: ${schema.enum.join(', ')}`);
    }
  }
  
  // Number validations
  if ((schema.type === 'number' || schema.type === 'integer') && !isNaN(Number(value))) {
    const numValue = Number(value);
    if (schema.minimum !== undefined && numValue < schema.minimum) {
      errors.push(`${fieldName} must be at least ${schema.minimum}`);
    }
    if (schema.maximum !== undefined && numValue > schema.maximum) {
      errors.push(`${fieldName} must be no more than ${schema.maximum}`);
    }
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Validate path parameters
 * @param {Object} pathParameters - Path parameters
 * @param {Object} schema - Validation schema
 * @returns {Object} Validation result
 */
const validatePathParameters = (pathParameters, schema) => {
  const errors = [];
  
  if (!schema.pathParameters) {
    return { valid: true, errors: [] };
  }
  
  for (const [paramName, paramSchema] of Object.entries(schema.pathParameters)) {
    const value = pathParameters?.[paramName];
    const validation = validateValue(value, paramSchema, paramName);
    
    if (!validation.valid) {
      errors.push(...validation.errors);
    }
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Validate query parameters
 * @param {Object} queryParameters - Query parameters
 * @param {Object} schema - Validation schema
 * @returns {Object} Validation result
 */
const validateQueryParameters = (queryParameters, schema) => {
  const errors = [];
  
  if (!schema.queryParameters) {
    return { valid: true, errors: [] };
  }
  
  for (const [paramName, paramSchema] of Object.entries(schema.queryParameters)) {
    const value = queryParameters?.[paramName];
    const validation = validateValue(value, paramSchema, paramName);
    
    if (!validation.valid) {
      errors.push(...validation.errors);
    }
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Sanitize string values
 * @param {string} value - Value to sanitize
 * @returns {string} Sanitized value
 */
const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;
  
  return value
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .replace(/[;]/g, '') // Remove semicolons
    .substring(0, 1000); // Limit length
};

/**
 * Sanitize query parameters
 * @param {Object} queryParameters - Query parameters to sanitize
 * @returns {Object} Sanitized query parameters
 */
const sanitizeQueryParameters = (queryParameters) => {
  if (!queryParameters) return {};
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(queryParameters)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Validation middleware
 * @param {Function} handler - Original handler function
 * @returns {Function} Wrapped handler with validation
 */
const validatorMiddleware = (handler) => {
  return async (event, context) => {
    try {
      const path = event.path || event.resource || '';
      const schema = VALIDATION_SCHEMAS[path];
      
      if (!schema) {
        // No validation schema for this endpoint, proceed
        return await handler(event, context);
      }
      
      // Validate path parameters
      const pathValidation = validatePathParameters(event.pathParameters, schema);
      if (!pathValidation.valid) {
        return bodyResponse({
          statusCode: BAD_REQUEST_CODE,
          body: {
            error: 'VALIDATION_ERROR',
            message: 'Invalid path parameters',
            timestamp: new Date().toISOString(),
            details: {
              pathParameterErrors: pathValidation.errors
            }
          }
        });
      }
      
      // Validate and sanitize query parameters
      const queryValidation = validateQueryParameters(event.queryStringParameters, schema);
      if (!queryValidation.valid) {
        return bodyResponse({
          statusCode: BAD_REQUEST_CODE,
          body: {
            error: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            timestamp: new Date().toISOString(),
            details: {
              queryParameterErrors: queryValidation.errors
            }
          }
        });
      }
      
      // Sanitize query parameters
      if (event.queryStringParameters) {
        event.queryStringParameters = sanitizeQueryParameters(event.queryStringParameters);
      }
      
      // Execute the original handler
      return await handler(event, context);
      
    } catch (error) {
      console.error('Validation middleware error:', error);
      
      return bodyResponse({
        statusCode: BAD_REQUEST_CODE,
        body: {
          error: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          timestamp: new Date().toISOString(),
          details: {
            error: error.message
          }
        }
      });
    }
  };
};

module.exports = { validatorMiddleware };
