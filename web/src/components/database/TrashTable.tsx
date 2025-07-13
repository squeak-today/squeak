import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useMemo, useCallback } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { RotateCcw, Trash2 } from "lucide-react"

import { type DeletedSummary, type Workspace, type Database, type SoftDeleteStatus } from '@/hooks/useWorkspacesAPI';
import { type Content } from '@/hooks/useDatabasesAPI';
import { useWorkspacesAPI } from '@/hooks/useWorkspacesAPI';
import { useDatabasesAPI } from '@/hooks/useDatabasesAPI';
import { useContentAPI } from '@/hooks/useContentAPI';

interface TrashItem {
  id: string;
  name: string;
  type: 'Workspace' | 'Database' | 'Content';
  workspaceId?: string;
  databaseId?: string;
}

interface TrashTableProps {
  deletedSummary: DeletedSummary;
  onRefresh: () => void;
}

export function TrashTable({ deletedSummary, onRefresh }: TrashTableProps) {
  const { deleteWorkspace } = useWorkspacesAPI();
  const { deleteDatabase } = useDatabasesAPI();
  const { deleteContent } = useContentAPI();

  const trashItems: TrashItem[] = useMemo(() => {
    const deletedWorkspaceIds = new Set(deletedSummary.workspaces.map(w => w.id));
    const deletedDatabaseIds = new Set(deletedSummary.databases.map(d => d.id));

    return [
      ...deletedSummary.workspaces.map((workspace: Workspace) => ({
        id: workspace.id,
        name: workspace.name,
        type: 'Workspace' as const,
      })),
      // only show databases whose parent workspace is NOT in the deleted workspaces list
      ...deletedSummary.databases
        .filter((database: Database) => !deletedWorkspaceIds.has(database.workspace_id))
        .map((database: Database) => ({
          id: database.id,
          name: database.name,
          type: 'Database' as const,
          workspaceId: database.workspace_id,
        })),
      // only show content whose parent database is NOT in the deleted databases list
      ...deletedSummary.contents
        .filter((content: Content) => !deletedDatabaseIds.has(content.database_id))
        .map((content: Content) => ({
          id: content.id,
          name: content.name,
          type: 'Content' as const,
          databaseId: content.database_id,
        })),
    ];
  }, [deletedSummary]);

  const handleRecover = useCallback(async (item: TrashItem) => {
    try {
      let error;
      
      if (item.type === 'Workspace') {
        ({ error } = await deleteWorkspace(item.id, "no" as SoftDeleteStatus));
      } else if (item.type === 'Database' && item.workspaceId) {
        ({ error } = await deleteDatabase(item.workspaceId, item.id, "no" as SoftDeleteStatus));
      } else if (item.type === 'Content' && item.databaseId) {
        // For content, we need to find the workspace ID from the database
        const database = deletedSummary.databases.find(db => db.id === item.databaseId);
        if (database) {
          ({ error } = await deleteContent(database.workspace_id, item.databaseId, item.id, "no" as SoftDeleteStatus));
        } else {
          console.error('Could not find database for content recovery');
          return;
        }
      }
      
      if (error) {
        console.error(`Failed to recover ${item.type.toLowerCase()}:`, error);
      } else {
        onRefresh();
      }
    } catch (error) {
      console.error(`Error recovering ${item.type.toLowerCase()}:`, error);
    }
  }, [deleteWorkspace, deleteDatabase, deleteContent, deletedSummary.databases, onRefresh]);

  const handlePermanentDelete = useCallback(async (item: TrashItem) => {
    try {
      let error;
      
      if (item.type === 'Workspace') {
        ({ error } = await deleteWorkspace(item.id, "hard_delete" as SoftDeleteStatus));
      } else if (item.type === 'Database' && item.workspaceId) {
        ({ error } = await deleteDatabase(item.workspaceId, item.id, "hard_delete" as SoftDeleteStatus));
      } else if (item.type === 'Content' && item.databaseId) {
        // for content, we need to find the workspace ID from the database
        const database = deletedSummary.databases.find(db => db.id === item.databaseId);
        if (database) {
          ({ error } = await deleteContent(database.workspace_id, item.databaseId, item.id, "hard_delete" as SoftDeleteStatus));
        } else {
          console.error('Could not find database for content permanent deletion');
          return;
        }
      }
      
      if (error) {
        console.error(`Failed to permanently delete ${item.type.toLowerCase()}:`, error);
      } else {
        onRefresh();
      }
    } catch (error) {
      console.error(`Error permanently deleting ${item.type.toLowerCase()}:`, error);
    }
  }, [deleteWorkspace, deleteDatabase, deleteContent, deletedSummary.databases, onRefresh]);

  const trashColumns = useMemo(() => [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: { row: any }) => (
        <div className="truncate font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }: { row: any }) => (
        <div className="text-sm text-muted-foreground">{row.getValue("type")}</div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: any }) => {
        const item = row.original as TrashItem;
        return (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-accent"
                  onClick={() => handleRecover(item)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Recover</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handlePermanentDelete(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Permanently Delete</p>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ], [handleRecover, handlePermanentDelete]);

  const trashTable = useReactTable({
    data: trashItems,
    columns: trashColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Trash</h4>
        <p className="text-sm text-muted-foreground">
          Deleted workspaces, databases, and content
        </p>
      </div>
      <ScrollArea className="h-64">
        {trashItems.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Trash is empty
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {trashTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {trashTable.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </ScrollArea>
    </div>
  );
} 