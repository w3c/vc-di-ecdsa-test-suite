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

for(const vcVersion of vectors.vcTypes) {
  const key = await getMultiKey({keyType: 'P-256'});
  const {document} = credentials.verify[vcVersion];
  // only use implementations with `ecdsa-rdfc-2019` verifiers.
  // and that also support the current VC version
  const {match} = endpoints.filter({
    filter({implementation}) {
      const endpoints = implementation.verifiers;
      // the filter function expects an array to be returned
      return endpoints.filter(e => {
        // we want only endpoints that match every tag
        if(tags.every(tag => e.tags.has(tag))) {
          // only return endpoints with the vcVersion support
          const {supports = {vc: ['1.1']}} = e?.settings;
          return supports?.vc?.includes(vcVersion);
        }
        return false;
      });
    }
  });
  // options for the DI Verifier Suite
  checkDataIntegrityProofVerifyErrors({
    implemented: match,
    testDescription:
      `Data Integrity (ecdsa-rdfc-2019 verifiers) VC ${vcVersion}`,
    testDataOptions: {
      suiteName: 'ecdsa-rdfc-2019',
      cryptosuite: ecdsaRdfc2019Cryptosuite,
      key,
      testVector: document,
      keyType: 'P-256'
    }
  });
}
