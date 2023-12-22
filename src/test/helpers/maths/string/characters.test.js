"use strict";
//Helpers
const {
  calculateNumberOfCharactersMatch,
} = require("../../../../helpers/maths/string/characters");
//Enums
const {
  statusCode,
  statusCodeDetails,
} = require("../../../../enums/http/status-code");
//Const
const OK_CODE = statusCode.OK;
const OK_CODE_DETAILS = statusCodeDetails.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const BAD_REQUEST_CODE_DETAILS = statusCodeDetails.BAD_REQUEST_CODE_DETAILS;
const STRING_MOCK = "STRING_MOCK";
const STRING_CHARACTERS_MOCK = "STRING_";
//Vars
let msg;
let calculateCharactersResult;

describe("- calculateNumberOfCharactersMatch helper (Unit Test)", () => {
  describe("1) Check cases for arguments.", () => {
    msg = "Should return a number if passed values to all parameters.";
    it(msg, async () => {
      calculateCharactersResult = await calculateNumberOfCharactersMatch(
        STRING_MOCK,
        STRING_CHARACTERS_MOCK
      );
      await expect(typeof calculateCharactersResult == "number").toBe(true);
    });

    msg = "Should return a number if passed other values.";
    it(msg, async () => {
      calculateCharactersResult = await calculateNumberOfCharactersMatch(
        STRING_MOCK,
        STRING_CHARACTERS_MOCK,
        STRING_CHARACTERS_MOCK
      );
      await expect(typeof calculateCharactersResult == "number").toBe(true);
    });

    msg = "Should return a string if no passed values.";
    it(msg, async () => {
      calculateCharactersResult = await calculateNumberOfCharactersMatch();
      await expect(typeof calculateCharactersResult == "string").toBe(true);
    });

    msg = "Should return a string if null value is passed.";
    it(msg, async () => {
      calculateCharactersResult = await calculateNumberOfCharactersMatch(null);
      await expect(typeof calculateCharactersResult == "string").toBe(true);
    });

    msg = "Should return a string if undefined value is passed.";
    it(msg, async () => {
      calculateCharactersResult = await calculateNumberOfCharactersMatch(
        undefined
      );
      await expect(typeof calculateCharactersResult == "string").toBe(true);
    });

    describe("2) Check cases for return .", () => {
      msg =
        "Should return a numeric type with a value greater than TWO for the string 'STRING_MOCK_233' and the character comparison string. 'STRING_' .";
      it(msg, async () => {
        const STRING_MOCK = "STRING_MOCK_233";
        const STRING_CHARACTERS_MOCK = "STRING_";
        calculateCharactersResult = await calculateNumberOfCharactersMatch(
          STRING_MOCK,
          STRING_CHARACTERS_MOCK
        );
        console.log(calculateCharactersResult);
        await expect(calculateCharactersResult >= 2).toBe(true);
      });
      msg =
        "Should return a numeric type with a value greater than TWO for the string 'STRING_MOCK_2334' and the character comparison string. 'ASD' .";
      it(msg, async () => {
        const STRING_MOCK = "STRING_MOCK_2334";
        const STRING_CHARACTERS_MOCK = "Z";
        calculateCharactersResult = await calculateNumberOfCharactersMatch(
          STRING_MOCK,
          STRING_CHARACTERS_MOCK
        );
        console.log(calculateCharactersResult);
        await expect(calculateCharactersResult == 0).toBe(true);
      });
    });
  });
});
