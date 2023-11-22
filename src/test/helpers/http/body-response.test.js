"use strict";
const {
  statusCode,
  statusCodeDetails,
} = require("../../../helpers/enums/http/status-code");
//Helpers
const { bodyResponse } = require("../../../helpers/http/body-response");
//const
const OK_CODE = statusCode.OK;
const OK_CODE_DETAILS = statusCodeDetails.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const BAD_REQUEST_CODE_DETAILS = statusCodeDetails.BAD_REQUEST_CODE_DETAILS;
const MOCK_OBJECT = {};
//Vars
let msg;
let bodyResponseResult;

describe("- bodyResponse helper (Unit Test)", () => {
  //--Start first suite --
  describe("- Check cases for each argument.", () => {
    msg = "- Should return an object passing values to all parameters.";
    it(msg, async () => {
      bodyResponseResult = await bodyResponse(OK_CODE, OK_CODE_DETAILS);
      await expect(typeof bodyResponseResult == "object").toBe(true);
    });

    msg =
      "- Should return an object with the same values of the status code and the message passed as a parameter.";

    it(msg, async () => {
      bodyResponseResult = await bodyResponse(OK_CODE, OK_CODE_DETAILS);
      expect(typeof bodyResponseResult == "object").toBe(true);

      expect(bodyResponseResult.statusCode == OK_CODE).toBe(true);

      let bodyConversion = JSON.parse(bodyResponseResult.body);

      let bodyConversionMessage = JSON.stringify(bodyConversion.message);

      expect(bodyConversionMessage == JSON.stringify(OK_CODE_DETAILS)).toBe(
        true
      );
    });

    msg =
      "- Should return an object with the value of the statusCode parameter of type any (Number or String)";

    it(msg, async () => {
      bodyResponseResult = await bodyResponse(
        BAD_REQUEST_CODE,
        BAD_REQUEST_CODE_DETAILS
      );

      expect(typeof bodyResponseResult == "object").toBe(true);

      expect(
        typeof bodyResponseResult.statusCode == "number" ||
          typeof bodyResponseResult.statusCode == "string"
      ).toBe(true);
    });

    msg =
      "- Should return an object with the value of the body parameter of type string";

    it(msg, async () => {
      bodyResponseResult = await bodyResponse(
        BAD_REQUEST_CODE,
        BAD_REQUEST_CODE_DETAILS
      );

      expect(typeof bodyResponseResult == "object").toBe(true);

      expect(typeof bodyResponseResult.body == "string").toBe(true);
    });

    msg = "- Should return a object if no parameters are passed.";

    it(msg, async () => {
      bodyResponseResult = await bodyResponse();

      expect(typeof test == "object").toBe(true);
    });

    msg =
      "- Should return a object with the value undefined for statusCode and body if no parameters are passed.";

    it(msg, async () => {
      bodyResponseResult = await bodyResponse();

      expect(typeof bodyResponseResult == "object").toBe(true);

      expect(bodyResponseResult.statusCode == undefined).toBe(true);

      expect(bodyResponseResult.body == undefined).toBe(true);
    });
  });
});

// describe("- response function (Unit Test)", () => {
//   describe("1) Check cases for arguments", () => {
//     let msg;

//     msg =
//       "Should return an object with the value null for statusCode if null is passed as a parameter for statusCode argument.";

//     it(msg, () => {
//       let test = response(null, BAD_REQUEST_CODE_MESSAGE);

//       expect(typeof test == "object").toBe(true);

//       expect(test.statusCode == null).toBe(true);
//     });

//     msg =
//       "Should return an object with the value null with string format for body if null is passed as a parameter for message argument.";

//     it(msg, () => {
//       let test = response(BAD_REQUEST_CODE, null);

//       console.log(test);

//       expect(typeof test == "object").toBe(true);

//       expect(test.body == "null").toBe(true);
//     });
//   });
// });
