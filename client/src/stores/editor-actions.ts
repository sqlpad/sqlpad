import localforage from 'localforage';
import queryString from 'query-string';
import message from '../common/message';
import {
  ACLRecord,
  AppInfo,
  Batch,
  BatchHistoryItem,
  ChartFields,
  Connection,
  ConnectionClient,
} from '../types';
import { api } from '../utilities/api';
import { getHistory } from '../utilities/history';
import {
  removeLocalQueryText,
  setLocalQueryText,
} from '../utilities/localQueryText';
import updateCompletions from '../utilities/updateCompletions';
import {
  EditorSession,
  INITIAL_SESSION,
  INITIAL_STATE,
  SchemaState,
  useEditorStore,
} from './editor-store';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const { getState, setState } = useEditorStore;

function setSession(sessionId: string, update: Partial<EditorSession>) {
  const { editorSessions } = getState();
  const session = getState().getSession(sessionId);
  if (!session) {
    return setState({
      editorSessions: {
        ...editorSessions,
        [sessionId]: { ...INITIAL_SESSION, ...update },
      },
    });
  }
  setState({
    editorSessions: {
      ...editorSessions,
      [sessionId]: { ...session, ...update },
    },
  });
}

// Schedule connectionClient Heartbeat
// This only does work if data exists to do the work on
// Assumption here is that the API call will finish in the 10 seconds this is scheduled for
setInterval(async () => {
  const { editorSessions } = getState();
  for (const sessionId of Object.keys(editorSessions)) {
    const { connectionClient } = getState().getSession(sessionId) || {};

    if (connectionClient) {
      const updateJson = await api.put(
        `/api/connection-clients/${connectionClient.id}`,
        {}
      );

      const currentConnectionClient =
        getState().getSession(sessionId)?.connectionClient;

      // If the connectionClient changed since hearbeat, do nothing
      if (
        !currentConnectionClient ||
        currentConnectionClient.id !== connectionClient?.id
      ) {
        return;
      }

      // If the PUT didn't return a connectionClient object or has an error,
      // the connectionClient has been disconnected
      if (updateJson.error || !updateJson.data) {
        setSession(sessionId, {
          connectionClient: undefined,
        });
      } else {
        setSession(sessionId, {
          connectionClient: updateJson.data,
        });
      }
    }
  }
}, 10000);

function setBatch(sessionId: string, batchId: string, batch: Batch) {
  const { batches, statements } = getState();
  const { selectedStatementId } = getState().getSession(sessionId) || {};

  const updatedStatements = {
    ...statements,
  };

  if (batch?.statements) {
    for (const statement of batch.statements) {
      updatedStatements[statement.id] = statement;
    }
    if (batch.statements.length === 1) {
      const onlyStatementId = batch.statements[0].id;
      if (selectedStatementId !== onlyStatementId) {
        setSession(sessionId, { selectedStatementId: onlyStatementId });
      }
    }
  }

  setState({
    statements: updatedStatements,
    batches: {
      ...batches,
      [batchId]: batch,
    },
  });
}

export const initEditor = async (
  config: AppInfo['config'],
  connections: Connection[]
) => {
  try {
    let [selectedConnectionId] = await Promise.all([
      localforage.getItem('selectedConnectionId'),
    ]);

    let initialConnectionId = '';

    if (connections.length === 1) {
      initialConnectionId = connections[0].id;
    } else {
      const { defaultConnectionId } = config || {};
      if (defaultConnectionId) {
        const foundDefault = connections.find(
          (c) => c.id === defaultConnectionId
        );
        if (foundDefault) {
          initialConnectionId = defaultConnectionId;
        }
      }

      if (typeof selectedConnectionId === 'string') {
        const selectedConnection = connections.find(
          (c) => c.id === selectedConnectionId
        );
        if (selectedConnection) {
          initialConnectionId = selectedConnectionId;
        }
      }

      const qs = queryString.parse(window.location.search);
      const qsConnectionName = qs.connectionName;
      if (qsConnectionName) {
        const selectedConnection = connections.find(
          (c) => c.name === qsConnectionName
        );
        if (selectedConnection?.id) {
          initialConnectionId = selectedConnection?.id;
        }
      }

      const qsConnectionId = qs.connectionId;
      if (qsConnectionId) {
        const selectedConnection = connections.find(
          (c) => c.id === qsConnectionId
        );
        if (selectedConnection?.id) {
          initialConnectionId = selectedConnection?.id;
        }
      }
    }

    const { focusedSessionId } = getState();
    setSession(focusedSessionId, { connectionId: initialConnectionId });
    if (initialConnectionId) {
      loadSchema(initialConnectionId);
    }
    setState({ initialized: true });
  } catch (error) {
    console.error(error);
    message.error('Error initializing application');
  }
};

