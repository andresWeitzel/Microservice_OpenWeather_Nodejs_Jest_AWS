"use strict";
//External
const { createJson } = require("../../../helpers/file-system/create-json");
//Const
const FILE_PATH_WEATHER_CONDITION =
  "../../../test/helpers/file-system/data/json/weather-condition/weather-condition-data.json";
//Vars
let msg;
let jsonResponse;
let jsonMock = {
  test01: "test01",
  test02: "test02",
  test03: "test03",
  test04: "test04",
};

describe("- createJson helper (Unit Test)", () => {
  //-Start first suite -
  describe("- Check cases for each argument.", () => {
    msg =
      "- Should not return anything if the json file has been created correctly";
    it(msg, async () => {
      jsonResponse = await createJson(FILE_PATH_WEATHER_CONDITION, jsonMock);
      await expect(typeof jsonResponse == "undefined").toBe(true);
    });

    // msg =
    //   "- Should return an object or string if only the url is passed to the function";
    // it(msg, async () => {
    //   let jsonResponse = await sendGetRequest(GOOGLE_URL, null);
    //   await expect(
    //     typeof jsonResponse == "string" || typeof jsonResponse == "object"
    //   ).toBe(true);
    // });
  });
});
