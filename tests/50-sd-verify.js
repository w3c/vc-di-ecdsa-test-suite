/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {verificationFail, verificationSuccess} from './assertions.js';
import {defineSuiteConformanceTests} from './suiteTests.js';
import {getSuiteConfig} from './test-config.js';
import {klona} from 'klona';
import {sdVerifySetup} from './setup.js';

const suite = 'ecdsa-sd-2023';
const {
  credentials,
  vectors
} = getSuiteConfig(suite);
const {keyTypes} = vectors;

describe('ecdsa-sd-2019 (verify)', async function() {
  let testVectors = new Map();
  let signedCredentials = [];
  let disclosedCredentials = [];
  let nestedDisclosedCredentials = [];
  let disclosedDlCredentialNoIds = [];
  let disclosedCredentialsWithFullArray = [];
  let disclosedCredentialsWithLessThanFullSubArray = [];
  let disclosedCredentialsWithoutFirstArrayElement = [];

  function defineTestVectorMapping(vcVersion) {
    // Make sure sdVerifySetup is called first
    if(Object.keys(testVectors).length === 0) {
      throw new Error('testVectors not populated. Was map instantiated?');
    }

    const getImplementationVectors = ({vectors}) =>
      keyTypes.map(type => vectors.get(type).
        get(vcVersion)).filter(Boolean);

    signedCredentials = getImplementationVectors({
      vectors: testVectors.signed
    });
    disclosedCredentials = getImplementationVectors({
      vectors: testVectors.disclosed.base
    });
    nestedDisclosedCredentials = getImplementationVectors({
      vectors: testVectors.disclosed.nested
    });
    disclosedDlCredentialNoIds = getImplementationVectors({
      vectors: testVectors.disclosed.noIds
    });
    disclosedCredentialsWithFullArray = getImplementationVectors({
      vectors: testVectors.disclosed.array.full
    });
    disclosedCredentialsWithLessThanFullSubArray =
  getImplementationVectors({
    vectors: testVectors.disclosed.array.lessThanFull
  });
    disclosedCredentialsWithoutFirstArrayElement =
  getImplementationVectors({
    vectors: testVectors.disclosed.array.missingElements
  });
  }

  await defineSuiteConformanceTests({
    suite,
    testCategory: 'verifiers',
    // We provide a custom mapped test vector for each VC version instead.
    buildTestVectorsFn: () => {},
  }, function({endpoint: verifier, vcVersion}) {
    before(async function() {
      testVectors = await sdVerifySetup({
        credentials,
        keyTypes,
        suite
      });

      // Define the test vector mapping for convienence.
      defineTestVectorMapping(vcVersion);
    });

    function assertTestVector(vector) {
      if(!vector || vector.length === 0) {
        throw new Error('No test vector provided.');
      }
    }

    it('MUST verify a valid VC with an ecdsa-sd-2023 proof.',
      async function() {
        assertTestVector(disclosedCredentials);
        for(const credential of disclosedCredentials) {
          await verificationSuccess({credential, verifier});
        }
      });
    it('MUST verify a valid VC with nested disclosed properties.',
      async function() {
        assertTestVector(nestedDisclosedCredentials);
        for(const credential of nestedDisclosedCredentials) {
          await verificationSuccess({credential, verifier});
        }
      });
    it('MUST verify a valid VC with disclosed properties and bnodes.',
      async function() {
        assertTestVector(disclosedDlCredentialNoIds);
        for(const credential of disclosedDlCredentialNoIds) {
          await verificationSuccess({credential, verifier});
        }
      });
    it('MUST verify with full array revealed properties',
      async function() {
        assertTestVector(disclosedCredentialsWithFullArray);
        for(const credential of disclosedCredentialsWithFullArray) {
          await verificationSuccess({credential, verifier});
        }
      });
    it('MUST verify with fewer array revealed properties',
      async function() {
        assertTestVector(disclosedCredentialsWithLessThanFullSubArray);
        for(const credential of
          disclosedCredentialsWithLessThanFullSubArray) {
          await verificationSuccess({credential, verifier});
        }
      });
    it('MUST verify w/o first element revealed properties',
      async function() {
        assertTestVector(disclosedCredentialsWithoutFirstArrayElement);
        for(const credential of
          disclosedCredentialsWithoutFirstArrayElement) {
          await verificationSuccess({credential, verifier});
        }
      });
    it('If the "proofValue" string does not start with "u", an ' +
    'error MUST be raised.', async function() {
      assertTestVector(disclosedCredentials);
      for(const credential of disclosedCredentials) {
        const signedCredentialCopy = klona(credential);
        // intentionally modify proofValue to not start with 'u'
        signedCredentialCopy.proof.proofValue = 'a';
        await verificationFail({
          credential: signedCredentialCopy, verifier
        });
      }
    });
    it('If the "cryptosuite" field is not the string ' +
    '"ecdsa-sd-2023", an error MUST be raised.', async function() {
      assertTestVector(disclosedCredentials);
      for(const credential of disclosedCredentials) {
        const signedCredentialCopy = klona(credential);
        signedCredentialCopy.proof.cryptosuite =
        'invalid-cryptosuite';
        await verificationFail({
          credential: signedCredentialCopy, verifier
        });
      }
    });
    it('MUST fail to verify a base proof.', async function() {
      assertTestVector(signedCredentials);
      for(const credential of signedCredentials) {
        const signedCredentialCopy = klona(credential);
        await verificationFail({
          credential: signedCredentialCopy, verifier
        });
      }
    });
    it('MUST fail to verify a modified disclosed credential.',
      async function() {
        assertTestVector(disclosedCredentials);
        for(const credential of disclosedCredentials) {
          const signedCredentialCopy = klona(credential);
          // intentionally modify `credentialSubject` ID
          signedCredentialCopy.credentialSubject.id = 'urn:invalid';
          await verificationFail({
            credential: signedCredentialCopy, verifier
          });
        }
      });
  });
});
