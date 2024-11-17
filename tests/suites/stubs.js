/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as base64url from 'base64url-universal';
import * as cborg from 'cborg';
import {
  canonicalize,
  canonicalizeAndGroup,
  createHmac,
  createHmacIdLabelMapFunction,
  selectJsonLd,
  stripBlankNodePrefixes
} from '@digitalbazaar/di-sd-primitives';

const CBOR_PREFIX_BASE = new Uint8Array([0xd9, 0x5d, 0x00]);
const CBOR_PREFIX_DERIVED = new Uint8Array([0xd9, 0x5d, 0x01]);
// CBOR decoder for implementations that use tag 64 for Uint8Array instead
// of byte string major type 2
const TAGS = [];
TAGS[64] = bytes => bytes;

export class DeriveStub {
  constructor({typeEncoders}) {
    this.typeEncoders = typeEncoders;
  }
  async derive({
    cryptosuite, document, proofSet,
    documentLoader, dataIntegrityProof
  }) {
    // get test specific options
    const {typeEncoders} = this;
    // find matching base `proof` in `proofSet`
    const {options: {proofId}} = cryptosuite;
    const baseProof = await _findProof({proofId, proofSet, dataIntegrityProof});
    // generate data for disclosure
    const {
      baseSignature, publicKey, signatures,
      labelMap, mandatoryIndexes, revealDoc
    } = await _createDisclosureData(
      {cryptosuite, document, proof: baseProof, documentLoader});

    // create new disclosure proof
    const newProof = {...baseProof};
    newProof.proofValue = await serializeDisclosureProofValue({
      baseSignature, publicKey, signatures,
      labelMap, mandatoryIndexes, typeEncoders
    });
    // attach proof to reveal doc w/o context
    delete newProof['@context'];
    revealDoc.proof = newProof;
    return revealDoc;
  }
}
// Stubs the ecdsa-sd-2023 derive function
export async function stubDerive({
  cryptosuite, document, proofSet,
  documentLoader, dataIntegrityProof
}) {
  // find matching base `proof` in `proofSet`
  const {options: {proofId}} = cryptosuite;
  const baseProof = await _findProof({proofId, proofSet, dataIntegrityProof});
  // generate data for disclosure
  const {
    baseSignature, publicKey, signatures, labelMap, mandatoryIndexes, revealDoc
  } = await _createDisclosureData(
    {cryptosuite, document, proof: baseProof, documentLoader});

  // create new disclosure proof
  const newProof = {...baseProof};
  newProof.proofValue = await serializeDisclosureProofValue(
    {baseSignature, publicKey, signatures, labelMap, mandatoryIndexes});

  // attach proof to reveal doc w/o context
  delete newProof['@context'];
  revealDoc.proof = newProof;
  return revealDoc;
}

// ecdsa-sd-2023 method that uses invalid cbor tags
function serializeDisclosureProofValue({
  baseSignature, publicKey, signatures,
  labelMap, mandatoryIndexes, typeEncoders
} = {}) {
  // encode as multibase (base64url no pad) CBOR
  const payload = [
    // Uint8Array
    baseSignature,
    // Uint8Array
    publicKey,
    // array of Uint8Arrays
    signatures,
    // Map of strings => strings compressed to ints => Uint8Arrays
    _compressLabelMap(labelMap),
    // array of numbers
    mandatoryIndexes
  ];
  const cbor = _concatBuffers([
    CBOR_PREFIX_DERIVED, cborg.encode(payload, {useMaps: true, typeEncoders})
  ]);
  return `u${base64url.encode(cbor)}`;
}

