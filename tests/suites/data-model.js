/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {createInitialVc, endpointCheck} from '../helpers.js';
import {
  assertions,
} from 'data-integrity-test-suite-assertion';
import {expect} from 'chai';

export function dataModelSuite({
  issuers,
  suiteName,
  keyType,
  vcVersion,
  credential,
  mandatoryPointers
}) {
  return describe(`${suiteName} - Data Model - VC ${vcVersion}`, function() {
    this.matrix = true;
    this.report = true;
    this.implemented = [...issuers];
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Implementation';
    for(const [name, {endpoints}] of issuers) {
      const [issuer] = endpoints;
      // does the endpoint support this test?
      if(!endpointCheck({endpoint: issuer, keyType, vcVersion})) {
        continue;
      }
      describe(`${name}: ${keyType}`, function() {
        let securedCredential = null;
        let proofs = [];
        before(async function() {
          securedCredential = await createInitialVc({
            issuer,
            vcVersion,
            vc: credential,
            mandatoryPointers
          });
          if(securedCredential) {
            proofs = Array.isArray(securedCredential.proof) ?
              securedCredential?.proof : [securedCredential?.proof];
            // only test proofs that match the relevant cryptosuite
            proofs = proofs.filter(p => p?.cryptosuite === suiteName);
          }
        });
        beforeEach(function() {
          this.currentTest.cell = {
            rowId: this.currentTest.title,
            columnId: this.currentTest.parent.title
          };
        });
        function assertBefore() {
          expect(
            securedCredential,
            `Expected issuer ${name}: ${keyType} to issue a VC`
          ).to.exist;
          expect(
            securedCredential,
            'Expected VC to be an object'
          ).to.be.an('object');
        }
        it('The publicKeyMultibase value of the verification method MUST ' +
          'start with the base-58-btc prefix (z), as defined in the ' +
          'Multibase section of Controller Documents 1.0. A ',
        async function() {
          this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#data-model:~:text=The%20publicKeyMultibase%20value%20of%20the%20verification%20method%20MUST%20start%20with%20the%20base%2D58%2Dbtc%20prefix%20(z)%2C%20as%20defined%20in%20the%20Multibase%20section%20of%20Controller%20Documents%201.0.';
          assertBefore();
          for(const proof of proofs) {
            expect(proof.verificationMethod).to.exist;
            expect(proof.verificationMethod).to.be.a('string');
            expect(
              assertions.shouldBeBs58(proof.verificationMethod),
              'Expected "proof.verificationMethod" to be Base58 encoded'
            ).to.be.true;
          }
        });
        it('Any other encoding MUST NOT be allowed. (verificationMethod)',
          async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#multikey';
            assertBefore();
            for(const proof of proofs) {
              expect(proof.verificationMethod).to.exist;
              expect(proof.verificationMethod).to.be.a('string');
              expect(
                assertions.shouldBeBs58(proof.verificationMethod),
                'Expected "proof.verificationMethod" to be Base58 encoded'
              ).to.be.true;
            }
          });
        it('The type property MUST be DataIntegrityProof.', async function() {
          this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#multikey:~:text=The%20type%20property%20MUST%20be%20DataIntegrityProof.';
          assertBefore();
          for(const proof of proofs) {
            expect(proof.type).to.exist;
            expect(proof.type).to.be.a('string');
            expect(proof.type).to.equal('DataIntegrityProof');
          }
        });
        it('The cryptosuite property MUST be ecdsa-rdfc-2019, ' +
          'ecdsa-jcs-2019, or ecdsa-sd-2023.', async function() {
          this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#multikey:~:text=The%20cryptosuite%20property%20MUST%20be%20ecdsa%2Drdfc%2D2019%2C%20ecdsa%2Djcs%2D2019%2C%20or%20ecdsa%2Dsd%2D2023.';
          assertBefore();
          for(const proof of proofs) {
            expect(proof.cryptosuite).to.exist;
            expect(proof.cryptosuite).to.be.a('string');
            expect(proof.cryptosuite).to.be.oneOf(
              ['ecdsa-rdfc-2019', 'edcsa-jcs-2019', 'ecdsa-sd-2023']);
          }
        });
      });
    }
  });
}
