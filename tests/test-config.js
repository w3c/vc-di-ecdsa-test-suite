/*!
 * Copyright 2023-2024 Digital Bazaar, Inc. All Rights Reserved
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {klona} from 'klona';
import {require} from './helpers.js';

const _runner = require('../config/runner.json');
const _vectors = require('../config/vectors.json');

// load `localConfig` settings to control interop tests
import {localSettings} from 'vc-test-suite-implementations';

// cache is valid for a single test run
const _cache = new Map();

// converts true values to true and everything else to false
const convertToBoolean = envVariable => /^(1|true)$/i.test(envVariable);

// gets the local value for test runs to determine
// if interop tests should run
const parseInteropOption = () => {
  if(process.env.DISABLE_INTEROP != undefined) {
    return convertToBoolean(process.env.DISABLE_INTEROP);
  }
  return !localSettings.enableInteropTests;
};

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
  const {credentials = {}, ...vectorConfig} = _createVectorConfig(suite);
  const config = {
    ...suiteConfig,
    credentials,
    disableInterop: parseInteropOption(),
    vectors: {...vectorConfig},
  };
  // store in the cache
  _cache.set(suite, config);
  return config;
};
