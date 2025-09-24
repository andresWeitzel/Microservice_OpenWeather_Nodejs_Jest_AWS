const { recordMetric } = require('../controllers/metrics/get-metrics');

/**
 * Middleware to collect API metrics
 * @param {Function} handler - Original handler function
 * @returns {Function} Wrapped handler with metrics collection
 */
const metricsMiddleware = (handler) => {
  return async (event, context) => {
    const startTime = Date.now();
    const endpoint = event.path || event.resource || 'unknown';
    let isError = false;
    
    try {
      // Execute the original handler
      const result = await handler(event, context);
      
      // Check if the response indicates an error
      if (result && result.statusCode >= 400) {
        isError = true;
      }
      
      return result;
      
    } catch (error) {
      isError = true;
      throw error;
      
    } finally {
      // Record metrics
      const responseTime = Date.now() - startTime;
      recordMetric(endpoint, responseTime, isError);
    }
  };
};

module.exports = { metricsMiddleware };
