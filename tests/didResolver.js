/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import * as didMethodKey from '@digitalbazaar/did-method-key';
import * as EcdsaMultikey from '@digitalbazaar/ecdsa-multikey';
import {
  multibaseMultikeyHeaderP256, multibaseMultikeyHeaderP384
} from './helpers.js';
import {Ed25519VerificationKey2020} from
  '@digitalbazaar/ed25519-verification-key-2020';

const didKeyDriver = didMethodKey.driver();

// FIXME: Remove this once API catalog has been updated to issue
// VC with ECDSA signature type proof.
didKeyDriver.use({
  multibaseMultikeyHeader: 'z6Mk',
  fromMultibase: Ed25519VerificationKey2020.from
});

didKeyDriver.use({
  multibaseMultikeyHeader: multibaseMultikeyHeaderP256,
  fromMultibase: EcdsaMultikey.from
});

didKeyDriver.use({
  multibaseMultikeyHeader: multibaseMultikeyHeaderP384,
  fromMultibase: EcdsaMultikey.from
});

export async function didResolver({url}) {
  if(url.startsWith('did:')) {
    return didKeyDriver.get({did: url});
  }
  throw new Error('DID Method not supported by resolver');
}
