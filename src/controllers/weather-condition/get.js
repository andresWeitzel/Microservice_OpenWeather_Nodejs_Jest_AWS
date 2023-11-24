"use strict";
//helpers
const { sendGetRequest } = require("../../helpers/axios/request/get");
const { statusCode } = require("../../helpers/enums/http/status-code");
const { bodyResponse } = require("../../helpers/http/body-response");
//const
const API_WEATHER_URL_BASE = process.env.API_WEATHER_URL_BASE;
const API_KEY = process.env.API_KEY;
const OK_CODE = statusCode.OK;
const BAD_REQUEST_CODE = statusCode.BAD_REQUEST;
//vars
let eventPathParams;
let countryParam;
let axiosConfig;
let axiosResponse;

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

    if (axiosResponse != (null && undefined)) {
      return await bodyResponse(OK_CODE, axiosResponse);
    }
    return await bodyResponse(
      BAD_REQUEST_CODE,
      `Data could not be obtained by country ${countryParam}`
    );
  } catch (error) {
    console.log(error);
  }
};
