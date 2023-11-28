# w3c/vc-di-ecdsa-test-suite  ChangeLog

## 2.1.0 - 2023-11-28

### Added
- Adds tests for `ecdsa-sd-2023` cryptosuite.

## 2.0.0 - 2023-11-27

### Added
- Adds test to check whether `proof.proofPurpose` field matches the verification
  relationship expressed by the verification method controller.

### Changed
- **BREAKING**: The tests require the cryptosuite type value to be either
  `ecdsa-rdfc-2019`, `ecdsa-jcs-2019`, or `ecdsa-sd-2023`.
- **BREAKING**: The tags required for the test suite have been updated, shifting
  from `ecdsa-2019` to `ecdsa-rdfc-2019`, `ecdsa-jcs-2019`, and/or
  `ecdsa-sd-2023`.

### Removed
- Removed unnecessary `verificationMethod.controller` test. The normative
  statement for that no longer exists in the spec.

## 1.0.0 - 2023-11-10

### Added
- Add a new reporter option that generates the JSON used to create the report.

### Changed
- Use `@digitalbazaar/mocha-w3c-interop-reporter@1.5.0`.

## Before 1.0.0

- See git history for changes.
