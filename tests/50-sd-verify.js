/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import {createDisclosedVc, createInitialVc} from './helpers.js';
import {verificationFail, verificationSuccess} from './assertions.js';
import {
  checkDataIntegrityProofVerifyErrors
} from 'data-integrity-test-suite-assertion';
import {endpoints} from 'vc-test-suite-implementations';
import {validVc as vc} from './validVc.js';

const tag = 'ecdsa-sd-2023';
// only use implementations with `ecdsa-sd-2023` verifiers.
const {match} = endpoints.filterByTag({
  tags: [tag],
  property: 'verifiers'
});

describe('ecdsa-sd-2023 (verify)', function() {
  checkDataIntegrityProofVerifyErrors({
    implemented: match,
    isEcdsaTests: true,
    testDescription: 'Data Integrity (ecdsa-sd-2023 verifiers)'
  });
  describe('ecdsa-sd-2023 (verifiers)', function() {
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
          beforeEach(async function() {
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
                  const {data: disclosedCredential} = await createDisclosedVc({
                    selectivePointers: ['/credentialSubject/id'],
                    signedCredential: signedVc,
                    vcHolder
                  });
                  disclosedCredentials.push(disclosedCredential);
                }
              }
            }
          });
          // wrap the testApi config in an Implementation class
          it('MUST verify a valid VC with an ecdsa-sd-2023 proof.',
            async function() {
              this.test.cell = {
                columnId: `${name}: ${keyTypes}`, rowId: this.test.title
              };
              for(const credential of disclosedCredentials) {
                await verificationSuccess({credential, verifier});
              }
            });
          it('If the "cryptosuite" field is not the string "ecdsa-sd-2023", ' +
            'an error MUST be raised.', async function() {
            this.test.cell = {
              columnId: `${name}: ${keyTypes}`, rowId: this.test.title
            };
            for(const credential of disclosedCredentials) {
              credential.proof.cryptosuite = 'invalid-cryptosuite';
              await verificationFail({credential, verifier});
            }
          });
        });
      }
    }
  });
});
