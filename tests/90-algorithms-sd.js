/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {endpoints} from 'vc-test-suite-implementations';
import {getSuiteConfig} from './test-config.js';
import {sd2023Algorithms} from './suites/algorithms-sd.js';

const cryptosuites = [
  'ecdsa-sd-2023',
];

for(const suiteName of cryptosuites) {
  const {tags, credentials, vectors} = getSuiteConfig(suiteName);
  const {match: verifiers} = endpoints.filterByTag({
    tags: [...tags],
    property: 'verifiers'
  });
  const {match: issuers} = endpoints.filterByTag({
    tags: [...tags],
    property: 'issuers'
  });
  for(const vcVersion of vectors.vcTypes) {
    const {
      document,
      mandatoryPointers,
      selectivePointers
    } = credentials.create[vcVersion];
    sd2023Algorithms({
      verifiers,
      issuers,
      suiteName,
      keyTypes: vectors.keyTypes,
      vcVersion,
      credential: document,
      mandatoryPointers,
      selectivePointers
    });
  }
}
