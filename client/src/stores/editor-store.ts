import create from 'zustand';
import {
  ConnectionSchema,
  ConnectionClient,
  ChartFields,
  ACLRecord,
  Batch,
  Statement,
  StatementColumn,
} from '../types';

export type ExpandedMap = { [itemPath: string]: boolean };

export interface SchemaState {
  loading: boolean;
  connectionSchema?: ConnectionSchema;
  error?: string;
}

export interface EditorSession {
  id: string;
  showSchema: boolean;
  showVisProperties: boolean;
  schemaExpansions: { [conectionId: string]: ExpandedMap };
  connectionId: string;
  connectionClient?: ConnectionClient;
  batchId?: string;
  isRunning: boolean;
  isSaving: boolean;
  // Editor session takes Query model fields and flattens
  queryId?: string;
  queryName: string;
  queryText: string;
  tags: string[];
  acl: Partial<ACLRecord>[];
  chartType: string;
  chartFields: ChartFields;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  // Additional data for editor states
  selectedText: string;
  selectedStatementId: string;
  queryError?: any;
  queryResult?: any;
  runQueryStartTime?: any;
  showValidation: boolean;
  unsavedChanges: boolean;
}

export type EditorStoreState = {
  initialized: boolean;
  showSave: boolean;
  focusedSessionId: string;
  editorSessions: Record<string, EditorSession>;
  batches: Record<string, Batch>;
  statements: Record<string, Statement>;
  schemaStates: { [conectionId: string]: SchemaState };
  getSession: () => EditorSession;
};

export const INITIAL_SESSION_ID = 'initial';

export const INITIAL_SESSION: EditorSession = {
  id: INITIAL_SESSION_ID,
  showSchema: true,
  showVisProperties: false,
  schemaExpansions: {},
  connectionId: '',
  connectionClient: undefined,
  batchId: undefined,
  isRunning: false,
  isSaving: false,
  queryId: undefined,
  queryName: '',
  queryText: '',
  tags: [],
  acl: [],
  chartType: '',
  chartFields: {},
  canRead: true,
  canWrite: true,
  canDelete: true,
  queryError: undefined,
  queryResult: undefined,
  runQueryStartTime: undefined,
  selectedText: '',
  selectedStatementId: '',
  showValidation: false,
  unsavedChanges: false,
};

export const useEditorStore = create<EditorStoreState>((set, get) => ({
  initialized: false,
  showSave: false,
  focusedSessionId: INITIAL_SESSION_ID,
  editorSessions: {
    [INITIAL_SESSION_ID]: INITIAL_SESSION,
  },
  batches: {},
  statements: {},
  schemaStates: {},
  getSession: () => {
    const { focusedSessionId, editorSessions } = get();
    if (!editorSessions[focusedSessionId]) {
      throw new Error('Editor session not found');
    }
    return editorSessions[focusedSessionId];
  },
}));

export function useInitialized() {
  return useEditorStore((s) => s.initialized);
}

export function useShowSave() {
  return useEditorStore((s) => s.showSave);
}

export function useSessionQueryShared() {
  return useEditorStore((s) => {
    const { acl } = s.getSession();
    return (acl || []).length > 0;
  });
}

export function useSessionTags() {
  return useEditorStore((s) => s.getSession().tags);
}

export function useSessionQueryId() {
  return useEditorStore((s) => s.getSession().queryId);
}

export function useSessionQueryName() {
  return useEditorStore((s) => s.getSession().queryName);
}

export function useSessionQueryText() {
  return useEditorStore((s) => s.getSession().queryText);
}

export function useSessionShowValidation() {
  return useEditorStore((s) => s.getSession().showValidation);
}

export function useSessionIsRunning() {
  return useEditorStore((s) => s.getSession().isRunning);
}

export function useSessionIsSaving() {
  return useEditorStore((s) => s.getSession().isSaving);
}

export function useSessionUnsavedChanges() {
  return useEditorStore((s) => s.getSession().unsavedChanges);
}

export function useSessionConnectionId(): string {
  return useEditorStore((s) => s.getSession().connectionId);
}

export function useSessionConnectionClient() {
  return useEditorStore((s) => s.getSession().connectionClient);
}

export function useSessionConnectionClientId() {
  return useEditorStore((s) => s.getSession().connectionClient?.id);
}

export function useSessionShowSchema() {
  return useEditorStore((s) => s.getSession().showSchema);
}

export function useSessionShowVisProperties() {
  return useEditorStore((s) => s.getSession().showVisProperties);
}

export function useSessionChartType() {
  return useEditorStore((s) => s.getSession().chartType);
}

export function useSessionChartFields() {
  return useEditorStore((s) => s.getSession().chartFields);
}

export function useSessionQueryResult() {
  return useEditorStore((s) => s.getSession().queryResult);
}

