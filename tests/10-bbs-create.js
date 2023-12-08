/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import {checkKeyType, createInitialVc} from './helpers.js';
import {
  shouldBeBs58, shouldBeMulticodecEncoded, verificationSuccess
} from './assertions.js';
import chai from 'chai';
import {
  checkDataIntegrityProofFormat
} from 'data-integrity-test-suite-assertion';
import {documentLoader} from './documentLoader.js';
import {endpoints} from 'vc-api-test-suite-implementations';
import {validVc as vc} from './mock-data.js';

const tag = 'bbs-2023';
const {match} = endpoints.filterByTag({
  tags: [tag],
  property: 'issuers'
});
const should = chai.should();

describe('bbs-2023 (create)', function() {
  checkDataIntegrityProofFormat({
    implemented: match,
    isEcdsaTests: true,
    testDescription: 'Data Integrity (bbs-2023 issuers)'
  });
  describe('bbs-2023 (issuers)', function() {
    this.matrix = true;
    this.report = true;
    this.implemented = [];
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Implementation';
    for(const [name, {endpoints, implementation}] of match) {
      for(const endpoint of endpoints) {
        const {supportedEcdsaKeyTypes} = endpoint.settings;
        for(const supportedEcdsaKeyType of supportedEcdsaKeyTypes) {
          const keyType = checkKeyType(supportedEcdsaKeyType);
          this.implemented.push(`${name}: ${keyType}`);
          describe(`${name}: ${keyType}`, function() {
            const issuer = endpoint;
            const verifier = implementation.verifiers.filter(
              v => v.tags.has(tag) && v.settings.supportedEcdsaKeyTypes
                .includes(keyType));
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
            it('The field "cryptosuite" MUST be "bbs-2023".', function() {
              this.test.cell = {
                columnId: `${name}: ${keyType}`, rowId: this.test.title
              };
              proofs.some(
                proof => proof.cryptosuite === 'bbs-2023'
              ).should.equal(true, 'Expected at least one proof to have ' +
                '"cryptosuite" property "bbs-2023".'
              );
            });
            it('The field "proofValue" MUST start with "u".', function() {
              this.test.cell = {
                columnId: `${name}: ${keyType}`, rowId: this.test.title
              };
              proofs.some(
                proof => proof.proofValue.startsWith('u')
              ).should.equal(true, 'Expected at least one proof to have ' +
                '"proofValue" property that starts with "u".'
              );
            });
            it('The "proof" MUST verify when using a conformant verifier.',
              async function() {
                this.test.cell = {
                  columnId: `${name}: ${keyType}`, rowId: this.test.title
                };
                should.exist(verifier, 'Expected implementation to have a VC ' +
                  'HTTP API compatible verifier.');
                verificationSuccess({credential: issuedVc, verifier});
              });
            it('The "proof.proofPurpose" field MUST match the verification ' +
              'relationship expressed by the verification method controller.',
            async function() {
              this.test.cell = {
                columnId: `${name}: ${keyType}`, rowId: this.test.title
              };
              verificationMethodDocuments.should.not.eql([], 'Expected ' +
                'at least one "verificationMethodDocument".');
              verificationMethodDocuments.some(
                verificationMethodDocument =>
                  verificationMethodDocument?.type === 'Multikey'
              ).should.equal(true, 'Expected at least one proof to have ' +
                '"type" property value "Multikey".'
              );
              const controllerDocuments = [];
              for(
                const verificationMethodDocument of verificationMethodDocuments
              ) {
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
              this.test.cell = {
                columnId: `${name}: ${keyType}`, rowId: this.test.title
              };
              verificationMethodDocuments.should.not.eql([], 'Expected ' +
                'at least one "verificationMethodDocument".');
              verificationMethodDocuments.some(
                verificationMethodDocument =>
                  verificationMethodDocument?.type === 'Multikey'
              ).should.equal(true, 'Expected at least one proof to have ' +
                '"type" property value "Multikey".'
              );
            });
            it('The "publicKeyMultibase" property of the verification method ' +
              'MUST be public key encoded according to MULTICODEC and ' +
              'formatted according to MULTIBASE.', async function() {
              this.test.cell = {
                columnId: `${name}: ${keyType}`, rowId: this.test.title
              };
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
              ).should.equal(true, 'Expected at "publicKeyMultibase" to ' +
                'be MULTIBASE formatted and MULTICODEC encoded.');
            });
          });
        }
      }
    }
  });
});
