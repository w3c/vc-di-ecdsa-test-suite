/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
  checkDataIntegrityProofFormat
} from 'data-integrity-test-suite-assertion';
import {endpoints} from 'vc-test-suite-implementations';
import {getSuiteConfig} from './test-config.js';

const {tags} = getSuiteConfig('ecdsa-rdfc-2019');
const {match} = endpoints.filterByTag({
  tags: [...tags],
  property: 'issuers'
});

checkDataIntegrityProofFormat({
  implemented: match,
  isEcdsaTests: true,
  testDescription: 'Data Integrity (ecdsa-rdfc-2019 issuers)',
  cryptosuiteName: 'ecdsa-rdfc-2019'
});