export function useSessionQueryError() {
  return useEditorStore((s) => {
    const { queryError, selectedStatementId } = s.getSession();
    if (queryError) {
      return queryError;
    }
    if (selectedStatementId) {
      const statementError = s.statements[selectedStatementId]?.error?.title;
      if (statementError) {
        return statementError;
      }
    }
    return;
  });
}

export function useBatchError() {
  return useEditorStore((s) => {
    const { queryError, batchId } = s.getSession();
    if (queryError) {
      return queryError;
    }
    if (batchId) {
      const batch = s.batches[batchId];
      if (batch?.statements) {
        const errored = batch.statements.find(
          (statement) => statement.status === 'error'
        );
        if (errored) {
          return errored.error?.title;
        }
      }
    }
    return;
  });
}

export function useSessionRunQueryStartTime() {
  return useEditorStore((s) => s.getSession().runQueryStartTime);
}

export function useSessionSelectedStatementId() {
  return useEditorStore((s) => s.getSession().selectedStatementId);
}

export function useSessionSchemaExpanded(connectionId?: string) {
  return useEditorStore((s) => {
    const { schemaExpansions } = s.getSession();
    if (!connectionId || !schemaExpansions[connectionId]) {
      return {};
    }
    return schemaExpansions[connectionId];
  });
}

export function useSchemaState(connectionId?: string) {
  return useEditorStore((s) => {
    if (!connectionId || !s.schemaStates[connectionId]) {
      const emptySchemaState: SchemaState = { loading: false };
      return emptySchemaState;
    }
    return s.schemaStates[connectionId];
  });
}

/**
 * Get current batch for the session
 */
export function useSessionBatch() {
  return useEditorStore((s) => {
    const { batchId } = s.getSession();
    if (batchId) {
      const batch = s.batches[batchId];
      if (batch) {
        return batch;
      }
    }
  });
}

export function useLastStatementId() {
  return useEditorStore((s) => {
    const { batchId } = s.getSession();
    if (batchId) {
      const batch = s.batches[batchId];
      if (batch && batch.statements) {
        const lastStatement = batch.statements[batch.statements.length - 1];
        if (lastStatement) {
          return lastStatement.id;
        }
      }
    }
    return '';
  });
}

export function useSessionTableLink(sequence?: number) {
  return useEditorStore((s) => {
    const { queryId, connectionClient } = s.getSession();
    const connectionClientId = connectionClient?.id;

    let tableLink = '';

    if (queryId && queryId !== 'new') {
      tableLink = `/query-table/${queryId}`;

      const searchParams = new URLSearchParams();

      if (connectionClientId) {
        searchParams.append('connectionClientId', connectionClientId);
      }
      if (sequence) {
        searchParams.append('sequence', sequence.toString());
      }

      tableLink += `?${searchParams.toString()}`;
    }

    return tableLink;
  });
}

/**
 * Get statement by sequence number for current session
 * If sequence is not provided, the last statement will be returned
 * @param sequence
 */
export function useSessionStatementIdBySequence(sequence?: number) {
  return useEditorStore((s) => {
    const { batchId } = s.getSession();
    if (batchId) {
      const batch = s.batches[batchId];
      if (batch && batch.statements) {
        const statementBySequence = batch.statements.find(
          (s) => s.sequence === sequence
        );
        if (statementBySequence) {
          return statementBySequence.id;
        }

        const lastStatement = batch.statements[batch.statements.length - 1];
        if (lastStatement) {
          return lastStatement.id;
        }
      }
    }
    return '';
  });
}

export function useStatementRowCount(statementId?: string) {
  return useEditorStore((s) => {
    if (!statementId) {
      return undefined;
    }
    return s.statements[statementId]?.rowCount;
  });
}

export function useStatementIncomplete(statementId: string) {
  return useEditorStore((s) => Boolean(s.statements[statementId]?.incomplete));
}

export function useStatementDurationMs(statementId: string) {
  return useEditorStore((s) => s.statements[statementId]?.durationMs);
}

const NO_COLUMNS: StatementColumn[] = [];

export function useStatementColumns(statementId?: string) {
  return useEditorStore((s) => {
    if (!statementId) {
      return NO_COLUMNS;
    }
    return s.statements[statementId]?.columns;
  });
}

export function useStatementStatus(statementId?: string) {
  return useEditorStore((s) => {
    if (!statementId) {
      return '';
    }
    return s.statements[statementId]?.status;
  });
}

export function useStatementSequence(statementId?: string) {
  return useEditorStore((s) => {
    if (!statementId) {
      return undefined;
    }
    return s.statements[statementId]?.sequence;
  });
}

export function useStatementText(statementId?: string) {
  return useEditorStore((s) => {
    if (!statementId) {
      return '';
    }
    return s.statements[statementId]?.statementText;
  });
}
