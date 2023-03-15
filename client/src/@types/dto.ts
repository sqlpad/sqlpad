export type LoginDTO = {
  email: string
  password: string
}

export type UserDTO = {
  name: string
  email: string
  logged_at: string
}

export type SignupDTO = {
  name: string
  email: string
  password: string
  companyName: string
  companyRole: string
  companySize: string
  companySector: string
  companyType: string
}

export type VerifyDTO = {
  email: string
  code: string
}

export type EmailDTO = {
  email: string
}

export type ConfirmPasswordDTO = {
  email: string
  code: string
  password: string
}

export type SourceTableDTO = {
  id: string
  tableName: string
  lastRefresh?: string
  lastDownload?: string
  rows: number
}

export type OutputTableDTO = {
  id: string
  source: string
  tableName: string
  lastRefresh?: string
  lastDownload?: string
  rows: number
}

export type ConnectionTableDTO = {
  source: string
  sourceName: string
  tableName: string
  lastRefresh: string
  refreshFrequency: string
  rows: number
  columns: number
}

export type SourceDTO = {
  name: string
  source: string
  lastRefresh?: string
  tables: SourceTableDTO[]
}

export type ExportDTO = {
  name: string
  source: string
  lastRefresh?: string
  tables: OutputTableDTO[]
}

export type ConnectionDTO = {
  name: string
  destination: string
  credentials: object
  tables: ConnectionTableDTO[]
}

export type DestinationList = {
  name: string
  destination: string
}

export type DownloadDTO = {
  tableName: string
  sourceName: string
}

export type ExportJournalDTO = {
  id: string
  status: string
  tableName: string
  tableSource: string
  url?: string
}
