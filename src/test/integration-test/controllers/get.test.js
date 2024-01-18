"use strict";
//External
const axios = require("axios");
//config
jest.mock("axios");
//Helpers
//Vars
let msg;
let weatherConditionGetLambda;

describe("- get lambda function (Integration Test)", () => {
  describe("1) Check cases for arguments.", () => {
    // msg = "Should return a response with http code and axios data.";
    // it(msg, async () => {
    //   weatherConditionGetLambda = ;
    // });
    // msg = "Should return a number if passed other values.";
    // it(msg, async () => {
    //   weatherConditionGetLambda = await calculateNumberOfCharactersMatch(
    //     STRING_MOCK,
    //     STRING_CHARACTERS_MOCK,
    //     STRING_CHARACTERS_MOCK
    //   );
    //   await expect(typeof weatherConditionGetLambda == "number").toBe(true);
    // });
    // msg = "Should return a string if no passed values.";
    // it(msg, async () => {
    //   weatherConditionGetLambda = await calculateNumberOfCharactersMatch();
    //   await expect(typeof weatherConditionGetLambda == "string").toBe(true);
    // });
    // msg = "Should return a string if null value is passed.";
    // it(msg, async () => {
    //   weatherConditionGetLambda = await calculateNumberOfCharactersMatch(null);
    //   await expect(typeof weatherConditionGetLambda == "string").toBe(true);
    // });
    // msg = "Should return a string if undefined value is passed.";
    // it(msg, async () => {
    //   weatherConditionGetLambda = await calculateNumberOfCharactersMatch(
    //     undefined
    //   );
    //   await expect(typeof weatherConditionGetLambda == "string").toBe(true);
    // });
    // describe("2) Check cases for return .", () => {
    //   msg =
    //     "Should return a numeric type with a value greater than TWO for the string 'STRING_MOCK_233' and the character comparison string. 'STRING_' .";
    //   it(msg, async () => {
    //     const STRING_MOCK = "STRING_MOCK_233";
    //     const STRING_CHARACTERS_MOCK = "STRING_";
    //     weatherConditionGetLambda = await calculateNumberOfCharactersMatch(
    //       STRING_MOCK,
    //       STRING_CHARACTERS_MOCK
    //     );
    //     await expect(weatherConditionGetLambda >= 2).toBe(true);
    //   });
    //   msg =
    //     "Should return a string type with 'ERROR in calculateNumberOfCharactersMatch() helper function.' value if not passed the correct types for arguments";
    //   it(msg, async () => {
    //     const NUMERIC_MOCK = 23;
    //     const STRING_CHARACTERS_MOCK = "2";
    //     let ERROR_MESSAGE =
    //       "ERROR in calculateNumberOfCharactersMatch() helper function.";
    //     weatherConditionGetLambda = await calculateNumberOfCharactersMatch(
    //       NUMERIC_MOCK,
    //       STRING_CHARACTERS_MOCK
    //     );
    //     await expect(weatherConditionGetLambda).toMatch(ERROR_MESSAGE);
    //   });
    // });
    // describe("3) Check cases for error.", () => {
    //   msg =
    //     "Should not thrown an Error if a new Error is passed for arguments.";
    //   it(msg, async () => {
    //     let newError = new Error();
    //     weatherConditionGetLambda = await calculateNumberOfCharactersMatch(
    //       newError,
    //       newError
    //     );
    //     await expect(async () => weatherConditionGetLambda).not.toThrow(Error);
    //   });
    //   msg =
    //     "Should not thrown an Error if no arguments is passed to the function.";
    //   it(msg, async () => {
    //     weatherConditionGetLambda = await calculateNumberOfCharactersMatch();
    //     await expect(async () => weatherConditionGetLambda).not.toThrow(Error);
    //   });
    //   msg =
    //     "Should return a string type with 'ERROR in calculateNumberOfCharactersMatch() helper function.' value if a new Error is passed for arguments.";
    //   it(msg, async () => {
    //     let newError = new Error();
    //     let ERROR_MESSAGE =
    //       "ERROR in calculateNumberOfCharactersMatch() helper function.";
    //     weatherConditionGetLambda = await calculateNumberOfCharactersMatch(
    //       newError,
    //       newError
    //     );
    //     await expect(weatherConditionGetLambda).toMatch(ERROR_MESSAGE);
    //   });
    // });
  });
});
