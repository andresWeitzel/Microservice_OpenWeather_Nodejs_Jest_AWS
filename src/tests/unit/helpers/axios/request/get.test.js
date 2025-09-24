"use strict";
//Helpers
const { sendGetRequest } = require("../../../../../helpers/axios/request/get");
//const
const FIRST_ARGUMENT_TYPE_NUMERIC =
  process.env.MOCK_FIRST_ARGUMENT_TYPE_NUMERIC;
const SECOND_ARGUMENT_TYPE_NUMERIC =
  process.env.MOCK_SECOND_ARGUMENT_TYPE_NUMERIC;
const ERROR_MESSAGE = process.env.MOCK_ERROR_MESSAGE;
const INVALID_URL = process.env.MOCK_INVALID_URL;
const GOOGLE_URL = process.env.MOCK_GOOGLE_URL;
const AXIOS_CONFIG = {
  headers: {
    "Content-Type": process.env.MOCK_AXIOS_CONTENT_TYPE,
  },
};
//vars
let msg;
let axiosResponse;

describe("- sendGetRequestTest helper (Unit Test)", () => {
  //-Start first suite -
  describe("1) Check cases for each argument.", () => {
    msg = "Should return an object or string for an http request.";
    it(msg, async () => {
      axiosResponse = await sendGetRequest(GOOGLE_URL, AXIOS_CONFIG);
      await expect(
        typeof axiosResponse == "string" || typeof axiosResponse == "object"
      ).toBe(true);
    });

    msg =
      "Should return an object or string if only the url is passed to the function";
    it(msg, async () => {
      axiosResponse = await sendGetRequest(GOOGLE_URL, null);
      await expect(
        typeof axiosResponse == "string" || typeof axiosResponse == "object"
      ).toBe(true);
    });

    msg =
      "Should return an object or string if only the url and config is passed to the function";
    test(msg, async () => {
      axiosResponse = await sendGetRequest(GOOGLE_URL, AXIOS_CONFIG);
      await expect(
        typeof axiosResponse == "string" || typeof axiosResponse == "object"
      ).toBe(true);
    });

    msg =
      "Should return an object or string if you pass all the arguments (the url, null for data (GET operation) and config)";
    test(msg, async () => {
      axiosResponse = await sendGetRequest(GOOGLE_URL, null, AXIOS_CONFIG);
      await expect(
        typeof axiosResponse == "string" || typeof axiosResponse == "object"
      ).toBe(true);
    });
  });
  describe("2) Check data types of arguments.", () => {
    msg =
      "Should return an object or string if you pass the data  argument with numeric type value.";
    test(msg, async () => {
      axiosResponse = await sendGetRequest(
        GOOGLE_URL,
        FIRST_ARGUMENT_TYPE_NUMERIC,
        AXIOS_CONFIG
      );
      await expect(
        typeof axiosResponse == "string" || typeof axiosResponse == "object"
      ).toBe(true);
    });

    msg =
      "Should return an object or string if you pass the config  argument with numeric type value";
    test(msg, async () => {
      axiosResponse = await sendGetRequest(
        GOOGLE_URL,
        null,
        SECOND_ARGUMENT_TYPE_NUMERIC
      );
      await expect(
        typeof axiosResponse == "string" || typeof axiosResponse == "object"
      ).toBe(true);
    });

    msg =
      "Should return an object or string if you pass the config and data arguments with numeric type value";
    test(msg, async () => {
      axiosResponse = await sendGetRequest(
        GOOGLE_URL,
        FIRST_ARGUMENT_TYPE_NUMERIC,
        SECOND_ARGUMENT_TYPE_NUMERIC
      );
      await expect(
        typeof axiosResponse == "string" || typeof axiosResponse == "object"
      ).toBe(true);
    });
  });
  describe("3) Check cases for errors.", () => {
    msg = "Should return a string value if a new Error is passed";
    it(msg, async () => {
      await expect(async () => await sendGetRequest(new Error())).not.toThrow(
        Error
      );
    });

    msg =
      "Should return a string value with the message of the treated error if no argument is passed to the function";
    it(msg, async () => {
      axiosResponse = await sendGetRequest();
      await expect(typeof axiosResponse == "string").toBe(true);
      axiosResponse = axiosResponse.toLowerCase();
      await expect(axiosResponse).toMatch(ERROR_MESSAGE);
    });

    msg =
      "It should return an treated error message if no argument is passed to the function and it should match the word ERROR.";
    it(msg, async () => {
      axiosResponse = await sendGetRequest();
      await expect(typeof axiosResponse == "string").toBe(true);
      axiosResponse = axiosResponse.toLowerCase();
      await expect(axiosResponse).toMatch(ERROR_MESSAGE);
    });

    msg =
      "It should not return the error thrown if no argument is passed to the function. But a string with a treated error";
    it(msg, async () => {
      await expect(async () => await sendGetRequest()).not.toThrow(Error);
      axiosResponse = await sendGetRequest();
      await expect(typeof axiosResponse == "string").toBe(true);
      axiosResponse = axiosResponse.toLowerCase();
      await expect(axiosResponse).toMatch(ERROR_MESSAGE);
    });

    msg = "Should return a string with a treated error for an invalid url ";
    it(msg, async () => {
      axiosResponse = await sendGetRequest(INVALID_URL);
      await expect(typeof axiosResponse == "string").toBe(true);
      axiosResponse = axiosResponse.toLowerCase();
      await expect(axiosResponse).toMatch(ERROR_MESSAGE);
    });
  });
});
