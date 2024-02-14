<!--
Copyright 2023 Digital Bazaar, Inc.

SPDX-License-Identifier: BSD-3-Clause
-->

## Table of Contents

- [Usage](#Usage)
  - [Configuring the Test Data](#Configuring-the-test-data)
  - [Configuring Test Data Generation](#Configuring-test-data-generation)

## Usage
The suites call on a common config file stored at `./config/runner.json`.
The test vectors call on a common config file stored at `./config/vector.json`.

### Configuring the Test Data
The tests run a set of static test vectors.
The vectors are configured in the `credentials` section of a suite.

Credentials configuration consists of 3 properties:
- `create` for issuance or VC creation tests.
- `verify` for VC verification tests.
  - Some `verify` sections contain multiple credentials and pointers for test data.
- `interop` for VC interoperability tests.

The test vector configuration consists of 1-3 paths to JSON objects:
- The property `document` is a path to an unsigned credential.
  - `document` is required by all tests.
- The property `mandatoryPointers` is a path to a JSON array of pointers.
  - `mandatoryPointers` are required only for selective disclosure tests.
- The property `selectivePointers` is an array containing all pointers for a credential.
  - Pointers used in the tests are deduced from the full set of pointers.
  - `selectivePointers` are required only for selective disclosure tests.
Some credentials sections might require multiple VCs. In this case multiple named
properties must be fulfilled in that section in order for the tests to run.

A minimal non-SD test vector configuration looks like this:
```js
"verify": {
  "document": "./test/input/vc-di-ecdsa/TestVectors/ecdsa-sd-2023/windDoc.json"
}
```

An SD test vector configuration looks like this:
```js
"create": {
  "document": "./mocks/valid/document.json",
  "mandatoryPointers": "./mocks/valid/mandatoryPointers.json",
  "selectivePointers": "./mocks/valid/selectivePointers.json"
}
```

The full `config/runner.json` file currently looks like this:
```js
{
  "suites": {
    "ecdsa-rdfc-2019": {
      "credentials": {
        "create": {"document": "./mocks/valid/document.json"},
        "verify": {"document": "./mocks/valid/document.json"},
        "interop": {"document": "./mocks/valid/document.json"}
      }
    },
    "ecdsa-sd-2023": {
      "credentials": {
        "create": {
          "document": "./mocks/valid/document.json",
          "mandatoryPointers": "./mocks/valid/mandatoryPointers.json"
        },
        "verify": {
          "subjectNestedObjects": {
            "document": "./mocks/valid/document.json",
            "mandatoryPointers": "./mocks/valid/mandatoryPointers.json",
            "selectivePointers": "./mocks/valid/selectivePointers.json"
          },
          "subjectHasArrays": {
            "document": "./mocks/achievement/document.json",
            "mandatoryPointers": "./mocks/achievement/mandatoryPointers.json",
            "selectivePointers": "./mocks/achievement/selectivePointers.json"
          }
        },
        "interop": {
          "document": "./mocks/valid/document.json",
          "mandatoryPointers": "./mocks/valid/mandatoryPointers.json",
          "selectivePointers": "./mocks/valid/selectivePointers.json"
        }
      }
    }
  }
}
```

### Configuring Test Data Generation
To generate test data used in the test suite, testers may specify
the issuer name using an environment variable or setting `issuerName` in a
particular suite in `./config/runner.json`. 

- For the `ecdsa-rdfc-2019` suite use `RDFC_ISSUER_NAME` set to an implementation name.
- For the `ecdsa-sd-2023` suite use `SD_ISSUER_NAME` set to an implementation name.
  - In both cases the issuer will default to `Digital Bazaar`.

In addition, the environment variable `SD_HOLDER_NAME` or the setting 
`holderName` in the `ecdsa-sd-2023` section of ./config/runner.json` 
can be used to specify the VC holder name for generating disclosed test credentials for ECDSA-SD tests.
If `$SD_HOLDER_NAME` or `holderName` is not specified, `Digital Bazaar` will be used.

```
SD_ISSUER_NAME="IssuerName" SD_HOLDER_NAME="HolderName" npm test
```

