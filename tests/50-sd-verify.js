/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {createDisclosedVc, createInitialVc} from './helpers.js';
import {issueTestData, deriveTestData} from './vc-generator/index.js';
import {verificationFail, verificationSuccess} from './assertions.js';
import {endpoints} from 'vc-test-suite-implementations';
import {getSuiteConfig} from './test-config.js';
import {klona} from 'klona';

const {
  tags,
  vcHolder: {tags: holderTags, holderName},
  credentials
} = getSuiteConfig('ecdsa-sd-2023');

// only use implementations with `ecdsa-sd-2023` verifiers.
const {match} = endpoints.filterByTag({
  tags: [...tags],
  property: 'verifiers'
});

describe('ecdsa-sd-2023 (verify)', function() {
  describe('ecdsa-sd-2023 (verifiers)', function() {
    let vcHolder;
    before(async function() {
      const {match: matchingVcHolders} = endpoints.filterByTag({
        tags: [...holderTags],
        property: 'vcHolders'
      });
      const vcHolders = matchingVcHolders.get(holderName).endpoints;
      vcHolder = vcHolders[0];
    });
    // this will tell the report
    // to make an interop matrix with this suite
    this.matrix = true;
    this.report = true;
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Verifier';
    this.implemented = [];
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
          const signedCredentials = [];
          const disclosedCredentials = [];
          const nestedDisclosedCredentials = [];
          const disclosedDlCredentialNoIds = [];
          const disclosedCredentialsWithFullArray = [];
          const disclosedCredentialsWithLessThanFullSubArray = [];
          const disclosedCredentialsWithoutFirstArrayElement = [];
          before(async function() {
            //verifierSupportedEcdsaKeyTypes
            const nestedCredential = klona(
              credentials.verify.subjectNestedObjects);
            // create initial signed VC
            const signedVc = await createInitialVc({
              issuer,
              vc: nestedCredential.document,
              // mandatoryPointers: nestedCredential.mandatoryPointers
            });
            signedCredentials.push(signedVc);
            // use initial VC for a basic selective disclosure test
            const {disclosedCredential} = await createDisclosedVc({
              selectivePointers: ['/credentialSubject/id'],
              signedCredential: signedVc,
              vcHolder
            });
            disclosedCredentials.push(disclosedCredential);
            const nestedPointers = nestedCredential.
              selectivePointers.slice(1, 3);
            // create initial nestedDisclosedCredential from signedVc
            const {
              disclosedCredential: nestedDisclosedCredential
            } = await createDisclosedVc({
              selectivePointers: [...nestedPointers],
              signedCredential: signedVc,
              vcHolder
            });
            nestedDisclosedCredentials.push(nestedDisclosedCredential);
            // copy the first vc
            const noIdVc = klona(nestedCredential.document);
            // delete the id
            delete noIdVc.id;
            // start second round test data creation w/ dlCredentialNoIds
            const signedDlCredentialNoIds = await createInitialVc({
              issuer, vc: noIdVc
            });
            const {
              disclosedCredential: disclosedDlCredentialNoId
            } = await createDisclosedVc({
              selectivePointers: [...nestedPointers],
              signedCredential: signedDlCredentialNoIds,
              vcHolder
            });
            disclosedDlCredentialNoIds.push(disclosedDlCredentialNoId);
            const credentialHasArrays = klona(
              credentials.verify.subjectHasArrays);
            // start third round test data creation w/
            // AchievementCredential
            const signedAchievementCredential = await createInitialVc({
              issuer, vc: credentialHasArrays.document
            });

            // select full arrays
            const {
              disclosedCredential: revealedAchievementCredential1
            } = await createDisclosedVc({
              selectivePointers:
                [...credentialHasArrays.selectivePointers],
              signedCredential: signedAchievementCredential,
              vcHolder
            });
            disclosedCredentialsWithFullArray.push(
              revealedAchievementCredential1);
            // select less than full subarrays
            const lessThanFullPointers = credentialHasArrays.
              selectivePointers.slice(2, -4);
            const {
              disclosedCredential: revealedAchievementCredential2
            } = await createDisclosedVc({
              selectivePointers: lessThanFullPointers,
              signedCredential: signedAchievementCredential,
              vcHolder
            });
            disclosedCredentialsWithLessThanFullSubArray.push(
              revealedAchievementCredential2);
            // select w/o first 7 array element
            const removeFirst7Pointers = credentialHasArrays.
              selectivePointers.slice(7);
            const {
              disclosedCredential: revealedAchievementCredential3
            } = await createDisclosedVc({
              selectivePointers: removeFirst7Pointers,
              signedCredential: signedAchievementCredential,
              vcHolder
            });
            disclosedCredentialsWithoutFirstArrayElement.push(
              revealedAchievementCredential3);
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
