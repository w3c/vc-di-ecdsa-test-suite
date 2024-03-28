/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
  verificationFail, verificationSuccess
} from './assertions.js';
import {
  endpoints as registeredImplementations
} from 'vc-test-suite-implementations';

import {getSuiteConfig} from './test-config.js';

import {expect} from 'chai';
import {issueTestData} from './vc-generator/index.js';
import {klona} from 'klona';

/**
 * Builds a result cell for the test reporter with the expected parameters.
 *
 * This is used to annotate the test results with the implementation name and
 * test name.
 *
 * @param {object} object - The object to use for building the result cell.
 * @param {string} object.name - The name of the implementation.
 * @param {string} object.keyType - The `keyType` being tested (e.g., `P-256`).
 * @param {string} object.testTitle - The title of the test.
 * @returns {object} The result cell object.
 */
const buildResultCell = ({name, keyType, testTitle}) => ({
  columnId: `${name}: ${keyType}`, rowId: testTitle
});

function annotateReportableTest(testContext, {
  implementationName, keyType
}) {
  testContext.test.cell = buildResultCell({
    name: implementationName,
    keyType,
    testTitle: testContext.test.title
  });
}

/**
 * Asserts that an implementation supports a `keyType` required by the test
 * suite's cryptosuite.
 *
 * Implementations may support many key types, but they must
 * support at least the required key types.
 *
 * @param {object} options - The options to use for assertion.
 * @param {object|null} options.testVector - The test vector object to be
 * validated for the associated keyType. NULL if the keyType is not supported
 * by the implementation as specified in `supportedEcdsaKeyTypes`.
 * @param {string} options.keyType - The type of ECDSA key to check for within
 * the test vector. This specifies the exact key type that the implementation
 * is expected to support.
 */
function expectImplementationTestVector({testVector, keyType}) {
  expect(
    testVector,
    `Implementation not marked as supporting required "${keyType}"! ` +
    'Is keyType missing from `supportedEcdsaKeyTypes`?'
  ).to.exist;
}

function setupReportableTestSuite(runnerContext, name) {
  runnerContext.matrix = true;
  runnerContext.report = true;
  runnerContext.rowLabel = 'Test Name';
  runnerContext.columnLabel = name;

  runnerContext.implemented = [];
}

const SUITE = 'ecdsa-rdfc-2019';

const {
  tags,
  credentials,
  keyTypes: requiredSupportedKeyTypes
} = getSuiteConfig(SUITE);

const {match: targetImplementations} = registeredImplementations.filterByTag({
  tags: [...tags],
  property: 'verifiers'
});

// Pre-build all the requisite test vectors
const testVectorsByKeyType = await issueTestData({
  credential: credentials.verify.document,
  suite: SUITE,
  keyTypes: requiredSupportedKeyTypes
});

describe('ecdsa-rdfc-2019 (verify)', function() {
  describe('ecdsa-rdfc-2019 (verifiers)', function() {
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
     * We want a test suite for each permutation for every key type we require.
    */

    for(const [name, {endpoints: verifiers}] of targetImplementations) {
      for(const verifier of verifiers) {
        const {
          supportedEcdsaKeyTypes: verifierKeyTypes
        } = verifier.settings;

        // Important: iterates over required keytypes (which may
        // differ from those specified by the implementation).
        for(const keyType of requiredSupportedKeyTypes) {
          const supportsKeyType = verifierKeyTypes.includes(keyType);

          const testVector = supportsKeyType ?
            testVectorsByKeyType.get(keyType) ?? null : null;

          // Registers the implementation for the test report
          const implementationTitle = `${name}: ${keyType}`;
          this.implemented.push(implementationTitle);

          const args = {
            implementationName: name,
            keyType,
            verifier,
            testVector,
          };

          describe(implementationTitle, function() {
            itMustVerifyValidVC(args);
            itRejectsInvalidCryptosuite(args);
          });
        }
      }
    }
  });
});

function itMustVerifyValidVC({
  implementationName, keyType,
  verifier, testVector
}) {
  return it('MUST verify a valid VC with an ecdsa-rdfc-2019 proof.',
    async function() {
      annotateReportableTest(this, {implementationName, keyType});

      expectImplementationTestVector({testVector, keyType});

      await verificationSuccess({credential: testVector, verifier});
    });
}

function itRejectsInvalidCryptosuite({
  implementationName, keyType,
  verifier, testVector
}) {
  return it('If the "cryptosuite" field is not either the string ' +
            '"ecdsa-rdfc-2019" or the string "ecdsa-jcs-2019", ' +
            'an error MUST be raised.',
  async function() {
    annotateReportableTest(this, {implementationName, keyType});

    expectImplementationTestVector({testVector, keyType});

    const credential = klona(testVector);
    // FIXME add invalid-cryptosuite as a locally valid cryptosuite
    // name, so the signature is correct, but the cryptosuite
    // name is incorrect
    credential.proof.cryptosuite = 'invalid-cryptosuite';
    await verificationFail({credential, verifier});
  });
}
