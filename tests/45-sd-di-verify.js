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
import {filterVerifiers} from './helpers.js';
import {getMultiKey} from './vc-generator/key-gen.js';
import {getSuiteConfig} from './test-config.js';

const {tags, credentials, vectors} = getSuiteConfig('ecdsa-sd-2023');

for(const vcVersion of vectors.vcTypes) {
  const key = await getMultiKey({keyType: 'P-256'});
  const {
    document,
    mandatoryPointers,
    selectivePointers
  } = credentials.verify.subjectHasArrays[vcVersion];
  const {match} = endpoints.filter({
    filter: filterVerifiers.bind({vcVersion, tags, vcDefault: '2.0'})
  });
  // options for the DI Verifier Suite
  checkDataIntegrityProofVerifyErrors({
    implemented: match,
    testDescription:
      `Data Integrity (ecdsa-sd-2023 verifiers) VC ${vcVersion}`,
    testDataOptions: {
      suiteName: 'ecdsa-sd-2023',
      cryptosuite: ecdsaSd2023Cryptosuite,
      key,
      testVector: document,
      mandatoryPointers,
      selectivePointers,
      keyType: 'P-256'
    }
  });
}
