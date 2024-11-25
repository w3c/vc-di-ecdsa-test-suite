/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  getBs58Bytes,
  getBs64UrlBytes,
  getProofs,
  isValidDatetime,
  isValidUtf8,
  multibaseMultikeyHeaderP256,
  multibaseMultikeyHeaderP384,
} from './helpers.js';
import chai from 'chai';
import {klona} from 'klona';
import varint from 'varint';

const should = chai.should();

// RegExp with bs58 characters in it
const bs58 =
  /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
// assert something is entirely bs58 encoded
export const shouldBeBs58 = s => bs58.test(s);

const bs64UrlNoPad = /^[A-Za-z0-9\-_]+$/;
export const shouldBeBs64UrlNoPad = s => bs64UrlNoPad.test(s);

// size of ecdsa-rdfc-2019 proofValues per keyType
export const proofBytes = {
  'P-256': 64,
  'P-384': 96
};

export const shouldHaveByteLength = async (
  multibaseString,
  expectedByteLength
) => {
  const bytes = await getBs58Bytes(multibaseString);
  bytes.length.should.eql(
    expectedByteLength,
    `Expected byteLength of ${expectedByteLength} received ${bytes.length}.`);
};

export const shouldHaveHeaderBytes = async (multibaseString, headerBytes) => {
  const bytes = await getBs64UrlBytes(multibaseString);
  const actualHeaderBytes = Array.from(bytes.slice(0, headerBytes.length));
  actualHeaderBytes.should.eql(
    Array.from(headerBytes),
    'Actual header bytes did not match expected header bytes.'
  );
};

export const shouldBeMulticodecEncoded = async s => {
  // check if it is multi codec encoded
  if(s.startsWith(multibaseMultikeyHeaderP256)) {
    // example of a P-256 publicKeyMultibase -
    // zDnaepHgv4AU1btQ8dp6EYbvgJ6M1ovzKnSpXJUPU2hshXLvp
    const bytes = await getBs58Bytes(s);
    bytes.length.should.equal(35);
    // bytes example => Uint8Array(35) [
    //   128,  36,   3,  98, 121, 153, 205, 199,
    //    39, 148, 212,  49, 157,  57, 152, 184,
    //    97,  14, 217, 198,  76,  50,  46, 169,
    //    58, 124, 244, 202, 141, 161,  92,  55,
    //   122, 233, 205
    // ]
    // get the two-byte prefix
    const prefix = Array.from(bytes.slice(0, 2));
    // the multicodec encoding of a P-256 public key is the two-byte
    // prefix 0x1200 followed by the 33-byte compressed public key data.
    const expectedP256Prefix = await varint.encode(0x1200);
    return JSON.stringify(prefix) === JSON.stringify(expectedP256Prefix);
  }

  if(s.startsWith(multibaseMultikeyHeaderP384)) {
    const bytes = await getBs58Bytes(s);
    bytes.length.should.equal(51);
    // get the two-byte prefix
    const prefix = Array.from(bytes.slice(0, 2));
    // the multicodec encoding of a P-384 public key is the two-byte prefix
    // 0x1201 followed by the 49-byte compressed public key data.
    const expectedP384Prefix = await varint.encode(0x1201);
    return JSON.stringify(prefix) === JSON.stringify(expectedP384Prefix);
  }
  // Unsupported key type, return false
  return false;
};

export const verificationFail = async ({credential, verifier}) => {
  const body = {
    verifiableCredential: credential,
    options: {
      checks: ['proof']
    }
  };
  const {result, error} = await verifier.post({json: body});
  should.not.exist(result, 'Expected no result from verifier.');
  should.exist(error, 'Expected verifier to error.');
  should.exist(error.status, 'Expected verifier to return an HTTP Status code');
  error.status.should.equal(
    400,
    'Expected HTTP Status code 400 invalid input!'
  );
};

export const verificationSuccess = async ({credential, verifier}) => {
  const body = {
    verifiableCredential: credential,
    options: {
      checks: ['proof']
    }
  };
  const {result, error, data} = await verifier.post({json: body});
  if(!result || !result.ok) {
    console.warn(
      `Verification failed for ${(result || error)?.requestUrl}`,
      (error || 'no error thrown'),
      JSON.stringify({credential, data}, null, 2));
  }
  should.not.exist(error, 'Expected verifier to not error.');
  should.exist(result, 'Expected a result from verifier.');
  should.exist(result.status,
    'Expected verifier to return an HTTP Status code');
  result.status.should.equal(
    200,
    'Expected HTTP Status code 200.'
  );
};

/**
 * Asserts that an implementation supports a `keyType` required by the test
 * suite's cryptosuite.
 *
 * Implementations may support many key types, but they must
 * support at least the required key types.
 *
 * @param {object} options - The options to use for assertion.
 * @param {object|null} options.testVector - The test vector object to be
 * validated for the associated keyType. NULL if the keyType is not supported
 * by the implementation as specified in `supportedEcdsaKeyTypes`.
 * @param {string} options.keyType - The type of ECDSA key to check for within
 * the test vector. This specifies the exact key type that the implementation
 * is expected to support.
 */
