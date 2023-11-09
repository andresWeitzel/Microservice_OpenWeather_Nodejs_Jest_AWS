"use strict";
const { statusCode } = require("../../../helpers/enums/http/status-code");
//Helpers
const { bodyResponse } = require("../../../helpers/http/body-response");
//const
const OK_CODE = statusCode.OK;
const MOCK_OBJECT = {};


describe("bodyResponse Unit Test", () => {
  test("Should return an object for an http request with a status code and message-object", async () => {
    let bodyResponseObject = await bodyResponse(OK_CODE, MOCK_OBJECT);
    await expect(
      typeof bodyResponseObject == "object"
    ).toBe(true);
  })
});