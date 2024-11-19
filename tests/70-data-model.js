/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  createInitialVc,
  createValidCredential,
  getProofs,
  setupReportableTestSuite,
  setupRow
} from './helpers.js';
import chai from 'chai';
import {endpoints} from 'vc-test-suite-implementations';

const should = chai.should();

const cryptosuites = [
  'ecdsa-sd-2023',
  'ecdsa-jcs-2019',
  'ecdsa-rdfc-2019',
];

const {match: issuers} = endpoints.filterByTag({
  tags: cryptosuites,
  property: 'issuers'
});

describe('Data Model - Proof Representations', function() {
  setupReportableTestSuite(this);
  this.implemented = [...issuers.keys()];
  let validCredential;
  before(async function() {
    validCredential = await createValidCredential();
  });
  for(const [columnId, {endpoints}] of issuers) {
    describe(columnId, function() {
      const [issuer] = endpoints;
      let issuedVc;
      let proofs;
      let ecdsaProofs = [];
      before(async function() {
        issuedVc = await createInitialVc({issuer, vc: validCredential});
        proofs = getProofs(issuedVc);
        if(proofs?.length) {
          ecdsaProofs = proofs.filter(
            proof => cryptosuites.includes(proof?.cryptosuite));
        }
      });
      beforeEach(setupRow);
      const assertBefore = () => {
        should.exist(issuedVc,
          'Expected issuer to have issued a credential.');
        should.exist(proofs,
          'Expected credential to have a proof.');
        ecdsaProofs.length.should.be.gte(1,
          'Expected at least one ecdsa cryptosuite.');
      };
      it('The type property MUST be DataIntegrityProof.',
        async function() {
          this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#dataintegrityproof';
          assertBefore();
        });
      it('The cryptosuite property MUST be ecdsa-rdfc-2019, ' +
          'ecdsa-jcs-2019, or ecdsa-sd-2023.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#dataintegrityproof';
        assertBefore();
      });
    });
  }
});
