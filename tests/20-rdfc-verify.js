/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {verificationFail, verificationSuccess} from './assertions.js';
import {endpoints} from 'vc-test-suite-implementations';
import {generateTestData} from './vc-generator/index.js';
import {getSuiteConfig} from './test-config.js';

const {
  tags,
  credentials
} = getSuiteConfig('ecdsa-rdfc-2019');

// only use implementations with `ecdsa-rdfc-2019` verifiers.
const {match} = endpoints.filterByTag({
  tags: [...tags],
  property: 'verifiers'
});

describe('ecdsa-rdfc-2019 (verify)', function() {
  describe('ecdsa-rdfc-2019 (verifiers)', function() {
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
          supportedEcdsaKeyTypes: verifierKeyTypes
        } = verifier.settings;
        const keyTypes = verifierKeyTypes.join(', ');
        // add implementer name and keyTypes to test report
        this.implemented.push(`${name}: ${keyTypes}`);
        describe(`${name}: ${keyTypes}`, function() {
          let testInputs = [];
          beforeEach(async function() {
            testInputs = await generateTestData({
              credential: credentials.verify.document,
              suite: 'ecdsa-rdfc-2019'
            });
          });
          // wrap the testApi config in an Implementation class
          it('MUST verify a valid VC with an ecdsa-rdfc-2019 proof.',
            async function() {
              this.test.cell = {
                columnId: `${name}: ${keyTypes}`, rowId: this.test.title
              };
              for(const credential of testInputs) {
                await verificationSuccess({credential, verifier});
              }
            });
          it('If the "cryptosuite" field is not the string ' +
            '"ecdsa-rdfc-2019" or "ecdsa-jcs-2019", an error MUST be ' +
            'raised.', async function() {
            this.test.cell = {
              columnId: `${name}: ${keyTypes}`, rowId: this.test.title
            };
            for(const credential of testInputs) {
              credential.proof.cryptosuite = 'invalid-cryptosuite';
              await verificationFail({credential, verifier});
            }
          });
        });
      }
    }
  });
});
