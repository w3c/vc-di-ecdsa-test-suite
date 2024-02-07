/*!
 * Copyright 2023-2024 Digital Bazaar, Inc. All Rights Reserved
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {klona} from 'klona';
import {require} from './helpers.js';

const _config = require('../config/runner.json');

const _envVariables = new Map([
  ['ecdsa-rdfc-2019', {
    issuerName: process.env.RDFC_ISSUER_NAME
  }],
  ['ecdsa-sd-2023', {
    issuerName: process.env.SD_ISSUER_NAME,
    holderName: process.env.SD_HOLDER_NAME
  }]
]);

export const getSuiteConfig = suite => {
  const suiteConfig = _config.suites[suite];
  if(!suiteConfig) {
    throw new Error(`Could not find config for suite ${suite}`);
  }
  if(typeof suiteConfig.issuerDocument === 'string') {
    suiteConfig.issuerDocument = require(suiteConfig.issuerDocument);
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
  return klona(suiteConfig);
};