// ecdsa-sd-2023 derive helper
async function _createDisclosureData({
  cryptosuite, document, proof, documentLoader
}) {

  // 1. Parse base `proof` to get parameters for disclosure proof.
  const {
    baseSignature, publicKey, hmacKey, signatures, mandatoryPointers
  } = await parseBaseProofValue({proof});

  // 2. Ensure mandatory and / or selective data will be disclosed.
  const {selectivePointers = []} = cryptosuite.options;
  if(!(mandatoryPointers?.length > 0 || selectivePointers?.length > 0)) {
    throw new Error('Nothing selected for disclosure.');
  }

  // 3. Create HMAC label replacement function from `hmacKey` to randomize
  //   bnode identifiers.
  const hmac = await createHmac({key: hmacKey});
  const labelMapFactoryFunction = createHmacIdLabelMapFunction({hmac});

  // 4. Canonicalize document with randomized bnode labels and group N-Quads
  //  by mandatory, selective, and combined pointers.
  const options = {documentLoader};
  const combinedPointers = mandatoryPointers.concat(selectivePointers);
  const {
    groups: {
      mandatory: mandatoryGroup,
      selective: selectiveGroup,
      combined: combinedGroup,
    },
    labelMap
  } = await canonicalizeAndGroup({
    document,
    labelMapFactoryFunction,
    groups: {
      mandatory: mandatoryPointers,
      selective: selectivePointers,
      combined: combinedPointers
    },
    options
  });

  // 5. Converting absolute indexes of mandatory N-Quads to relative indexes in
  // the combined output to be revealed.
  let relativeIndex = 0;
  const mandatoryIndexes = [];
  for(const absoluteIndex of combinedGroup.matching.keys()) {
    if(mandatoryGroup.matching.has(absoluteIndex)) {
      mandatoryIndexes.push(relativeIndex);
    }
    relativeIndex++;
  }

  // 6. Filter signatures from `baseProof` to those matching non-mandatory
  //   absolute indexes and shifting by any absolute mandatory indexes that
  //   occur before each entry.
  let index = 0;
  const filteredSignatures = signatures.filter(() => {
    while(mandatoryGroup.matching.has(index)) {
      index++;
    }
    return selectiveGroup.matching.has(index++);
  });

  // 7. Produce reveal document using combination of mandatory and selective
  //   pointers.
  const revealDoc = selectJsonLd({document, pointers: combinedPointers});

  // 8. Canonicalize deskolemized N-Quads for the combined group to generate
  //   the canonical blank node labels a verifier will see.
  let canonicalIdMap = new Map();
  await canonicalize(
    combinedGroup.deskolemizedNQuads.join(''),
    {...options, inputFormat: 'application/n-quads', canonicalIdMap});
  // implementation-specific bnode prefix fix
  canonicalIdMap = stripBlankNodePrefixes(canonicalIdMap);

  // 9. Produce a blank node label map from the canonical blank node labels
  //   the verifier will see to the HMAC labels.
  const verifierLabelMap = new Map();
  for(const [inputLabel, verifierLabel] of canonicalIdMap) {
    verifierLabelMap.set(verifierLabel, labelMap.get(inputLabel));
  }

  // 10. Return data used by cryptosuite to disclose.
  return {
    baseSignature, publicKey, signatures: filteredSignatures,
    labelMap: verifierLabelMap, mandatoryIndexes,
    revealDoc
  };
}

// ecdsa-sd-2023 helper function
function _concatBuffers(buffers) {
  const bytes = new Uint8Array(buffers.reduce((acc, b) => acc + b.length, 0));
  let offset = 0;
  for(const b of buffers) {
    bytes.set(b, offset);
    offset += b.length;
  }
  return bytes;
}

// ecdsa-sd-2023 helper function
function _compressLabelMap(labelMap) {
  const map = new Map();
  for(const [k, v] of labelMap.entries()) {
    map.set(parseInt(k.slice(4), 10), base64url.decode(v.slice(1)));
  }
  return map;
}

// ecdsa-sd-2023 proofValue function
function parseBaseProofValue({proof} = {}) {
  try {
    // decode from base64url
    const proofValue = base64url.decode(proof.proofValue.slice(1));

    const payload = proofValue.subarray(CBOR_PREFIX_BASE.length);
    const [
      baseSignature,
      publicKey,
      hmacKey,
      signatures,
      mandatoryPointers
    ] = cborg.decode(payload, {useMaps: true, tags: TAGS});

    const params = {
      baseSignature, publicKey, hmacKey, signatures, mandatoryPointers
    };
    return params;
  } catch(e) {
    const err = new TypeError(
      'The proof does not include a valid "proofValue" property.');
    err.cause = e;
    throw err;
  }
}

// ecdsa-sd-2023
async function _findProof({proofId, proofSet, dataIntegrityProof}) {
  let proof;
  if(proofId) {
    proof = proofSet.find(p => p.id === proofId);
  } else {
    // no `proofId` given, so see if a single matching proof exists
    for(const p of proofSet) {
      if(await dataIntegrityProof.matchProof({proof: p})) {
        if(proof) {
          // already matched
          throw new Error(
            'Multiple matching proofs; a "proofId" must be specified.');
        }
        proof = p;
      }
    }
  }
  if(!proof) {
    throw new Error(
      'No matching base proof found from which to derive a disclosure proof.');
  }
  return proof;
}

// ecdsa-sd-2023 proofValue
export function parseDisclosureProofValue({proof} = {}) {
  try {
    // decode from base64url
    const proofValue = base64url.decode(proof.proofValue.slice(1));

    const payload = proofValue.subarray(CBOR_PREFIX_DERIVED.length);
    const [
      baseSignature,
      publicKey,
      signatures,
      compressedLabelMap,
      mandatoryIndexes
    ] = cborg.decode(payload, {useMaps: true, tags: TAGS});

    const labelMap = _decompressLabelMap(compressedLabelMap);
    const params = {
      baseSignature, publicKey, signatures, labelMap, mandatoryIndexes
    };
    return params;
  } catch(e) {
    const err = new TypeError(
      'The proof does not include a valid "proofValue" property.');
    err.cause = e;
    throw err;
  }
}
// ecdsa-sd-2023 proofValue
function _decompressLabelMap(compressedLabelMap) {
  const map = new Map();
  for(const [k, v] of compressedLabelMap.entries()) {
    map.set(`c14n${k}`, `u${base64url.encode(v)}`);
  }
  return map;
}

