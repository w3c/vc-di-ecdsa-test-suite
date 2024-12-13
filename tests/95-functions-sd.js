/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  createDisclosedVc,
  encodeSdDerivedProofValue,
  generateCredential,
  inspectSdBaseProofValue,
  inspectSdDerivedProofValue,
  proofExists,
  secureCredential,
  setupReportableTestSuite,
  setupRow,
  verifyError,
  verifySuccess
} from './helpers.js';
import chai from 'chai';
import {ecdsaSdVectors} from './vectors.js';
import {endpoints} from 'vc-test-suite-implementations';

const should = chai.should();

const cryptosuites = [
  'ecdsa-sd-2023',
];

const {match: issuers} = endpoints.filterByTag({
  tags: cryptosuites,
  property: 'issuers'
});

const {match: holders} = endpoints.filterByTag({
  tags: cryptosuites,
  property: 'vcHolders'
});

const {match: verifiers} = endpoints.filterByTag({
  tags: cryptosuites,
  property: 'verifiers'
});

describe('Functions - Selective Disclosure', function() {
  setupReportableTestSuite(this);
  this.implemented = [...issuers.keys()];
  for(const [columnId, {endpoints}] of issuers) {
    describe(columnId, function() {
      const [issuer] = endpoints;
      beforeEach(setupRow);
      // 3.4.12 selectPaths
      it('Set value to parentValue.path. If value is now undefined, ' +
        'an error MUST be raised and SHOULD convey an error type of ' +
        'PROOF_GENERATION_ERROR, indicating that the JSON pointer ' +
        'does not match the given document.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#selective-disclosure-functions';
        should.not.exist(await secureCredential(
          {
            issuer,
            vc: generateCredential(),
            mandatoryPointers: ['/credentialSubject/invalidPointer']
          }),
        'Expected issuance failure for non existing JSON pointer.');
      });
    });
  }
});

