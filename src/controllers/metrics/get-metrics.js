const { bodyResponse } = require('../../helpers/http/body-response');
const { OK_CODE } = require('../../enums/http/status-code');

// In-memory metrics storage (in production, use Redis or DynamoDB)
let metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  endpoints: {},
  hourlyStats: {},
  dailyStats: {},
  lastReset: new Date().toISOString()
};

/**
 * Get API metrics and statistics
 * @param {Object} event - API Gateway event
 * @param {Object} context - Lambda context
 * @returns {Object} Metrics response
 */
const getMetrics = async (event, context) => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.toISOString().split('T')[0];
    
    // Calculate error rate
    const errorRate = metrics.totalRequests > 0 
      ? (metrics.failedRequests / metrics.totalRequests) * 100 
      : 0;
    
    // Calculate success rate
    const successRate = metrics.totalRequests > 0 
      ? (metrics.successfulRequests / metrics.totalRequests) * 100 
      : 0;
    
    // Get top endpoints by request count
    const topEndpoints = Object.entries(metrics.endpoints)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 10)
      .map(([endpoint, data]) => ({
        endpoint,
        count: data.count,
        averageResponseTime: data.totalResponseTime / data.count,
        errorRate: data.errors / data.count * 100
      }));
    
    // Get hourly statistics for the last 24 hours
    const hourlyStats = Object.entries(metrics.hourlyStats)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .slice(-24)
      .map(([hour, stats]) => ({
        hour: parseInt(hour),
        requests: stats.requests || 0,
        errors: stats.errors || 0,
        averageResponseTime: stats.totalResponseTime / (stats.requests || 1)
      }));
    
    // Get daily statistics for the last 7 days
    const dailyStats = Object.entries(metrics.dailyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, stats]) => ({
        date,
        requests: stats.requests || 0,
        errors: stats.errors || 0,
        averageResponseTime: stats.totalResponseTime / (stats.requests || 1)
      }));

    const response = {
      overview: {
        totalRequests: metrics.totalRequests,
        successfulRequests: metrics.successfulRequests,
        failedRequests: metrics.failedRequests,
        successRate: Math.round(successRate * 100) / 100,
        errorRate: Math.round(errorRate * 100) / 100,
        averageResponseTime: Math.round(metrics.averageResponseTime * 100) / 100,
        uptime: process.uptime(),
        lastReset: metrics.lastReset
      },
      endpoints: {
        topEndpoints,
        totalEndpoints: Object.keys(metrics.endpoints).length
      },
      timeSeries: {
        hourly: hourlyStats,
        daily: dailyStats
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      },
      timestamp: now.toISOString()
    };

    return bodyResponse({
      statusCode: OK_CODE,
      body: response
    });

  } catch (error) {
    console.error('Error getting metrics:', error);
    
    return bodyResponse({
      statusCode: 500,
      body: {
        error: 'METRICS_ERROR',
        message: 'Failed to retrieve metrics',
        timestamp: new Date().toISOString(),
        details: {
          error: error.message
        }
      }
    });
  }
};

/**
 * Record a request metric
 * @param {string} endpoint - API endpoint
 * @param {number} responseTime - Response time in milliseconds
 * @param {boolean} isError - Whether the request resulted in an error
 */
const recordMetric = (endpoint, responseTime, isError = false) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.toISOString().split('T')[0];
  
  // Update overall metrics
  metrics.totalRequests++;
  if (isError) {
    metrics.failedRequests++;
  } else {
    metrics.successfulRequests++;
  }
  
  // Update average response time
  metrics.averageResponseTime = 
    (metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTime) / metrics.totalRequests;
  
  // Update endpoint-specific metrics
  if (!metrics.endpoints[endpoint]) {
    metrics.endpoints[endpoint] = {
      count: 0,
      errors: 0,
      totalResponseTime: 0
    };
  }
  
  metrics.endpoints[endpoint].count++;
  metrics.endpoints[endpoint].totalResponseTime += responseTime;
  if (isError) {
    metrics.endpoints[endpoint].errors++;
  }
  
  // Update hourly stats
  if (!metrics.hourlyStats[currentHour]) {
    metrics.hourlyStats[currentHour] = {
      requests: 0,
      errors: 0,
      totalResponseTime: 0
    };
  }
  
  metrics.hourlyStats[currentHour].requests++;
  metrics.hourlyStats[currentHour].totalResponseTime += responseTime;
  if (isError) {
    metrics.hourlyStats[currentHour].errors++;
  }
  
  // Update daily stats
  if (!metrics.dailyStats[currentDay]) {
    metrics.dailyStats[currentDay] = {
      requests: 0,
      errors: 0,
      totalResponseTime: 0
    };
  }
  
  metrics.dailyStats[currentDay].requests++;
  metrics.dailyStats[currentDay].totalResponseTime += responseTime;
  if (isError) {
    metrics.dailyStats[currentDay].errors++;
  }
  
  // Clean up old data (keep only last 7 days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
  
  Object.keys(metrics.dailyStats).forEach(date => {
    if (date < sevenDaysAgoStr) {
      delete metrics.dailyStats[date];
    }
  });
  
  // Clean up old hourly data (keep only last 24 hours)
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twentyFourHoursAgoHour = twentyFourHoursAgo.getHours();
  
  Object.keys(metrics.hourlyStats).forEach(hour => {
    if (parseInt(hour) < twentyFourHoursAgoHour) {
      delete metrics.hourlyStats[hour];
    }
  });
};

/**
 * Reset metrics (useful for testing or maintenance)
 */
const resetMetrics = () => {
  metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    endpoints: {},
    hourlyStats: {},
    dailyStats: {},
    lastReset: new Date().toISOString()
  };
};

module.exports = { 
  getMetrics, 
  recordMetric, 
  resetMetrics 
};
