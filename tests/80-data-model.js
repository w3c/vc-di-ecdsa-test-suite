/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {dataModelSuite} from './suites/data-model.js';
import {endpoints} from 'vc-test-suite-implementations';
import {getSuiteConfig} from './test-config.js';

const cryptosuites = [
  'ecdsa-rdfc-2019',
  'ecdsa-sd-2023'
  //FIXME implement jcs 'ecdsa-jcs-2019'
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
    dataModelSuite({
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
