/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as Ecdsa25519Multikey from '@digitalbazaar/ecdsa-multikey';

export const getMultikey = async ({serializedKeyPair}) => {
  if(!serializedKeyPair) {
    throw new Error('serializedKeyPair required');
  }
  const key = await Ecdsa25519Multikey.from(serializedKeyPair);
  const signer = key.signer();
  // The issuer needs to match the signer or the controller of the signer
  const issuer = `did:key:${key.publicKeyMultibase}`;
  // verificationMethod needs to be a fragment
  // this only works for did:key
  signer.id = `${issuer}#${key.publicKeyMultibase}`;
  return {signer, issuer, key};
};

