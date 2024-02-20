/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as EcdsaMultikey from '@digitalbazaar/ecdsa-multikey';
import {require} from './helpers.js';

const keys = require('../../config/keys.json');
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

export const getMultikeys = async () => {
  const _keys = {};
  for(const prop in keys) {
    const serializedKeyPair = require(keys[prop]);
    const formattedKey = formatKey(serializedKeyPair);
    const key = await EcdsaMultikey.from(formattedKey);
    const signer = key.signer();
    // The issuer needs to match the signer or the controller of the signer
    const issuer = `did:key:${key.publicKeyMultibase}`;
    // verificationMethod needs to be a fragment
    // this only works for did:key
    signer.id = `${issuer}#${key.publicKeyMultibase}`;
    _keys[prop] = {signer, issuer, key};
  }
  return _keys;
};
