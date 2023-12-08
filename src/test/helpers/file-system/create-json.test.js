"use strict";
const { getLocaleTimeZone } = require("../../../helpers/dates/locale-timezone");
//External
const { createJson } = require("../../../helpers/file-system/create-json");
//Const
const FILE_PATH_WEATHER_CONDITION =
  "../../../test/helpers/file-system/data/json/weather-condition/weather-condition-data.json";
//Vars
let dateLocale;
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
  describe("1) Check cases for arguments.", () => {
    msg =
      "Should not return anything if all valid arguments are passed and the json file has been created correctly";
    it(msg, async () => {
      dateLocale = await getLocaleTimeZone(
        "es",
        "America/Argentina/Buenos_Aires"
      );
      jsonMock.time = dateLocale;
      jsonResponse = await createJson(FILE_PATH_WEATHER_CONDITION, jsonMock);
      await expect(typeof jsonResponse == "undefined").toBe(true);
    });

    msg =
      "Should not create the json file correctly if no arguments are passed and return a string type";
    it(msg, async () => {
      jsonResponse = await createJson();
      await expect(typeof jsonResponse == "string").toBe(true);
    });

    msg =
      "Should return a string type with the message 'Unable to create json file. ERROR in createJson() helper function.' if no argument are passed";
    it(msg, async () => {
      jsonResponse = await createJson();
      await expect(
        jsonResponse ==
          "Unable to create json file. ERROR in createJson() helper function."
      ).toBe(true);
    });
  });
});
