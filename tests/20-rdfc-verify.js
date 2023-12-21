/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import {verificationFail, verificationSuccess} from './assertions.js';
import {
  checkDataIntegrityProofVerifyErrors
} from 'data-integrity-test-suite-assertion';
import {createInitialVc} from './helpers.js';
import {endpoints} from 'vc-test-suite-implementations';
import {issuerName} from './test-config.js';
import {validVc as vc} from './mock-data.js';

const tag = 'ecdsa-rdfc-2019';
// only use implementations with `ecdsa-rdfc-2019` verifiers.
const {match} = endpoints.filterByTag({
  tags: [tag],
  property: 'verifiers'
});

describe('ecdsa-rdfc-2019 (verify)', function() {
  checkDataIntegrityProofVerifyErrors({
    implemented: match,
    isEcdsaTests: true,
    testDescription: 'Data Integrity (ecdsa-rdfc-2019 verifiers)'
  });
  describe('ecdsa-rdfc-2019 (verifiers)', function() {
    let issuers;
    before(async function() {
      const {match} = endpoints.filterByTag({
        tags: [tag],
        property: 'issuers'
      });
      // Uses DB issuer as default issuer to issue a verifiable credential for
      // the verifier tests.
      issuers = match.get(issuerName).endpoints;
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
          const credentials = [];
          beforeEach(async function() {
            for(const issuer of issuers) {
              const {
                supportedEcdsaKeyTypes: issuerSupportedEcdsaKeyTypes
              } = issuer.settings;
              for(const verifierSupportedEcdsaKeyType of
                verifierSupportedEcdsaKeyTypes) {
                if(issuerSupportedEcdsaKeyTypes.includes(
                  verifierSupportedEcdsaKeyType)) {
                  const issuedVc = await createInitialVc({issuer, vc});
                  credentials.push(issuedVc);
                }
              }
            }
          });
          // wrap the testApi config in an Implementation class
          it('MUST verify a valid VC with an ecdsa-rdfc-2019 proof.',
            async function() {
              this.test.cell = {
                columnId: `${name}: ${keyTypes}`, rowId: this.test.title
              };
              for(const credential of credentials) {
                await verificationSuccess({credential, verifier});
              }
            });
          it('If the "cryptosuite" field is not the string ' +
            '"ecdsa-rdfc-2019" or "ecdsa-jcs-2019", an error MUST be ' +
            'raised.', async function() {
            this.test.cell = {
              columnId: `${name}: ${keyTypes}`, rowId: this.test.title
            };
            for(const credential of credentials) {
              credential.proof.cryptosuite = 'invalid-cryptosuite';
              await verificationFail({credential, verifier});
            }
          });
        });
      }
    }
  });
});