export function toggleShowQueryModal() {
  const { showQueryModal } = getState();
  setState({ showQueryModal: !showQueryModal });
}

export function setMouseOverResultPane(mouseOverResultPane: boolean) {
  setState({ mouseOverResultPane });
}

/**
 * Reset state (on signout for example)
 */
export async function resetState() {
  setState({ ...INITIAL_STATE });
}

/**
 * Open a connection client for the currently selected connection if supported
 */
export async function connectConnectionClient() {
  const { focusedSessionId } = getState();
  const { connectionClient, connectionId } = getState().getFocusedSession();

  // If a connectionClient is already open or selected connection id doesn't exist, do nothing
  if (connectionClient || !connectionId) {
    return;
  }

  // Regular users are not allowed to get connections by id, but they can get list of connections
  // May want to store selected connection instead of just id
  const { data: connections } = await api.getConnections();
  const connection = (connections || []).find(
    (connection) => connection.id === connectionId
  );

  if (connection) {
    setAsynchronousDriver(connection.isAsynchronous);
  }

  const supportedAndEnabled =
    connection &&
    connection.supportsConnectionClient &&
    connection.multiStatementTransactionEnabled;

  if (!supportedAndEnabled) {
    return;
  }

  const json = await api.post('/api/connection-clients', {
    connectionId,
  });
  if (json.error) {
    return message.error('Problem connecting to database');
  }

  setSession(focusedSessionId, {
    connectionClient: json.data,
    isDriverAsynchronous: connection ? connection.isAsynchronous : false,
  });
}

/**
 * Disconnect the current connection client if one exists
 */
export async function disconnectConnectionClient() {
  const { focusedSessionId } = getState();
  const { connectionClient } = getState().getFocusedSession();

  if (connectionClient) {
    api
      .delete(`/api/connection-clients/${connectionClient.id}`)
      .then((json) => {
        if (json.error) {
          message.error(json.error);
        }
      });
  }

  setSession(focusedSessionId, {
    connectionClient: undefined,
  });
}

function cleanupConnectionClient(connectionClient?: ConnectionClient) {
  // Close connection client but do not wait for this to complete
  if (connectionClient) {
    api
      .delete(`/api/connection-clients/${connectionClient.id}`)
      .then((json) => {
        if (json.error) {
          message.error(json.error);
        }
      });
  }
}

/**
 * Select connection and disconnect connectionClient if it exists
 * @param connectionId
 */
export function selectConnectionId(connectionId: string) {
  const { focusedSessionId } = getState();
  const { connectionClient } = getState().getFocusedSession();

  localforage
    .setItem('selectedConnectionId', connectionId)
    .catch((error) => message.error(error));

  cleanupConnectionClient(connectionClient);

  setSession(focusedSessionId, {
    connectionId,
    connectionClient: undefined,
  });
}

export const formatQuery = async () => {
  const { focusedSessionId } = getState();
  const { queryText, queryId } = getState().getFocusedSession();

  const json = await api.post('/api/format-sql', {
    query: queryText,
  });

  if (json.error) {
    message.error(json.error);
    return;
  }

  if (!json.data || !json.data.query) {
    console.warn('unexpected API result');
    return;
  }

  setLocalQueryText(queryId, json.data.query);
  setSession(focusedSessionId, {
    queryText: json.data.query,
    unsavedChanges: true,
  });
};

