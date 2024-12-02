/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  checkDataIntegrityProofFormat
} from 'data-integrity-test-suite-assertion';
import {endpoints} from 'vc-test-suite-implementations';
import {getSuiteConfig} from './test-config.js';

const {tags} = getSuiteConfig('ecdsa-sd-2023');
const {match} = endpoints.filterByTag({
  tags: [...tags],
  property: 'issuers'
});

checkDataIntegrityProofFormat({
  implemented: match,
  isEcdsaTests: true,
  testDescription: 'Data Integrity (ecdsa-sd-2023 issuers)',
  cryptosuiteName: 'ecdsa-sd-2023'
});
