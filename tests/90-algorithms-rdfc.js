/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  generateCredential,
  isValidDatetime,
<<<<<<< HEAD
  proofExists,
  secureCredential,
=======
<<<<<<< HEAD
  isValidUtf8,
=======
  proofExists,
  secureCredential,
>>>>>>> 265e798 (improve proof handling when asserting a secured credential)
>>>>>>> ec4cd6a (improve proof handling when asserting a secured credential)
  setupReportableTestSuite,
  setupRow
} from './helpers.js';
import {
  assertAllUtf8
} from './assertions.js';
import chai from 'chai';
import {endpoints} from 'vc-test-suite-implementations';

const should = chai.should();

const cryptosuites = [
  'ecdsa-rdfc-2019',
];

const {match: issuers} = endpoints.filterByTag({
  tags: cryptosuites,
  property: 'issuers'
});

describe('Algorithms - Transformation (ecdsa-rdfc-2019)', function() {
  setupReportableTestSuite(this);
  this.implemented = [...issuers.keys()];
  for(const [columnId, {endpoints}] of issuers) {
    describe(columnId, function() {
      const [issuer] = endpoints;
<<<<<<< HEAD
      let securedCredential;
      before(async function() {
        securedCredential = await secureCredential(
          {issuer, vc: generateCredential()});
=======
<<<<<<< HEAD
      let issuedVc;
      let proofs;
      let rdfc2019Proofs = [];
      before(async function() {
        issuedVc = await createInitialVc({issuer, vc: validCredential});
        proofs = getProofs(issuedVc);
        if(proofs?.length) {
          rdfc2019Proofs = proofs.filter(
            proof => proof?.cryptosuite === cryptosuite);
        }
=======
      let securedCredential;
      let proofs;
      before(async function() {
        securedCredential = await secureCredential(
          {issuer, vc: generateCredential()});
        proofs = getProofs(securedCredential);
>>>>>>> 265e798 (improve proof handling when asserting a secured credential)
>>>>>>> ec4cd6a (improve proof handling when asserting a secured credential)
      });
      beforeEach(setupRow);
      it('The transformation options MUST contain a type identifier ' +
          'for the cryptographic suite (type) and a cryptosuite identifier ' +
          '(cryptosuite).',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#transformation-ecdsa-rdfc-2019';
<<<<<<< HEAD
        const proof = proofExists(securedCredential);
=======
<<<<<<< HEAD
        assertBefore();
        for(const proof of rdfc2019Proofs) {
          should.exist(proof.type, 'Expected a type identifier on ' +
                                  'the proof.');
          should.exist(proof.cryptosuite,
            'Expected a cryptosuite identifier on the proof.');
        }
=======
        const proof = proofExists(proofs);
>>>>>>> ec4cd6a (improve proof handling when asserting a secured credential)
        should.exist(proof.type,
          'Expected a type identifier on the proof.');
        should.exist(proof.cryptosuite,
          'Expected a cryptosuite identifier on the proof.');
<<<<<<< HEAD
=======
>>>>>>> 265e798 (improve proof handling when asserting a secured credential)
>>>>>>> ec4cd6a (improve proof handling when asserting a secured credential)
      });
      it('Whenever this algorithm encodes strings, ' +
          'it MUST use UTF-8 encoding.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#transformation-ecdsa-rdfc-2019';
<<<<<<< HEAD
        const proof = proofExists(securedCredential);
        assertAllUtf8(proof);
      });
      it('If options.type is not set to the string DataIntegrityProof or ' +
        'options.cryptosuite is not set to the string ecdsa-rdfc-2019, ' +
        'an error MUST be raised and SHOULD convey an error type ' +
        'of PROOF_TRANSFORMATION_ERROR.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#transformation-ecdsa-rdfc-2019';
        const proof = proofExists(securedCredential);
        should.exist(proof.type,
          'Expected a type identifier on the proof.');
        should.exist(proof.cryptosuite,
          'Expected a cryptosuite identifier on the proof.');
        proof.type.should.equal('DataIntegrityProof',
          'Expected DataIntegrityProof type.');
        proof.cryptosuite.should.equal('ecdsa-rdfc-2019',
          'Expected ecdsa-rdfc-2019 cryptosuite.');
      });
    });
  }
});

describe('Algorithms - Proof Configuration (ecdsa-rdfc-2019)', function() {
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
      it('The proof options MUST contain a type identifier for the ' +
        'cryptographic suite (type) and MUST contain a cryptosuite ' +
        'identifier (cryptosuite).',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-configuration-ecdsa-rdfc-2019';
        const proof = proofExists(securedCredential);
        should.exist(proof.type,
          'Expected a type identifier on the proof.');
        should.exist(proof.cryptosuite,
          'Expected a cryptosuite identifier on the proof.');
      });
      it('If proofConfig.type is not set to DataIntegrityProof ' +
        'and/or proofConfig.cryptosuite is not set to ecdsa-rdfc-2019, ' +
        'an error MUST be raised and SHOULD convey an error type ' +
        'of PROOF_GENERATION_ERROR.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-configuration-ecdsa-rdfc-2019';
        const proof = proofExists(securedCredential);
        should.exist(proof.type,
          'Expected a type identifier on the proof.');
        should.exist(proof.cryptosuite,
          'Expected a cryptosuite identifier on the proof.');
        proof.type.should.equal('DataIntegrityProof',
          'Expected DataIntegrityProof type.');
        proof.cryptosuite.should.equal('ecdsa-rdfc-2019',
          'Expected ecdsa-rdfc-2019 cryptosuite.');
      });
      it('If proofConfig.created is set and if the value is not a ' +
        'valid [XMLSCHEMA11-2] datetime, an error MUST be raised and ' +
        'SHOULD convey an error type of PROOF_GENERATION_ERROR.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-configuration-ecdsa-rdfc-2019';
        const proof = proofExists(securedCredential);
        if(proof?.created) {
          isValidDatetime(proof.created).should.equal(
=======
<<<<<<< HEAD
        assertBefore();
        for(const proof of rdfc2019Proofs) {
          should.exist(proof?.proofValue,
            'Expected proofValue to exist.');
          isValidUtf8(proof.proofValue).should.equal(
>>>>>>> ec4cd6a (improve proof handling when asserting a secured credential)
            true,
            'Expected created value to be a valid datetime string.'
          );
        }
=======
        const proof = proofExists(proofs);
        assertAllUtf8(proof);
>>>>>>> 265e798 (improve proof handling when asserting a secured credential)
      });
<<<<<<< HEAD
=======
      it('If options.type is not set to the string DataIntegrityProof or ' +
              'options.cryptosuite is not set to the string ecdsa-rdfc-2019, ' +
              'an error MUST be raised and SHOULD convey an error type ' +
              'of PROOF_TRANSFORMATION_ERROR.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#transformation-ecdsa-rdfc-2019';
<<<<<<< HEAD
        assertBefore();
        for(const proof of rdfc2019Proofs) {
          should.exist(proof.type,
            'Expected a type identifier on the proof.');
          should.exist(proof.cryptosuite,
            'Expected a cryptosuite identifier on the proof.');
          proof.type.should.equal('DataIntegrityProof',
            'Expected DataIntegrityProof type.');
          proof.cryptosuite.should.equal('ecdsa-rdfc-2019',
            'Expected ecdsa-rdfc-2019 cryptosuite.');
=======
        const proof = proofExists(proofs);
        should.exist(proof.type,
          'Expected a type identifier on the proof.');
        should.exist(proof.cryptosuite,
          'Expected a cryptosuite identifier on the proof.');
        proof.type.should.equal('DataIntegrityProof',
          'Expected DataIntegrityProof type.');
        proof.cryptosuite.should.equal('ecdsa-rdfc-2019',
          'Expected ecdsa-rdfc-2019 cryptosuite.');
      });
    });
  }
});

