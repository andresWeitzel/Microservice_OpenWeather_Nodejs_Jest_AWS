"use strict";
//Helpers
const { sendGetRequest } = require("../../../../helpers/axios/request/get");
//const
const ERROR_MESSAGE = "error";
const INVALID_URL = "hff://zzz.com.ar";
const GOOGLE_URL = "https://www.google.com/";
const AXIOS_CONFIG = {
  headers: {
    "Content-Type": "application/json",
  },
};
//vars
let msg;
describe("- sendGetRequestTest helper (Unit Test)", () => {
  describe("- Check arguments", () => {
    msg = "- Should return an object or string for an http request.";
    it(msg, async () => {
      let axiosResponse = await sendGetRequest(GOOGLE_URL, AXIOS_CONFIG);
      await expect(
        typeof axiosResponse == "string" || typeof axiosResponse == "object"
      ).toBe(true);
    });

    msg =
      "- Should return an object or string if only the url is passed to the function";
    it(msg, async () => {
      let axiosResponse = await sendGetRequest(GOOGLE_URL, null);
      await expect(
        typeof axiosResponse == "string" || typeof axiosResponse == "object"
      ).toBe(true);
    });

    msg =
      "- Should return an object or string if only the url and config is passed to the function";
    test(msg, async () => {
      let axiosResponse = await sendGetRequest(GOOGLE_URL, AXIOS_CONFIG);
      await expect(
        typeof axiosResponse == "string" || typeof axiosResponse == "object"
      ).toBe(true);
    });

    msg =
      "- Should return an object or string if you pass all the arguments (the url, null for data (GET operation) and config)";
    test(msg, async () => {
      let axiosResponse = await sendGetRequest(GOOGLE_URL, null, AXIOS_CONFIG);
      await expect(
        typeof axiosResponse == "string" || typeof axiosResponse == "object"
      ).toBe(true);
    });
  });

  describe("- Check errors", () => {
    msg =
      "- Should return a string value with the message of the treated error if no argument is passed to the function";
    it(msg, async () => {
      let axiosResponse = await sendGetRequest();
      await expect(typeof axiosResponse == "string").toBe(true);
    });

    msg =
      "- It should return an treated error message if no argument is passed to the function and it should match the word ERROR.";
    it(msg, async () => {
      let axiosResponse = await sendGetRequest();
      await expect(typeof axiosResponse == "string").toBe(true);
      axiosResponse = axiosResponse.toLowerCase();
      await expect(axiosResponse).toMatch(ERROR_MESSAGE);
    });

    msg =
      "- It should not return the error thrown if no argument is passed to the function. But a string with a treated error";
    it(msg, async () => {
      let axiosResponse = await sendGetRequest();
      await expect(() => axiosResponse).not.toThrow(Error);
      await expect(typeof axiosResponse == "string").toBe(true);
      axiosResponse = axiosResponse.toLowerCase();
      await expect(axiosResponse).toMatch(ERROR_MESSAGE);
    });

    msg = "- Should return a string with a treated error for an invalid url ";
    it(msg, async () => {
      let axiosResponse = await sendGetRequest(INVALID_URL);
      await expect(typeof axiosResponse == "string").toBe(true);
      axiosResponse = axiosResponse.toLowerCase();
      await expect(axiosResponse).toMatch(ERROR_MESSAGE);
    });
  });
});
