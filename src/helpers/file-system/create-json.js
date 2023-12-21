//External
let path = require("path");
let fs = require('fs/promises');
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
    await fs.writeFile(
      path.join(__dirname + filePath),
      JSON.stringify(data, null, 4),
      (err) => {
        if (err) {
          console.log(err);
          return;
        }
      console.log("File has been created in " + filePath);
      }
    );

  } catch (error) {
    msgResponse = "Unable to create json file. ERROR in createJson() helper function.";
    msgLog = msgResponse + `Caused by ${error}`;
    console.log(msgLog);
    return msgResponse;
  }
};

module.exports = {
  createJson,
};
