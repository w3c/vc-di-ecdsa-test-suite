/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as vc from '@digitalbazaar/vc';
import {config, require} from '../helpers.js';
import {cryptosuites} from './cryptosuites.js';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {getMultikey} from './key-gen.js';
import klona from 'klona';
import {validVc} from '../mock-data.js';

// cache test data for a single run
const vcCache = new Map([
  ['validVc', klona(validVc)]
]);

/**
 * Calls the vc generators and then returns a Map
 * with the test data.
 *
 * @returns {Promise<Map>} Returns a Map of test data.
 */
export async function generateTestData() {
  const serializedKeyPair = require(config.keyPair);
  const {signer, issuer} = await getMultikey(serializedKeyPair);
  const credential = klona(validVc);
  credential.issuer = issuer;
  for(const name in config.suites) {
    const suite = new DataIntegrityProof({
      signer,
      cryptosuite: cryptosuites.get(name)
    });

  }
  for(const [id, generator] of vcGenerators) {
    if(vcCache.get(id)) {
      continue;
    }
    const testData = await generator({signer, credential});
    vcCache.set(id, testData);
  }
  return {
    clone(key) {
      return klona(vcCache.get(key));
    }
  };
}
