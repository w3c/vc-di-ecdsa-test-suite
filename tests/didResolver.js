/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import * as didMethodKey from '@digitalbazaar/did-method-key';
import * as EcdsaMultikey from '@digitalbazaar/ecdsa-multikey';

const didKeyDriver = didMethodKey.driver();

const SUPPORTED_BASE58_ECDSA_MULTIKEY_HEADERS = new Map([
  ['P-256', 'zDna'],
  ['P-384', 'z82L']
]);

const multibaseMultikeyHeaderP256 =
  SUPPORTED_BASE58_ECDSA_MULTIKEY_HEADERS.get('P-256');
didKeyDriver.use({
  multibaseMultikeyHeader: multibaseMultikeyHeaderP256,
  fromMultibase: EcdsaMultikey.from
});

const multibaseMultikeyHeaderP384 =
  SUPPORTED_BASE58_ECDSA_MULTIKEY_HEADERS.get('P-384');
didKeyDriver.use({
  multibaseMultikeyHeader: multibaseMultikeyHeaderP384,
  fromMultibase: EcdsaMultikey.from
});

export async function didResolver(url) {
  if(url.startsWith('did:')) {
    return didKeyDriver.get({did: url});
  }
  throw new Error('DID Method not supported by resolver');
}