export function expectImplementationTestVector({testVector, keyType}) {
  chai.expect(
    testVector,
    `Implementation not marked as supporting required "${keyType}"! ` +
    'Is keyType missing from `supportedEcdsaKeyTypes`?'
  ).to.exist;
}

export function itMustVerifyValidVC({
  keyType,
  suiteName,
  endpoint, testVector
}) {
  return it(`MUST verify a valid VC with an ${suiteName} proof.`,
    async function() {
      expectImplementationTestVector({testVector, keyType});

      await verificationSuccess({credential: testVector, verifier: endpoint});
    });
}

export function itRejectsInvalidCryptosuite(expectedValidSuites, {
  keyType,
  endpoint, testVector
}) {
  const validDescription = expectedValidSuites
    .map(suite => `the string "${suite}"`)
    .join(' or ');

  return it('If the "cryptosuite" field is not ' + validDescription +
  ', an error MUST be raised.',
  async function() {
    expectImplementationTestVector({testVector, keyType});

    const credential = klona(testVector);
    // FIXME add invalid-cryptosuite as a locally valid cryptosuite
    // name, so the signature is correct, but the cryptosuite
    // name is incorrect
    credential.proof.cryptosuite = 'invalid-cryptosuite';
    await verificationFail({credential, verifier: endpoint});
  });
}

export function assertSecuredCredential(securedCredential) {
  should.exist(securedCredential,
    'Expected issuer to have issued a credential.');
  const proofs = getProofs(securedCredential);
  should.exist(proofs,
    'Expected credential to have a proof.');
  proofs.length.should.equal(1,
    'Expected credential to have a single proof.');
}

export function assertAllUtf8(proof) {
  for(const [key, value] of Object.entries(proof)) {
    isValidUtf8(value).should.equal(
      true,
      `Expected ${key} value to be a valid UTF-8 encoded string.`
    );
  }
}

export function assertCryptosuiteProof(proof, cryptosuite) {
  should.exist(proof.type,
    'Expected a type on the proof.');
  proof.type.should.equal('DataIntegrityProof',
    'Expected DataIntegrityProof type.');
  should.exist(proof.cryptosuite,
    'Expected a cryptosuite identifier on the proof.');
  proof.cryptosuite.should.equal(cryptosuite,
    `Expected {cryptosuite} cryptosuite.`);
}

export function assertDataIntegrityProof(proof) {
  if(proof?.id) {
  }
  should.exist(proof.type,
    'Expected a type on the proof.');
  proof.type.should.equal('DataIntegrityProof',
    'Expected DataIntegrityProof type.');
  isValidUtf8(proof.type).should.equal(
    true,
    'Expected type value to be a valid UTF-8 encoded string.'
  );
  should.exist(proof.proofPurpose,
    'Expected a proofPurpose on the proof.');
  isValidUtf8(proof.proofPurpose).should.equal(
    true,
    'Expected proofPurpose value to be a valid UTF-8 encoded string.'
  );
  if(proof?.verificationMethod) {
    isValidUtf8(proof.verificationMethod).should.equal(
      true,
      'Expected verificationMethod value to be a valid UTF-8 encoded string.'
    );
  }
  should.exist(proof.cryptosuite,
    'Expected a cryptosuite identifier on the proof.');
  isValidUtf8(proof.cryptosuite).should.equal(
    true,
    'Expected cryptosuite value to be a valid UTF-8 encoded string.'
  );
  if(proof?.created) {
    isValidDatetime(proof.created).should.equal(
      true,
      'Expected created value to be a valid datetime string.'
    );
    isValidUtf8(proof.created).should.equal(
      true,
      'Expected created value to be a valid UTF-8 encoded string.'
    );
  }
  if(proof?.expires) {
    isValidDatetime(proof.expires).should.equal(
      true,
      'Expected created value to be a valid datetime string.'
    );
    isValidUtf8(proof.expires).should.equal(
      true,
      'Expected expires value to be a valid UTF-8 encoded string.'
    );
  }
  if(proof?.domain) {
    isValidUtf8(proof.domain).should.equal(
      true,
      'Expected domain value to be a valid UTF-8 encoded string.'
    );
  }
  if(proof?.challenge) {
    isValidUtf8(proof.challenge).should.equal(
      true,
      'Expected challenge value to be a valid UTF-8 encoded string.'
    );
  }
  should.exist(proof.proofValue,
    'Expected proof to have proofValue.');
  isValidUtf8(proof.proofValue).should.equal(
    true,
    'Expected proofValue value to be a valid UTF-8 encoded string.'
  );
  if(proof?.previousProof) {
  }
  if(proof?.nonce) {
  }
}
