/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  assertIssuedVc,
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

describe('Data Model - Verification Methods (Multikey)', function() {
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
      it('The publicKeyMultibase value of the verification method ' +
        'MUST start with the base-58-btc prefix (z), as defined in ' +
        'the Multibase section of Controller Documents 1.0.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#dataintegrityproof';
        assertIssuedVc(issuedVc, proofs, ecdsaProofs);
      });
      it('A Multibase-encoded ECDSA 256-bit public key value or an ' +
        'ECDSA 384-bit public key value follows, as defined in the Multikey ' +
        'section of Controller Documents 1.0. Any other encoding ' +
        'MUST NOT be allowed.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#dataintegrityproof';
        assertIssuedVc(issuedVc, proofs, ecdsaProofs);
      });
    });
  }
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
      it('The type property MUST be DataIntegrityProof.',
        async function() {
          this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#dataintegrityproof';
          assertIssuedVc(issuedVc, proofs, ecdsaProofs);
        });
      it('The cryptosuite property MUST be ecdsa-rdfc-2019, ' +
          'ecdsa-jcs-2019, or ecdsa-sd-2023.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#dataintegrityproof';
        assertIssuedVc(issuedVc, proofs, ecdsaProofs);
      });
    });
  }
});
