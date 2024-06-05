/*!
 * Copyright 2023-24 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as ecdsaSd2023Cryptosuite from
  '@digitalbazaar/ecdsa-sd-2023-cryptosuite';
import {
  checkDataIntegrityProofVerifyErrors
} from 'data-integrity-test-suite-assertion';
import {endpoints} from 'vc-test-suite-implementations';
import {getSuiteConfig} from './test-config.js';

const {tags, credentials, vectors} = getSuiteConfig('ecdsa-sd-2023');

// only use implementations with `ecdsa-sd-2023` verifiers.
const {match} = endpoints.filterByTag({
  tags: [...tags],
  property: 'verifiers'
});
// options for the DI Verifier Suite
const testDataOptions = {
  suiteName: 'ecdsa-sd-2023',
  cryptosuite: ecdsaSd2023Cryptosuite,
  keyType: 'P-256',
  mandatoryPointers: ['/issuer'],
  selectivePointers: ['/credentialSubject']
};

console.log({credentials, vectors});

await checkDataIntegrityProofVerifyErrors({
  implemented: match,
  isEcdsaTests: true,
  testDescription: 'Data Integrity (ecdsa-sd-2023 verifiers)',
  testDataOptions
});

