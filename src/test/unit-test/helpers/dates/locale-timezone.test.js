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
      let characters = "/,:";
      let totalCharacters = 4; // total characters for DD/MM/YY, HH:MM:SS
      let numberCharactersMatch = await calculateNumberOfCharactersMatch(
        getLocaleTimeZoneResult,
        characters
      );
      await expect(numberCharactersMatch >= totalCharacters).toBe(true);
    });
  });

  describe("3) Check cases for error.", () => {
    msg =
      "Should not return a error message if no argument is passed to the function.";
    it(msg, async () => {
      await expect(async () => await getLocaleTimeZone()).not.toThrow(Error);
      getLocaleTimeZoneResult = await getLocaleTimeZone();
      await expect(typeof getLocaleTimeZoneResult == "string").toBe(true);
    });

    msg = "Should return a string value if a new Error is passed";
    it(msg, async () => {
      await expect(
        async () => await getLocaleTimeZone(new Error())
      ).not.toThrow(Error);
    });

    msg =
      "Should return a string type with the message 'ERROR in getLocaleTimeZone() helper function.' if a null are passed";
    it(msg, async () => {
      let ERROR_MESSAGE = "ERROR in getLocaleTimeZone() helper function.";
      getLocaleTimeZoneResult = await getLocaleTimeZone(null);
      await expect(getLocaleTimeZoneResult).toMatch(ERROR_MESSAGE);
    });
  });
});
