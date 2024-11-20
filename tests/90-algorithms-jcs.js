/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  assertAllUtf8,
  assertDataIntegrityProof,
  assertSecuredCredential
} from './assertions.js';
import {
  generateCredential,
  getProofs,
  isValidDatetime,
  secureCredential,
  setupReportableTestSuite,
  setupRow,
  verifyFail,
  verifySuccess
} from './helpers.js';
import canonicalize from 'json-canon';
import chai from 'chai';
import {ecdsaJcsVectors} from './vectors.js';
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

describe('Algorithms - Create Proof (ecdsa-jcs-2019)', function() {
  setupReportableTestSuite(this);
  this.implemented = [...issuers.keys()];
  for(const [columnId, {endpoints}] of issuers) {
    describe(columnId, function() {
      const [issuer] = endpoints;
      let securedCredential;
      let proof;
      before(async function() {
        securedCredential = await secureCredential(
          {issuer, vc: generateCredential()});
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
      const [verifier] = endpoints;
      beforeEach(setupRow);
      it('The following algorithm specifies how to verify a ' +
        'data integrity proof given an secured data document. ' +
        'Required inputs are an secured data document (map securedDocument). ' +
        'This algorithm returns a verification result.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#verify-proof-ecdsa-rdfc-2019';
        for(const curve of verifier.settings.supportedEcdsaKeyTypes) {
          const testVector = structuredClone(ecdsaJcsVectors[curve]);
          await verifySuccess(verifier, testVector);

          // Slice the proof
          testVector.proof.proofValue =
            testVector.proof.proofValue.slice(0, -1);
          await verifyFail(verifier, testVector);
        }
      });
    });
  }
});

describe('Algorithms - Transformation', function() {
  setupReportableTestSuite(this);
  this.implemented = [...issuers.keys()];
  for(const [columnId, {endpoints}] of issuers) {
    describe(columnId, function() {
      const [issuer] = endpoints;
      let securedCredential;
      let proof;
      before(async function() {
        securedCredential = await secureCredential(
          {issuer, vc: generateCredential()});
        proof = getProofs(securedCredential)[0];
      });
      beforeEach(setupRow);
      it('The proof options MUST contain a type identifier for the ' +
        'cryptographic suite (type) and MAY contain a cryptosuite ' +
        'identifier (cryptosuite).',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-serialization-ecdsa-jcs-2019';
        should.exist(proof.type,
          'Expected a type identifier on the proof.');
      });
      it('The transformation options MUST contain a type identifier ' +
            'for the cryptographic suite (type) and a cryptosuite identifier ' +
            '(cryptosuite).',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#transformation-ecdsa-jcs-2019';
        should.exist(proof.type, 'Expected a type identifier on ' +
                                'the proof.');
        should.exist(proof.cryptosuite,
          'Expected a cryptosuite identifier on the proof.');
      });
      it('Whenever this algorithm encodes strings, ' +
        'it MUST use UTF-8 encoding.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#transformation-ecdsa-jcs-2019';
        assertAllUtf8(proof);
      });
      it('If options.type is not set to the string DataIntegrityProof or ' +
        'options.cryptosuite is not set to the string ecdsa-jcs-2019, ' +
        'an error MUST be raised and SHOULD convey an error type ' +
        'of PROOF_TRANSFORMATION_ERROR.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#transformation-ecdsa-jcs-2019';
        should.exist(proof.type,
          'Expected a type identifier on the proof.');
        should.exist(proof.cryptosuite,
          'Expected a cryptosuite identifier on the proof.');
        proof.type.should.equal('DataIntegrityProof',
          'Expected DataIntegrityProof type.');
        proof.cryptosuite.should.equal('ecdsa-jcs-2019',
          'Expected ecdsa-jcs-2019 cryptosuite.');
      });
    });
  }
});

describe('ecdsa-jcs-2019 - Algorithms - Proof Configuration', function() {
  setupReportableTestSuite(this);
  this.implemented = [...issuers.keys()];
  for(const [columnId, {endpoints}] of issuers) {
    describe(columnId, function() {
      const [issuer] = endpoints;
      let securedCredential;
      let proof;
      before(async function() {
        securedCredential = await secureCredential(
          {issuer, vc: generateCredential()});
        proof = getProofs(securedCredential)[0];
      });
      beforeEach(setupRow);
      it('The proof options MUST contain a type identifier for the ' +
            'cryptographic suite (type) and MUST contain a cryptosuite ' +
            'identifier (cryptosuite).',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-configuration-ecdsa-jcs-2019';
        should.exist(proof.type,
          'Expected a type identifier on the proof.');
        should.exist(proof.cryptosuite,
          'Expected a cryptosuite identifier on the proof.');
      });
      it('If proofConfig.type is not set to DataIntegrityProof ' +
            'and/or proofConfig.cryptosuite is not set to ecdsa-jcs-2019, ' +
            'an error MUST be raised and SHOULD convey an error type ' +
            'of PROOF_GENERATION_ERROR.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-configuration-ecdsa-jcs-2019';
        should.exist(proof.type,
          'Expected a type identifier on the proof.');
        should.exist(proof.cryptosuite,
          'Expected a cryptosuite identifier on the proof.');
        proof.type.should.equal('DataIntegrityProof',
          'Expected DataIntegrityProof type.');
        proof.cryptosuite.should.equal('ecdsa-jcs-2019',
          'Expected ecdsa-jcs-2019 cryptosuite.');
      });
      it('If proofConfig.created is set and if the value is not a ' +
            'valid [XMLSCHEMA11-2] datetime, an error MUST be raised and ' +
            'SHOULD convey an error type of PROOF_GENERATION_ERROR.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-configuration-ecdsa-jcs-2019';
        if(proof?.created) {
          isValidDatetime(proof.created).should.equal(
            true,
            'Expected created value to be a valid datetime string.'
          );
        }
      });
    });
  }
});

describe('ecdsa-jcs-2019 - Algorithms - Proof Serialization', function() {
  setupReportableTestSuite(this);
  this.implemented = [...issuers.keys()];
  for(const [columnId, {endpoints}] of issuers) {
    describe(columnId, function() {
      const [issuer] = endpoints;
      let securedCredential;
      let proof;
      before(async function() {
        securedCredential = await secureCredential(
          {issuer, vc: generateCredential()});
        proof = getProofs(securedCredential)[0];
      });
      beforeEach(setupRow);
      it('The proof options MUST contain a type identifier for the ' +
        'cryptographic suite (type) and MAY contain a cryptosuite identifier ' +
        '(cryptosuite).',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-serialization-ecdsa-jcs-2019';
        should.exist(proof.type,
          'Expected a type identifier on the proof.');
      });
    });
  }
});
