import { type ColumnDef } from "@tanstack/react-table"
import { type Content } from '@/hooks/useDatabasesAPI';
import { LanguagePill, CEFRPill } from '@/components/ui/pills';
import { formatDate } from '@/lib/utils';

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
      return (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.getValue("created_at"))}
        </span>
      );
    },
    size: 150,
  }
]