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
  time: null,
};

describe("- createJson helper (Unit Test)", () => {
  //-Start first suite -
  describe("- Check cases for each argument.", () => {
    msg =
      "- Should not return anything if all valid arguments are passed and the json file has been created correctly";
    it(msg, async () => {
      let dateLocale = new Date().toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"});
      jsonMock.time = dateLocale;
      jsonResponse = await createJson(FILE_PATH_WEATHER_CONDITION, jsonMock);
      await expect(typeof jsonResponse == "undefined").toBe(true);
    });

    msg =
    "- Should not create the json file correctly if no arguments are passed";
  it(msg, async () => {
    jsonResponse = await createJson();
    await expect(typeof jsonResponse == "undefined").toBe(true);
  });
  });
});
