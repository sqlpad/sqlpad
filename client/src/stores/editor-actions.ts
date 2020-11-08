import localforage from 'localforage';
import queryString from 'query-string';
import message from '../common/message';
import {
  ACLRecord,
  AppInfo,
  Batch,
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
import { EditorSession, SchemaState, useEditorStore } from './editor-store';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const { getState, setState } = useEditorStore;

function setSession(sessionId: string, update: Partial<EditorSession>) {
  const { editorSessions } = getState();
  const focusedSession = getState().getSession(sessionId);
  setState({
    editorSessions: {
      ...editorSessions,
      [sessionId]: { ...focusedSession, ...update },
    },
  });
}

// Schedule connectionClient Heartbeat
// This only does work if data exists to do the work on
// Assumption here is that the API call will finish in the 10 seconds this is scheduled for
setInterval(async () => {
  const { editorSessions } = getState();
  for (const sessionId of Object.keys(editorSessions)) {
    const { connectionClient } = getState().getSession(sessionId);

    if (connectionClient) {
      const updateJson = await api.put(
        `/api/connection-clients/${connectionClient.id}`,
        {}
      );

      const currentConnectionClient = getState().getSession(sessionId)
        ?.connectionClient;

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

function setBatch(batchId: string, batch: Batch) {
  const { batches, statements, focusedSessionId } = getState();
  const { selectedStatementId } = getState().getSession();

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
        setSession(focusedSessionId, { selectedStatementId: onlyStatementId });
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

export const initApp = async (
  config: AppInfo['config'],
  connections: Connection[]
) => {
  try {
    let [selectedConnectionId] = await Promise.all([
      localforage.getItem('selectedConnectionId'),
    ]);

    let initialConnectionId = '';

    if (connections.length === 1) {
      selectedConnectionId = connections[0].id;
    } else {
      const { defaultConnectionId } = config || {};
      if (defaultConnectionId) {
        const foundDefault = connections.find(
          (c) => c.id === defaultConnectionId
        );
        if (Boolean(foundDefault)) {
          initialConnectionId = defaultConnectionId;
        }
      }

      if (typeof selectedConnectionId === 'string') {
        const selectedConnection = connections.find(
          (c) => c.id === selectedConnectionId
        );
        if (Boolean(selectedConnection)) {
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
    setState({ initialized: true });
  } catch (error) {
    console.error(error);
    message.error('Error initializing application');
  }
};

export function toggleShowSave() {
  const { showSave } = getState();
  setState({ showSave: !showSave });
}

/**
 * Reset state (on signout for example)
 * TODO: This needs to either do more, cancel timeouts, polling, etc OR navigate to a new page in browser (not client-side routed)
 */
export async function resetState() {
  const { focusedSessionId } = getState();
  setSession(focusedSessionId, { selectedStatementId: '', batchId: '' });
  setState({
    batches: {},
    statements: {},
  });
}

/**
 * Open a connection client for the currently selected connection if supported
 */
export async function connectConnectionClient() {
  const { focusedSessionId } = getState();
  const { connectionClient, connectionId } = getState().getSession();

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
  });
}

/**
 * Disconnect the current connection client if one exists
 */
export async function disconnectConnectionClient() {
  const { focusedSessionId } = getState();
  const { connectionClient } = getState().getSession();

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
  const { connectionClient } = getState().getSession();

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
  const { queryText, queryId } = getState().getSession();

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

export const loadQuery = async (queryId: string) => {
  const { focusedSessionId } = getState();

  const { error, data } = await api.getQuery(queryId);
  if (error || !data) {
    return message.error('Query not found');
  }

  const { connectionClient } = getState().getSession();

  // Cleanup existing connection
  // Even if the connection isn't changing, the client should be refreshed
  // This is to prevent accidental state from carrying over
  // For example, if there is an open transaction,
  // we don't want that impacting the new query if same connectionId is used)
  cleanupConnectionClient(connectionClient);

  setSession(focusedSessionId, {
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
    queryResult: undefined,
    unsavedChanges: false,
  });
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
  } = getState().getSession();

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

  setBatch(batch.id, batch);

  while (
    batch?.id &&
    !((batch?.status === 'finished' || batch?.status === 'error') && !error)
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
      setBatch(batch.id, batch);
    }
  }

  setSession(focusedSessionId, {
    isRunning: false,
  });
};

export const saveQuery = async (additionalUpdates?: Partial<EditorSession>) => {
  const { focusedSessionId } = getState();
  const session = getState().getSession();

  // If can't write, bail early
  if (!session.canWrite) {
    setSession(focusedSessionId, { showValidation: false });
    setState({ showSave: false });
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
    setState({ showSave: true });
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
        setState({ showSave: true });
        return;
      }
      // TODO - need to figure out how to express either { error } or { data }
      // This would never happen but TypeScript doesn't know
      if (!data) {
        return;
      }
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
      setState({ showSave: false });
    });
  } else {
    api.createQuery(queryData).then((json) => {
      const { error, data } = json;
      if (error) {
        // If there was an error, show the save dialog.
        // It might be closed and it is where the error is placed.
        // This should be rare, and not sure what might trigger it at this point, but just in case
        setSession(focusedSessionId, { isSaving: false, saveError: error });
        setState({ showSave: true });
        return;
      }
      // TODO - need to figure out how to express either { error } or { data }
      // This would never happen but TypeScript doesn't know
      if (!data) {
        return;
      }
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
      setState({ showSave: false });
    });
  }
};

export const handleCloneClick = () => {
  const { focusedSessionId } = getState();
  const { queryName, queryId } = getState().getSession();
  const history = getHistory();
  setSession(focusedSessionId, {
    queryId: '',
    queryName: `Copy of ${queryName}`,
    unsavedChanges: true,
    canDelete: true,
    canWrite: true,
    canRead: true,
  });
  history?.push(`/queries/new?clone=${queryId}`);
};

// NOTE connectionId, connectionClient, etc ARE NOT set here on purpose
// Some things should be carried over when creating a new session
const newQuerySession: Partial<EditorSession> = {
  isRunning: false,
  queryId: '',
  queryName: '',
  tags: [],
  acl: [],
  queryText: '',
  chartType: '',
  chartFields: {},
  canRead: true,
  canWrite: true,
  canDelete: true,
  queryError: undefined,
  queryResult: undefined,
  unsavedChanges: false,
  selectedStatementId: '',
  batchId: undefined,
  isSaving: false,
  runQueryStartTime: undefined,
  selectedText: '',
  showValidation: false,
};

export const resetNewQuery = () => {
  const { focusedSessionId } = getState();
  setSession(focusedSessionId, newQuerySession);
};

export const selectStatementId = (selectedStatementId: string) => {
  const { focusedSessionId } = getState();
  setSession(focusedSessionId, { selectedStatementId });
};

export const setQueryText = (queryText: string) => {
  const { focusedSessionId } = getState();
  const { queryId } = getState().getSession();
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
  const { chartFields } = getState().getSession();

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
  const { showSchema } = getState().getSession();
  setSession(focusedSessionId, { showSchema: !showSchema });
}

export function toggleVisProperties() {
  const { focusedSessionId } = getState();
  const { showVisProperties } = getState().getSession();
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
  const { showSchema, schemaExpansions } = getState().getSession();

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
    if (data?.schemas) {
      data.schemas.forEach((schema) => {
        expanded[schema.name] = true;
      });
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
  const connectionSchema = getState().schemaStates[connectionId]
    ?.connectionSchema;

  if (connectionSchema?.schemas || connectionSchema?.tables) {
    updateCompletions(connectionSchema);
  } else {
    updateCompletions({ schemas: [] });
  }
}

export function toggleSchemaItem(connectionId: string, item: { id: string }) {
  const { focusedSessionId } = getState();
  const { schemaExpansions } = getState().getSession();

  const expanded = { ...schemaExpansions[connectionId] };
  expanded[item.id] = !expanded[item.id];

  setSession(focusedSessionId, {
    schemaExpansions: { ...schemaExpansions, [connectionId]: expanded },
  });
}
