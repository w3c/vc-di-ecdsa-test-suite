/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  assertDataIntegrityProof,
  assertSecuredCredential
} from './assertions.js';
import {
  baseCredential,
  getProofs,
  secureCredential,
  setupReportableTestSuite,
  setupRow
} from './helpers.js';
import canonicalize from 'json-canon';
import chai from 'chai';
import {endpoints} from 'vc-test-suite-implementations';
import {expect} from 'chai';

const should = chai.should();

const cryptosuites = [
  'ecdsa-jcs-2019',
];

const {match: issuers} = endpoints.filterByTag({
  tags: cryptosuites,
  property: 'issuers'
});

const {match: verifiers} = endpoints.filterByTag({
  tags: cryptosuites,
  property: 'verifiers'
});

describe('Create Proof (ecdsa-jcs-2019)', function() {
  setupReportableTestSuite(this);
  this.implemented = [...issuers.keys()];
  for(const [columnId, {endpoints}] of issuers) {
    describe(columnId, function() {
      const [issuer] = endpoints;
      let securedCredential;
      let proof;
      before(async function() {
        securedCredential = await secureCredential(
          {issuer, vc: baseCredential()});
        proof = getProofs(securedCredential)[0];
      });
      beforeEach(setupRow);
      it('The following algorithm specifies how to create a ' +
        'data integrity proof given an unsecured data document. ' +
        'Required inputs are an unsecured data document ' +
        '(map unsecuredDocument), and a set of proof options ' +
        '(map options). A data integrity proof (map), or an error, ' +
        'is produced as output.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#create-proof-ecdsa-jcs-2019';
        assertSecuredCredential(securedCredential);
        assertDataIntegrityProof(proof, 'ecdsa-jcs-2019');
      });
      it('If unsecuredDocument.@context is present, ' +
        'set proof.@context to unsecuredDocument.@context.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#create-proof-ecdsa-jcs-2019';
        should.exist(proof['@context'],
          'Expected proof to have context.');
        canonicalize(proof['@context']).should.equal(
          canonicalize(securedCredential['@context']),
          'Expected proof context to match document context.'
        );
      });
      it('Let proof.proofValue be a base58-btc-encoded ' +
        'Multibase value of the proofBytes.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#create-proof-ecdsa-jcs-2019';
        should.exist(proof.proofValue,
          'Expected proof to have proofValue.');
        expect(proof.proofValue.startsWith('z')).to.be.true;
      });
    });
  }
});

describe('Algorithms - Verify Proof (ecdsa-jcs-2019)', function() {
  setupReportableTestSuite(this);
  for(const [columnId, {endpoints}] of verifiers) {
    describe(columnId, function() {
      const [issuer] = issuers.get(columnId).endpoints;
      const [verifier] = endpoints;
      let securedCredential;
      before(async function() {
        securedCredential = await secureCredential(
          {issuer, vc: baseCredential()});
      });
      beforeEach(setupRow);
      it('',
        async function() {
          this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#verify-proof-ecdsa-rdfc-2019';
        });
    });
  }
});