/**
 * Loads query and stores in editor session state.
 * Returns a promise of API result to allow context-dependent behavior,
 * like showing not found modal in query editor.
 * @param queryId
 */
export const loadQuery = async (queryId: string) => {
  const response = await api.getQuery(queryId);

  const { error, data } = response;
  if (error || !data) {
    return response;
  }

  const { focusedSessionId } = getState();
  const { connectionClient, ...restOfCurrentSession } =
    getState().getFocusedSession();

  // Cleanup existing connection
  // Even if the connection isn't changing, the client should be refreshed
  // This is to prevent accidental state from carrying over
  // For example, if there is an open transaction,
  // we don't want that impacting the new query if same connectionId is used)
  cleanupConnectionClient(connectionClient);

  setSession(focusedSessionId, {
    ...restOfCurrentSession,
    // Map query object to flattened editor session data
    queryId,
    connectionId: data.connectionId,
    connectionClient: undefined,
    queryText: data.queryText,
    queryName: data.name,
    tags: data.tags,
    acl: data.acl,
    chartType: data?.chart?.chartType,
    chartFields: data?.chart?.fields,
    canDelete: data.canDelete,
    canRead: data.canRead,
    canWrite: data.canWrite,
    // Reset result/error/unsaved/running states
    batchId: '',
    selectedStatementId: '',
    isRunning: false,
    queryError: undefined,
    unsavedChanges: false,
  });

  return response;
};

export const runQuery = async () => {
  const { focusedSessionId } = getState();
  const {
    queryId,
    queryName,
    queryText,
    chartType,
    chartFields,
    connectionId,
    connectionClient,
    selectedText,
    isDriverAsynchronous,
  } = getState().getFocusedSession();

  if (!connectionId) {
    return setSession(focusedSessionId, {
      queryError: 'Connection required',
      selectedStatementId: '',
    });
  }

  if (!queryText) {
    return setSession(focusedSessionId, {
      queryError: 'SQL text required',
      selectedStatementId: '',
    });
  }

  setSession(focusedSessionId, {
    batchId: undefined,
    isRunning: true,
    isExecutionStarting: false,
    runQueryStartTime: new Date(),
    selectedStatementId: '',
  });

  const postData = {
    connectionId,
    connectionClientId: connectionClient && connectionClient.id,
    queryId,
    name: queryName,
    batchText: queryText,
    selectedText,
    chart: {
      chartType,
      fields: chartFields,
    },
  };

  let res = await api.createBatch(postData);

  setSession(focusedSessionId, {
    isExecutionStarting: isDriverAsynchronous ? true : false,
  });

  let error = res.error;
  let batch = res.data;

  if (error) {
    return setSession(focusedSessionId, {
      queryError: error,
    });
  }

  if (!batch) {
    return setSession(focusedSessionId, {
      queryError: 'error creating batch',
    });
  }

  setBatch(focusedSessionId, batch.id, batch);

  while (
    batch?.id &&
    !(
      (batch?.status === 'finished' ||
        batch?.status === 'error' ||
        batch?.status === 'cancelled') &&
      !error
    )
  ) {
    await sleep(500);
    res = await api.getBatch(batch.id);
    error = res.error;
    batch = res.data;

    setSession(focusedSessionId, {
      batchId: batch?.id,
      queryError: error,
    });

    if (batch) {
      setBatch(focusedSessionId, batch.id, batch);
    }
  }

  setSession(focusedSessionId, {
    isRunning: false,
    isExecutionStarting: false,
  });
};

