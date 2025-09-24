const { bodyResponse } = require('../helpers/http/body-response');
const { SERVICE_UNAVAILABLE_CODE } = require('../enums/http/status-code');

/**
 * Circuit breaker states
 */
const CIRCUIT_STATES = {
  CLOSED: 'CLOSED',     // Normal operation
  OPEN: 'OPEN',         // Circuit is open, requests are blocked
  HALF_OPEN: 'HALF_OPEN' // Testing if service is back
};

/**
 * Circuit breaker configuration
 */
const CIRCUIT_CONFIG = {
  failureThreshold: 5,        // Number of failures before opening circuit
  recoveryTimeout: 30000,     // Time to wait before trying again (30 seconds)
  monitoringPeriod: 60000,    // Time window for monitoring failures (1 minute)
  successThreshold: 3         // Number of successes needed to close circuit
};

/**
 * Circuit breaker instances for different services
 */
const circuitBreakers = new Map();

/**
 * Circuit breaker class
 */
class CircuitBreaker {
  constructor(serviceName, config = CIRCUIT_CONFIG) {
    this.serviceName = serviceName;
    this.config = config;
    this.state = CIRCUIT_STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.failures = []; // Array to track failures within monitoring period
  }
  
  /**
   * Check if circuit breaker should allow the request
   * @returns {boolean} Whether request should be allowed
   */
  canExecute() {
    const now = Date.now();
    
    // Clean up old failures outside monitoring period
    this.failures = this.failures.filter(
      failureTime => now - failureTime < this.config.monitoringPeriod
    );
    
    switch (this.state) {
      case CIRCUIT_STATES.CLOSED:
        return true;
        
      case CIRCUIT_STATES.OPEN:
        // Check if recovery timeout has passed
        if (now - this.lastFailureTime > this.config.recoveryTimeout) {
          this.state = CIRCUIT_STATES.HALF_OPEN;
          this.successCount = 0;
          return true;
        }
        return false;
        
      case CIRCUIT_STATES.HALF_OPEN:
        return true;
        
      default:
        return true;
    }
  }
  
  /**
   * Record a successful execution
   */
  onSuccess() {
    this.failures = []; // Clear failures on success
    
    if (this.state === CIRCUIT_STATES.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.state = CIRCUIT_STATES.CLOSED;
        this.failureCount = 0;
        console.log(`Circuit breaker for ${this.serviceName} is now CLOSED`);
      }
    } else if (this.state === CIRCUIT_STATES.CLOSED) {
      this.failureCount = 0;
    }
  }
  
  /**
   * Record a failed execution
   */
  onFailure() {
    const now = Date.now();
    this.failures.push(now);
    this.lastFailureTime = now;
    
    if (this.state === CIRCUIT_STATES.CLOSED) {
      this.failureCount++;
      if (this.failureCount >= this.config.failureThreshold) {
        this.state = CIRCUIT_STATES.OPEN;
        console.log(`Circuit breaker for ${this.serviceName} is now OPEN`);
      }
    } else if (this.state === CIRCUIT_STATES.HALF_OPEN) {
      this.state = CIRCUIT_STATES.OPEN;
      console.log(`Circuit breaker for ${this.serviceName} is now OPEN (from HALF_OPEN)`);
    }
  }
  
  /**
   * Get circuit breaker status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      serviceName: this.serviceName,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      failuresInWindow: this.failures.length,
      canExecute: this.canExecute()
    };
  }
}

/**
 * Get or create circuit breaker for a service
 * @param {string} serviceName - Name of the service
 * @returns {CircuitBreaker} Circuit breaker instance
 */
const getCircuitBreaker = (serviceName) => {
  if (!circuitBreakers.has(serviceName)) {
    circuitBreakers.set(serviceName, new CircuitBreaker(serviceName));
  }
  return circuitBreakers.get(serviceName);
};

/**
 * Determine service name from event
 * @param {Object} event - API Gateway event
 * @returns {string} Service name
 */
