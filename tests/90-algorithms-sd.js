/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  assertAllUtf8,
  assertCryptosuiteProof,
  assertDataIntegrityProof
} from './assertions.js';
import {
  generateCredential,
  inspectSdProofValue,
  isValidDatetime,
  proofExists,
  secureCredential,
  setupReportableTestSuite,
  setupRow,
} from './helpers.js';
import chai from 'chai';
import {endpoints} from 'vc-test-suite-implementations';
import {expect} from 'chai';

const should = chai.should();

const cryptosuites = [
  'ecdsa-sd-2023',
];

const {match: issuers} = endpoints.filterByTag({
  tags: cryptosuites,
  property: 'issuers'
});

const {match: verifiers} = endpoints.filterByTag({
  tags: cryptosuites,
  property: 'verifiers'
});

describe('Algorithms - Create Base Proof (ecdsa-sd-2023)', function() {
  setupReportableTestSuite(this);
  this.implemented = [...issuers.keys()];
  for(const [columnId, {endpoints}] of issuers) {
    describe(columnId, function() {
      const [issuer] = endpoints;
      let securedCredential;
      before(async function() {
        const mandatoryPointers = ['/credentialSubject/name'];
        securedCredential = await secureCredential(
          {issuer, vc: generateCredential(), mandatoryPointers});
      });
      beforeEach(setupRow);
      it('A data integrity proof (map), or an error, is produced as output.',
        async function() {
          this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#create-proof-ecdsa-sd-2023';
          const proof = proofExists(securedCredential);
          assertDataIntegrityProof(proof);
          // We only do a positive test
        });
      it('Let proof.proofValue be a base64-url-encoded ' +
        'Multibase value of the proofBytes.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#create-proof-ecdsa-sd-2023';
        // Shallow multibase test
        // TODO try decoding
        const proof = proofExists(securedCredential);
        should.exist(proof.proofValue,
          'Expected proof to have proofValue.');
        expect(proof.proofValue.startsWith('u')).to.be.true;
      });
    });
  }
});

describe('Algorithms - Base Proof Transformation (ecdsa-sd-2023)', function() {
  setupReportableTestSuite(this);
  this.implemented = [...issuers.keys()];
  for(const [columnId, {endpoints}] of issuers) {
    describe(columnId, function() {
      const [issuer] = endpoints;
      let securedCredential;
      before(async function() {
        const mandatoryPointers = ['/credentialSubject/name'];
        securedCredential = await secureCredential(
          {issuer, vc: generateCredential(), mandatoryPointers});
      });
      beforeEach(setupRow);
      it('The transformation options MUST contain a type identifier for the ' +
        'cryptographic suite (type), a cryptosuite identifier (cryptosuite), ' +
        'and a verification method (verificationMethod).',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-serialization-ecdsa-sd-2023';
        const proof = proofExists(securedCredential);
        should.exist(proof.type,
          'Expected a type identifier on the proof.');
        should.exist(proof.cryptosuite,
          'Expected a cryptosuite on the proof.');
        should.exist(proof.verificationMethod,
          'Expected a verificationMethod on the proof.');
      });
      it('The transformation options MUST contain an array of mandatory ' +
        'JSON pointers (mandatoryPointers) and MAY contain additional ' +
        'options, such as a JSON-LD document loader.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#transformation-ecdsa-sd-2023';
        // Send an issuance request without mandatoryPointers
        const securedCredentialNoPointers = await secureCredential(
          {issuer, vc: generateCredential()});
        const proof = proofExists(securedCredentialNoPointers);
        const decodedProof =
          await inspectSdProofValue(proof);
        should.exist(decodedProof.mandatoryPointers,
          'Expected mandatoryPointers to be included in the proofValue.');
      });
      it('Whenever this algorithm encodes strings, it MUST use UTF-8 encoding.',
        async function() {
          this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#transformation-ecdsa-sd-2023';
          const proof = proofExists(securedCredential);
          assertAllUtf8(proof);
        });
      it('Per the recommendations of [RFC2104], the HMAC key MUST be the ' +
        'same length as the digest size; for SHA-256, this is 256 bits ' +
        'or 32 bytes.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#transformation-ecdsa-sd-2023';
        const proof = proofExists(securedCredential);
        const decodedProof = await inspectSdProofValue(proof);
        decodedProof.hmacKey.length.should.equal(32,
          'Expected HMAC key to be the same length as the digest size.'
        );
      });
    });
  }
});

