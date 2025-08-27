// Copyright 2023 Digital Bazaar, Inc.
//
// SPDX-License-Identifier: BSD-3-Clause

module.exports = {
  env: {
    node: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  extends: [
    'eslint-config-digitalbazaar',
    'eslint-config-digitalbazaar/jsdoc',
    'digitalbazaar/module',
  ],
  rules: {
    'jsdoc/check-examples': 0,
    'max-len': ['error', {ignorePattern: '\\* SPDX-License-Identifier: ',
      ignoreUrls: true}]
  }
};
