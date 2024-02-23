/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {deriveTestData, issueTestData} from './vc-generator/index.js';
import {verificationFail, verificationSuccess} from './assertions.js';
import {endpoints} from 'vc-test-suite-implementations';
import {getSuiteConfig} from './test-config.js';
import {klona} from 'klona';

const suite = 'ecdsa-sd-2023';
const {
  tags,
  credentials
} = getSuiteConfig(suite);
// FIXME move this to vectors
const keyTypes = ['P-256'];
// only use implementations with `ecdsa-sd-2023` verifiers.
const {match} = endpoints.filterByTag({
  tags: [...tags],
  property: 'verifiers'
});

describe('ecdsa-sd-2023 (verify)', function() {
  describe('ecdsa-sd-2023 (verifiers)', function() {
    // this will tell the report
    // to make an interop matrix with this suite
    this.matrix = true;
    this.report = true;
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Verifier';
    this.implemented = [];
    const testVectors = {
      //signedCredentials
      signed: [],
      disclosed: {
        //disclosedCredentials
        base: [],
        //nestedDisclosedCredentials
        nested: [],
        //disclosedDlCredentialNoIds
        noIds: [],
        array: {
          //disclosedCredentialsWithFullArray
          full: [],
          //disclosedCredentialsWithLessThanFullSubArray
          lessThanFull: [],
          //disclosedCredentialsWithoutFirstArrayElement
          missingElements: []
        }
      }
    };
    before(async function() {
      const {subjectNestedObject, subjectHasArrays} = credentials.verify;
      // create initial signed VCs
      testVectors.signed = await issueTestData({
        credential: subjectNestedObject.document,
        suite,
        keyTypes,
        mandatoryPointers: subjectNestedObject.mandatoryPointers
      });
      const [signedVc] = testVectors.signed;
      // use initial VCs for a basic selective disclosure test
      testVectors.disclosed.base = await deriveTestData({
        selectivePointers: ['/credentialSubject/id'],
        verifiableCredential: signedVc,
        keyTypes,
        suite
      });
      // create initial nestedDisclosedCredential from signedVc
      testVectors.disclosed.nested = await deriveTestData({
        selectivePointers: subjectNestedObject.selectivePointers.slice(1, 3),
        verifiableCredential: signedVc,
        keyTypes,
        suite
      });
      // copy the first vc
      const noIdVc = klona(subjectNestedObject.document);
      // delete the id
      delete noIdVc.id;
      // start second round test data creation w/ dlCredentialNoIds
      const [signedDlCredentialNoIds] = await issueTestData({
        credential: noIdVc,
        keyTypes,
        suite: 'ecdsa-sd-2023',
      });
      testVectors.disclosed.noIds = await deriveTestData({
        selectivePointers: subjectNestedObject.selectivePointers.slice(1, 3),
        verifiableCredential: signedDlCredentialNoIds,
        keyTypes,
        suite
      });
      const credentialHasArrays = klona(subjectHasArrays);
      // start third round test data creation w/
      // AchievementCredential
      const [signedAchievementCredential] = await issueTestData({
        credential: credentialHasArrays.document,
        mandatoryPointers: credentialHasArrays.mandatoryPointers,
        keyTypes,
        suite
      });
      // select full arrays
      testVectors.disclosed.array.full = await deriveTestData({
        selectivePointers:
          [...credentialHasArrays.selectivePointers],
        verifiableCredential: signedAchievementCredential,
        suite,
        keyTypes
      });
      // select less than full subarrays
      const lessThanFullPointers = credentialHasArrays.
        selectivePointers.slice(2, -4);
      testVectors.disclosed.array.lessThanFull = await deriveTestData({
        selectivePointers: lessThanFullPointers,
        verifiableCredential: signedAchievementCredential,
        suite,
        keyTypes
      });
      // select w/o first 7 array element
      const removeFirst7Pointers = credentialHasArrays.
        selectivePointers.slice(7);
      testVectors.disclosed.array.missingElements = await deriveTestData({
        selectivePointers: removeFirst7Pointers,
        verifiableCredential: signedAchievementCredential,
        suite,
        keyTypes
      });
    });
    // loop through implementers and test endpoints
    for(const [name, {endpoints: verifiers}] of match) {
      for(const verifier of verifiers) {
        // get the keyTypes each verifier supports
        const {
          supportedEcdsaKeyTypes: verifierSupportedEcdsaKeyTypes
        } = verifier.settings;
        // format keyTypes for test report
        const keyTypes = verifierSupportedEcdsaKeyTypes.join(', ');
        // add name and keyTypes to test report
        this.implemented.push(`${name}: ${keyTypes}`);
        describe(`${name}: ${keyTypes}`, function() {
          before(function() {
            // filter vectors so we don't test curves they don't support
          });
          it('MUST verify a valid VC with an ecdsa-sd-2023 proof.',
            async function() {
              this.test.cell = {
                columnId: `${name}: ${keyTypes}`, rowId: this.test.title
              };
              for(const credential of disclosedCredentials) {
                await verificationSuccess({credential, verifier});
              }
            });
          it('MUST verify a valid VC with nested disclosed properties.',
            async function() {
              this.test.cell = {
                columnId: `${name}: ${keyTypes}`, rowId: this.test.title
              };
              for(const credential of nestedDisclosedCredentials) {
                await verificationSuccess({credential, verifier});
              }
            });
          it('MUST verify a valid VC with disclosed properties and bnodes.',
            async function() {
              this.test.cell = {
                columnId: `${name}: ${keyTypes}`, rowId: this.test.title
              };
              for(const credential of disclosedDlCredentialNoIds) {
                await verificationSuccess({credential, verifier});
              }
            });
          it('MUST verify with full array revealed properties',
            async function() {
              this.test.cell = {
                columnId: `${name}: ${keyTypes}`, rowId: this.test.title
              };
              for(const credential of disclosedCredentialsWithFullArray) {
                await verificationSuccess({credential, verifier});
              }
            });
          it('MUST verify with fewer array revealed properties',
            async function() {
              this.test.cell = {
                columnId: `${name}: ${keyTypes}`, rowId: this.test.title
              };
              for(
                const credential of disclosedCredentialsWithLessThanFullSubArray
              ) {
                await verificationSuccess({credential, verifier});
              }
            });
          it('MUST verify w/o first element revealed properties',
            async function() {
              this.test.cell = {
                columnId: `${name}: ${keyTypes}`, rowId: this.test.title
              };
              for(
                const credential of disclosedCredentialsWithoutFirstArrayElement
              ) {
                await verificationSuccess({credential, verifier});
              }
            });
          it('If the "proofValue" string does not start with "u", an ' +
            'error MUST be raised.', async function() {
            this.test.cell = {
              columnId: `${name}: ${keyTypes}`, rowId: this.test.title
            };
            for(const credential of disclosedCredentials) {
              const signedCredentialCopy = klona(credential);
              // intentionally modify proofValue to not start with 'u'
              signedCredentialCopy.proof.proofValue = 'a';
              await verificationFail({
                credential: signedCredentialCopy, verifier
              });
            }
          });
          it('If the "cryptosuite" field is not the string "ecdsa-sd-2023", ' +
            'an error MUST be raised.', async function() {
            this.test.cell = {
              columnId: `${name}: ${keyTypes}`, rowId: this.test.title
            };
            for(const credential of disclosedCredentials) {
              const signedCredentialCopy = klona(credential);
              signedCredentialCopy.proof.cryptosuite = 'invalid-cryptosuite';
              await verificationFail({
                credential: signedCredentialCopy, verifier
              });
            }
          });
          it('MUST fail to verify a base proof.', async function() {
            this.test.cell = {
              columnId: `${name}: ${keyTypes}`, rowId: this.test.title
            };
            for(const credential of signedCredentials) {
              const signedCredentialCopy = klona(credential);
              await verificationFail({
                credential: signedCredentialCopy, verifier
              });
            }
          });
          it('MUST fail to verify a modified disclosed credential.',
            async function() {
              this.test.cell = {
                columnId: `${name}: ${keyTypes}`, rowId: this.test.title
              };
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
      }
    }
  });
});
