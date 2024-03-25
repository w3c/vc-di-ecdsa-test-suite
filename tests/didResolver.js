/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as didMethodKey from '@digitalbazaar/did-method-key';
import * as EcdsaMultikey from '@digitalbazaar/ecdsa-multikey';
import {
  multibaseMultikeyHeaderEd25519,
  multibaseMultikeyHeaderP256, multibaseMultikeyHeaderP384
} from './helpers.js';
import {
  Ed25519VerificationKey2020
} from '@digitalbazaar/ed25519-verification-key-2020';

const didKeyDriver = didMethodKey.driver();

didKeyDriver.use({
  multibaseMultikeyHeader: multibaseMultikeyHeaderP256,
  fromMultibase: EcdsaMultikey.from
});

didKeyDriver.use({
  multibaseMultikeyHeader: multibaseMultikeyHeaderP384,
  fromMultibase: EcdsaMultikey.from
});

didKeyDriver.use({
  multibaseMultikeyHeader: multibaseMultikeyHeaderEd25519,
  fromMultibase: Ed25519VerificationKey2020.from
});

export async function didResolver({url}) {
  if(url.startsWith('did:')) {
    return didKeyDriver.get({did: url});
  }
  throw new Error('DID Method not supported by resolver');
}
