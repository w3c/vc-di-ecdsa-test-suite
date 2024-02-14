/*!
 * Copyright 2023-2024 Digital Bazaar, Inc. All Rights Reserved
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {klona} from 'klona';
import {require} from './helpers.js';

const _runner = require('../config/runner.json');
const _vectors = require('../config/vectors.json');

// cache is valid for a single test run
const _cache = new Map();

// gets the env variables for the suites
const _envVariables = new Map([
  ['ecdsa-rdfc-2019', {
    issuerName: process.env.RDFC_ISSUER_NAME
  }],
  ['ecdsa-sd-2023', {
    issuerName: process.env.SD_ISSUER_NAME,
    holderName: process.env.SD_HOLDER_NAME
  }]
]);

const openVectorFiles = vectorFiles => {
  for(const property in vectorFiles) {
    const value = vectorFiles[property];
    // assume strings are paths to be opened
    if(typeof value === 'string') {
      vectorFiles[property] = klona(require(value));
      continue;
    }
    // assume everything else recurs
    vectorFiles[property] = openVectorFiles(value);
  }
  return vectorFiles;
};

const _createVectorConfig = suite => {
  // prevent mutation to require cache
  const vectorConfig = klona(_vectors.suites[suite]);
  // open test data in credentials section
  if(vectorConfig.credentials) {
    const {credentials} = vectorConfig;
    for(const property in credentials) {
      credentials[property] = openVectorFiles(credentials[property]);
    }
  }
  return vectorConfig;
};

const _createSuiteConfig = suite => {
  // clone to prevent mutations of the require cache
  const suiteConfig = klona(_runner.suites[suite]);
  if(!suiteConfig) {
    throw new Error(`Could not find config for suite ${suite}`);
  }
  // preserve the use of env variables for some settings
  const {issuerName, holderName} = _envVariables.get(suite);
  if(issuerName) {
    suiteConfig.issuerName = issuerName;
  }
  if(suiteConfig.vcHolder && holderName) {
    suiteConfig.vcHolder.holderName = holderName;
  }
  // return a deep copy to prevent test data mutation
  return suiteConfig;
};

export const getSuiteConfig = suite => {
  // if cached config use it
  if(_cache.get(suite)) {
    // return a deep copy to prevent test data mutation
    return klona(_cache.get(suite));
  }
  // create an initial config
  const suiteConfig = _createSuiteConfig(suite);
  const {credentials = {}} = _createVectorConfig(suite);
  const config = {...suiteConfig, credentials};
  // store in the cache
  _cache.set(suite, config);
  return config;
};
