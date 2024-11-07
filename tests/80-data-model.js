/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {dataModelSuite} from './suites/data-model.js';
import {endpoints} from 'vc-test-suite-implementations';
import {getSuiteConfig} from './test-config.js';

const cryptosuites = [
  'ecdsa-rdfc-2019',
  'ecdsa-jcs-2019'
];

for(const suiteName of cryptosuites) {
  const {tags, credentials, vectors} = getSuiteConfig(suiteName);
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
    for(const keyType of vectors.keyTypes) {
      dataModelSuite({
        issuers,
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
