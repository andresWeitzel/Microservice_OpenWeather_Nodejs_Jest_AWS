"use strict";
//helpers
const { sendGetRequest } = require("../../helpers/axios/request/get");
const { statusCode } = require("../../helpers/enums/http/status-code");
const { createJson } = require("../../helpers/file-system/create-json");
const { bodyResponse } = require("../../helpers/http/body-response");
//const
const API_WEATHER_URL_BASE = process.env.API_WEATHER_URL_BASE;
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
const INTERNAL_SERVER_ERROR = statusCode.INTERNAL_SERVER_ERROR;
const FILE_PATH_WEATHER_CONDITION =
  "../../../data/json/weather-condition/weather-condition-data.json";
//vars
let eventPathParams;
let countryParam;
let axiosConfig;
let axiosResponse;
let jsonResponse;

module.exports.handler = async (event) => {
  try {
    eventPathParams = event.pathParameters;
    countryParam = eventPathParams.country;

    const URL = API_WEATHER_URL_BASE + countryParam + "&appid=" + API_KEY;

    console.log(URL);

    axiosConfig = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    axiosResponse = await sendGetRequest(URL, null, axiosConfig);

    if (axiosResponse == (null || undefined)) {
      return await bodyResponse(
        BAD_REQUEST_CODE,
        `Data could not be obtained by country ${countryParam}`
      );
    }

    jsonResponse = await createJson(FILE_PATH_WEATHER_CONDITION, axiosResponse);

    if (typeof jsonResponse === "string") {
      return await bodyResponse(INTERNAL_SERVER_ERROR, jsonResponse);
    }

    return await bodyResponse(OK_CODE, axiosResponse);
  } catch (error) {
    console.log(error);
  }
};
