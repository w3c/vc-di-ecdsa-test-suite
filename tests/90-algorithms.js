/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {ecdsaRdfc2019Algorithms} from './suites/algorithms.js';
import {endpoints} from 'vc-test-suite-implementations';
import {getSuiteConfig} from './test-config.js';

const cryptosuites = [
  'ecdsa-rdfc-2019',
];

for(const suiteName of cryptosuites) {
  const {tags, credentials, vectors} = getSuiteConfig(suiteName);
  const {match: verifiers} = endpoints.filterByTag({
    tags: [...tags],
    property: 'verifiers'
  });
  for(const vcVersion of vectors.vcTypes) {
    const {
      document,
      mandatoryPointers,
      selectivePointers
    } = credentials.create[vcVersion];
    for(const keyType of vectors.keyTypes) {
      ecdsaRdfc2019Algorithms({
        verifiers,
        suiteName,
        keyType,
        vcVersion,
        credential: document,
        mandatoryPointers,
        selectivePointers
      });
    }
  }
}
