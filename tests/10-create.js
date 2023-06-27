/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import {shouldBeBs58, shouldBeMulticodecEncoded} from './assertions.js';
import chai from 'chai';
import {
  checkDataIntegrityProofFormat
} from 'data-integrity-test-suite-assertion';
import {createInitialVc} from './helpers.js';
import {documentLoader} from './documentLoader.js';
import {endpoints} from 'vc-api-test-suite-implementations';
import {validVc as vc} from './validVc.js';

const tag = 'ecdsa-2019';
const cryptosuite = 'ecdsa-2019';
const {match, nonMatch} = endpoints.filterByTag({
  tags: [tag],
  property: 'issuers'
});
const should = chai.should();

describe('ecdsa-2019 (P-256 create)', function() {
  checkDataIntegrityProofFormat({
    implemented: match,
    notImplemented: nonMatch
  });
  describe('ecdsa-2019 (P-256 issuer)', function() {
    this.matrix = true;
    this.report = true;
    this.implemented = [...match.keys()];
    this.notImplemented = [...nonMatch.keys()];
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Implementation';
    for(const [columnId, {endpoints, implementation}] of match) {
      const [issuer] = endpoints;
      const verifier = implementation.verifiers.find(
        v => v.tags.has(tag));
      let issuedVc;
      let proofs;
      let verificationMethodDocument;
      before(async function() {
        issuedVc = await createInitialVc({issuer, vc});
        proofs = Array.isArray(issuedVc?.proof) ?
          issuedVc.proof : [issuedVc?.proof];
        const verificationMethod = issuedVc?.proof?.verificationMethod;
        verificationMethodDocument = await documentLoader({
          url: verificationMethod
        });
      });
      it('MUST have property "cryptosuite".', function() {
        this.test.cell = {columnId, rowId: this.test.title};
        proofs.some(
          proof => typeof proof?.cryptosuite === 'string'
        ).should.equal(
          true,
          'Expected at least one proof to have cryptosuite.'
        );
      });
      it('The field "cryptosuite" MUST be "ecdsa-2019".', function() {
        this.test.cell = {columnId, rowId: this.test.title};
        proofs.some(
          proof => proof?.cryptosuite === cryptosuite
        ).should.equal(
          true,
          'Expected at least one proof to have "cryptosuite" `ecdsa-2019`.'
        );
      });
      it('The "proofValue" field MUST be a multibase-encoded base58-btc ' +
        'encoded value.', function() {
        this.test.cell = {columnId, rowId: this.test.title};
        const multibase = 'z';
        proofs.some(proof => {
          const value = proof?.proofValue;
          return value.startsWith(multibase) && shouldBeBs58(value);
        }).should.equal(
          true,
          'Expected "proof.proofValue" to be multibase-encoded base58-btc ' +
          'value.'
        );
      });
      it('The "proof" MUST verify when using a conformant verifier.',
        async function() {
          this.test.cell = {columnId, rowId: this.test.title};
          should.exist(verifier, 'Expected implementation to have a VC ' +
            'HTTP API compatible verifier.');
          const {result, error} = await verifier.post({json: {
            verifiableCredential: issuedVc,
            options: {checks: ['proof']}
          }});
          should.not.exist(error, 'Expected verifier to not error.');
          should.exist(result, 'Expected verifier to return a result.');
          result.status.should.not.equal(400, 'Expected status code to not ' +
            'be 400.');
          result.status.should.equal(200, 'Expected status code to be 200.');
        });
      it('Dereferencing "verificationMethod" MUST result in an object ' +
        'containing a type property with "Multikey" value.', async function() {
        should.exist(verificationMethodDocument, 'Expected dereferencing ' +
          '"verificationMethod" to return a document.');
        verificationMethodDocument.type.should.equal('Multikey', 'Expected ' +
          'verification method document type property value to be "Multikey".');
      });
      it('The "controller" of the verification method MUST exist and MUST be ' +
        'a valid URL.', async function() {
        const {controller} = verificationMethodDocument;
        should.exist(controller, 'Expected "controller" of the verification ' +
          'method to exist.');
        let result;
        let err;
        try {
          result = new URL(controller);
        } catch(e) {
          err = e;
        }
        should.not.exist(err, 'Expected URL check of the "controller" of the ' +
          'verification method to not error.');
        should.exist(result, 'Expected the controller of the verification ' +
          'method to be a valid URL');
      });
      it.skip('The "proofPurpose" property MUST match the verification ' +
        'relationship expressed by the verification method controller.',
      async function() {
        const {controller} = verificationMethodDocument;
        should.exist(controller, 'Expected "controller" of the verification ' +
          'method to exist.');
        const {proofPurpose} = proofs[0];
        should.exist(proofPurpose, 'Expected "proofPurpose" of the proof ' +
          'to exist.');
        // FIXME: Move this test into the tests for verifier and fix it.
      });
      it('The "publicKeyMultibase" property of the verification method MUST ' +
        'be public key encoded according to MULTICODEC and formatted ' +
        'according to MULTIBASE.', async function() {
        const {publicKeyMultibase} = verificationMethodDocument;
        should.exist(publicKeyMultibase, 'Expected "publicKeyMultibase" of ' +
          'the verification method to exist.');
        const multibase = 'z';
        const isMutibaseFormatted = publicKeyMultibase.startsWith(multibase) &&
          shouldBeBs58(publicKeyMultibase);
        isMutibaseFormatted.should.equal(true, 'Expected publicKeyMultibase ' +
          'to be MULTIBASE formatted.'
        );
        const isMulticodecEncoded =
          await shouldBeMulticodecEncoded(publicKeyMultibase);
        isMulticodecEncoded.should.equal(true, 'Expected ' +
          'publicKeyMultibase to be MULTICODEC encoded.'
        );
      });
    }
  });
});
