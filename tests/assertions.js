/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import {
  expectedP256Prefix, expectedP384Prefix, multibaseMultikeyHeaderP256,
  multibaseMultikeyHeaderP384,
} from './helpers.js';
import {decode} from 'base58-universal';
import varint from 'varint';

// RegExp with bs58 characters in it
const bs58 =
  /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
// assert something is entirely bs58 encoded
export const shouldBeBs58 = s => bs58.test(s);

export const shouldBeMulticodecEncoded = async s => {
  // check if it is multi codec encoded
  if(s.startsWith(multibaseMultikeyHeaderP256)) {
    // example of a P-256 publicKeyMultibase -
    // zDnaepHgv4AU1btQ8dp6EYbvgJ6M1ovzKnSpXJUPU2hshXLvp
    const bytes = await decode(s.slice(1));
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
    return JSON.stringify(prefix) === JSON.stringify(expectedP256Prefix);
  }

  if(s.startsWith(multibaseMultikeyHeaderP384)) {
    const bytes = await decode(s.slice(1));
    bytes.length.should.equal(51);
    // get the two-byte prefix
    const prefix = Array.from(bytes.slice(0, 2));
    // the multicodec encoding of a P-384 public key is the two-byte prefix
    // 0x1201 followed by the 49-byte compressed public key data.
    return JSON.stringify(prefix) === JSON.stringify(expectedP384Prefix);
  }
  // Unsupported key type, return false
  return false;
};

export const shouldBeDetachedEcdsa = async s => {
  const bytes = await decode(s.slice(1));
  const expectedPrefixes = [];
  // These varint values are from ecdsa-multikey lib
  // eslint-disable-next-line max-len
  // https://github.com/digitalbazaar/ecdsa-multikey/blob/5c13147eff96ab4f6eda8484604f387fea0751d6/util/varint-conversions.js#L17-L22
  const varints = ['0x1200', '0x1201', '0x1202', '0x1306', '0x1307', '0x1308'];
  for(let i = 0; i < varints.length; i++) {
    const expectedPrefix = await varint.encode(varints[i]);
    expectedPrefixes.push(JSON.stringify(expectedPrefix));
  }
  const prefix = Array.from(bytes.slice(0, 2));

  return expectedPrefixes.includes(JSON.stringify(prefix));
};
