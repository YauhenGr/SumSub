const axios = require('axios');
const crypto = require('crypto');
const FormData = require('form-data');

// These parameters should be used for all requests
const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN || '';
const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY || '';
const SUMSUB_BASE_URL = process.env.SUMSUB_BASE_URL || '';

let config = {};
config.baseURL= SUMSUB_BASE_URL;

axios.interceptors.request.use(createSignature, function (error) {
  return Promise.reject(error);
})

function createSignature(config) {
  console.log('Creating a signature for the request...');

  var ts = Math.floor(Date.now() / 1000);
  const signature = crypto.createHmac('sha256',  SUMSUB_SECRET_KEY);
  signature.update(ts + config.method.toUpperCase() + config.url);

  if (config.data instanceof FormData) {
    signature.update (config.data.getBuffer());
  } else if (config.data) {
    signature.update (config.data);
  }

  config.headers['X-App-Access-Ts'] = ts;
  config.headers['X-App-Access-Sig'] = signature.digest('hex');

  return config;
}

function createAccessToken (externalUserId, levelName = 'basic-kyc-level', ttlInSecs = 600) {
  console.log("Creating an access token for initializng SDK...");

  var method = 'post';
  var url = `/resources/accessTokens?userId=${externalUserId}&ttlInSecs=${ttlInSecs}&levelName=${levelName}`;

  var headers = {
    'Accept': 'application/json',
    'X-App-Token': SUMSUB_APP_TOKEN
  };

  config.method = method;
  config.url = url;
  config.headers = headers;
  config.data = null;

  return config;
}

const main = async () => {
  const externalUserId = "random-JSToken-" + Math.random().toString(36).substr(2, 9);
  const levelName = 'basic-kyc-level';
  // console.log("External UserID: ", externalUserId);

  // const response = await axios(createApplicant(externalUserId, levelName))
  //   .then(function (response) {
  //     console.log("Response:\n", response.data);
  //     return response;
  //   })
  //   .catch(function (error) {
  //     console.log("Error:\n", error.response.data);
  //   });
  //
  // const applicantId = response.data.id;
  // console.log("ApplicantID: ", applicantId);

  // response = await axios(addDocument(applicantId))
  //   .then(function (response) {
  //     console.log("Response:\n", response.data);
  //     return response;
  //   })
  //   .catch(function (error) {
  //     console.log("Error:\n", error.response.data);
  //   });

  // response = await axios(getApplicantStatus(applicantId))
  //   .then(function (response) {
  //     console.log("Response:\n", response.data);
  //     return response;
  //   })
  //   .catch(function (error) {
  //     console.log("Error:\n", error.response.data);
  //   });

  return await axios(createAccessToken(externalUserId, levelName, 1200))
    .then(function (response) {
      console.log("resul Response:\n", response.data);
      return response;
    })
    .catch(function (error) {
      console.log("Error:\n", error.response.data);
    });
}

module.exports = { main };