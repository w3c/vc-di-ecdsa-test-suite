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

describe('ecdsa-2019 (create)', function() {
  checkDataIntegrityProofFormat({
    implemented: match,
    notImplemented: nonMatch
  });
  describe('ecdsa-2019 (issuer)', function() {
    this.matrix = true;
    this.report = true;
    this.implemented = [...match.keys()];
    this.notImplemented = [...nonMatch.keys()];
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Implementation';
    for(const [name, {endpoints, implementation}] of match) {
      describe(name, function() {
        const [issuer] = endpoints;
        const verifier = implementation.verifiers.find(
          v => v.tags.has(tag));
        let issuedVc;
        let proofs;
        const verificationMethodDocuments = [];
        before(async function() {
          issuedVc = await createInitialVc({issuer, vc});
          proofs = Array.isArray(issuedVc?.proof) ?
            issuedVc.proof.filter(proof => proof.cryptosuite === cryptosuite) :
            [issuedVc?.proof];
          proofs.should.not.eql([], 'Expected at least one proof to have ' +
            'cryptosuite "ecdsa-2019".');
          const verificationMethods = proofs.map(
            proof => proof.verificationMethod);
          for(const verificationMethod of verificationMethods) {
            const verificationMethodDocument = await documentLoader({
              url: verificationMethod
            });
            verificationMethodDocuments.push(verificationMethodDocument);
          }
        });
        it('The field "cryptosuite" MUST be "ecdsa-2019".', function() {
          this.test.cell = {columnId: name, rowId: this.test.title};
          proofs.forEach(proof => {
            should.exist(proof.cryptosuite, 'Expected proof to have ' +
              '"cryptosuite" property.');
            proof.cryptosuite.should.equal(cryptosuite, 'Expected ' +
              '"cryptosuite" property to be "ecdsa-2019".');
          });
        });
        it('The "proof" MUST verify when using a conformant verifier.',
          async function() {
            this.test.cell = {columnId: name, rowId: this.test.title};
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
          'containing a type property with "Multikey" value.',
        async function() {
          this.test.cell = {columnId: name, rowId: this.test.title};
          verificationMethodDocuments.should.not.eql([], 'Expected ' +
            '"verificationMethodDocuments" to not be empty.');
          verificationMethodDocuments.forEach(verificationMethodDocument => {
            should.exist(verificationMethodDocument, 'Expected dereferencing ' +
              '"verificationMethod" to return a document.');
            verificationMethodDocument.type.should.equal(
              'Multikey',
              'Expected verification method document type property value to ' +
              'be "Multikey".');
          });
        });
        it('The "controller" of the verification method MUST exist and MUST ' +
          'be a valid URL.', async function() {
          this.test.cell = {columnId: name, rowId: this.test.title};
          verificationMethodDocuments.should.not.eql(0, 'Expected ' +
            '"verificationMethodDocuments" to not be empty.');
          verificationMethodDocuments.forEach(verificationMethodDocument => {
            should.exist(verificationMethodDocument, 'Expected dereferencing ' +
              '"verificationMethod" to return a document.');
            const {controller} = verificationMethodDocument;
            should.exist(controller, 'Expected "controller" of the ' +
              'verification method to exist.');
            let result;
            let err;
            try {
              result = new URL(controller);
            } catch(e) {
              err = e;
            }
            should.not.exist(err, 'Expected URL check of the "controller" of ' +
              'the verification method to not error.');
            should.exist(result, 'Expected the controller of the ' +
              'verification method to be a valid URL.');
          });
        });
        it.skip('The "proofValue" field MUST be a detached ECDSA.',
          async function() {
            this.test.cell = {columnId: name, rowId: this.test.title};
            // for(const proof of proofs) {
            //   const value = proof?.proofValue;
            //   // FIXME: check of the value is a detached ecdsa.
            //   const isDetachedEcdsa = await shouldBeDetachedEcdsa(value);
            //   isDetachedEcdsa.should.equal(true, 'Expected "proofValue" ' +
            //   'to be a detached ECDSA  value.');
            // }
          });
        it('The "publicKeyMultibase" property of the verification method ' +
          'MUST be public key encoded according to MULTICODEC and formatted ' +
          'according to MULTIBASE.', async function() {
          this.test.cell = {columnId: name, rowId: this.test.title};
          verificationMethodDocuments.should.not.eql([], 'Expected ' +
            '"verificationMethodDocuments" to not be empty.');
          for(const verificationMethodDocument of verificationMethodDocuments) {
            const {publicKeyMultibase} = verificationMethodDocument;
            should.exist(publicKeyMultibase, 'Expected "publicKeyMultibase" ' +
              'of the verification method to exist.');
            const multibase = 'z';
            const isMutibaseFormatted =
              publicKeyMultibase.startsWith(multibase) &&
              shouldBeBs58(publicKeyMultibase);
            isMutibaseFormatted.should.equal(true, 'Expected ' +
              '"publicKeyMultibase" to be MULTIBASE formatted.'
            );
            const isMulticodecEncoded =
              await shouldBeMulticodecEncoded(publicKeyMultibase);
            isMulticodecEncoded.should.equal(true, 'Expected ' +
              '"publicKeyMultibase" to be MULTICODEC encoded.');
          }
        });
      });
    }
  });
});
