/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  checkDataIntegrityProofVerifyErrors
} from 'data-integrity-test-suite-assertion';
import {endpoints} from 'vc-test-suite-implementations';
import {getSuiteConfig} from './test-config.js';

const {tags} = getSuiteConfig('ecdsa-rdfc-2019');

// only use implementations with `ecdsa-rdfc-2019` verifiers.
const {match} = endpoints.filterByTag({
  tags: [...tags],
  property: 'verifiers'
});
// options for the DI Verifier Suite
const testDataOptions = {
  suiteName: 'ecdsa-rdfc-2019',
  keyType: 'P-256'
};
checkDataIntegrityProofVerifyErrors({
  implemented: match,
  isEcdsaTests: true,
  testDescription: 'Data Integrity (ecdsa-rdfc-2019 verifiers)',
  testDataOptions
});
