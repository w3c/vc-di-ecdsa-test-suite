/*!
 * Copyright 2023-2024 Digital Bazaar, Inc. All Rights Reserved
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {klona} from 'klona';
import {require} from './helpers.js';

const _config = require('../config/runner.json');
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

const openFiles = suiteFiles => {
  for(const property in suiteFiles) {
    const value = suiteFiles[property];
    // assume strings are paths to be opened
    if(typeof value === 'string') {
      suiteFiles[property] = klona(require(value));
      continue;
    }
    // assume everything else recurs
    suiteFiles[property] = openFiles(value);
  }
  return suiteFiles;
};

const _createSuiteConfig = suite => {
  // clone to prevent mutations of the require cache
  const suiteConfig = klona(_config.suites[suite]);
  if(!suiteConfig) {
    throw new Error(`Could not find config for suite ${suite}`);
  }
  // open test data in credentials section
  if(suiteConfig.credentials) {
    const {credentials} = suiteConfig;
    for(const property in credentials) {
      credentials[property] = openFiles(credentials[property]);
    }
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
  // store in the cache
  _cache.set(suite, suiteConfig);
  return suiteConfig;
};
