/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  generateCredential,
  multikeyFromVerificationMethod,
  proofExists,
  secureCredential,
  setupReportableTestSuite,
  setupRow
} from './helpers.js';
import {
  assertDataIntegrityProof
} from './assertions.js';
import chai from 'chai';
import {endpoints} from 'vc-test-suite-implementations';
import {expect} from 'chai';

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
  for(const [columnId, {endpoints}] of issuers) {
    describe(columnId, function() {
      const [issuer] = endpoints;
      let securedCredential;
      before(async function() {
        securedCredential = await secureCredential(
          {issuer, vc: generateCredential()});
      });
      beforeEach(setupRow);
      it('The publicKeyMultibase value of the verification method ' +
        'MUST start with the base-58-btc prefix (z), as defined in ' +
        'the Multibase section of Controller Documents 1.0.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#dataintegrityproof';
        const proof = proofExists(securedCredential);
        const verificationMethod = proof.verificationMethod;
        // Only did key is supported
        const keyType = issuer.settings.supportedEcdsaKeyTypes[0];
        const multikey =
          await multikeyFromVerificationMethod(verificationMethod, keyType);
        expect(multikey.startsWith('z')).to.be.true;
      });
      it('A Multibase-encoded ECDSA 256-bit public key value or an ' +
        'ECDSA 384-bit public key value follows, as defined in the Multikey ' +
        'section of Controller Documents 1.0. Any other encoding ' +
        'MUST NOT be allowed.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#dataintegrityproof';
        const proof = proofExists(securedCredential);
        const verificationMethod = proof.verificationMethod;
        // Only did key is supported
        const keyType = issuer.settings.supportedEcdsaKeyTypes[0];
        const multikey =
          await multikeyFromVerificationMethod(verificationMethod, keyType);
        expect(multikey).to.be.exist;
      });
    });
  }
});

describe('Data Model - Proof Representations', function() {
  setupReportableTestSuite(this);
  this.implemented = [...issuers.keys()];
  for(const [columnId, {endpoints}] of issuers) {
    describe(columnId, function() {
      const [issuer] = endpoints;
      let securedCredential;
      before(async function() {
        securedCredential = await secureCredential(
          {issuer, vc: generateCredential()});
      });
      beforeEach(setupRow);
      it('A proof contains the attributes specified in the ' +
        'Proofs section of [VC-DATA-INTEGRITY].',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#dataintegrityproof';
        const proof = proofExists(securedCredential);
        assertDataIntegrityProof(proof);
      });
      it('The type property MUST be DataIntegrityProof.',
        async function() {
          this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#dataintegrityproof';
          const proof = proofExists(securedCredential);
          should.exist(proof.type,
            'Expected a type on the proof.');
          proof.type.should.equal('DataIntegrityProof',
            'Expected DataIntegrityProof type.');
        });
      it('The cryptosuite property MUST be ecdsa-rdfc-2019, ' +
        'ecdsa-jcs-2019, or ecdsa-sd-2023.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#dataintegrityproof';
        const proof = proofExists(securedCredential);
        should.exist(proof.cryptosuite,
          'Expected a cryptosuite identifier on the proof.');
        proof.cryptosuite.should.be.oneOf(cryptosuites,
          `Expected cryptosuite for be one of ${cryptosuites}.`);
      });
    });
  }
});
