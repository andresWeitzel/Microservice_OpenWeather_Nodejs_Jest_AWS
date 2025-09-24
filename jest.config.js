//For using environment variables with .envs
/** @type {import('jest').Config} */
const config = {
    setupFilesAfterEnv: ['./src/tests/mock/set-env-vars.js'],
  };
  
  module.exports = config;