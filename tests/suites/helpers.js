/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {getSuite} from '../vc-generator/cryptosuites.js';

// FIXME:an existing function in data integrity test suite assertion
// does something similar to this function, but is not currently exported
export function getSuites({
  signer,
  suiteName,
  mandatoryPointers,
  selectivePointers
}) {
  const suites = {
    suite: new DataIntegrityProof({
      signer,
      cryptosuite: getSuite({
        suite: suiteName,
        mandatoryPointers
      })
    })
  };
  if(selectivePointers) {
    suites.selectiveSuite = new DataIntegrityProof({
      signer,
      cryptosuite: getSuite({
        suite: suiteName,
        selectivePointers
      })
    });
  }
  return suites;
}
