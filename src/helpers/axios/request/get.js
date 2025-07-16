const axios = require("axios");
//Const-vars
let axiosResponse;
let axiosData;
let msgResponse;
let msgLog;

/**
 * @description Sleep function for retry delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after ms milliseconds
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * @description Function to send a axios get request with retry logic and improved error handling
 * @param {string} url string type
 * @param {any} data any type
 * @param {any} config any type
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @returns  an object with the information from request
 * @example
 */
const sendGetRequest = async (url, data, config, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Default timeout configuration with shorter timeout for retries
      const defaultConfig = {
        timeout: attempt === 1 ? 10000 : 8000, // 10s first attempt, 8s retries
        headers: {
          "Content-Type": "application/json",
        },
      };

      // Merge default config with provided config
      const finalConfig = config ? { ...defaultConfig, ...config } : defaultConfig;

      console.log(`Attempt ${attempt}/${maxRetries} for URL: ${url}`);

      if (data == (null || undefined)) {
        axiosResponse = await axios.get(url, finalConfig);
      } else {
        axiosResponse = await axios.get(url, data, finalConfig);
      }
      
      axiosData = axiosResponse != null ? axiosResponse.data : null;

      if (attempt > 1) {
        console.log(`Success on attempt ${attempt} for URL: ${url}`);
      }

      return axiosData;
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log(`Authentication error (${error.response.status}), not retrying: ${url}`);
        break;
      }
      
      if (error.response && error.response.status === 404) {
        console.log(`Not found error (404), not retrying: ${url}`);
        break;
      }

      msgResponse = `ERROR in sendGetRequest() helper function (attempt ${attempt}/${maxRetries}).`;
      
      // Enhanced error logging with specific error types
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        msgLog = msgResponse + `Caused by Timeout Error: ${error.message} - URL: ${url}`;
      } else if (error.code === 'ENOTFOUND') {
        msgLog = msgResponse + `Caused by DNS Error: ${error.message} - URL: ${url}`;
      } else if (error.code === 'ECONNREFUSED') {
        msgLog = msgResponse + `Caused by Connection Refused: ${error.message} - URL: ${url}`;
      } else if (error.response) {
        // Server responded with error status
        msgLog = msgResponse + `Caused by HTTP ${error.response.status}: ${error.response.statusText} - URL: ${url}`;
      } else if (error.request) {
        // Request was made but no response received
        msgLog = msgResponse + `Caused by No Response: ${error.message} - URL: ${url}`;
      } else {
        // Other errors
        msgLog = msgResponse + `Caused by ${error.message} - URL: ${url}`;
      }
      
      console.log(msgLog);

      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
        console.log(`Waiting ${delay}ms before retry...`);
        await sleep(delay);
      }
    }
  }
  
  // All retries failed
  console.log(`All ${maxRetries} attempts failed for URL: ${url}`);
  return null;
};

module.exports = {
  sendGetRequest,
};
