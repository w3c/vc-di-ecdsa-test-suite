/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {contextMap} from './contexts.js';
// disable JsonLdDocument to prevent contexts being marked static
/*
import {JsonLdDocumentLoader} from 'jsonld-document-loader';
const jdl = new JsonLdDocumentLoader();

// add contexts to documentLoad
for(const [key, value] of contextMap) {
  jdl.addStatic(key, value);
}
*/

export const documentLoader = url => {
  const document = contextMap.get(url);
  return {
    contextUrl: null,
    documentUrl: url,
    document
  };
};
