import { type ColumnDef } from "@tanstack/react-table"
import { type DatabaseType } from '@/hooks/useWorkspacesAPI';
import { type Content } from '@/hooks/useDatabasesAPI';

export type DatabaseRow = Content;

export const contentColumns: ColumnDef<Content>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("id")}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "database_id",
    header: "Database ID",
    cell: ({ row }) => (
      <span className="font-mono text-sm text-muted-foreground">
        {row.getValue("database_id")}
      </span>
    ),
  },
]

export const databaseTypeToColumns: Record<DatabaseType, ColumnDef<any>[]> = {
  content: contentColumns,
}

export function getColumnsForDatabaseType(type: DatabaseType): ColumnDef<any>[] {
  return databaseTypeToColumns[type] || [];
} 