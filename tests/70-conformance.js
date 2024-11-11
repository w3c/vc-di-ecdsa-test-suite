/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {conformanceSuite} from './suites/conformance.js';
import {endpoints} from 'vc-test-suite-implementations';
import {getSuiteConfig} from './test-config.js';

const cryptosuites = [
  'ecdsa-rdfc-2019',
  'ecdsa-sd-2023'
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
    conformanceSuite({
      verifiers,
      suiteName,
      keyTypes: vectors.keyTypes,
      vcVersion,
      credential: document,
      mandatoryPointers,
      selectivePointers
    });
  }
}
