"use strict";
//Helpers
const { sendGetRequest } = require("../../../../helpers/axios/request/get");
//const
const GOOGLE_URL = "https://www.google.com/";
const AXIOS_CONFIG = {
  headers: {
    "Content-Type": "application/json",
  },
};

describe("sendGetRequestTest Unit Test", () => {
  test("Should return an object or string for an http request", async () => {
    let axiosResponse = await sendGetRequest(GOOGLE_URL, AXIOS_CONFIG);
    await expect(
      typeof axiosResponse == "string" || typeof axiosResponse == "object"
    ).toBe(true);
  });

  test("Should return null or undefined if no argument is passed to the function", async () => {
    let axiosResponse = await sendGetRequest();
    await expect(axiosResponse == (null || undefined)).toBe(true);
  });

  test("Should return error if no argument is passed to the function", async () => {
    let axiosResponse = await sendGetRequest();
    await expect(()=>axiosResponse).not.toThrow(Error);
  });

  test("Should return an object or string if only the url is passed to the function", async () => {
    let axiosResponse = await sendGetRequest(GOOGLE_URL, null);
    await expect(
      typeof axiosResponse == "string" || typeof axiosResponse == "object"
    ).toBe(true);
  });

  test("Should return an object or string if only the url and config is passed to the function", async () => {
    let axiosResponse = await sendGetRequest(GOOGLE_URL, AXIOS_CONFIG);
    await expect(
      typeof axiosResponse == "string" || typeof axiosResponse == "object"
    ).toBe(true);
  });

  test("Should return null or undefined with an invalid url ", async () => {
    let INVALID_URL = "hff://zzz.com.ar"
    let axiosResponse = await sendGetRequest(INVALID_URL);
    await expect(axiosResponse == (null || undefined)).toBe(true);
  });

});
