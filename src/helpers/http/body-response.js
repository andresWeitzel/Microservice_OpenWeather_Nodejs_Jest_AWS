//Cont-vars
let msgResponse;
let msgLog;
/**
 * @description Build a standardized Lambda proxy JSON response with CORS headers
 * @param {Object|Number} statusOrOptions Either status code (legacy) or options object
 * options = { statusCode: number, body: any, headers?: Record<string,string> }
 * @returns {Object} Lambda proxy response
 */
const bodyResponse = async (statusOrOptions, maybeBody) => {
  try {
    // Support legacy signature: (statusCode, message)
    const isLegacy = typeof statusOrOptions === 'number';
    const statusCode = isLegacy ? statusOrOptions : statusOrOptions.statusCode;
    const payload = isLegacy ? { message: maybeBody } : (statusOrOptions.body ?? {});
    const extraHeaders = isLegacy ? {} : (statusOrOptions.headers ?? {});

    return {
      statusCode: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        ...extraHeaders,
      },
      body: JSON.stringify(payload, null, 2),
    };
  } catch (error) {
    msgResponse = "ERROR in bodyResponse() function.";
    msgLog = msgResponse + `Caused by ${error}`;
    console.log(msgLog);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      },
      body: JSON.stringify({ message: msgResponse }, null, 2),
    };
  }
};

module.exports = { bodyResponse };
