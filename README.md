<!--
Copyright 2023 Digital Bazaar, Inc.

SPDX-License-Identifier: BSD-3-Clause
-->

# [ECDSA](https://www.w3.org/TR/vc-di-ecdsa/) Cryptosuite test suite

## Table of Contents

- [ECDSA Cryptosuite test suite](#ecdsa-cryptosuite-test-suite)
  - [Table of Contents](#table-of-contents)
  - [Background](#background)
  - [Install](#install)
  - [Usage](#usage)
    - [Running Specific Tests](#Running-Specific-Tests)
    - [Testing Locally](#testing-locally)
    - [Configuring the Tests](#Configuring-the-tests)
    - [Configuring the Test Data](#Configuring-the-test-data)
  - [Implementation](#implementation)
    - [Docker Integration (TODO)](#docker-integration-todo)
  - [Contribute](#contribute)
  - [License](#license)

## Background
Provides interoperability tests for verifiable credential processors
(issuers and verifiers) that support [ECDSA](https://www.w3.org/TR/vc-di-ecdsa/)
[Data Integrity](https://www.w3.org/TR/vc-data-integrity/) cryptosuites.

## Install

```js
npm i
```

## Usage
To generate test data used in the test suite, testers are required to specify
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

### Running Specific Tests
This suite uses [`mocha.js`](https://mochajs.org) as the test runner.
Mocha has [multiple options](https://mochajs.org/#command-line-usage) for filtering which tests run.

For example, the snippet below uses `grep` to filter tests by name, and only runs one of the test suites.
```bash
mocha --grep '"specificProperty" test name' ./tests/10-specific-test-suite.js
```

### Testing Locally
If you want to test implementations or just endpoints running locally, you can
copy `localImplementationsConfig.example.cjs` to `.localImplementationsConfig.cjs`
in the root directory of the test suite.

```bash
cp localImplementationsConfig.example.cjs .localImplementationsConfig.cjs
```

Git is set to ignore `.localImplementationsConfig.cjs` by default.

This file must be a CommonJS module that exports an array of implementations:

```js
// .localImplementationsConfig.cjs defining local implementations
// you can specify a BASE_URL before running the tests such as:
// BASE_URL=http://localhost:40443/zDdfsdfs npm test
const baseUrl = process.env.BASE_URL || 'https://localhost:40443/id';
module.exports = [{
  name: 'My Company',
  implementation: 'My Implementation Name',
  issuers: [{
    id: 'did:key:zMyKey',
    endpoint: `${baseUrl}/credentials/issue`,
    tags: ['ecdsa-rdfc-2019', 'localhost']
  }],
  verifiers: [{
    endpoint: `${baseUrl}/credentials/verify`,
    tags: ['ecdsa-rdfc-2019', 'localhost']
  }]
}];
```

After adding the configuration file, both the localhost implementations and other
implementations matching the test tag will be included in the test run.

To specifically test only the localhost implementation, modify the test suite to
filter implementations based on a specific tag in your local configuration file.

For instance, if your `.localImplementationsConfig.cjs` configuration file looks like
the one above, you can adjust the tag used in each test suite by modifying `./config/runner.json`
to filter the implementations by `localhost` and other tags.

### Configuring the Tests
The suites call on a common config file stored at `./config/runner.json`.
These test suites use tags matched to implementations' endpoint tags in the tests.
You can change the tag on which the suites will run in `./config/runner.json`, if desired.

For this suite the `runner.json` file looks like this:

```js
{
  "suites": {
    "ecdsa-rdfc-2019": {
      "tags": ["ecdsa-rdfc-2019"],
      "issuerName": "Digital Bazaar",
      "credentials": {...}
    },
    "ecdsa-sd-2023": {
      "tags": ["ecdsa-sd-2023"],
      "issuerName": "Digital Bazaar",
      "credentials": {...},
      "vcHolder": {
        "holderName": "Digital Bazaar",
        "tags": ["vcHolder"]
      }
    }
  }
}
```

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
      "tags": ["ecdsa-rdfc-2019"],
      "issuerName": "Digital Bazaar",
      "credentials": {
        "create": {"document": "./mocks/valid/document.json"},
        "verify": {"document": "./mocks/valid/document.json"},
        "interop": {"document": "./mocks/valid/document.json"}
      }
    },
    "ecdsa-sd-2023": {
      "tags": ["ecdsa-sd-2023"],
      "issuerName": "Digital Bazaar",
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
      },
      "vcHolder": {...}
    }
  }
}
```

## Implementation

You will need an issuer and verifier that are compatible with [VC API](https://w3c-ccg.github.io/vc-api/)
and are capable of handling issuance and verification of Verifiable Credentials
with `DataIntegrityProof` proof type using the `ecdsa-rdfc-2019`,
`ecdsa-jcs-2019`, or `ecdsa-sd-2023` cryptosuites.

To add your implementation to this test suite, you will need to add 2 endpoints
to your implementation manifest.
- A credential issuer endpoint (`/credentials/issue`) in the `issuers` property.
  - An optional `id` property may be set alongside the `endpoint`.
    - If provided, the specified `issuer.id` will be added to Verifiable Credentials
      in the tests.
    - If present, the `issuer.id` MUST use the `did:key` method and MUST be dereferenceable.
  - If the endpoint supports a selective disclosure suite
    - The endpoint must accept `options.mandatoryPointers`.
    - If present, `options.mandatoryPointers` is an array of strings.
- A credential verifier endpoint (`/credentials/verify`) in the `verifiers`
property.
- An optional `vcHolder` endpoint can be added for `ecdsa-sd-2023` selective disclosure tests.
  - The vcHolder endpoint route is meant to be `/credentials/derive`
  - The endpoint is expected to accept a JSON object with 2 properties:
    - `options` which is a JSON object.
    - `options.selectivePointers` which is an array of strings.
    - `verifiableCredential` which is a previously signed JSON verifiable credential.
    - The endpoint needs to use `ecdsa-sd-2023` for the derived verifiable credential.

All endpoints will require a cryptosuite tag of `ecdsa-rdfc-2019`,
`ecdsa-jcs-2019`, and/or `ecdsa-sd-2023`. Alongside this cryptosuite tag, you
will need to specify the `supportedEcdsaKeyTypes` property, parallel to `tags`
listing the ECDSA key types issuable or verifiable by your implementation.
Currently, the test suite supports `P-256` and `P-384` ECDSA key types.
A `vcHolder` tag is required for the `vcHolder` endpoints.

NOTE: The tests for `ecdsa-jcs-2019` are TBA.

A simplified manifest would look like this:

```js
{
  "name": "My Company",
  "implementation": "My implementation",
  "issuers": [{
    "id": "did:key:myIssuer1#keyFragment",
    "endpoint": "https://mycompany.example/credentials/issue",
    "method": "POST",
    "supportedEcdsaKeyTypes": ["P-256", "P-384"]
    "tags": ["ecdsa-rdfc-2019"]
  }, {
    "id": "did:key:myIssuer#issuer2",
    "endpoint": "https://mycompany.example/credentials/issue",
    "method": "POST",
    "supportedEcdsaKeyTypes": ["P-256"]
    "tags": ["ecdsa-jcs-2019"]
  }, {
    "id": "did:key:myIssuer3",
    "endpoint": "https://mycompany.example/credentials/issue",
    "method": "POST",
    "supportedEcdsaKeyTypes": ["P-256"]
    "tags": ["ecdsa-sd-2023"]
  }],
  "verifiers": [{
    "endpoint": "https://mycompany.example/credentials/verify",
    "method": "POST",
    "supportedEcdsaKeyTypes": ["P-256", "P-384"]
    "tags": [
      "ecdsa-rdfc-2019", "ecdsa-jcs-2019", "ecdsa-sd-2023"
    ]
  }],
  "vcHolders": [{
    "id": "did:key:myIssuer1#keyFragment",
    "endpoint": "https://mycompany.example/credentials/derive",
    "tags": ["vcHolder"]
  }]
}
```

The example above represents an unauthenticated endpoint. You may add ZCAP or
OAuth2 authentication to your endpoints. You can find an example in the
[vc-test-suite-implementations README](https://github.com/w3c/vc-test-suite-implementations#adding-a-new-implementation).

To run the tests, some implementations may require client secrets that can be
passed as environment variables to the test script. To see which implementations
require client secrets, please check the implementation manifest within the
[vc-test-suite-implementations](https://github.com/w3c/vc-test-suite-implementations/tree/main/implementations) library.

### Docker Integration (TODO)

We are presently working on implementing a new feature that will enable the
use of Docker images instead of live endpoints. The Docker image that
you provide will be started when the test suite is run. The image is expected
to expose the API provided above, which will be used in the same way that
live HTTP endpoints are used above.

## Contribute

See [the CONTRIBUTING.md file](CONTRIBUTING.md).

Pull Requests are welcome!

## License

See [the LICENSE.md file](LICENSE.md)
