import create from 'zustand';
import {
  ConnectionSchema,
  ConnectionClient,
  ChartFields,
  ACLRecord,
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
  schemaExpansions: { [conectionId: string]: ExpandedMap };
  connectionId: string;
  connectionClient?: ConnectionClient;
  connectionClientInterval?: any;
  runQueryInstanceId?: string;
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
  queryError?: any;
  queryResult?: any;
  runQueryStartTime?: any;
  showValidation: boolean;
  unsavedChanges: boolean;
}

export type EditorStoreState = {
  initialized: boolean;
  focusedSessionId: string;
  editorSessions: Record<string, EditorSession>;
  schemaStates: { [conectionId: string]: SchemaState };
  getFocusedSession: () => EditorSession;
};

const INITIAL_SESSION_ID = 'initial';

export const useEditorStore = create<EditorStoreState>((set, get) => ({
  initialized: false,
  focusedSessionId: INITIAL_SESSION_ID,
  editorSessions: {
    [INITIAL_SESSION_ID]: {
      id: INITIAL_SESSION_ID,
      showSchema: true,
      schemaExpansions: {},
      connectionId: '',
      connectionClient: undefined,
      connectionClientInterval: undefined,
      runQueryInstanceId: undefined,
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
      showValidation: false,
      unsavedChanges: false,
    },
  },
  schemaStates: {},
  getFocusedSession: () => {
    const { focusedSessionId, editorSessions } = get();
    if (!editorSessions[focusedSessionId]) {
      throw new Error('Editor session not found');
    }
    return editorSessions[focusedSessionId];
  },
}));

export function useQueryShared() {
  return useEditorStore((s) => {
    const { acl } = s.getFocusedSession();
    return (acl || []).length > 0;
  });
}

export function useTags() {
  return useEditorStore((s) => s.getFocusedSession().tags);
}

export function useQueryId() {
  return useEditorStore((s) => s.getFocusedSession().queryId);
}

export function useQueryName() {
  return useEditorStore((s) => s.getFocusedSession().queryName);
}

export function useQueryText() {
  return useEditorStore((s) => s.getFocusedSession().queryText);
}

export function useShowValidation() {
  return useEditorStore((s) => s.getFocusedSession().showValidation);
}

export function useIsRunning() {
  return useEditorStore((s) => s.getFocusedSession().isRunning);
}

export function useIsSaving() {
  return useEditorStore((s) => s.getFocusedSession().isSaving);
}

export function useUnsavedChanges() {
  return useEditorStore((s) => s.getFocusedSession().unsavedChanges);
}

export function useSelectedConnectionId(): string {
  return useEditorStore((s) => s.getFocusedSession().connectionId);
}

export function useConnectionClient(): any {
  return useEditorStore((s) => s.getFocusedSession().connectionClient);
}

export function useShowSchema(): boolean {
  return useEditorStore((s) => s.getFocusedSession().showSchema);
}

export function useChartType() {
  return useEditorStore((s) => s.getFocusedSession().chartType);
}

export function useChartFields() {
  return useEditorStore((s) => s.getFocusedSession().chartFields);
}

export function useQueryResult() {
  return useEditorStore((s) => s.getFocusedSession().queryResult);
}

export function useQueryError() {
  return useEditorStore((s) => s.getFocusedSession().queryError);
}

export function useRunQueryStartTime() {
  return useEditorStore((s) => s.getFocusedSession().runQueryStartTime);
}

export function useSchemaExpanded(connectionId?: string) {
  return useEditorStore((s) => {
    const { schemaExpansions } = s.getFocusedSession();
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
