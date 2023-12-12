"use strict";
//Helpers
const { getLocaleTimeZone } = require("../../../helpers/dates/locale-timezone");
//Const
const TODAY_DATE = new Date();
//Vars
let msg;
let getLocaleTimeZoneResult;

describe("- getLocaleTimeZone helper (Unit Test)", () => {
  describe("1) Check cases for arguments.", () => {
    msg = "Should return a string type passing values to all parameters.";
    it(msg, async () => {
      getLocaleTimeZoneResult = await getLocaleTimeZone(TODAY_DATE);
      await expect(typeof getLocaleTimeZoneResult == "string").toBe(true);
    });

    msg = "Should return a string type if no arguments are passed.";
    it(msg, async () => {
      getLocaleTimeZoneResult = await getLocaleTimeZone();
      await expect(typeof getLocaleTimeZoneResult == "string").toBe(true);
    });

    msg = "Should return a string type if a null are passed.";
    it(msg, async () => {
      getLocaleTimeZoneResult = await getLocaleTimeZone(null);
      await expect(typeof getLocaleTimeZoneResult == "string").toBe(true);
    });
    msg = "Should return a string type if an undefined are passed.";
    it(msg, async () => {
      getLocaleTimeZoneResult = await getLocaleTimeZone(undefined);
      await expect(typeof getLocaleTimeZoneResult == "string").toBe(true);
    });
  });

  describe("2) Check cases for return.", () => {

  });

  describe("2) Check cases for error.", () => {
    msg =
    "Should return a string type with the message 'ERROR in getLocaleTimeZone() helper function.' if new Error() are passed";
    it(msg, async () => {
      getLocaleTimeZoneResult = null;
      getLocaleTimeZoneResult = await getLocaleTimeZone(new Error());
      await expect(getLocaleTimeZoneResult == 'ERROR in getLocaleTimeZone() helper function.').toBe(true);
    });
  });
});
