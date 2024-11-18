<!--
Copyright 2023 Digital Bazaar, Inc.

SPDX-License-Identifier: BSD-3-Clause
-->

# [ECDSA](https://www.w3.org/TR/vc-di-ecdsa/) Cryptosuite test suite

## Table of Contents

- [Background](#background)
- [Implementation](#implementation)
- [Usage](#usage)
  - [Testing Locally](#testing-locally)
  - [Running Interoperability Tests](#running-interoperability-tests)
- [Development](#development)
  - [Configuring the Tests](#configuring-the-tests)
  - [Configuring Test Vectors](#configuring-test-vectors)
- [Contribute](#contribute)
- [License](#license)

## Background

Provides interoperability tests for verifiable credential processors
(issuers and verifiers) that support [ECDSA](https://www.w3.org/TR/vc-di-ecdsa/)
[Data Integrity](https://www.w3.org/TR/vc-data-integrity/) cryptosuites.

## Implementation

You will need an issuer and verifier that are compatible with [VC API](https://w3c-ccg.github.io/vc-api/)
and are capable of handling issuance and verification of Verifiable Credentials
with `DataIntegrityProof` proof type using the `ecdsa-rdfc-2019`,
`ecdsa-jcs-2019`, or `ecdsa-sd-2023` cryptosuites.

To add your implementation to this test suite, you will need to add 2 endpoints
to your implementation manifest.

- A credential issuer endpoint (`/credentials/issue`) in the `issuers` property.
  - A required `id` property MUST be set alongside the `endpoint`.
    - The specified `issuer.id` will be added to Verifiable Credentials
      in the tests where applicable.
    - The value of `issuer.id` MUST use the `did:key` method.
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
It is recommended to have one issuer per supported ECDSA key type.
Issuers and Verifiers may support more than one VC version.
Use the property `supports.vc` with the values "1.1" and/or "2.0" to signal
support for versions of Verifiable Credentials on your endpoints.
Currently, the `ecdsa-rdfc-2019` test suite supports `P-256` and `P-384` ECDSA key types.
The `ecdsa-sd-2023` test suite only supports the `P-256` ECDSA key type.
Verifier endpoints can support multiple keys, key types, and suites.
A `vcHolder` tag is required for the `vcHolder` endpoints.

NOTE: The tests for `ecdsa-jcs-2019` are TBA.

A simplified manifest would look like this:

```js
{
  "name": "My Company",
  "implementation": "My implementation",
  "issuers": [{
    "id": "did:key:myIssuer1#p256",
    "endpoint": "https://mycompany.example/issuer/p256/credentials/issue",
    "method": "POST",
    "supportedEcdsaKeyTypes": ["P-256"],
    "supports": {
      "vc": ["1.1", "2.0"]
    },
    "tags": ["ecdsa-rdfc-2019"]
  },{
    "id": "did:key:myIssuer1#p384",
    "endpoint": "https://mycompany.example/issuer/p384/credentials/issue",
    "method": "POST",
    "supportedEcdsaKeyTypes": ["P-384"],
    "supports": {
      "vc": ["1.1", "2.0"]
    },
    "tags": ["ecdsa-rdfc-2019"]
  }, {
    "id": "did:key:myIssuer#issuer2",
    "endpoint": "https://mycompany.example/credentials/issue",
    "method": "POST",
    "supportedEcdsaKeyTypes": ["P-256"],
    "supports": {
      "vc": ["1.1", "2.0"]
    },
    "tags": ["ecdsa-jcs-2019"]
  }, {
    "id": "did:key:myIssuer3",
    "endpoint": "https://mycompany.example/credentials/issue",
    "method": "POST",
    "supportedEcdsaKeyTypes": ["P-256"],
    "supports": {
      "vc": ["1.1", "2.0"]
    },
    "tags": ["ecdsa-sd-2023"]
  }],
  "verifiers": [{
    "endpoint": "https://mycompany.example/credentials/verify",
    "method": "POST",
    "supportedEcdsaKeyTypes": ["P-256", "P-384"],
    "supports": {
      "vc": ["1.1", "2.0"]
    },
    "tags": ["ecdsa-rdfc-2019", "ecdsa-jcs-2019", "ecdsa-sd-2023"]
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


## Usage

```js
npm i
```

### Testing Locally

To test a single implementation or endpoint running locally, you can
copy `localConfig.example.cjs` to `localConfig.cjs`
in the root directory of the test suite.

```bash
cp localConfig.example.cjs localConfig.cjs
```

This file must be a CommonJS module that exports an object containing a
`settings` object (for configuring the test suite code itself) and an
`implementations` array (for configuring the implementation(s) to test against).

The format of the object contained in the `implementations` array is
identical to the one defined in
[VC Test Suite Implementations](https://github.com/w3c/vc-test-suite-implementations?tab=readme-ov-file#usage)).
The `implementations` array may contain more than one implementation object, to
test multiple implementations in one run.

```js
// localConfig.cjs defines local implementations
// you can specify a BASE_URL when running the tests such as:
// BASE_URL=http://localhost:40443/zDdfsdfs npm test
const baseUrl = process.env.BASE_URL || 'https://localhost:40443/id';
module.exports = {
  settings: {
    enableInteropTests: false, // default
    testAllImplementations: false // default
  },
  implementations: [{
    name: 'My Company',
    implementation: 'My Implementation Name',
    // only this implementation will be run in the suite
    issuers: [{
      id: 'did:key:zMyKey',
      endpoint: `${baseUrl}/credentials/issue`,
      supportedEcdsaKeyTypes: ['P-256'],
      tags: ['ecdsa-rdfc-2019']
    }],
    verifiers: [{
      endpoint: `${baseUrl}/credentials/verify`,
      supportedEcdsaKeyTypes: ['P-256'],
      tags: ['ecdsa-rdfc-2019']
    }]
  }];
```

### Running Interoperability Tests

Running interoperability tests requires having authorization to the endpoints of multiple
implementations. Because most users of this suite will not have those authorization capabilities,
the interoperability suites are disabled by default. You can try running the interoperability suites
by adding `enableInteropTests: true` to your `localConfig.cjs` file.

## Development

### Configuring the Tests

The suites call on a set of common config files stored at `./config/`.

- `./config/runner.json` is for test suite specific configurations.
- `./config/vector.json` is for test vector specific configurations.

These test suites use tags matched to implementation endpoint tags in the tests.
You can change the tag on which the suites will run in `./config/runner.json`, if desired.

For this suite, the `runner.json` file looks like this:

```js
{
  "suites": {
    "ecdsa-rdfc-2019": {
      "tags": ["ecdsa-rdfc-2019"]
    },
    "ecdsa-sd-2023": {
      "tags": ["ecdsa-sd-2023"],
      "vcHolder": {
        "holderName": "Digital Bazaar",
        "tags": ["vcHolder"]
      }
    }
  }
}
```

### Configuring Test Vectors

The tests use a configuration file `/config/vectors.json` to configure test vectors.
[Test Vector configuration is documented in testVectorGuide.md,](/testVectorGuide.md)

## Contribute

See [the CONTRIBUTING.md file](CONTRIBUTING.md).

Pull Requests are welcome!

## License

See [the LICENSE.md file](LICENSE.md)
