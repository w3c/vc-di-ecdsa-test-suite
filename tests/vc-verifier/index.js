/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as didKey from '@digitalbazaar/did-method-key';
import * as EcdsaMultikey from '@digitalbazaar/ecdsa-multikey';
import * as vc from '@digitalbazaar/vc';
import {CachedResolver} from '@digitalbazaar/did-io';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {documentLoader} from '../vc-generator/documentLoader.js';
import {
  Ed25519VerificationKey2020
} from '@digitalbazaar/ed25519-verification-key-2020';

// Configure the driver for ECDSA DID keys
const driver = didKey.driver();
const didResolver = new CachedResolver();
const keyTypes = [
  {keyType: 'P-256', header: 'zDna', fromMultibase: EcdsaMultikey.from},
  {keyType: 'P-384', header: 'z82L', fromMultibase: EcdsaMultikey.from},
  {
    keyType: 'Ed25519',
    header: 'z6Mk',
    fromMultibase: Ed25519VerificationKey2020.from
  },
];

for(const {header, fromMultibase} of keyTypes) {
  driver.use({
    multibaseMultikeyHeader: header,
    fromMultibase
  });
}

didResolver.use(driver);

// Wrap the local document loader to handle DIDs
async function localDocumentLoader(url) {
  if(url.startsWith('did:')) {
    const document = await didResolver.get({did: url});
    return {
      contextUrl: null,
      documentUrl: url,
      document
    };
  }
  return documentLoader(url);
}

/**
 * Local instance of a Verifier service that can be used to verify VCs locally.
 *
 * This is not intended to be a complete implementation but sufficient only for
 * local testing.
 *
 * @param {object} options - The options to use for the verifier.
 * @param {string} options.cryptosuite - Cryptosuite to use for verification.
 * @returns {object} A Verifier service for the given cryptosuite.
 */
export const localVerifier = ({cryptosuite}) => ({
  post: async ({
    json: {verifiableCredential: credential, options: {checks}}}) => {
    const suite = new DataIntegrityProof({cryptosuite});

    try {
      const result = await vc.verifyCredential({
        credential,
        suite,
        documentLoader: localDocumentLoader,
      });
      let {verified} = result;

      // Certain errors will bypass the proof check, so ensure we run the check
      const hasUncheckedProof = verified && checks.includes('proof') &&
        result.error && !result.proof && result.results?.at(0) &&
        typeof credential.issuanceDate === 'string';

      if(hasUncheckedProof) {
        const proofResult = await vc.verifyCredential({
          credential,
          documentLoader: localDocumentLoader,
          suite,
          now: new Date(credential.issuanceDate),
        });

        verified = (result.verified && proofResult.verified);
        if(proofResult.verified) {
          result.results[0] = {
            ...proofResult.results[0],
            ...result.results[0],
            proofVerified: true
          };
        }
      }

      if(!verified) {
        return {
          error: {
            name: 'VerificationError',
            message: 'Verification error (local).',
            errors: result.error.errors?.map(({message}) => message) ??
              [result.error.message],
            causes: result.error.errors?.map(({cause}) => cause?.message) ?? [],
            credential: JSON.stringify(credential),
          },
          verified: false, status: 400
        };
      }

      return {result: {...result, status: 200, requestUrl: 'local-verifier'}};
    } catch(e) {
      return {
        error: {...e, verified: false, status: 400},
      };
    }
  }
});
