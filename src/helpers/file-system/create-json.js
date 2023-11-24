//External
let path = require("path");
let fs = require("fs");

const createJson = async (filePath, data) => {
  try {
    fs.writeFile(
      path.join(__dirname + filePath),
      JSON.stringify(data, null, 4),
      (err) => {
        if (err) {
          console.error(err);
          return;
        }

        console.log("File has been created in " + filePath);
      }
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createJson,
};
