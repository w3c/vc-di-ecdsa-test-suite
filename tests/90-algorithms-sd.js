/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  config,
  createInitialVc,
  createValidCredential,
  getProofs,
  isValidDatetime,
  isValidUtf8,
  setupReportableTestSuite,
  setupRow
} from './helpers.js';
import chai from 'chai';
import {endpoints} from 'vc-test-suite-implementations';

const should = chai.should();

const cryptosuite = 'ecdsa-sd-2023';
const {tags} = config.suites[
  cryptosuite
];
const {match: issuers} = endpoints.filterByTag({
  tags: [...tags],
  property: 'issuers'
});

describe('ecdsa-sd-2023 - Algorithms - Base Proof Transformation', function() {
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
      let sd2023Proofs = [];
      before(async function() {
        issuedVc = await createInitialVc({issuer, vc: validCredential});
        proofs = getProofs(issuedVc);
        if(proofs?.length) {
          sd2023Proofs = proofs.filter(
            proof => proof?.cryptosuite === cryptosuite);
        }
      });
      beforeEach(setupRow);
      const assertBefore = () => {
        should.exist(issuedVc, 'Expected issuer to have issued a ' +
                          'credential.');
        should.exist(proofs, 'Expected credential to have a proof.');
        sd2023Proofs.length.should.be.gte(1, 'Expected at least one ' +
                          'ecdsa-sd-2023 cryptosuite.');
      };
      it('The transformation options MUST contain a type identifier for the ' +
        'cryptographic suite (type), a cryptosuite identifier (cryptosuite), ' +
        'and a verification method (verificationMethod).',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-serialization-ecdsa-sd-2023';
        assertBefore();
        for(const proof of sd2023Proofs) {
          should.exist(proof.type,
            'Expected a type identifier on the proof.');
          should.exist(proof.cryptosuite,
            'Expected a cryptosuite on the proof.');
          should.exist(proof.verificationMethod,
            'Expected a verificationMethod on the proof.');
        }
      });
      it('The transformation options MUST contain an array of mandatory ' +
        'JSON pointers (mandatoryPointers) and MAY contain additional ' +
        'options, such as a JSON-LD document loader.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#transformation-ecdsa-sd-2023';
        assertBefore();
        this.skip();
      });
      it('Whenever this algorithm encodes strings, ' +
        'it MUST use UTF-8 encoding.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#transformation-ecdsa-sd-2023';
        assertBefore();
        for(const proof of sd2023Proofs) {
          should.exist(proof?.proofValue,
            'Expected proofValue to exist.');
          isValidUtf8(proof.proofValue).should.equal(
            true,
            'Expected proofValue value to be a valid UTF-8 encoded string.'
          );
        }
      });
      it('Per the recommendations of [RFC2104], the HMAC key MUST be the ' +
        'same length as the digest size; for SHA-256, this is 256 bits ' +
        'or 32 bytes.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#transformation-ecdsa-sd-2023';
        assertBefore();
        this.skip();
      });
    });
  }
});

