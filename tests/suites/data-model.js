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
            proofs = Array.isArray(securedCredential.proofs) ?
              securedCredential?.proofs : [securedCredential?.proofs];
            // only test proofs that match the relevant cryptosuite
            proofs.filter(p => p.cryptosuite === suiteName);
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
          'Multibase section of Controller Documents 1.0. A ' +
          'Multibase-encoded Ed25519 256-bit public key value follows, as ' +
          'defined in the Multikey section of Controller Documents 1.0.',
        async function() {
          this.test.link = 'https://w3c.github.io/vc-di-eddsa/#data-model:~:text=in%20this%20specification.-,The%20publicKeyMultibase%20value%20of%20the%20verification%20method%20MUST%20start%20with%20the%20base%2D58%2Dbtc%20prefix,-(z)%2C%20as';
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
            this.test.link = 'https://w3c.github.io/vc-di-eddsa/#data-model:~:text=of%20Controller%20Documents%201.0.-,Any%20other%20encoding%20MUST%20NOT%20be%20allowed.,-Developers%20are%20advised%20to%20not';
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
          this.test.link = 'https://w3c.github.io/vc-di-eddsa/#data-model:~:text=The%20type%20property%20MUST%20be%20DataIntegrityProof.';
          assertBefore();
          for(const proof of proofs) {
            expect(proof.type).to.exist;
            expect(proof.type).to.be.a('string');
            expect(proof.type).to.equal('DataIntegrityProof');
          }
        });
        it('The cryptosuite property of the proof MUST be eddsa-rdfc-2022 or ' +
          'eddsa-jcs-2022.', async function() {
          this.test.link = 'https://w3c.github.io/vc-di-eddsa/#data-model:~:text=The%20cryptosuite%20property%20of%20the%20proof%20MUST%20be%20eddsa%2Drdfc%2D2022%20or%20eddsa%2Djcs%2D2022.';
          assertBefore();
          for(const proof of proofs) {
            expect(proof.cryptosuite).to.exist;
            expect(proof.cryptosuite).to.be.a('string');
            expect(proof.cryptosuite).to.be.oneOf(
              ['eddsa-rdfc-2022', 'eddsa-jcs-2022']);
          }
        });
        it('The proofValue property of the proof MUST be a detached EdDSA ' +
          'signature produced according to [RFC8032], encoded using the ' +
          'base-58-btc header and alphabet as described in the Multibase ' +
          'section of Controller Documents 1.0.', async function() {
          this.test.link = 'https://w3c.github.io/vc-di-eddsa/#data-model:~:text=The%20proofValue%20property%20of%20the%20proof%20MUST%20be%20a%20detached%20EdDSA%20signature%20produced%20according%20to%20%5BRFC8032%5D%2C%20encoded%20using%20the%20base%2D58%2Dbtc%20header%20and%20alphabet%20as%20described%20in%20the%20Multibase%20section%20of%20Controller%20Documents%201.0.';
          assertBefore();
          for(const proof of proofs) {
            expect(proof.proofValue).to.exist;
            expect(proof.proofValue).to.be.a('string');
            expect(
              assertions.shouldBeBs58(proof.proofValue),
              'Expected "proof.proofValue" to be Base58 encoded'
            ).to.be.true;
          }
        });
      });
    }
  });
}