describe('Functions - ecdsa-sd-2023', function() {
  setupReportableTestSuite(this);
  this.implemented = [...issuers.keys()];
  for(const [columnId, {endpoints}] of issuers) {
    describe(columnId, function() {
      const [issuer] = endpoints;
      let holder = null;
      if(holders.get(columnId)) {
        [holder] = holders.get(columnId)?.endpoints;
      } else {
      }
      let verifier = null;
      if(verifiers.get(columnId)) {
        [verifier] = verifiers.get(columnId)?.endpoints;
      } else {
      }
      let securedCredential;
      let disclosedCredential;
      let validDerivedProof;
      before(async function() {
        securedCredential = await secureCredential(
          {issuer, vc: generateCredential()});
        validDerivedProof =
          structuredClone(ecdsaSdVectors.derivedProof);
      });
      // 3.5.2 serializeBaseProofValue
      it('CBOR-encode components per [RFC8949] where CBOR ' +
        'tagging MUST NOT be used on any of the components.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#selective-disclosure-functions';
        const proof = proofExists(securedCredential);
        const decodedProof =
            await inspectSdBaseProofValue(proof);
        should.exist(decodedProof,
          'Implementation must not use CBOR tagging.'
        );
      });
      // 3.5.3 parseBaseProofValue
      it('If the proofValue string does not start with u, ' +
        'indicating that it is a multibase-base64url-no-pad-encoded value, ' +
        'an error MUST be raised and SHOULD convey an error type of ' +
        'PROOF_VERIFICATION_ERROR.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#selective-disclosure-functions';
        if(holder) {
          const proof = proofExists(securedCredential);
          should.exist(proof.proofValue,
            'Expected proof to have proofValue.');
          // Create negative fixture
          const invalidBaseCredential = structuredClone(securedCredential);
          invalidBaseCredential.proof.proofValue =
            invalidBaseCredential.proof.proofValue.slice(1);
          ({disclosedCredential} = await createDisclosedVc(
            {
              selectivePointers: ['/credentialSubject/id'],
              signedCredential: invalidBaseCredential,
              vcHolder: holder
            }));
          should.not.exist(disclosedCredential?.proof,
            'Derived endpoint should reject proof without multibase indicator.'
          );
        } else {
          this.skip();
        }
      });
      // 3.5.3 parseBaseProofValue
      it('If the decodedProofValue does not start with the ' +
        'ECDSA-SD base proof header bytes 0xd9, 0x5d, ' +
        'and 0x00, an error MUST be raised and SHOULD ' +
        'convey an error type of PROOF_VERIFICATION_ERROR.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#selective-disclosure-functions';
        if(holder) {
          const proof = proofExists(securedCredential);
          should.exist(proof.proofValue,
            'Expected proof to have proofValue.');
          // Create negative fixture
          const invalidBaseCredential = structuredClone(securedCredential);
          invalidBaseCredential.proof.proofValue =
            invalidBaseCredential.proof.proofValue.slice(0, 1) +
            invalidBaseCredential.proof.proofValue.slice(4);
          ({disclosedCredential} = await createDisclosedVc(
            {
              selectivePointers: ['/credentialSubject/id'],
              signedCredential: invalidBaseCredential,
              vcHolder: holder
            }));
          should.not.exist(disclosedCredential?.proof,
            'Derived endpoint should reject proof without header.'
          );
        } else {
          this.skip();
        }
      });
      // 3.5.7 serializeDerivedProofValue
      it('CBOR-encode components per [RFC8949] where CBOR ' +
        'tagging MUST NOT be used on any of the components.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#selective-disclosure-functions';
        if(holder) {
          ({disclosedCredential} = await createDisclosedVc(
            {
              selectivePointers: ['/credentialSubject/id'],
              signedCredential: securedCredential,
              vcHolder: holder
            }));
          const decodedDerivedProofValue =
            await inspectSdDerivedProofValue(disclosedCredential.proof);
          should.exist(decodedDerivedProofValue,
            'Implementation must not use CBOR tagging.'
          );
        } else {
          this.skip();
        }
      });
      // 3.5.8 parseDerivedProofValue
      it('If the proofValue string does not start with u, ' +
        'indicating that it is a multibase-base64url-no-pad-encoded ' +
        'value, an error MUST be raised and SHOULD convey an ' +
        'error type of PROOF_VERIFICATION_ERROR.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#selective-disclosure-functions';
        if(verifier) {
          await verifySuccess(verifier, validDerivedProof);
          // Clone a valid proof and slice the multibase header
          const invalidDerivedProof =
            structuredClone(validDerivedProof);
          invalidDerivedProof.proof.proofValue =
            invalidDerivedProof.proof.proofValue.slice(1);
          await verifyError(verifier, invalidDerivedProof);
        } else {
          this.skip();
        }
      });
      // 3.5.8 parseDerivedProofValue
      it('If the decodedProofValue does not start with the ECDSA-SD ' +
        'disclosure proof header bytes 0xd9, 0x5d, and 0x01, ' +
        'an error MUST be raised and SHOULD convey an error ' +
        'type of PROOF_VERIFICATION_ERROR.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#selective-disclosure-functions';
        if(verifier) {
          await verifySuccess(verifier, validDerivedProof);
          // Clone a valid proof and slice the ECDSA-SD disclosure proof header
          const invalidDerivedProof =
            structuredClone(validDerivedProof);
          invalidDerivedProof.proof.proofValue =
            invalidDerivedProof.proof.proofValue.slice(0, 1) +
            invalidDerivedProof.proof.proofValue.slice(4);
          await verifyError(verifier, invalidDerivedProof);
        } else {
          this.skip();
        }
      });
      // 3.5.8 parseDerivedProofValue
      it('Initialize components to an array that is the result of ' +
        'CBOR-decoding the bytes that follow the three-byte ' +
        'ECDSA-SD disclosure proof header. If the result is ' +
        'not an array of the following five elements — a byte array ' +
        'of length 64; a byte array of length 36; an array of byte arrays, ' +
        'each of length 64; a map of integers to byte arrays, ' +
        'each of length 32; and an array of integers — ' +
        'an error MUST be raised and SHOULD convey an error type of ' +
        'PROOF_VERIFICATION_ERROR.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-di-ecdsa/#selective-disclosure-functions';
        if(verifier) {
          const validDerivedProofValue =
            await inspectSdDerivedProofValue(validDerivedProof.proof);

          // Create invalid bodies for negative tests
          let invalidDerivedProof = structuredClone(validDerivedProof);
          const invalidDerivedProofValue =
            structuredClone(validDerivedProofValue);

          // add a non bytearray element in the labelMap array
          invalidDerivedProof = structuredClone(validDerivedProof);
          invalidDerivedProofValue.labelMap.push = 'not a bytearray';
          invalidDerivedProof.proof =
            encodeSdDerivedProofValue(invalidDerivedProof);
          await verifyError(verifier, invalidDerivedProof);

          // replace an integer with a string in the mandatoryIndexes array
          invalidDerivedProof = structuredClone(validDerivedProof);
          invalidDerivedProofValue.mandatoryIndexes[0] = '0';
          invalidDerivedProof.proof =
            encodeSdDerivedProofValue(invalidDerivedProof);
          await verifyError(verifier, invalidDerivedProof);
        } else {
          this.skip();
        }
      });
    });
  }
});
