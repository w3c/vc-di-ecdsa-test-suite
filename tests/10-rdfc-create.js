/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  shouldBeBs58, shouldBeMulticodecEncoded, verificationSuccess
} from './assertions.js';
import chai from 'chai';
import {createInitialVc} from './helpers.js';
import {documentLoader} from './documentLoader.js';
import {endpoints} from 'vc-test-suite-implementations';
import {getSuiteConfig} from './test-config.js';

const {tags, credentials, keyTypes} = getSuiteConfig('ecdsa-rdfc-2019');
const {match} = endpoints.filterByTag({
  tags: [...tags],
  property: 'issuers'
});
const should = chai.should();

describe('ecdsa-rdfc-2019 (create)', function() {
  describe('ecdsa-rdfc-2019 (issuers)', function() {
    this.matrix = true;
    this.report = true;
    this.implemented = [];
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Implementation';
    for(const [name, {endpoints: issuers, implementation}] of match) {
      // test for each support key type
      for(const keyType of keyTypes) {
      // loop through each issuer in suite
        for(const issuer of issuers) {
          const {supportedEcdsaKeyTypes} = issuer.settings;
          // if an issuer does not support the current keyType skip it
          if(!supportedEcdsaKeyTypes.includes(keyType)) {
            continue;
          }
          // add implementer name and keyType to test report
          this.implemented.push(`${name}: ${keyType}`);
          describe(`${name}: ${keyType}`, function() {
            // find matching verifier for test
            const verifier = implementation.verifiers.filter(
              v => tags.every(tag => v.tags.has(tag)) &&
                v.settings.supportedEcdsaKeyTypes.includes(keyType));
            let issuedVc;
            let proofs;
            const verificationMethodDocuments = [];
            before(async function() {
              issuedVc = await createInitialVc({
                issuer,
                vc: credentials.create.document
              });
              // VCs can have multiple proofs so account for that
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
            it('The field "cryptosuite" MUST be "ecdsa-rdfc-2019" or ' +
              '"ecdsa-jcs-2019".', function() {
              this.test.cell = {
                columnId: `${name}: ${keyType}`, rowId: this.test.title
              };
              const cryptosuite = ['ecdsa-rdfc-2019', 'ecdsa-jcs-2019'];
              proofs.some(
                proof => cryptosuite.includes(proof?.cryptosuite)
              ).should.equal(true, 'Expected at least one proof to have ' +
                '"cryptosuite" property "ecdsa-rdfc-2019" or "ecdsa-jcs-2019".'
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