describe('Algorithms - Base Proof Configuration (ecdsa-sd-2023)', function() {
  setupReportableTestSuite(this);
  this.implemented = [...issuers.keys()];
  for(const [columnId, {endpoints}] of issuers) {
    describe(columnId, function() {
      const [issuer] = endpoints;
      let securedCredential;
      before(async function() {
        const mandatoryPointers = ['/credentialSubject/name'];
        securedCredential = await secureCredential(
          {issuer, vc: generateCredential(), mandatoryPointers});
      });
      it('The proof options MUST contain a type identifier for the ' +
        'cryptographic suite (type) and MUST contain a cryptosuite ' +
        'identifier (cryptosuite).',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-configuration-ecdsa-sd-2023';
        const proof = proofExists(securedCredential);
        should.exist(proof.type,
          'Expected a type identifier on the proof.');
        should.exist(proof.cryptosuite,
          'Expected a cryptosuite identifier on the proof.');
      });
      it('If proofConfig.type is not set to DataIntegrityProof and/or ' +
        'proofConfig.cryptosuite is not set to ecdsa-sd-2023, ' +
        'an error MUST be raised and SHOULD convey an error type of ' +
        'PROOF_GENERATION_ERROR.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-configuration-ecdsa-sd-2023';
        const proof = proofExists(securedCredential);
        assertCryptosuiteProof(proof, 'ecdsa-sd-2023');
      });
      it('If proofConfig.created is set and if the value is not a ' +
        'valid [XMLSCHEMA11-2] datetime, an error MUST be raised and ' +
        'SHOULD convey an error type of PROOF_GENERATION_ERROR.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-configuration-ecdsa-sd-2023';
        const proof = proofExists(securedCredential);
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

describe('Algorithms - Base Proof Serialization (ecdsa-sd-2023)', function() {
  setupReportableTestSuite(this);
  this.implemented = [...issuers.keys()];
  for(const [columnId, {endpoints}] of issuers) {
    describe(columnId, function() {
      const [issuer] = endpoints;
      let securedCredential;
      before(async function() {
        const mandatoryPointers = ['/credentialSubject/name'];
        securedCredential = await secureCredential(
          {issuer, vc: generateCredential(), mandatoryPointers});
      });
      beforeEach(setupRow);
      it('The proof options MUST contain a type identifier for the ' +
        'cryptographic suite (type) and MAY contain a cryptosuite identifier ' +
        '(cryptosuite).',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-serialization-ecdsa-sd-2023';
        const proof = proofExists(securedCredential);
        should.exist(proof.type,
          'Expected a type identifier on the proof.');
      });
    });
  }
});

describe('Algorithms - Verify Derived Proof (ecdsa-sd-2023)', function() {
  setupReportableTestSuite(this);
  this.implemented = [...verifiers.keys()];
  for(const [columnId, {endpoints}] of verifiers) {
    describe(columnId, function() {
      const [verifier] = endpoints;
      beforeEach(setupRow);
      it('If the length of signatures does not match the length of ' +
        'nonMandatory, an error MUST be raised and SHOULD convey an ' +
        'error type of PROOF_VERIFICATION_ERROR, indicating that the ' +
        'signature count does not match the non-mandatory message count.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-serialization-ecdsa-sd-2023';
        verifier;
        this.skip();
      });
    });
  }
});