describe('Algorithms - Proof Configuration (ecdsa-rdfc-2019)', function() {
  setupReportableTestSuite(this);
  this.implemented = [...issuers.keys()];
  for(const [columnId, {endpoints}] of issuers) {
    describe(columnId, function() {
      const [issuer] = endpoints;
      let securedCredential;
      let proofs;
      before(async function() {
        securedCredential = await secureCredential(
          {issuer, vc: generateCredential()});
        proofs = getProofs(securedCredential);
      });
      beforeEach(setupRow);
      it('The proof options MUST contain a type identifier for the ' +
        'cryptographic suite (type) and MUST contain a cryptosuite ' +
        'identifier (cryptosuite).',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-configuration-ecdsa-rdfc-2019';
        const proof = proofExists(proofs);
        should.exist(proof.type,
          'Expected a type identifier on the proof.');
        should.exist(proof.cryptosuite,
          'Expected a cryptosuite identifier on the proof.');
      });
      it('If proofConfig.type is not set to DataIntegrityProof ' +
        'and/or proofConfig.cryptosuite is not set to ecdsa-rdfc-2019, ' +
        'an error MUST be raised and SHOULD convey an error type ' +
        'of PROOF_GENERATION_ERROR.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-configuration-ecdsa-rdfc-2019';
        const proof = proofExists(proofs);
        should.exist(proof.type,
          'Expected a type identifier on the proof.');
        should.exist(proof.cryptosuite,
          'Expected a cryptosuite identifier on the proof.');
        proof.type.should.equal('DataIntegrityProof',
          'Expected DataIntegrityProof type.');
        proof.cryptosuite.should.equal('ecdsa-rdfc-2019',
          'Expected ecdsa-rdfc-2019 cryptosuite.');
      });
      it('If proofConfig.created is set and if the value is not a ' +
        'valid [XMLSCHEMA11-2] datetime, an error MUST be raised and ' +
        'SHOULD convey an error type of PROOF_GENERATION_ERROR.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-configuration-ecdsa-rdfc-2019';
        const proof = proofExists(proofs);
        if(proof?.created) {
          isValidDatetime(proof.created).should.equal(
            true,
            'Expected created value to be a valid datetime string.'
          );
>>>>>>> 265e798 (improve proof handling when asserting a secured credential)
        }
      });
>>>>>>> ec4cd6a (improve proof handling when asserting a secured credential)
    });
  }
});

