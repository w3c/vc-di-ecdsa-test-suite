/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {verificationFail, verificationSuccess} from './assertions.js';
import {endpoints} from 'vc-test-suite-implementations';
import {getSuiteConfig} from './test-config.js';
import {klona} from 'klona';
import {sdVerifySetup} from './setup.js';

const suite = 'ecdsa-sd-2023';
const {
  tags,
  credentials,
  vectors
} = getSuiteConfig(suite);
// only use implementations with `ecdsa-sd-2023` verifiers.
const {match} = endpoints.filterByTag({
  tags: [...tags],
  property: 'verifiers'
});

describe('ecdsa-sd-2023 (verify)', function() {
  let testVectors = new Map();
  before(async function() {
    testVectors = await sdVerifySetup({credentials, vectors});
  });
  for(const vcVersion of vectors.vcTypes) {
    describe('ecdsa-sd-2023 (verifiers)', function() {
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
          const {supportedEcdsaKeyTypes} = verifier.settings;
          // format keyTypes for test report
          const keyTypes = supportedEcdsaKeyTypes.join(', ');
          // add name and keyTypes to test report
          this.implemented.push(`${name}: ${keyTypes}`);
          describe(`${name}: ${keyTypes}`, function() {
            let signedCredentials = [];
            let disclosedCredentials = [];
            let nestedDisclosedCredentials = [];
            let disclosedDlCredentialNoIds = [];
            let disclosedCredentialsWithFullArray = [];
            let disclosedCredentialsWithLessThanFullSubArray = [];
            let disclosedCredentialsWithoutFirstArrayElement = [];
            before(function() {
              // filter vectors so suite doesn't test unsupported keyTypes
              const getImplementationVectors = ({vectors}) =>
                supportedEcdsaKeyTypes.map(type => vectors.get(type).
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
                for(const credential of
                  disclosedCredentialsWithLessThanFullSubArray) {
                  await verificationSuccess({credential, verifier});
                }
              });
            it('MUST verify w/o first element revealed properties',
              async function() {
                this.test.cell = {
                  columnId: `${name}: ${keyTypes}`, rowId: this.test.title
                };
                for(const credential of
                  disclosedCredentialsWithoutFirstArrayElement) {
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
            it('If the "cryptosuite" field is not the string ' +
            '"ecdsa-sd-2023", an error MUST be raised.', async function() {
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
  }
});
