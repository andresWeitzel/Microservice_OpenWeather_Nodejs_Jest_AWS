//Vars
let stringToCompareArray;
let charactersArray;
let countCharacters;
let msgResponse;
let msgLog;

/**
 * @description Function to calculate the number of characters based on a string parameter that are equal
 * @param {String} stringToCompare String type
 * @param {String} characters String type
 * @returns a number of characters for a string that have the same characters passed as parameters
 *  @example stringToCompare = 'abc' | characters = 'a' => 1
 */
const calculateNumberOfCharactersMatch = async (
  stringToCompare,
  characters
) => {
  try {
    stringToCompareArray = null;
    charactersArray = null;
    countCharacters = 0;

    stringToCompareArray = [...stringToCompare];
    charactersArray = [...characters];

    for (let i = 0; i <= charactersArray.length; i++) {
      if (stringToCompareArray.indexOf(charactersArray[i])) {
        countCharacters++;
      }
    }
    return countCharacters;
  } catch (error) {
    msgResponse =
      "ERROR in calculateNumberOfCharactersMatch() helper function.";
    msgLog = msgResponse + `Caused by ${error}`;
    console.log(msgLog);
    return msgResponse;
  }
};

module.exports = {
  calculateNumberOfCharactersMatch,
};
