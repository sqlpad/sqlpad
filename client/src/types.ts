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
  updatedAt: string | Date;
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
  adminRegistrationOpen: boolean;
  config: {
    allowCsvDownload: boolean;
    // baseUrl app is mounted in. ie "/sqlpad"
    baseUrl: string;
    defaultConnectionId: string;
    editorWordWrap: boolean;
    googleAuthConfigured: string;
    ldapConfigured: boolean;
    localAuthConfigured: boolean;
    oidcConfigured: boolean;
    oidcLinkHtml: string;
    publicUrl: string;
    samlConfigured: boolean;
    samlLinkHtml: string;
    showServiceTokensUI: boolean;
    smtpConfigured: string;
  };
  // brief user info if user is logged in
  currentUser?: {
    id: string;
    email: string;
    role: string;
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

export interface Query {
  id: string;
  name: string;
  chart?: {
    fields?: ChartFields;
    chartType?: string;
  };
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

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  disabled: boolean;
  signupAt: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  passwordResetId?: string;
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
