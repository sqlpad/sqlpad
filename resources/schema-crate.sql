select 
    'Tables' as table_type,
    'YES' as is_nullable, 
    tables.schema_name as table_schema, 
    tables.table_name as table_name, 
    column_name, 
    data_type 
from 
    information_schema.tables, information_schema.columns 
where  
    tables.schema_name not in ('information_schema') 
    and columns.schema_name = tables.schema_name 
    and columns.table_name = tables.table_name