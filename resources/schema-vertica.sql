SELECT 
    vt.table_schema, 
    vt.table_name, 
    vc.column_name, 
    vc.data_type
FROM 
    V_CATALOG.TABLES vt 
    JOIN V_CATALOG.ALL_TABLES vat ON vt.table_id = vat.table_id 
    JOIN V_CATALOG.COLUMNS vc ON vt.table_schema = vc.table_schema AND vt.table_name = vc.table_name 
WHERE 
    vt.table_schema NOT IN ('V_CATALOG') AND vat.table_type = 'TABLE' 
ORDER BY 
    vt.table_schema, 
    vt.table_name, 
    vc.ordinal_position