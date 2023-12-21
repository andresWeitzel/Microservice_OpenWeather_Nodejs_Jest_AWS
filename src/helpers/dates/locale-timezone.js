//Vars
let msgResponse;
let msgLog;
let dateLocale;

/**
 * @description Function to get a locale date time with timezone according to the zone and format
 * @param {String} formatZone String type
 * @param {String} timeZone String type
 * @example "7/12/2023, 15:12:21"
 */
const getLocaleTimeZone = async (formatZone, timeZone) => {
  try {
    dateLocale = new Date().toLocaleString(formatZone, { timeZone: timeZone });
    return dateLocale;
  } catch (error) {
    msgResponse = "ERROR in getLocaleTimeZone() helper function.";
    msgLog = msgResponse + `Caused by ${error}`;
    console.log(msgLog);
    return msgResponse;
  }
};

module.exports = {
  getLocaleTimeZone,
};
