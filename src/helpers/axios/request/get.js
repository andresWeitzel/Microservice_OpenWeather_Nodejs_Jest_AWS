const axios = require("axios");
//Const-vars
let axiosResponse;
let axiosData;
let msgResponse;
let msgLog;

/**
 * @description Function to send a axios get request
 * @param {string} url string type
 * @param {any} data any type
 * @param {any} config any type
 * @returns  an object with the information from request
 * @example
 */
const sendGetRequest = async (url, data, config) => {
  try {
    if (data == (null || undefined) && config == (null || undefined)) {
      axiosResponse = await axios.get(url);
    } else if (data == (null || undefined)) {
      axiosResponse = await axios.get(url, config);
    } else {
      axiosResponse = await axios.get(url, data, config);
    }
    axiosData = axiosResponse != null ? axiosResponse.data : null;

    return axiosData;
  } catch (error) {
    msgResponse = "ERROR in sendGetRequest() helper function.";
    msgLog = msgResponse + `Caused by ${error}`;
    console.log(msgLog);
    return msgResponse;
  }
};

module.exports = {
  sendGetRequest,
};
