/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  itMustVerifyValidVC,
  itRejectsInvalidCryptosuite
} from './assertions.js';
import {getSuiteConfig} from './test-config.js';
import {issueCredentials} from './vc-generator/index.js';
import {
  endpoints as registeredImplementations
} from 'vc-test-suite-implementations';
import {
  setupReportableTestSuite
} from './helpers.js';

const SUITE = 'ecdsa-rdfc-2019';
const {
  tags,
  credentials,
  vectors
} = getSuiteConfig(SUITE);

const requiredSupportedKeyTypes = vectors.keyTypes;
const {match: targetImplementations} = registeredImplementations.filterByTag({
  tags: [...tags],
  property: 'verifiers'
});

// Pre-build all the requisite test vectors
const testVectorsByKeyType = await issueCredentials({
  credentials: Object.entries(credentials.verify),
  suite: SUITE,
  keyTypes: requiredSupportedKeyTypes
});

describe('ecdsa-rdfc-2019 (verify)', function() {
  for(const vcVersion of vectors.vcTypes) {
    describe(`ecdsa-rdfc-2019 (verifiers) VC ${vcVersion}`, function() {
      setupReportableTestSuite(this, 'Verifier');
      /**
       * We build a dynamic test suite based on the implementations that support
       * the `ecdsa-rdfc-2019` suite.
       *
       * If the target implementations do not support a specific test, we will
       * skip the test but still keep it defined, so that this is obvious in the
       * results.
       *
       * Note that a single implementation may define multiple verifiers, which
       * in turn may support multiple key types.
       *
       * We want a test suite for each permutation for every key type we
       * require.
      */

      for(const [name, {endpoints: verifiers}] of targetImplementations) {
        for(const verifier of verifiers) {
          const {
            supportedEcdsaKeyTypes: verifierKeyTypes,
            // assume support for vc 1.1
            supports = {vc: ['1.1']}
          } = verifier.settings;
          // check to make sure the issuer supports the vc type
          if(!supports?.vc?.includes(vcVersion)) {
            continue;
          }
          // Important: iterates over required keyTypes (which may
          // differ from those specified by the implementation).
          for(const keyType of requiredSupportedKeyTypes) {
            const supportsKeyType = verifierKeyTypes.includes(keyType);

            const testVector = supportsKeyType ?
              testVectorsByKeyType.get(keyType).get(vcVersion) ?? null : null;

            // Registers the implementation for the test report
            const implementationTitle = `${name}: ${keyType}`;
            this.implemented.push(implementationTitle);
            const args = {
              implementationName: name,
              suiteName: SUITE,
              keyType,
              verifier,
              testVector,
            };
            describe(implementationTitle, function() {
              itMustVerifyValidVC(args);
              itRejectsInvalidCryptosuite([SUITE, 'ecdsa-jcs-2019'], args);
            });
          }
        }
      }
    });
  }
});
