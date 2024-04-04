/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as credentialsV2Context from '@digitalbazaar/credentials-v2-context';
import credentialsCtx from 'credentials-context';
import dataIntegrityCtx from '@digitalbazaar/data-integrity-context';
import didCtx from '@digitalcredentials/did-context';
import {klona} from 'klona';
import multikeyCtx from '@digitalbazaar/multikey-context';

const contextMap = new Map();

// add contexts for the documentLoader
contextMap.set(multikeyCtx.constants.CONTEXT_URL, multikeyCtx.CONTEXT);
contextMap.set(
  dataIntegrityCtx.constants.CONTEXT_URL,
  dataIntegrityCtx.CONTEXT
);
contextMap.set(
  didCtx.constants.DID_CONTEXT_URL,
  didCtx.contexts.get(
    didCtx.constants.DID_CONTEXT_URL)
);
contextMap.set(
  credentialsCtx.constants.CONTEXT_URL,
  credentialsCtx.contexts.get(
    credentialsCtx.constants.CONTEXT_URL)
);

contextMap.set(
  credentialsV2Context.constants.CONTEXT_URL,
  credentialsV2Context.contexts.get(
    credentialsV2Context.constants.CONTEXT_URL)
);

export {contextMap};
