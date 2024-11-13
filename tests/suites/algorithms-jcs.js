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
} from '../helpers.js';
import chai from 'chai';
import {endpoints} from 'vc-test-suite-implementations';

export function ecdsaJcs2019Algorithms() {
  const cryptosuite = 'ecdsa-jcs-2019';
  const {tags} = config.suites[
    cryptosuite
  ];
  const {match: issuers} = endpoints.filterByTag({
    tags: [...tags],
    property: 'issuers'
  });
  const should = chai.should();

  describe('ecdsa-jcs-2019 - Algorithms - Transformation', function() {
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
        let jcs2019Proofs = [];
        before(async function() {
          issuedVc = await createInitialVc({issuer, vc: validCredential});
          proofs = getProofs(issuedVc);
          if(proofs?.length) {
            jcs2019Proofs = proofs.filter(
              proof => proof?.cryptosuite === cryptosuite);
          }
        });
        beforeEach(setupRow);
        const assertBefore = () => {
          should.exist(issuedVc, 'Expected issuer to have issued a ' +
                      'credential.');
          should.exist(proofs, 'Expected credential to have a proof.');
          jcs2019Proofs.length.should.be.gte(1, 'Expected at least one ' +
                      'ecdsa-jcs-2019 cryptosuite.');
        };
        it('The transformation options MUST contain a type identifier ' +
          'for the cryptographic suite (type) and a cryptosuite identifier ' +
          '(cryptosuite).',
        async function() {
          this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#transformation-ecdsa-jcs-2019';
          assertBefore();
          for(const proof of jcs2019Proofs) {
            should.exist(proof.type, 'Expected a type identifier on ' +
                              'the proof.');
            should.exist(proof.cryptosuite,
              'Expected a cryptosuite identifier on the proof.');
          }
        });
        it('Whenever this algorithm encodes strings, ' +
          'it MUST use UTF-8 encoding.',
        async function() {
          this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#transformation-ecdsa-jcs-2019';
          assertBefore();
          for(const proof of jcs2019Proofs) {
            should.exist(proof?.proofValue,
              'Expected proofValue to exist.');
            isValidUtf8(proof.proofValue).should.equal(
              true,
              'Expected proofValue value to be a valid UTF-8 encoded string.'
            );
          }
        });
        it('If options.type is not set to the string DataIntegrityProof or ' +
          'options.cryptosuite is not set to the string ecdsa-jcs-2019, ' +
          'an error MUST be raised and SHOULD convey an error type ' +
          'of PROOF_TRANSFORMATION_ERROR.',
        async function() {
          this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#transformation-ecdsa-jcs-2019';
          assertBefore();
          for(const proof of jcs2019Proofs) {
            should.exist(proof.type,
              'Expected a type identifier on the proof.');
            should.exist(proof.cryptosuite,
              'Expected a cryptosuite identifier on the proof.');
            proof.type.should.equal('DataIntegrityProof',
              'Expected DataIntegrityProof type.');
            proof.cryptosuite.should.equal('ecdsa-jcs-2019',
              'Expected ecdsa-jcs-2019 cryptosuite.');
          }
        });
      });
    }
  });

  describe('ecdsa-jcs-2019 - Algorithms - Proof Configuration', function() {
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
        let jcs2019Proofs = [];
        before(async function() {
          issuedVc = await createInitialVc({issuer, vc: validCredential});
          proofs = getProofs(issuedVc);
          if(proofs?.length) {
            jcs2019Proofs = proofs.filter(
              proof => proof?.cryptosuite === cryptosuite);
          }
        });
        beforeEach(setupRow);
        const assertBefore = () => {
          should.exist(issuedVc, 'Expected issuer to have issued a ' +
                      'credential.');
          should.exist(proofs, 'Expected credential to have a proof.');
          jcs2019Proofs.length.should.be.gte(1, 'Expected at least one ' +
                      'ecdsa-jcs-2019 cryptosuite.');
        };
        it('The proof options MUST contain a type identifier for the ' +
          'cryptographic suite (type) and MUST contain a cryptosuite ' +
          'identifier (cryptosuite).',
        async function() {
          this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-configuration-ecdsa-jcs-2019';
          assertBefore();
          for(const proof of jcs2019Proofs) {
            should.exist(proof.type,
              'Expected a type identifier on the proof.');
            should.exist(proof.cryptosuite,
              'Expected a cryptosuite identifier on the proof.');
          }
        });
        it('If proofConfig.type is not set to DataIntegrityProof ' +
          'and/or proofConfig.cryptosuite is not set to ecdsa-jcs-2019, ' +
          'an error MUST be raised and SHOULD convey an error type ' +
          'of PROOF_GENERATION_ERROR.',
        async function() {
          this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-configuration-ecdsa-jcs-2019';
          assertBefore();
          for(const proof of jcs2019Proofs) {
            should.exist(proof.type,
              'Expected a type identifier on the proof.');
            should.exist(proof.cryptosuite,
              'Expected a cryptosuite identifier on the proof.');
            proof.type.should.equal('DataIntegrityProof',
              'Expected DataIntegrityProof type.');
            proof.cryptosuite.should.equal('ecdsa-jcs-2019',
              'Expected ecdsa-jcs-2019 cryptosuite.');
          }
        });
        it('If proofConfig.created is set and if the value is not a ' +
          'valid [XMLSCHEMA11-2] datetime, an error MUST be raised and ' +
          'SHOULD convey an error type of PROOF_GENERATION_ERROR.',
        async function() {
          this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-configuration-ecdsa-jcs-2019';
          for(const proof of jcs2019Proofs) {
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

  describe('ecdsa-jcs-2019 - Algorithms - Transformation', function() {
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
        let jcs2019Proofs = [];
        before(async function() {
          issuedVc = await createInitialVc({issuer, vc: validCredential});
          proofs = getProofs(issuedVc);
          if(proofs?.length) {
            jcs2019Proofs = proofs.filter(
              proof => proof?.cryptosuite === cryptosuite);
          }
        });
        beforeEach(setupRow);
        const assertBefore = () => {
          should.exist(issuedVc, 'Expected issuer to have issued a ' +
                      'credential.');
          should.exist(proofs, 'Expected credential to have a proof.');
          jcs2019Proofs.length.should.be.gte(1, 'Expected at least one ' +
                      'ecdsa-jcs-2019 cryptosuite.');
        };
        it('The proof options MUST contain a type identifier for the ' +
          'cryptographic suite (type) and MAY contain a cryptosuite ' +
          'identifier (cryptosuite).',
        async function() {
          this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#proof-serialization-ecdsa-jcs-2019';
          assertBefore();
          for(const proof of jcs2019Proofs) {
            should.exist(proof.type,
              'Expected a type identifier on the proof.');
          }
        });
      });
    }
  });
}
