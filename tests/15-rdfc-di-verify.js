/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  checkDataIntegrityProofVerifyErrors
} from 'data-integrity-test-suite-assertion';
import {
  cryptosuite as ecdsaRdfc2019Cryptosuite
} from '@digitalbazaar/ecdsa-rdfc-2019-cryptosuite';
import {endpoints} from 'vc-test-suite-implementations';
import {getMultiKey} from './vc-generator/key-gen.js';
import {getSuiteConfig} from './test-config.js';

const {tags, vectors, credentials} = getSuiteConfig('ecdsa-rdfc-2019');
// only use implementations with `ecdsa-rdfc-2019` verifiers.
const {match} = endpoints.filterByTag({
  tags: [...tags],
  property: 'verifiers'
});

for(const vcVersion of vectors.vcTypes) {
  for(const keyType of vectors.keyTypes) {
    const key = await getMultiKey({keyType});
    const {document} = credentials.verify[vcVersion];
    // options for the DI Verifier Suite
    checkDataIntegrityProofVerifyErrors({
      implemented: match,
      isEcdsaTests: true,
      testDescription:
        `Data Integrity (ecdsa-rdfc-2019 verifiers) VC ${vcVersion}`,
      testDataOptions: {
        suiteName: 'ecdsa-rdfc-2019',
        cryptosuite: ecdsaRdfc2019Cryptosuite,
        key,
        testVector: document,
        keyType
      }
    });
  }
}
