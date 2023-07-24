export interface Connection {
  createdAt: string | Date;
  description?: string;
  driver: string;
  editable: boolean;
  id: string;
  idleTimeoutSeconds?: number;
  maxRows: number;
  multiStatementTransactionEnabled?: boolean;
  name: string;
  supportsConnectionClient: boolean;
  isAsynchronous: boolean;
  updatedAt: string | Date;
}

export type StatementResults = Array<Array<any>>;

export interface StatementColumn {
  datatype:
    | 'date'
    | 'datetime'
    | 'object'
    | 'number'
    | 'boolean'
    | 'string'
    | null;
  max?: number | string | Date | boolean;
  min?: number | string | Date | boolean;
  /**
   * Number of characters longest value ignoring new lines
   */
  maxValueLength?: number;
  /**
   * Number of characters in longest line of data for this column.
   * Objects are JSON.stringify(value, null, 2)
   */
  maxLineLength?: number;
  name: string;
}

export interface StatementError {
  title: string;
}

export interface Statement {
  id: string;
  batchId: string;
  sequence: number;
  statementText: string;
  status: 'queued' | 'started' | 'finished' | 'error' | 'cancelled';
  executionId?: string;
  startTime?: string | Date;
  stopTime?: string | Date;
  durationMs?: number;
  columns?: StatementColumn[];
  rowCount?: number;
  resultsPath?: string;
  incomplete?: boolean;
  error?: StatementError;
}

export interface Batch {
  id: string;
  queryId?: string;
  name?: string;
  connectionId: string;
  connectionClientId: string;
  status: 'started' | 'finished' | 'error' | 'cancelled';
  startTime: string | Date;
  stopTime: string | Date;
  durationMs: number;
  batchText: string;
  selectedText: string;
  chart?: QueryChart;
  statements: Statement[];
  userId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface BatchHistoryItem extends Batch {
  startTimeCalendar: string | Date;
  stopTimeCalendar: string | Date;
  createdAtCalendar: string | Date;
}

export type ConnectionFields = Record<string, any>;

export interface ConnectionDetail extends ConnectionFields {
  createdAt: string | Date;
  // data is a container for driver-specific fields
  // These values are also merged to the root of the object for backwards compatibility
  data: ConnectionFields;
  description?: string;
  driver: string;
  editable: boolean;
  id: string;
  idleTimeoutSeconds?: number;
  maxRows: number;
  multiStatementTransactionEnabled: boolean;
  name: string;
  supportsConnectionClient: boolean;
  updatedAt: string | Date;
}

export interface ConnectionClient {
  connectedAt: string | Date;
  id: string;
  lastKeepAliveAt: string | Date;
  name: string;
}

export interface AppInfo {
  config: {
    allowCsvDownload: boolean;
    // baseUrl app is mounted in. ie "/sqlpad"
    baseUrl: string;
    defaultConnectionId: string;
    editorWordWrap: boolean;
    googleAuthConfigured: boolean;
    ldapConfigured: boolean;
    ldapRolesConfigured: boolean;
    localAuthConfigured: boolean;
    oidcConfigured: boolean;
    oidcLinkHtml: string;
    publicUrl: string;
    samlConfigured: boolean;
    samlLinkHtml: string;
    showServiceTokensUI: boolean;
  };
  // brief user info if user is logged in
  currentUser?: {
    id: string;
    email?: string;
    role: string;
    name?: string;
    ldapId?: string;
  };
  version: string;
}

export type ChartFields = Record<string, any>;

export interface ACLRecord {
  createdAt: string | Date;
  groupId: string;
  id: number;
  queryId: string;
  updatedAt: string | Date;
  userId?: string;
  write: boolean;
}

export interface QueryChart {
  fields?: ChartFields;
  chartType?: string;
}

export interface Query {
  id: string;
  name: string;
  chart?: QueryChart;
  queryText: string;
  connection: {
    id: string;
    name: string;
    driver: string;
  };
  // id of user
  createdBy: string;
  createdByUser: {
    id: string;
    name?: string | null;
    email: string;
  };
  acl: ACLRecord[];
  tags: string[];
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

export interface QueryDetail {
  id: string;
  name: string;
  chart?: {
    fields?: ChartFields;
    chartType?: string;
  };
  queryText: string;
  connectionId: string;
  // Query detail is missing connection for some reason
  // TODO: expose this on query get too
  // connection: {
  //   id: string;
  //   name: string;
  //   driver: string;
  // };
  // id of user
  createdBy: string;
  createdByUser: {
    id: string;
    name?: string | null;
    email: string;
  };
  acl: ACLRecord[];
  tags: string[];
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

export interface User {
  id: string;
  email?: string;
  name: string;
  role: string;
  ldapId?: string;
  syncAuthRole?: boolean | null;
  disabled: boolean;
  signupAt: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  passwordResetId?: string;
}

export interface UserSelfUpdate {
  email: string;
  name: string;
  password?: string;
}

export interface ConnectionAccess {
  connectionId: string;
  connectionName: string;
  createdAt: string | Date;
  duration: number;
  expiryDate: string | Date;
  id: number;
  updatedAt: string | Date;
  userEmail: string;
  userId: string;
}

export interface ServiceToken {
  createdAt: string;
  duration: number;
  expiryDate: string | Date;
  id: number;
  maskedToken: string;
  name: string;
  role: string;
  updatedAt: string | Date;
}

export interface DriverField {
  description: string;
  formType: string;
  key: string;
  label: string;
}

export interface Driver {
  id: string;
  name: string;
  supportsConnectionClient: boolean;
  fields: DriverField[];
}

export interface TableColumn {
  name: string;
  description: string;
  dataType: string;
}

export interface SchemaTable {
  name: string;
  description: string;
  columns: TableColumn[];
}

export interface Schema {
  name: string;
  description: string;
  tables: SchemaTable[];
}

export interface Catalog {
  name: string;
  description: string;
  schemas: Schema[];
}

export interface ConnectionSchema {
  schemas?: Schema[];
  tables?: SchemaTable[];
  catalogs?: Catalog[];
}

export type QueryHistoryResponse = Array<Record<string, any>>;
