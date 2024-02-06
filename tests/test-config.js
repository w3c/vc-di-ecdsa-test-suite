/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import {klona} from 'klona';
import {require} from './helpers.js';

export const issuerName = process.env.ISSUER_NAME || 'Digital Bazaar';
export const holderName = process.env.HOLDER_NAME || 'Digital Bazaar';

export const config = require('../config/runner.json');

export const getSuiteConfig = suite => {
  const suiteConfig = config.suites[suite];
  if(!suiteConfig) {
    throw new Error(`Could not find config for suite ${suite}`);
  }
  if(typeof suiteConfig.issuerDocument === 'string') {
    suiteConfig.issuerDocument = require(suiteConfig.issuerDocument);
  }
  return klona(suiteConfig);
};