describe('Algorithms - Proof Serialization (ecdsa-rdfc-2019)', function() {
  setupReportableTestSuite(this);
  this.implemented = [...issuers.keys()];
  for(const [columnId, {endpoints}] of issuers) {
    describe(columnId, function() {
      const [issuer] = endpoints;
<<<<<<< HEAD
      let securedCredential;
      before(async function() {
        securedCredential = await secureCredential(
          {issuer, vc: generateCredential()});
=======
<<<<<<< HEAD
      let issuedVc;
      let proofs;
      let rdfc2019Proofs = [];
      before(async function() {
        issuedVc = await createInitialVc({issuer, vc: validCredential});
        proofs = getProofs(issuedVc);
        if(proofs?.length) {
          rdfc2019Proofs = proofs.filter(
            proof => proof?.cryptosuite === cryptosuite);
        }
=======
      let securedCredential;
      let proofs;
      before(async function() {
        securedCredential = await secureCredential(
          {issuer, vc: generateCredential()});
        proofs = getProofs(securedCredential);
>>>>>>> 265e798 (improve proof handling when asserting a secured credential)
>>>>>>> ec4cd6a (improve proof handling when asserting a secured credential)
      });
      beforeEach(setupRow);
      it('The proof options MUST contain a type identifier for the ' +
        'cryptographic suite (type) and MAY contain a cryptosuite identifier ' +
        '(cryptosuite).',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-serialization-ecdsa-rdfc-2019';
<<<<<<< HEAD
        const proof = proofExists(securedCredential);
        should.exist(proof.type,
          'Expected a type identifier on the proof.');
=======
<<<<<<< HEAD
        assertBefore();
        for(const proof of rdfc2019Proofs) {
          should.exist(proof.type,
            'Expected a type identifier on the proof.');
        }
=======
        const proof = proofExists(proofs);
        should.exist(proof.type,
          'Expected a type identifier on the proof.');
>>>>>>> 265e798 (improve proof handling when asserting a secured credential)
>>>>>>> ec4cd6a (improve proof handling when asserting a secured credential)
      });
    });
  }
});