describe('ecdsa-sd-2023 - Algorithms - Base Proof Configuration', function() {
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
      let sd2023Proofs = [];
      before(async function() {
        issuedVc = await createInitialVc({issuer, vc: validCredential});
        proofs = getProofs(issuedVc);
        if(proofs?.length) {
          sd2023Proofs = proofs.filter(
            proof => proof?.cryptosuite === cryptosuite);
        }
      });
      beforeEach(setupRow);
      const assertBefore = () => {
        should.exist(issuedVc,
          'Expected issuer to have issued a credential.');
        should.exist(proofs,
          'Expected credential to have a proof.');
        sd2023Proofs.length.should.be.gte(1,
          'Expected at least one ecdsa-sd-2023 cryptosuite.');
      };
      it('The proof options MUST contain a type identifier for the ' +
        'cryptographic suite (type) and MUST contain a cryptosuite ' +
        'identifier (cryptosuite).',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-configuration-ecdsa-sd-2023';
        assertBefore();
        for(const proof of sd2023Proofs) {
          should.exist(proof.type,
            'Expected a type identifier on the proof.');
          should.exist(proof.cryptosuite,
            'Expected a cryptosuite identifier on the proof.');
        }
      });
      it('If proofConfig.type is not set to DataIntegrityProof and/or ' +
        'proofConfig.cryptosuite is not set to ecdsa-sd-2023, ' +
        'an error MUST be raised and SHOULD convey an error type of ' +
        'PROOF_GENERATION_ERROR.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-configuration-ecdsa-sd-2023';
        assertBefore();
        for(const proof of sd2023Proofs) {
          should.exist(proof.type,
            'Expected a type identifier on the proof.');
          should.exist(proof.cryptosuite,
            'Expected a cryptosuite identifier on the proof.');
          proof.type.should.equal('DataIntegrityProof',
            'Expected DataIntegrityProof type.');
          proof.cryptosuite.should.equal('ecdsa-sd-2023',
            'Expected ecdsa-sd-2023 cryptosuite.');
        }
      });
      it('If proofConfig.created is set and if the value is not a ' +
        'valid [XMLSCHEMA11-2] datetime, an error MUST be raised and ' +
        'SHOULD convey an error type of PROOF_GENERATION_ERROR.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-configuration-ecdsa-sd-2023';
        for(const proof of sd2023Proofs) {
          if(proof?.created) {
            isValidDatetime(proof.created).should.equal(
              true,
              'Expected created value to be a valid datetime string.'
            );
          }
        }
      });
    });
  }
});

describe('ecdsa-sd-2023 - Algorithms - Base Proof Serialization', function() {
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
      let sd2023Proofs = [];
      before(async function() {
        issuedVc = await createInitialVc({issuer, vc: validCredential});
        proofs = getProofs(issuedVc);
        if(proofs?.length) {
          sd2023Proofs = proofs.filter(
            proof => proof?.cryptosuite === cryptosuite);
        }
      });
      beforeEach(setupRow);
      const assertBefore = () => {
        should.exist(issuedVc, 'Expected issuer to have issued a ' +
                              'credential.');
        should.exist(proofs, 'Expected credential to have a proof.');
        sd2023Proofs.length.should.be.gte(1, 'Expected at least one ' +
                              'ecdsa-sd-2023 cryptosuite.');
      };
      it('The proof options MUST contain a type identifier for the ' +
        'cryptographic suite (type) and MAY contain a cryptosuite identifier ' +
        '(cryptosuite).',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-serialization-ecdsa-sd-2023';
        assertBefore();
        for(const proof of sd2023Proofs) {
          should.exist(proof.type,
            'Expected a type identifier on the proof.');
        }
      });
    });
  }
});

describe('ecdsa-sd-2023 - Algorithms - Verify Derived Proof', function() {
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
      let sd2023Proofs = [];
      before(async function() {
        issuedVc = await createInitialVc({issuer, vc: validCredential});
        proofs = getProofs(issuedVc);
        if(proofs?.length) {
          sd2023Proofs = proofs.filter(
            proof => proof?.cryptosuite === cryptosuite);
        }
      });
      beforeEach(setupRow);
      const assertBefore = () => {
        should.exist(issuedVc, 'Expected issuer to have issued a ' +
                              'credential.');
        should.exist(proofs, 'Expected credential to have a proof.');
        sd2023Proofs.length.should.be.gte(1, 'Expected at least one ' +
                              'ecdsa-sd-2023 cryptosuite.');
      };
      it('If the length of signatures does not match the length of ' +
        'nonMandatory, an error MUST be raised and SHOULD convey an ' +
        'error type of PROOF_VERIFICATION_ERROR, indicating that the ' +
        'signature count does not match the non-mandatory message count.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-serialization-ecdsa-sd-2023';
        assertBefore();
        this.skip();
      });
    });
  }
});
