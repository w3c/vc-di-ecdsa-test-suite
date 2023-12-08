/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import {achievementCredential, dlCredentialNoIds, validVc as vc} from
  './mock-data.js';
import {createDisclosedVc, createInitialVc} from './helpers.js';
import {verificationFail, verificationSuccess} from './assertions.js';
import {
  checkDataIntegrityProofVerifyErrors
} from 'data-integrity-test-suite-assertion';
import {endpoints} from 'vc-api-test-suite-implementations';
import {klona} from 'klona';

const tag = 'bbs-2023';
// only use implementations with `bbs-2023` verifiers.
const {match} = endpoints.filterByTag({
  tags: [tag],
  property: 'verifiers'
});

describe('bbs-2023 (verify)', function() {
  checkDataIntegrityProofVerifyErrors({
    implemented: match,
    isEcdsaTests: true,
    testDescription: 'Data Integrity (bbs-2023 verifiers)'
  });
  describe('bbs-2023 (verifiers)', function() {
    let issuers;
    let vcHolder;
    before(async function() {
      const {match: matchingIssuers} = endpoints.filterByTag({
        tags: [tag],
        property: 'issuers'
      });
      const {match: matchingVcHolders} = endpoints.filterByTag({
        tags: ['vcHolder'],
        property: 'vcHolders'
      });
      // Use DB issuer to issue a verifiable credential for the verifier tests
      issuers = matchingIssuers.get('Digital Bazaar').endpoints;
      const vcHolders = matchingVcHolders.get('Digital Bazaar').endpoints;
      vcHolder = vcHolders[0];
    });
    // this will tell the report
    // to make an interop matrix with this suite
    this.matrix = true;
    this.report = true;
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Verifier';
    this.implemented = [];
    for(const [name, {endpoints}] of match) {
      for(const endpoint of endpoints) {
        const {
          supportedEcdsaKeyTypes: verifierSupportedEcdsaKeyTypes
        } = endpoint.settings;
        const keyTypes = verifierSupportedEcdsaKeyTypes.join(', ');
        const verifier = endpoint;
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
            for(const issuer of issuers) {
              const {
                supportedEcdsaKeyTypes: issuerSupportedEcdsaKeyTypes
              } = issuer.settings;
              for(const verifierSupportedEcdsaKeyType of
                verifierSupportedEcdsaKeyTypes) {
                if(issuerSupportedEcdsaKeyTypes.includes(
                  verifierSupportedEcdsaKeyType)) {
                  const signedVc = await createInitialVc({issuer, vc});
                  signedCredentials.push(signedVc);
                  const {disclosedCredential} = await createDisclosedVc({
                    selectivePointers: ['/credentialSubject/id'],
                    signedCredential: signedVc,
                    vcHolder
                  });
                  disclosedCredentials.push(disclosedCredential);
                  const {
                    disclosedCredential: nestedDisclosedCredential
                  } = await createDisclosedVc({
                    selectivePointers: [
                      '/credentialSubject/driverLicense/dateOfBirth',
                      '/credentialSubject/driverLicense/expirationDate'
                    ],
                    signedCredential: signedVc,
                    vcHolder
                  });
                  nestedDisclosedCredentials.push(nestedDisclosedCredential);
                  const signedDlCredentialNoIds = await createInitialVc({
                    issuer, vc: dlCredentialNoIds
                  });
                  const {
                    disclosedCredential: disclosedDlCredentialNoId
                  } = await createDisclosedVc({
                    selectivePointers: [
                      '/credentialSubject/driverLicense/dateOfBirth',
                      '/credentialSubject/driverLicense/expirationDate'
                    ],
                    signedCredential: signedDlCredentialNoIds,
                    vcHolder
                  });
                  disclosedDlCredentialNoIds.push(disclosedDlCredentialNoId);

                  const signedAchievementCredential = await createInitialVc({
                    issuer, vc: achievementCredential
                  });

                  // select full arrays
                  const {
                    disclosedCredential: revealedAchievementCredential1
                  } = await createDisclosedVc({
                    selectivePointers: [
                      '/credentialSubject/achievements/0/sailNumber',
                      '/credentialSubject/achievements/0/sails/0',
                      '/credentialSubject/achievements/0/sails/1',
                      '/credentialSubject/achievements/0/sails/2',
                      '/credentialSubject/achievements/0/sails/3',
                      '/credentialSubject/achievements/0/boards/0',
                      '/credentialSubject/achievements/0/boards/1',
                      '/credentialSubject/achievements/1/sailNumber',
                      '/credentialSubject/achievements/1/sails/0',
                      '/credentialSubject/achievements/1/sails/1',
                      '/credentialSubject/achievements/1/sails/2',
                      '/credentialSubject/achievements/1/sails/3',
                      '/credentialSubject/achievements/1/boards/0',
                      '/credentialSubject/achievements/1/boards/1'
                    ],
                    signedCredential: signedAchievementCredential,
                    vcHolder
                  });
                  disclosedCredentialsWithFullArray.push(
                    revealedAchievementCredential1);

                  // select less than full subarrays
                  const {
                    disclosedCredential: revealedAchievementCredential2
                  } = await createDisclosedVc({
                    selectivePointers: [
                      '/credentialSubject/achievements/0/sails/1',
                      '/credentialSubject/achievements/0/sails/3',
                      '/credentialSubject/achievements/0/boards/0',
                      '/credentialSubject/achievements/0/boards/1',
                      '/credentialSubject/achievements/1/sails/0',
                      '/credentialSubject/achievements/1/sails/2',
                      '/credentialSubject/achievements/1/boards/1'
                    ],
                    signedCredential: signedAchievementCredential,
                    vcHolder
                  });
                  disclosedCredentialsWithLessThanFullSubArray.push(
                    revealedAchievementCredential2);

                  // select w/o first array element
                  const {
                    disclosedCredential: revealedAchievementCredential3
                  } = await createDisclosedVc({
                    selectivePointers: [
                      '/credentialSubject/achievements/0/sails/1',
                      '/credentialSubject/achievements/0/sails/3',
                      '/credentialSubject/achievements/0/boards/0',
                      '/credentialSubject/achievements/0/boards/1',
                      '/credentialSubject/achievements/1/sails/0',
                      '/credentialSubject/achievements/1/sails/2',
                      '/credentialSubject/achievements/1/boards/1'
                    ],
                    signedCredential: signedAchievementCredential,
                    vcHolder
                  });
                  disclosedCredentialsWithoutFirstArrayElement.push(
                    revealedAchievementCredential3);
                }
              }
            }
          });
          it('MUST verify a valid VC with an bbs-2023 proof.',
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
          it('If the "cryptosuite" field is not the string "bbs-2023", ' +
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