const getServiceName = (event) => {
  const path = event.path || event.resource || 'unknown';
  
  // Map paths to service names
  if (path.includes('/weather/')) {
    return 'weather-service';
  } else if (path.includes('/forecast/')) {
    return 'forecast-service';
  } else if (path.includes('/info/')) {
    return 'info-service';
  } else if (path.includes('/health')) {
    return 'health-service';
  } else if (path.includes('/metrics')) {
    return 'metrics-service';
  } else if (path.includes('/docs')) {
    return 'docs-service';
  }
  
  return 'unknown-service';
};

/**
 * Check if error should be considered a failure for circuit breaker
 * @param {Error|Object} error - Error object or response
 * @returns {boolean} Whether this is a failure
 */
const isFailure = (error) => {
  // If it's an actual error (exception)
  if (error instanceof Error) {
    return true;
  }
  
  // If it's a response with error status code
  if (error && typeof error === 'object' && error.statusCode) {
    return error.statusCode >= 500; // Only 5xx errors count as failures
  }
  
  return false;
};

/**
 * Circuit breaker middleware
 * @param {Function} handler - Original handler function
 * @returns {Function} Wrapped handler with circuit breaker
 */
const circuitBreakerMiddleware = (handler) => {
  return async (event, context) => {
    const serviceName = getServiceName(event);
    const circuitBreaker = getCircuitBreaker(serviceName);
    
    // Check if circuit breaker allows execution
    if (!circuitBreaker.canExecute()) {
      return bodyResponse({
        statusCode: SERVICE_UNAVAILABLE_CODE,
        body: {
          error: 'SERVICE_UNAVAILABLE',
          message: 'Service is temporarily unavailable due to high error rate',
          timestamp: new Date().toISOString(),
          details: {
            serviceName,
            circuitState: circuitBreaker.state,
            retryAfter: Math.ceil(CIRCUIT_CONFIG.recoveryTimeout / 1000)
          }
        },
        headers: {
          'Retry-After': Math.ceil(CIRCUIT_CONFIG.recoveryTimeout / 1000),
          'X-Circuit-Breaker-State': circuitBreaker.state
        }
      });
    }
    
    try {
      // Execute the original handler
      const result = await handler(event, context);
      
      // Check if result indicates failure
      if (isFailure(result)) {
        circuitBreaker.onFailure();
      } else {
        circuitBreaker.onSuccess();
      }
      
      // Add circuit breaker status to response headers
      if (result && result.headers) {
        result.headers['X-Circuit-Breaker-State'] = circuitBreaker.state;
        result.headers['X-Circuit-Breaker-Failures'] = circuitBreaker.failureCount;
      }
      
      return result;
      
    } catch (error) {
      // Record failure in circuit breaker
      circuitBreaker.onFailure();
      
      // Re-throw the error
      throw error;
    }
  };
};

/**
 * Get circuit breaker status for all services
 * @returns {Object} Status of all circuit breakers
 */
const getCircuitBreakerStatus = () => {
  const status = {};
  
  for (const [serviceName, circuitBreaker] of circuitBreakers.entries()) {
    status[serviceName] = circuitBreaker.getStatus();
  }
  
  return status;
};

/**
 * Reset circuit breaker for a service
 * @param {string} serviceName - Name of the service
 */
const resetCircuitBreaker = (serviceName) => {
  if (circuitBreakers.has(serviceName)) {
    const circuitBreaker = circuitBreakers.get(serviceName);
    circuitBreaker.state = CIRCUIT_STATES.CLOSED;
    circuitBreaker.failureCount = 0;
    circuitBreaker.successCount = 0;
    circuitBreaker.failures = [];
    circuitBreaker.lastFailureTime = null;
    console.log(`Circuit breaker for ${serviceName} has been reset`);
  }
};

module.exports = { 
  circuitBreakerMiddleware, 
  getCircuitBreakerStatus, 
  resetCircuitBreaker,
  CIRCUIT_STATES 
};