export const cancelQuery = async () => {
  const { focusedSessionId } = getState();
  const { connectionId, isDriverAsynchronous, batchId } =
    getState().getFocusedSession();

  if (!isDriverAsynchronous) {
    return setSession(focusedSessionId, {
      queryError: 'Driver does not support cancellation',
      selectedStatementId: '',
    });
  }

  if (!batchId) {
    return setSession(focusedSessionId, {
      queryError: 'Batch ID required',
      selectedStatementId: '',
    });
  }
  if (!connectionId) {
    return setSession(focusedSessionId, {
      queryError: 'Connection required',
      selectedStatementId: '',
    });
  }

  setSession(focusedSessionId, {
    isRunning: true,
    isExecutionStarting: true,
    runQueryStartTime: new Date(),
    selectedStatementId: '',
  });

  const putData = {
    connectionId: connectionId,
  };

  await api.cancelBatch(batchId, putData);
  message.error('Query cancelled by user');
  return setSession(focusedSessionId, {
    batchId: undefined,
    isRunning: false,
    isExecutionStarting: false,
  });
};

export const setEditorBatchHistoryItem = async (
  batchHistoryItem: BatchHistoryItem
) => {
  const { focusedSessionId } = getState();

  // Statements might not exist if query result data is purged
  // In that case, just restore the SQL and chart config and similar
  // clear out batchId/selectedStatementId
  const hasStatements = batchHistoryItem.statements;

  setSession(focusedSessionId, {
    queryName: batchHistoryItem.name,
    queryText: batchHistoryItem.batchText,
    chartType: batchHistoryItem.chart?.chartType,
    chartFields: batchHistoryItem.chart?.fields,
    connectionId: batchHistoryItem.connectionId,
    connectionClient: undefined,
    selectedText: '',
    batchId: hasStatements ? batchHistoryItem.id : undefined,
    selectedStatementId: undefined,
    isRunning: false,
    runQueryStartTime: batchHistoryItem.startTime,
  });

  if (hasStatements) {
    setBatch(focusedSessionId, batchHistoryItem.id, batchHistoryItem);
  }
};

export const saveQuery = async (additionalUpdates?: Partial<EditorSession>) => {
  const { focusedSessionId } = getState();
  const session = getState().getFocusedSession();

  // If can't write, bail early
  if (!session.canWrite) {
    setSession(focusedSessionId, { showValidation: false });
    setState({ showQueryModal: false });
    return;
  }

  const mergedSession = { ...session, ...additionalUpdates };

  const {
    queryId,
    connectionId,
    queryName,
    queryText,
    chartFields,
    chartType,
    tags,
    acl,
  } = mergedSession;

  if (!queryName) {
    setSession(focusedSessionId, { showValidation: true });
    setState({ showQueryModal: true });
    return;
  }

  setSession(focusedSessionId, { isSaving: true, saveError: undefined });
  const queryData = {
    connectionId,
    name: queryName,
    queryText,
    acl,
    chart: {
      chartType,
      fields: chartFields,
    },
    tags,
  };

  if (queryId) {
    api.updateQuery(queryId, queryData).then((json) => {
      const { error, data } = json;
      if (error) {
        // If there was an error, show the save dialog.
        // It might be closed and it is where the error is placed.
        // This should be rare, and not sure what might trigger it at this point, but just in case
        setSession(focusedSessionId, { isSaving: false, saveError: error });
        setState({ showQueryModal: true });
        return;
      }
      // TypeScript doesn't know that if error did not exist we are dealing with data
      if (data) {
        removeLocalQueryText(data.id);
        setSession(focusedSessionId, {
          isSaving: false,
          unsavedChanges: false,
          connectionId: data.connectionId,
          queryId: data.id,
          queryText: data.queryText,
          queryName: data.name,
          tags: data.tags,
          acl: data.acl,
          chartType: data?.chart?.chartType,
          chartFields: data?.chart?.fields,
          canDelete: data.canDelete,
          canRead: data.canRead,
          canWrite: data.canWrite,
        });
        setState({ showQueryModal: false });
      }
    });
  } else {
    api.createQuery(queryData).then((json) => {
      const { error, data } = json;
      if (error) {
        // If there was an error, show the save dialog.
        // It might be closed and it is where the error is placed.
        // This should be rare, and not sure what might trigger it at this point, but just in case
        setSession(focusedSessionId, { isSaving: false, saveError: error });
        setState({ showQueryModal: true });
        return;
      }
      // TypeScript doesn't know that if error did not exist we are dealing with data
      if (data) {
        const history = getHistory();
        history?.push(`/queries/${data.id}`);
        removeLocalQueryText(data.id);
        setSession(focusedSessionId, {
          isSaving: false,
          unsavedChanges: false,
          connectionId: data.connectionId,
          queryId: data.id,
          queryText: data.queryText,
          queryName: data.name,
          tags: data.tags,
          acl: data.acl,
          chartType: data?.chart?.chartType,
          chartFields: data?.chart?.fields,
          canDelete: data.canDelete,
          canRead: data.canRead,
          canWrite: data.canWrite,
        });
        setState({ showQueryModal: false });
      }
    });
  }
};

