/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import {
  shouldBeBs58, shouldBeMulticodecEncoded, verificationSuccess
} from './assertions.js';
import chai from 'chai';
import {
  checkDataIntegrityProofFormat
} from 'data-integrity-test-suite-assertion';
import {createInitialVc} from './helpers.js';
import {documentLoader} from './documentLoader.js';
import {endpoints} from 'vc-test-suite-implementations';
import {validVc as vc} from './validVc.js';

const tag = 'ecdsa-rdfc-2019';
const {match} = endpoints.filterByTag({
  tags: [tag],
  property: 'issuers'
});
const should = chai.should();

describe('ecdsa-rdfc-2019 (create)', function() {
  checkDataIntegrityProofFormat({
    implemented: match
  });
  describe('ecdsa-rdfc-2019 (issuer)', function() {
    this.matrix = true;
    this.report = true;
    this.implemented = [...match.keys()];
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
          proofs = Array.isArray(issuedVc?.proof) ? issuedVc.proof :
            [issuedVc?.proof];
          const verificationMethods = proofs.map(
            proof => proof.verificationMethod);
          for(const verificationMethod of verificationMethods) {
            const verificationMethodDocument = await documentLoader({
              url: verificationMethod
            });
            verificationMethodDocuments.push(verificationMethodDocument);
          }
        });
        it('The field "cryptosuite" MUST be "ecdsa-rdfc-2019", ' +
          '"ecdsa-jcs-2019" or "ecdsa-sd-2023".', function() {
          this.test.cell = {columnId: name, rowId: this.test.title};
          const cryptosuite = [
            'ecdsa-rdfc-2019', 'ecdsa-jcs-2019', 'ecdsa-sd-2023'
          ];
          proofs.some(
            proof => cryptosuite.includes(proof?.cryptosuite)
          ).should.equal(true, 'Expected at least one proof to have ' +
            '"cryptosuite" property "ecdsa-rdfc-2019", "ecdsa-jcs-2019" ' +
            'or "ecdsa-sd-2023".'
          );
        });
        it('The "proof" MUST verify when using a conformant verifier.',
          async function() {
            this.test.cell = {columnId: name, rowId: this.test.title};
            should.exist(verifier, 'Expected implementation to have a VC ' +
              'HTTP API compatible verifier.');
            verificationSuccess({credential: issuedVc, verifier});
          });
        it('The "proof.proofPurpose" field MUST match the verification ' +
          'relationship expressed by the verification method controller.',
        async function() {
          this.test.cell = {columnId: name, rowId: this.test.title};
          verificationMethodDocuments.should.not.eql([], 'Expected ' +
            'at least one "verificationMethodDocument".');
          verificationMethodDocuments.some(
            verificationMethodDocument =>
              verificationMethodDocument?.type === 'Multikey'
          ).should.equal(true, 'Expected at least one proof to have "type" ' +
              'property value "Multikey".'
          );
          const controllerDocuments = [];
          for(const verificationMethodDocument of verificationMethodDocuments) {
            const controllerDocument = await documentLoader({
              url: verificationMethodDocument.controller
            });
            controllerDocuments.push(controllerDocument);
          }
          proofs.some(
            proof => controllerDocuments.some(controllerDocument =>
              controllerDocument.hasOwnProperty(proof.proofPurpose))
          ).should.equal(true, 'Expected "proof.proofPurpose" field ' +
            'to match the verification method controller.'
          );
        });
        it('Dereferencing "verificationMethod" MUST result in an object ' +
          'containing a type property with "Multikey" value.',
        async function() {
          this.test.cell = {columnId: name, rowId: this.test.title};
          verificationMethodDocuments.should.not.eql([], 'Expected ' +
            'at least one "verificationMethodDocument".');
          verificationMethodDocuments.some(
            verificationMethodDocument =>
              verificationMethodDocument?.type === 'Multikey'
          ).should.equal(true, 'Expected at least one proof to have "type" ' +
              'property value "Multikey".'
          );
        });
        it('The "publicKeyMultibase" property of the verification method ' +
          'MUST be public key encoded according to MULTICODEC and formatted ' +
          'according to MULTIBASE.', async function() {
          this.test.cell = {columnId: name, rowId: this.test.title};
          verificationMethodDocuments.should.not.eql([], 'Expected ' +
            '"verificationMethodDocuments" to not be empty.');
          verificationMethodDocuments.some(
            verificationMethodDocument => {
              const multibase = 'z';
              const {publicKeyMultibase} = verificationMethodDocument;
              return publicKeyMultibase.startsWith(multibase) &&
                shouldBeBs58(publicKeyMultibase) &&
                shouldBeMulticodecEncoded(publicKeyMultibase);
            }
          ).should.equal(true, 'Expected at "publicKeyMultibase" to to be ' +
            'MULTIBASE formatted and MULTICODEC encoded.');
        });
      });
    }
  });
});
