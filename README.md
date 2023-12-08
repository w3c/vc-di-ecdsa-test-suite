# [BBS](https://www.w3.org/TR/vc-di-bbs/) Cryptosuite test suite

## Table of Contents

- [BBS Cryptosuite test suite](#bbs-cryptosuite-test-suite)
  - [Table of Contents](#table-of-contents)
  - [Background](#background)
  - [Install](#install)
  - [Usage](#usage)
  - [Implementation](#implementation)
    - [Docker Integration (TODO)](#docker-integration-todo)
  - [Contribute](#contribute)
  - [License](#license)

## Background
Provides interoperability tests for verifiable credential processors
(issuers and verifiers) that support [BBS](https://www.w3.org/TR/vc-di-bbs/)
[Data Integrity](https://www.w3.org/TR/vc-data-integrity/) cryptosuites.

## Install

```js
npm i
```

## Usage

```
npm test
```

## Implementation

You will need an issuer and verifier that are compatible with [VC API](https://w3c-ccg.github.io/vc-api/)
and are capable of handling issuance and verification of Verifiable Credentials
with `DataIntegrityProof` proof type using the `bbs-2023` cryptosuite.

To add your implementation to this test suite, you will need to add 2 endpoints
to your implementation manifest.
- A credential issuer endpoint (`/credentials/issue`) in the `issuers` property.
- A credential verifier endpoint (`/credentials/verify`) in the `verifiers` property.

All endpoints will require a cryptosuite tag of `bbs-2023`. Alongside this
cryptosuite tag, you must also specify the `supportedEcdsaKeyTypes` property,
parallel to `tags` listing the ECDSA key types issuable or verifiable by your
implementation. Currently, the test suite supports `P-256` and `P-384` ECDSA
key types.

A simplified manifest would look like this:

```js
{
  "name": "My Company",
  "implementation": "My implementation",
  "issuers": [{
    "id": "",
    "endpoint": "https://mycompany.example/credentials/issue",
    "method": "POST",
    "supportedEcdsaKeyTypes": ["P-256"]
    "tags": ["bbs-2023"]
  }],
  "verifiers": [{
    "id": "",
    "endpoint": "https://mycompany.example/credentials/verify",
    "method": "POST",
    "supportedEcdsaKeyTypes": ["P-256", "P-384"]
    "tags": ["bbs-2023"]
  }]
}
```

The example above represents an unauthenticated endpoint. You may add ZCAP or
OAuth2 authentication to your endpoints. You can find an example in the
[vc-api-test-suite-implementations README](https://github.com/w3c-ccg/vc-api-test-suite-implementations#adding-a-new-implementation).

To run the tests, some implementations may require client secrets that can be
passed as environment variables to the test script. To see which implementations
require client secrets, please check the implementation manifest within the
[vc-api-test-suite-implementations](https://github.com/w3c-ccg/vc-api-test-suite-implementations/tree/main/implementations) library.

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