// Clone works by updating existing session, then navigating to URL with `/queries/new`
// The session doesn't change, so the new should not get applied
export const handleCloneClick = () => {
  const { focusedSessionId } = getState();
  const { queryName } = getState().getFocusedSession();
  const history = getHistory();
  setSession(focusedSessionId, {
    queryId: '',
    queryName: `Copy of ${queryName}`,
    unsavedChanges: true,
    canDelete: true,
    canWrite: true,
    canRead: true,
  });
  history?.push(`/queries/new`);
};

export const resetNewQuery = () => {
  const { focusedSessionId } = getState();

  // Get some editor state from current session and carry that on to new session
  const {
    showSchema,
    showVisProperties,
    schemaExpansions,
    connectionId,
    connectionClient,
  } = getState().getFocusedSession();

  const session = {
    ...INITIAL_SESSION,
    showSchema,
    showVisProperties,
    schemaExpansions,
    connectionId,
    connectionClient,
  };
  setSession(focusedSessionId, session);
};

export const selectStatementId = (selectedStatementId: string) => {
  const { focusedSessionId } = getState();
  setSession(focusedSessionId, { selectedStatementId });
};

export const setQueryText = (queryText: string) => {
  const { focusedSessionId } = getState();
  const { queryId } = getState().getFocusedSession();
  setLocalQueryText(queryId, queryText);
  setSession(focusedSessionId, { queryText, unsavedChanges: true });
};

export const setQueryName = (queryName: string) => {
  const { focusedSessionId } = getState();
  setSession(focusedSessionId, { queryName, unsavedChanges: true });
};

export const setTags = (tags: string[]) => {
  const { focusedSessionId } = getState();
  setSession(focusedSessionId, { tags, unsavedChanges: true });
};

export const setAcl = (acl: Partial<ACLRecord>[]) => {
  const { focusedSessionId } = getState();
  setSession(focusedSessionId, { acl, unsavedChanges: true });
};

export const setChartType = (chartType: string) => {
  const { focusedSessionId } = getState();
  setSession(focusedSessionId, { chartType, unsavedChanges: true });
};

export const setChartFields = (chartFields: ChartFields) => {
  const { focusedSessionId } = getState();
  setSession(focusedSessionId, { chartFields, unsavedChanges: true });
};

export const handleChartConfigurationFieldsChange = (
  chartFieldId: string,
  queryResultField: string | boolean | number
) => {
  const { focusedSessionId } = getState();
  const { chartFields } = getState().getFocusedSession();

  setSession(focusedSessionId, {
    chartFields: { ...chartFields, [chartFieldId]: queryResultField },
    unsavedChanges: true,
  });
};

export const handleChartTypeChange = (chartType: string) => {
  const { focusedSessionId } = getState();
  setSession(focusedSessionId, { chartType, unsavedChanges: true });
};

export const handleQuerySelectionChange = (selectedText: string) => {
  const { focusedSessionId } = getState();
  setSession(focusedSessionId, { selectedText });
};

export function toggleSchema() {
  const { focusedSessionId } = getState();
  const { showSchema } = getState().getFocusedSession();
  setSession(focusedSessionId, { showSchema: !showSchema });
}

export function toggleVisProperties() {
  const { focusedSessionId } = getState();
  const { showVisProperties } = getState().getFocusedSession();
  setSession(focusedSessionId, { showVisProperties: !showVisProperties });
}

