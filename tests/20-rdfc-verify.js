/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {config, createInitialVc} from './helpers.js';
import {verificationFail, verificationSuccess} from './assertions.js';
import {
  checkDataIntegrityProofVerifyErrors
} from 'data-integrity-test-suite-assertion';
import {endpoints} from 'vc-test-suite-implementations';
import {issuerName} from './test-config.js';
import {validVc as vc} from './mock-data.js';

const {tags} = config.suites['ecdsa-rdfc-2019'];
// only use implementations with `ecdsa-rdfc-2019` verifiers.
const {match} = endpoints.filterByTag({
  tags: [...tags],
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
        tags: [...tags],
        property: 'issuers'
      });
      // Uses 'Digital Bazaar' as default issuer to issue a verifiable
      // credential for the verifier tests.
      issuers = match.get(issuerName).endpoints;
    });
    // this will tell the report
    // to make an interop matrix with this suite
    this.matrix = true;
    this.report = true;
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Verifier';
    this.implemented = [];
    for(const [name, {endpoints: verifiers}] of match) {
      for(const verifier of verifiers) {
        const {
          supportedEcdsaKeyTypes: verifierSupportedEcdsaKeyTypes
        } = verifier.settings;
        const keyTypes = verifierSupportedEcdsaKeyTypes.join(', ');
        // add implementer name and keyTypes to test report
        this.implemented.push(`${name}: ${keyTypes}`);
        describe(`${name}: ${keyTypes}`, function() {
          const credentials = [];
          beforeEach(async function() {
            // use each issuer to create test data for verify suite
            for(const issuer of issuers) {
              const {
                supportedEcdsaKeyTypes: issuerSupportedEcdsaKeyTypes
              } = issuer.settings;
              // issue vc for each supported key type
              for(const verifierSupportedEcdsaKeyType of
                verifierSupportedEcdsaKeyTypes) {
                if(issuerSupportedEcdsaKeyTypes.includes(
                  verifierSupportedEcdsaKeyType)) {
                  const issuedVc = await createInitialVc({issuer, vc});
                  // add each vc to resulting test data
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
