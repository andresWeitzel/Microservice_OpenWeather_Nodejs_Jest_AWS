//External
let path = require("path");
let fs = require("fs/promises");
//vars
let msgResponse;
let msgLog;

/**
 * @description Function to create a json file
 * @param {string} filePath string type
 * @param {object} data object type
 * @example
 */
const createJson = async (filePath, data) => {
  try {
    // Validate arguments
    if (filePath === undefined || filePath === null) {
      msgResponse = "Unable to create json file. ERROR in createJson() helper function.";
      msgLog = msgResponse + "Caused by TypeError [ERR_INVALID_ARG_TYPE]: The \"data\" argument must be of type string or an instance of Buffer, TypedArray, or DataView. Received undefined";
      console.log(msgLog);
      return msgResponse;
    }

    if (data === undefined || data === null) {
      msgResponse = "Unable to create json file. ERROR in createJson() helper function.";
      msgLog = msgResponse + "Caused by TypeError [ERR_INVALID_ARG_TYPE]: The \"data\" argument must be of type string or an instance of Buffer, TypedArray, or DataView. Received undefined";
      console.log(msgLog);
      return msgResponse;
    }

    // Use a custom replacer function to handle circular references
    const jsonString = JSON.stringify(data, (key, value) => {
      // Skip circular references by replacing them with a placeholder
      if (typeof value === 'object' && value !== null) {
        if (value.constructor && value.constructor.name === 'ClientRequest') {
          return '[ClientRequest Object]';
        }
        if (value.constructor && value.constructor.name === 'TLSSocket') {
          return '[TLSSocket Object]';
        }
        if (value.constructor && value.constructor.name === 'IncomingMessage') {
          return '[IncomingMessage Object]';
        }
      }
      return value;
    }, 4);
    
    const absolutePath = path.resolve(__dirname, filePath);
    const dirPath = path.dirname(absolutePath);
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(absolutePath, jsonString);
    if (!(process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID != null)) {
      console.log("File has been created in " + filePath);
    }
  } catch (error) {
    msgResponse =
      "Unable to create json file. ERROR in createJson() helper function.";
    msgLog = msgResponse + `Caused by ${error}`;
    console.log(msgLog);
    return msgResponse; // Return error message instead of throwing
  }
};

module.exports = {
  createJson,
};
