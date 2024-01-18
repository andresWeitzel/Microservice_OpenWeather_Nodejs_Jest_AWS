"use strict";
//Helpers
const {
  calculateNumberOfCharactersMatch,
} = require("../../../../helpers/maths/string/characters");
//Const
const MOCK_STRING_01 = process.env.MOCK_STRING_01;
const MOCK_STRING_02 = process.env.MOCK_STRING_02;
//Vars
let msg;
let calculateCharactersResult;

describe("- calculateNumberOfCharactersMatch helper (Unit Test)", () => {
  describe("1) Check cases for arguments.", () => {
    msg = "Should return a number if passed values to all parameters.";
    it(msg, async () => {
      calculateCharactersResult = await calculateNumberOfCharactersMatch(
        MOCK_STRING_01,
        MOCK_STRING_02
      );
      await expect(typeof calculateCharactersResult == "number").toBe(true);
    });

    msg = "Should return a number if passed other values.";
    it(msg, async () => {
      calculateCharactersResult = await calculateNumberOfCharactersMatch(
        MOCK_STRING_01,
        MOCK_STRING_02,
        MOCK_STRING_02
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
        "Should return a numeric type with a value greater than TWO for the string 'MOCK_STRING_01_233' and the character comparison string. 'STRING_' .";
      it(msg, async () => {
        const MOCK_STRING_01 = "MOCK_STRING_01_233";
        const MOCK_STRING_02 = "STRING_";
        calculateCharactersResult = await calculateNumberOfCharactersMatch(
          MOCK_STRING_01,
          MOCK_STRING_02
        );
        await expect(calculateCharactersResult >= 2).toBe(true);
      });

      msg =
        "Should return a string type with 'ERROR in calculateNumberOfCharactersMatch() helper function.' value if not passed the correct types for arguments";
      it(msg, async () => {
        const NUMERIC_MOCK = 23;
        const MOCK_STRING_02 = "2";
        let ERROR_MESSAGE =
          "ERROR in calculateNumberOfCharactersMatch() helper function.";

        calculateCharactersResult = await calculateNumberOfCharactersMatch(
          NUMERIC_MOCK,
          MOCK_STRING_02
        );
        await expect(calculateCharactersResult).toMatch(ERROR_MESSAGE);
      });
    });

    describe("3) Check cases for error.", () => {
      msg =
        "Should not thrown an Error if a new Error is passed for arguments.";
      it(msg, async () => {
        let newError = new Error();
        calculateCharactersResult = await calculateNumberOfCharactersMatch(
          newError,
          newError
        );
        await expect(async () => calculateCharactersResult).not.toThrow(Error);
      });

      msg =
        "Should not thrown an Error if no arguments is passed to the function.";
      it(msg, async () => {
        calculateCharactersResult = await calculateNumberOfCharactersMatch();
        await expect(async () => calculateCharactersResult).not.toThrow(Error);
      });

      msg =
        "Should return a string type with 'ERROR in calculateNumberOfCharactersMatch() helper function.' value if a new Error is passed for arguments.";
      it(msg, async () => {
        let newError = new Error();
        let ERROR_MESSAGE =
          "ERROR in calculateNumberOfCharactersMatch() helper function.";

        calculateCharactersResult = await calculateNumberOfCharactersMatch(
          newError,
          newError
        );
        await expect(calculateCharactersResult).toMatch(ERROR_MESSAGE);
      });
    });
  });
});
