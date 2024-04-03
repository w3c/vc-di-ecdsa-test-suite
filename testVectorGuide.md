<!--
Copyright 2023 Digital Bazaar, Inc.

SPDX-License-Identifier: BSD-3-Clause
-->

## Table of Contents

- [Usage](#Usage)
  - [Configuring the Test Data](#Configuring-the-test-data)
  - [Configuring Test Data Generation](#Configuring-test-data-generation)

## Usage
The suites call on a set of common config files stored at `./config/`.
- `./config/runner.json` is for test suite specific configuration.
- `./config/vector.json` is for test vector specific configuration.

### Configuring the Test Data
The tests run a set of static test vectors configured by `./config/vectors.json.`.
The vectors are configured for each suite and contain a credentials section.
The initial ./config/vectors.json` is populated with defaults.

Credentials configuration consists of 3 properties:
- `create` for issuance or VC creation tests.
- `verify` for VC verification tests.
  - Some `verify` sections contain multiple credentials and pointers for test data.
- `interop` for VC interoperability tests.

The test vector configuration consists of a version (either 1.1 or 2.0) and 1-3 paths to JSON objects:
- The property `document` is a path to an unsigned credential.
  - `document` is required by all tests.
- The property `mandatoryPointers` is a path to a JSON array of pointers.
  - `mandatoryPointers` are required only for selective disclosure tests.
- The property `selectivePointers` is an array containing all pointers for a credential.
  - Pointers used in the tests are deduced from the full set of pointers.
  - `selectivePointers` are required only for selective disclosure tests.

Some credentials sections (such as the sd verify test) might require multiple test vectors.
If multiple vectors are required, multiple named properties must be filled in 
in that section, in order for the tests to run.

Each vectors suite has an associated `keyTypes` property.
That property contains an array of `keyTypes` used to create verification test data.
Your implementation will only be tested against the `supportedEcdsaKeyTypes` specified
in your implementation manifest.

A minimal non-SD test vector configuration looks like this:
```js
"verify": {
  "1.1": {"document": "./test/input/vc-di-ecdsa/TestVectors/1.1/ecdsa-sd-2023/windDoc.json"},
  "2.0": {"document": "./test/input/vc-di-ecdsa/TestVectors/2.0/ecdsa-sd-2023/windDoc.json"}
}
```

An SD test vector configuration looks like this:
```js
"create": {
  "1.1": {
    "document": "./mocks/valid/1.1/document.json",
    "mandatoryPointers": "./mocks/valid/1.1/mandatoryPointers.json",
    "selectivePointers": "./mocks/valid/1.1/selectivePointers.json"
  },
  "2.0": {
    "document": "./mocks/valid/2.0/document.json",
    "mandatoryPointers": "./mocks/valid/2.0/mandatoryPointers.json",
    "selectivePointers": "./mocks/valid/2.0/selectivePointers.json"
  }
}
```

You can see the full `config/vectors.json` [here](/config/vectors.json)

### Configuring Test Data Generation
To generate interop test data used in the test suite, testers may specify
the holder name using either the environment variable `SD_HOLDER_NAME` or the setting 
`holderName` in the `ecdsa-sd-2023` section of `./config/runner.json`. This holder
name will be used as the VC holder name when generating disclosed test credentials
for ECDSA-SD tests.
If `$SD_HOLDER_NAME` or `holderName` is not specified, `Digital Bazaar` will be used.

```
SD_HOLDER_NAME="HolderName" npm test
```
