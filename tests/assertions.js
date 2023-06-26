/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import {
  multibaseMultikeyHeaderP256, multibaseMultikeyHeaderP384
} from './helpers.js';

// RegExp with bs58 characters in it
const bs58 =
  /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
// assert something is entirely bs58 encoded
export const shouldBeBs58 = s => bs58.test(s);

export const shouldBeMulticodecEncoded = s => {
  // check if it is multi codec encoded
  if(s.startsWith(multibaseMultikeyHeaderP256)) {
    // the multicodec encoding of a P-256 public key is the two-byte
    // prefix 0x1200 followed by the 33-byte compressed public key data.
  }

  if(s.startsWith(multibaseMultikeyHeaderP384)) {
    // the multicodec encoding of a P-384 public key is the two-byte prefix
    // 0x1201 followed by the 49-byte compressed public key data.
  }
};
