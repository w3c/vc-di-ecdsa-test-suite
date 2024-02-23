/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {verificationFail, verificationSuccess} from './assertions.js';
import {endpoints} from 'vc-test-suite-implementations';
import {getSuiteConfig} from './test-config.js';
import {issueTestData} from './vc-generator/index.js';
import {klona} from 'klona';

const {
  tags,
  credentials
} = getSuiteConfig('ecdsa-rdfc-2019');
// FIXME use keyTypes from getSuiteConfig
const keyTypes = ['P-256', 'P-384'];
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
    let testVectors = new Map();
    before(async function() {
      testVectors = await issueTestData({
        credential: credentials.verify.document,
        suite: 'ecdsa-rdfc-2019',
        keyTypes
      });
    });
    for(const [name, {endpoints: verifiers}] of match) {
      for(const verifier of verifiers) {
        const {
          supportedEcdsaKeyTypes: verifierKeyTypes
        } = verifier.settings;
        const keyTypes = verifierKeyTypes.join(', ');
        // add implementer name and keyTypes to test report
        this.implemented.push(`${name}: ${keyTypes}`);
        describe(`${name}: ${keyTypes}`, function() {
          let supportedVectors = [];
          before(function() {
            // filter the test data to only include VC signed with
            // keyTypes the verifier supports
            supportedVectors = verifierKeyTypes.map(
              (keyType = '') => testVectors.get(keyType.toUpperCase()));
          });
          // wrap the testApi config in an Implementation class
          it('MUST verify a valid VC with an ecdsa-rdfc-2019 proof.',
            async function() {
              this.test.cell = {
                columnId: `${name}: ${keyTypes}`, rowId: this.test.title
              };
              for(const vector of supportedVectors) {
                await verificationSuccess({credential: vector, verifier});
              }
            });
          it('If the "cryptosuite" field is not the string ' +
            '"ecdsa-rdfc-2019" or "ecdsa-jcs-2019", an error MUST be ' +
            'raised.', async function() {
            this.test.cell = {
              columnId: `${name}: ${keyTypes}`, rowId: this.test.title
            };
            for(const vector of supportedVectors) {
              const credential = klona(vector);
              //FIXME add invalid-cryptosuite as a valid cryptosuite name
              //locally so the signature is correct, but the cryptosuite
              //name is incorrect
              credential.proof.cryptosuite = 'invalid-cryptosuite';
              await verificationFail({credential, verifier});
            }
          });
        });
      }
    }
  });
});
