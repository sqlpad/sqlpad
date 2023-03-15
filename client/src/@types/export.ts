export type ExportTables = {
  source: string
  tableName: string
}

export type Connection = {
  destinationName: string
  destination: string
  credentials: object
  tables: ExportTables[]
}
