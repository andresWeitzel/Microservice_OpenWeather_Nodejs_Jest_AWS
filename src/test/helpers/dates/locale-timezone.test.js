"use strict";
//Helpers
const { getLocaleTimeZone } = require("../../../helpers/dates/locale-timezone");
const {
  calculateNumberOfCharactersMatch,
} = require("../../../helpers/maths/string/characters");
//Const
const TODAY_DATE = new Date();
//Vars
let msg;
let getLocaleTimeZoneResult;

describe("- getLocaleTimeZone helper (Unit Test)", () => {
  describe("1) Check cases for arguments.", () => {
    msg = "Should return a string type passing values to all parameters.";
    it(msg, async () => {
      getLocaleTimeZoneResult = await getLocaleTimeZone(TODAY_DATE);
      await expect(typeof getLocaleTimeZoneResult == "string").toBe(true);
    });

    msg = "Should return a string type if no arguments are passed.";
    it(msg, async () => {
      getLocaleTimeZoneResult = await getLocaleTimeZone();
      await expect(typeof getLocaleTimeZoneResult == "string").toBe(true);
    });

    msg = "Should return a string type if a null are passed.";
    it(msg, async () => {
      getLocaleTimeZoneResult = await getLocaleTimeZone(null);
      await expect(typeof getLocaleTimeZoneResult == "string").toBe(true);
    });
    msg = "Should return a string type if an undefined are passed.";
    it(msg, async () => {
      getLocaleTimeZoneResult = await getLocaleTimeZone(undefined);
      await expect(typeof getLocaleTimeZoneResult == "string").toBe(true);
    });
  });

  describe("2) Check cases for return.", () => {
    msg =
      "Should return a string type with 'DD/MM/YY, HH:MM:SS' format (Ex: 7/12/2023, 15:12:21) if a correct date param is passed";
    it(msg, async () => {
      getLocaleTimeZoneResult = await getLocaleTimeZone(TODAY_DATE);
      await expect(typeof getLocaleTimeZoneResult == "string").toBe(true);
      let characters = "/:,";
      let totalCharacters = 5; // total characters for DD/MM/YY, HH:MM:SS
      let numberCharactersMatch = await calculateNumberOfCharactersMatch(
        getLocaleTimeZoneResult,
        characters
      );
      console.log('number'+numberCharactersMatch);
      await expect(numberCharactersMatch == totalCharacters).toBe(true);
    });
  });

  describe("3) Check cases for error.", () => {
    msg = "Should return a string value if a new Error is passed";
    it(msg, async () => {
      await expect(async () => await getLocaleTimeZone(new Error())).not.toThrow(
        Error
      );
    });
    msg =
    "Should return a string type with the message 'ERROR in getLocaleTimeZone() helper function.' if a new Error() are passed";
    it(msg, async () => {
      getLocaleTimeZoneResult = await getLocaleTimeZone(new Error());
      // console.log(getLocaleTimeZoneResult);
      // console.log(typeof getLocaleTimeZoneResult);
      await expect( getLocaleTimeZoneResult == 'ERROR in getLocaleTimeZone() helper function.').toBe(true);
    });
  });
});
