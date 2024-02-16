/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as ecdsaSd2023Cryptosuite from
  '@digitalbazaar/ecdsa-sd-2023-cryptosuite';
import {
  cryptosuite as ecdsaRdfc2019Cryptosuite
} from '@digitalbazaar/ecdsa-rdfc-2019-cryptosuite';

export const cryptosuites = new Map([
  ['ecdsa-rdfc-2019', ecdsaRdfc2019Cryptosuite],
  ['ecdsa-sd-2023', ecdsaSd2023Cryptosuite]
]);

