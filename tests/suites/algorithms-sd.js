/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  assertions,
  generators,
  issueCloned
} from 'data-integrity-test-suite-assertion';
import {
  shouldBeBs64UrlNoPad,
  shouldHaveHeaderBytes,
} from '../assertions.js';
import {createInitialVc} from '../helpers.js';
import {expect} from 'chai';
import {getMultiKey} from '../vc-generator/key-gen.js';
import {getSuites} from './helpers.js';

export function sd2023Algorithms({
  credential,
  mandatoryPointers,
  selectivePointers,
  verifiers,
  issuers,
  keyTypes,
  suiteName,
  vcVersion,
  setup = _setup
}) {
  return describe(`${suiteName} - Algorithms - VC ${vcVersion}`, function() {
    this.matrix = true;
    this.report = true;
    this.implemented = [];
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Implementation';
    let fixtures = new Map();
    before(async function() {
      fixtures = await setup({
        suite: suiteName,
        keyTypes,
        credential,
        mandatoryPointers,
        selectivePointers
      });
    });
    for(const [name, {endpoints}] of verifiers) {
      const [verifier] = endpoints;
      // account for cases where implementer has no issuer
      const [issuer] = (issuers.get(name)?.endpoints || []);
      for(const keyType of keyTypes) {
        this.implemented.push(`${name}: ${keyType}`);
        describe(`${name}: ${keyType}`, function() {
          let baseCredential;
          let proofs = [];
          before(async function() {
            if(issuer) {
              baseCredential = await createInitialVc({
                issuer,
                credential,
                mandatoryPointers
              });
              if(baseCredential) {
                proofs = Array.isArray(baseCredential.proof) ?
                  baseCredential?.proof : [baseCredential?.proof];
                // only test proofs that match the relevant cryptosuite
                proofs = proofs.filter(p => p?.cryptosuite === suiteName);
              }
            }
          });
          beforeEach(function() {
            this.currentTest.cell = {
              rowId: this.currentTest.title,
              columnId: this.currentTest.parent.title
            };
          });
          const assertIssuer = () => {
            expect(
              issuer,
              `Expected ${name} to have an "ecdsa-sd-2023" issuer endpoint`
            ).to.exist;
            expect(
              baseCredential,
              `Expected ${name} to issue a base credential`
            ).to.exist;
          };
          it('When generating ECDSA signatures, the signature value MUST be ' +
          'expressed according to section 7 of [RFC4754] (sometimes referred ' +
          'to as the IEEE P1363 format) and encoded according to the ' +
          'specific cryptosuite proof generation algorithm.', async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#base-proof-serialization-ecdsa-sd-2023:~:text=When%20generating%20ECDSA%20signatures%2C%20the%20signature%20value%20MUST%20be%20expressed%20according%20to%20section%207';
            assertIssuer();
            const _proof = proofs.find(p =>
              p?.cryptosuite === 'ecdsa-sd-2023');
            expect(
              _proof,
              `Expected VC from issuer ${name} to have an ' +
              '"ecdsa-sd-2023" proof`).to.exist;
            expect(
              _proof.proofValue,
              `Expected VC from issuer ${name} to have a ' +
              '"proof.proofValue"`
            ).to.exist;
            expect(
              _proof.proofValue,
              `Expected VC "proof.proofValue" from issuer ${name} to be ` +
              'a string.'
            ).to.be.a.string;
            //Ensure the proofValue string starts with u, indicating that it
            //is a multibase-base64url-no-pad-encoded value, throwing an
            //error if it does not.
            expect(
              _proof.proofValue.startsWith('u'),
              `Expected "proof.proofValue" to start with u received ` +
              `${_proof.proofValue[0]}`).to.be.true;
            // now test the encoding which is bs64 url no pad for this suite
            expect(
              shouldBeBs64UrlNoPad(_proof.proofValue),
              'Expected "proof.proofValue" to be bs64 url no pad encoded.'
            ).to.be.true;
            await shouldHaveHeaderBytes(
              _proof.proofValue,
              new Uint8Array([0xd9, 0x5d, 0x00])
            );
          });
          it('If source has an id that is not a blank node identifier, set ' +
          'selection.id to its value. Note: All non-blank node identifiers ' +
          'in the path of any JSON Pointer MUST be included in the ' +
          'selection, this includes any root document identifier.',
          async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#jsonpointertopaths:~:text=If%20source%20has%20an%20id%20that%20is%20not%20a%20blank%20node%20identifier%2C%20set%20selection.id%20to%20its%20value.%20Note%3A%20All%20non%2Dblank%20node%20identifiers%20in%20the%20path%20of%20any%20JSON%20Pointer%20MUST%20be%20included%20in%20the%20selection%2C%20this%20includes%20any%20root%20document%20identifier.';
            this.cell.skipMessage = 'Not Implemented';
            this.skip();
          });
          it('If source.type is set, set selection.type to its value. ' +
          'Note: The selection MUST include all types in the path of any ' +
          'JSON Pointer, including any root document type.', async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#selective-disclosure-functions:~:text=If%20source.type%20is%20set%2C%20set%20selection.type%20to%20its%20value.%20Note%3A%20The%20selection%20MUST%20include%20all%20types%20in%20the%20path%20of%20any%20JSON%20Pointer%2C%20including%20any%20root%20document%20type.';
            this.cell.skipMessage = 'Not Implemented';
            this.skip();
          });
          it('Set value to parentValue.path. If value is now undefined, an ' +
          'error MUST be raised and SHOULD convey an error type of ' +
          'PROOF_GENERATION_ERROR, indicating that the JSON pointer does ' +
          'not match the given document.', async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#selective-disclosure-functions:~:text=Set%20value%20to%20parentValue.path.%20If%20value%20is%20now%20undefined%2C%20an%20error%20MUST%20be%20raised%20and%20SHOULD%20convey%20an%20error%20type%20of%20PROOF_GENERATION_ERROR%2C%20indicating%20that%20the%20JSON%20pointer%20does%20not%20match%20the%20given%20document.';
            assertIssuer();
            await assertions.shouldFailIssuance({
              credential: structuredClone(credential),
              issuer,
              reason: 'Should not issue VC with json pointer that does not ' +
              'match credential.',
              options: {
                mandatoryPointers: ['/non/existent/path']
              }
            });
          });
          it('CBOR-encode components per [RFC8949] where CBOR tagging MUST ' +
          'NOT be used on any of the components. Append the produced encoded ' +
          'value to proofValue.', async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#selective-disclosure-functions:~:text=and%20mandatoryPointers.-,CBOR%2Dencode%20components%20per%20%5BRFC8949%5D%20where%20CBOR%20tagging%20MUST,-NOT%20be%20used';
            this.cell.skipMessage = 'Not Implemented';
            this.skip();
          });
          it('If the proofValue string does not start with u, indicating ' +
          'that it is a multibase-base64url-no-pad-encoded value, an error ' +
          'MUST be raised and SHOULD convey an error type of ' +
          'PROOF_VERIFICATION_ERROR.', async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#selective-disclosure-functions:~:text=produced%20as%20output.-,If%20the%20proofValue%20string%20does%20not%20start%20with%20u%2C%20indicating%20that%20it%20is%20a%20multibase%2Dbase64url%2Dno%2Dpad%2Dencoded%20value%2C%20an%20error%20MUST%20be%20raised%20and%20SHOULD%20convey%20an%20error%20type%20of%20PROOF_VERIFICATION_ERROR.,-Initialize%20decodedProofValue%20to';
            this.cell.skipMessage = 'Not Implemented';
            this.skip();
            /*
            await assertions.verificationFail({
              verifier,
              credential: fixtures.get('invalidProofValuePrefix'),
              reason: 'Should not verify VC with invalid proofValue prefix'
            });
            */
          });
          it('If the decodedProofValue does not start with the ECDSA-SD ' +
          'base proof header bytes 0xd9, 0x5d, and 0x00, an error MUST be ' +
          'raised and SHOULD convey an error type of PROOF_VERIFICATION_ERROR.',
          async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#selective-disclosure-functions:~:text=If%20the%20decodedProofValue%20does%20not%20start%20with%20the%20ECDSA%2DSD%20base%20proof%20header%20bytes%200xd9%2C%200x5d%2C%20and%200x00%2C%20an%20error%20MUST%20be%20raised%20and%20SHOULD%20convey%20an%20error%20type%20of%20PROOF_VERIFICATION_ERROR.';
            this.cell.skipMessage = 'Not Implemented';
            this.skip();
            /*
            await assertions.verificationFail({
              verifier,
              credential: fixtures.get('invalidBaseProofHeader'),
              reason: 'Should not verify VC with invalid base proof header'
            });
            */
          });
          it('If the decodedProofValue does not start with the ECDSA-SD ' +
          'disclosure proof header bytes 0xd9, 0x5d, and 0x01, an error ' +
          'MUST be raised and SHOULD convey an error type of ' +
          'PROOF_VERIFICATION_ERROR.', async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#selective-disclosure-functions:~:text=If%20the%20decodedProofValue%20does%20not%20start%20with%20the%20ECDSA%2DSD%20disclosure%20proof%20header%20bytes%200xd9%2C%200x5d%2C%20and%200x01%2C%20an%20error%20MUST%20be%20raised%20and%20SHOULD%20convey%20an%20error%20type%20of%20PROOF_VERIFICATION_ERROR.';
            this.cell.skipMessage = 'Not Implemented';
            this.skip();
            /*
            await assertions.verificationFail({
              verifier,
              credential: fixtures.get('invalidDisclosureProofHeader'),
              reason: 'Should not verify VC with invalid disclosure proof ' +
              'header'
            });
            */
          });
          it('If the result is not an array of the following five elements ' +
          '— a byte array of length 64; a byte array of length 36; an array ' +
          'of byte arrays, each of length 64; a map of integers to byte ' +
          'arrays, each of length 32; and an array of integers — an error ' +
          'MUST be raised and SHOULD convey an error type of ' +
          'PROOF_VERIFICATION_ERROR.', async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#selective-disclosure-functions:~:text=array%20of%20integers%20%E2%80%94-,an%20error%20MUST%20be%20raised%20and%20SHOULD%20convey%20an%20error%20type%20of%20PROOF_VERIFICATION_ERROR.,-Replace%20the%20fourth';
            this.cell.skipMessage = 'Not Implemented';
            this.skip();
          });
          it('The transformation options MUST contain a type identifier for ' +
          'the cryptographic suite (type), a cryptosuite identifier ' +
          '(cryptosuite), and a verification method (verificationMethod).',
          async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#selective-disclosure-functions:~:text=The%20transformation%20options%20MUST%20contain%20a%20type%20identifier%20for%20the%20cryptographic%20suite%20(type)%2C%20a%20cryptosuite%20identifier%20(cryptosuite)%2C%20and%20a%20verification%20method%20(verificationMethod).';
            this.cell.skipMessage = 'Not Implemented';
            this.skip();
            /*
            await assertions.verificationFail({
              verifier,
              credential: fixtures.get('noTypeCryptosuiteOrVm'),
              reason: 'Should not verify VC with no type or cryptosuite'
            });
            */
          });
          it('The transformation options MUST contain an array of mandatory ' +
          'JSON pointers (mandatoryPointers) and MAY contain additional ' +
          'options, such as a JSON-LD document loader.', async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#selective-disclosure-functions:~:text=The%20transformation%20options%20MUST%20contain%20an%20array%20of%20mandatory%20JSON%20pointers%20(mandatoryPointers)%20and%20MAY%20contain%20additional%20options%2C%20such%20as%20a%20JSON%2DLD%20document%20loader.';
            this.cell.skipMessage = 'Not Implemented';
            this.skip();
            /*
            await assertions.verificationFail({
              credential: fixtures.get('noMandatoryPointers'),
              verifier,
              reason: 'Should not verify VC with no mandatoryPointers'
            });
            */
          });
          it('Whenever this algorithm encodes strings, it MUST use UTF-8 ' +
          'encoding.', async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#selective-disclosure-functions:~:text=produced%20as%20output.-,Whenever%20this%20algorithm%20encodes%20strings%2C%20it%20MUST%20use%20UTF%2D8%20encoding.,-Initialize%20hmac%20to';
            this.cell.skipMessage = 'Not Implemented';
            this.skip();
          });
          it('Per the recommendations of [RFC2104], the HMAC key MUST be the ' +
          'same length as the digest size; for SHA-256, this is 256 bits or ' +
          '32 bytes.', async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#selective-disclosure-functions:~:text=Per%20the%20recommendations%20of%20%5BRFC2104%5D%2C%20the%20HMAC%20key%20MUST%20be%20the%20same%20length%20as%20the%20digest%20size%3B%20for%20SHA%2D256%2C%20this%20is%20256%20bits%20or%2032%20bytes.';
            this.cell.skipMessage = 'Not Implemented';
            this.skip();
          });
          it('The proof options MUST contain a type identifier for the ' +
          'cryptographic suite (type) and MUST contain a cryptosuite ' +
          'identifier (cryptosuite).', async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#base-proof-configuration-ecdsa-sd-2023';
            this.cell.skipMessage = 'Not Implemented';
            this.skip();
            /*
            await assertions.verificationFail({
              verifier,
              credential: fixtures.get('noTypeCryptosuite'),
              reason: 'Should not verify VC with no type or cryptosuite'
            });
            */
          });
          it('If proofConfig.type is not set to DataIntegrityProof and/or ' +
          'proofConfig.cryptosuite is not set to ecdsa-sd-2023, an error ' +
          'MUST be raised and SHOULD convey an error type of ' +
          'PROOF_GENERATION_ERROR.', async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#base-proof-configuration-ecdsa-sd-2023:~:text=If%20proofConfig.type%20is%20not%20set%20to%20DataIntegrityProof%20and/or%20proofConfig.cryptosuite%20is%20not%20set%20to%20ecdsa%2Dsd%2D2023%2C%20an%20error%20MUST%20be%20raised%20and%20SHOULD%20convey%20an%20error%20type%20of%20PROOF_GENERATION_ERROR.';
            this.cell.skipMessage = 'Not Implemented';
            this.skip();
            /*
            await assertions.verificationFail({
              verifier,
              credential: fixtures.get('noTypeCryptosuite'),
              reason: 'Should not verify VC with no type or cryptosuite'
            });
            */
          });
          it('If proofConfig.created is set and if the value is not a valid ' +
          '[XMLSCHEMA11-2] datetime, an error MUST be raised and SHOULD ' +
          'convey an error type of PROOF_GENERATION_ERROR.', async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#base-proof-configuration-ecdsa-sd-2023';
            await assertions.verificationFail({
              credential: fixtures.get('invalidCreated'),
              verifier,
              reason: 'Should not verify VC with invalid created'
            });
          });
          it('The proof options MUST contain a type identifier for the ' +
          'cryptographic suite (type) and MAY contain a cryptosuite ' +
          'identifier (cryptosuite).', async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#base-proof-serialization-ecdsa-sd-2023';
            this.cell.skipMessage = 'Not Implemented';
            this.skip();
            /*
            await assertions.verificationFail({
              verifier,
              credential: fixtures.get('noTypeCryptosuite'),
              reason: 'Should not verify VC with no type or cryptosuite'
            });
            */
          });
          it('If the length of signatures does not match the length of ' +
          'nonMandatory, an error MUST be raised and SHOULD convey an ' +
          'error type of PROOF_VERIFICATION_ERROR, indicating that the ' +
          'signature count does not match the non-mandatory message count.',
          async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#base-proof-serialization-ecdsa-sd-2023:~:text=If%20the%20length%20of%20signatures%20does%20not%20match%20the%20length%20of%20nonMandatory%2C%20an%20error%20MUST%20be%20raised%20and%20SHOULD%20convey%20an%20error%20type%20of%20PROOF_VERIFICATION_ERROR%2C%20indicating%20that%20the%20signature%20count%20does%20not%20match%20the%20non%2Dmandatory%20message%20count.';
            this.cell.skipMessage = 'Not Implemented';
            this.skip();
          });
        });
      }
    }
  });
}

async function _setup({
  credential,
  suiteName,
  keyType,
  mandatoryPointers,
  selectivePointers
}) {
  const {invalidCreated} = generators?.dates;
  const credentials = new Map();
  const keyPair = await getMultiKey({keyType});
  const signer = keyPair.signer();
  const _credential = structuredClone(credential);
  _credential.issuer = keyPair.controller;
  credentials.set('invalidCreated', await issueCloned(invalidCreated({
    credential: structuredClone(_credential),
    ...getSuites({
      signer,
      suiteName,
      selectivePointers,
      mandatoryPointers
    })
  })));
  return credentials;
}
