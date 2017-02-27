select 
    'Tables' as table_type,
    'YES' as is_nullable, 
    tables.table_schema as table_schema, 
    tables.table_name as table_name, 
    column_name, 
    data_type 
from 
    information_schema.tables, information_schema.columns 
where  
    tables.table_schema not in ('information_schema') 
    and columns.table_schema = tables.table_schema 
    and columns.table_name = tables.table_name
