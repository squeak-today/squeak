# folder for Supabase related files
Holds migrations and Go code to query with the Supabase database.

Fill a .env file with the following variables:
```
SUPABASE_HOST = ""
SUPABASE_PORT = ""
SUPABASE_USER = ""
SUPABASE_PASSWORD = ""
SUPABASE_DATABASE = ""
```
Code uses transaction pooler.

This folder is used to make queries, insert data, and make migrations.