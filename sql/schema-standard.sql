SELECT 
    (CASE t.table_type WHEN 'BASE TABLE' THEN 'Tables' WHEN 'VIEW' THEN 'Views' ELSE t.table_type END) AS table_type, 
    t.table_schema, 
    t.table_name, 
    c.column_name, 
    c.data_type, 
    c.is_nullable 
FROM 
    INFORMATION_SCHEMA.tables t 
    JOIN INFORMATION_SCHEMA.columns c ON t.table_schema = c.table_schema AND t.table_name = c.table_name 
WHERE 
    t.table_schema NOT IN ('information_schema', 'pg_catalog') 
ORDER BY 
    t.table_type, 
    t.table_schema, 
    t.table_name, 
    c.ordinal_position