export function setSchemaState(connectionId: string, schemaState: SchemaState) {
  const { schemaStates } = getState();
  const update = {
    ...schemaStates,
    [connectionId]: schemaState,
  };
  setState({ schemaStates: update });
}

/**
 * Get schema via API and store into editor store
 * @param connectionId - connection id to get schema for
 * @param reload - force cache refresh for schema
 */
export async function loadSchema(connectionId: string, reload?: boolean) {
  const { schemaStates, focusedSessionId } = getState();
  const { showSchema, schemaExpansions } = getState().getFocusedSession();

  if (!schemaStates[connectionId] || reload) {
    setSchemaState(connectionId, {
      loading: true,
    });

    const json = await api.getConnectionSchema(connectionId, reload);
    const { error, data } = json;

    if (error) {
      setSchemaState(connectionId, {
        loading: false,
        error,
      });
      // If sidebar is not shown, send error notification
      // It is otherwise shown in sidebar where schema would be
      if (!showSchema) {
        message.error(error);
      }
      return;
    }

    // Pre-expand schemas
    const expanded: { [key: string]: boolean } = {};
    // Added schemas length restriction before auto-expand.
    // This limit is there because there is no collapse-all function in the UI
    // and render time can explode quickly.
    // In datawarehousing there can be 100's of schema's each containing 50-100
    // tables and those containing each 5+ columns and manually collapsing
    // them is very annoying.
    // NOTE: the 5 here is completely arbitrary it may be preferable to not auto expand unless there is only 1.
    if (data?.schemas && data?.schemas.length <= 5) {
      data.schemas.forEach((schema) => {
        expanded[schema.name] = true;
      });
    }

    const stringCompare = new Intl.Collator('en', { sensitivity: 'base' });
    const nameCompare: {
      (a: { name: string }, b: { name: string }): number;
    } = (a, b) => stringCompare.compare(a.name, b.name);
    if (data?.catalogs) {
      data.catalogs.sort(nameCompare);
      data.catalogs.forEach((catalogs) => {
        catalogs.schemas.sort(nameCompare);
        catalogs.schemas.forEach((schema) => {
          schema.tables.sort(nameCompare);
          // NOTE: we do not sort columns that can be annoying with regards to creation order.
        });
      });      
    }
    if (data?.schemas) {
      data.schemas.sort(nameCompare);
      data.schemas.forEach((schema) => {
        schema.tables.sort(nameCompare);
        // NOTE: we do not sort columns that can be annoying with regards to creation order.
      });
    }
    if (data?.tables) {
      data.tables.sort(nameCompare);
      // NOTE: we do not sort columns that can be annoying with regards to creation order.
      }

    setSchemaState(connectionId, {
      loading: false,
      connectionSchema: data,
      error: undefined,
    });

    setSession(focusedSessionId, {
      schemaExpansions: { ...schemaExpansions, [connectionId]: expanded },
    });
  }

  // Refresh completions
  const connectionSchema =
    getState().schemaStates[connectionId]?.connectionSchema;

  if (connectionSchema?.schemas || connectionSchema?.tables) {
    updateCompletions(connectionSchema);
  } else {
    updateCompletions({ schemas: [] });
  }
}

export function toggleSchemaItem(connectionId: string, item: { id: string }) {
  const { focusedSessionId } = getState();
  const { schemaExpansions } = getState().getFocusedSession();

  const expanded = { ...schemaExpansions[connectionId] };
  expanded[item.id] = !expanded[item.id];

  setSession(focusedSessionId, {
    schemaExpansions: { ...schemaExpansions, [connectionId]: expanded },
  });
}

/**
 * Sets the state for an asynchronous driver that will enable cancel queries
 * @param {boolean} setAsynchronousDriver
 */
export function setAsynchronousDriver(asynchronous?: boolean) {
  const { focusedSessionId } = getState();

  const isAsync = asynchronous ? true : false;
  setSession(focusedSessionId, {
    isDriverAsynchronous: isAsync,
  });
}
