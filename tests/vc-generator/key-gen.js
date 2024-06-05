/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as EcdsaMultikey from '@digitalbazaar/ecdsa-multikey';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const keys = require('../../config/keys.json');

// checks and adds missing properties to keys
const formatKey = key => {
  if(key.privateKeyMultibase && !key.secretKeyMultibase) {
    key.secretKeyMultibase = key.privateKeyMultibase;
  }
  if(!key.controller) {
    key.controller = `did:key:${key.publicKeyMultibase}`;
  }
  if(!key.id) {
    key.id = `${key.controller}#${key.publicKeyMultibase}`;
  }
  return key;
};

export const getMultikeys = async ({keyTypes}) => {
  const _keys = new Map();
  for(const keyType in keys) {
    // don't fetch keys not specified by keyTypes
    if(!new Set(keyTypes).has(keyType)) {
      continue;
    }
    const key = await getMultiKey({keyType});
    const signer = key.signer();
    // The issuer needs to match the signer or the controller of the signer
    const issuer = `did:key:${key.publicKeyMultibase}`;
    // verificationMethod needs to be a fragment
    // this only works for did:key
    signer.id = `${issuer}#${key.publicKeyMultibase}`;
    _keys.set(keyType, {signer, issuer, key});
  }
  return _keys;
};

export async function getMultiKey({keyType}) {
  // require the exported keyPair
  const serializedKeyPair = require(`../${keys[keyType]}`);
  // check format keyPair to ensure it's interoperable with multikey spec
  const formattedKey = formatKey(serializedKeyPair);
  return EcdsaMultikey.from(formattedKey);
}
