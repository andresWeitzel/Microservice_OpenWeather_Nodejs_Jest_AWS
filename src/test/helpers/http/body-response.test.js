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
const MOCK_OBJECT = {};
//Vars
let msg;
let bodyResponseResult;

describe("- bodyResponse helper (Unit Test)", () => {
  //--Start first suite --
  describe("- 1) Check cases for each argument.", () => {
    msg = "- Should return an object passing values ​​to all parameters.";
    it(msg, async () => {
      bodyResponseResult = await bodyResponse(OK_CODE, OK_CODE_DETAILS);
      await expect(typeof bodyResponseResult == "object").toBe(true);
    });

    msg =
      "- Should return an object with the same values ​​of the status code and the message passed as a parameter.";

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
  });
});

// describe("- response function (Unit Test)", () => {
//   describe("1) Check cases for arguments", () => {
//     let msg;

//     msg =
//       "Should return an object with the same values ​​of the status code and the message passed as a parameter.";

//     it(msg, () => {
//       let test = response(OK_CODE, OK_CODE_MESSAGE);

//       expect(typeof test == "object").toBe(true);

//       expect(test.body == JSON.stringify(OK_CODE_MESSAGE)).toBe(true);

//       expect(test.statusCode == OK_CODE).toBe(true);
//     });

//     msg =
//       "Should return an object with the value of the statusCode parameter of type any (Number or String)";

//     it(msg, () => {
//       let test = response("200", OK_CODE_MESSAGE);

//       expect(typeof test == "object").toBe(true);

//       expect(
//         typeof test.statusCode == "number" || typeof test.statusCode == "string"
//       ).toBe(true);
//     });

//     msg =
//       "Should return an object with the value of the body parameter of type string";

//     it(msg, () => {
//       let test = response("200", OK_CODE_MESSAGE);

//       expect(typeof test == "object").toBe(true);

//       expect(typeof test.body == "string").toBe(true);
//     });

//     msg = "Should return a object if no parameters are passed.";

//     it(msg, () => {
//       let test = response();

//       expect(typeof test == "object").toBe(true);
//     });

//     msg =
//       "Should return a object with the value undefined for statusCode and body if no parameters are passed.";

//     it(msg, () => {
//       let test = response();

//       expect(typeof test == "object").toBe(true);

//       expect(test.statusCode == undefined).toBe(true);

//       expect(test.body == undefined).toBe(true);
//     });

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
