const axios = require("axios");

const googleApi = axios.create({
  baseURL: process.env.GOOGLE_API,
});

export default googleApi;