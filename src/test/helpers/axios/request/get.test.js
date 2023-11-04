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
    expect(
      typeof axiosResponse == "string" || typeof axiosResponse == "object"
    ).toBe(true);
  });

  test("Should be return null or undefined if no argument is passed to the function", async () => {
    let axiosResponse = await sendGetRequest();
    expect(axiosResponse == (null || undefined)).toBe(true);
  });

  test("Should return an object or string if only the url is passed to the function", async () => {
    let axiosResponse = await sendGetRequest(GOOGLE_URL, null);
    expect(
      typeof axiosResponse == "string" || typeof axiosResponse == "object"
    ).toBe(true);
  });

  test("Should return an object or string if only the url and config is passed to the function", async () => {
    let axiosResponse = await sendGetRequest(GOOGLE_URL, AXIOS_CONFIG);
    expect(
      typeof axiosResponse == "string" || typeof axiosResponse == "object"
    ).toBe(true);
  });

});
