import { type ColumnDef } from "@tanstack/react-table"
import { type DatabaseType } from '@/hooks/useWorkspacesAPI';
import { type Content } from '@/hooks/useDatabasesAPI';
import { LanguagePill, CEFRPill } from '@/components/ui/pills';

export type DatabaseRow = Content;

export const contentColumns: ColumnDef<Content>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
    size: 300,
  },
  {
    accessorKey: "cefr_level",
    header: "CEFR Level",
    cell: ({ row }) => (
      <CEFRPill cefrLevel={row.getValue("cefr_level")} />
    ),
    size: 120,
  },
  {
    accessorKey: "language_code",
    header: "Language",
    cell: ({ row }) => (
      <LanguagePill languageCode={row.getValue("language_code")} />
    ),
    size: 120,
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return (
        <span className="text-sm text-muted-foreground">
          {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      );
    },
    size: 150,
  }
]

export const databaseTypeToColumns: Record<DatabaseType, ColumnDef<any>[]> = {
  content: contentColumns,
}

export function getColumnsForDatabaseType(type: DatabaseType): ColumnDef<any>[] {
  return databaseTypeToColumns[type] || [];
} 