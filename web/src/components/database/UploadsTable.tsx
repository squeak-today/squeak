import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"

import { type ContentJob } from '@/hooks/useContentAPI';

interface UploadsTableProps {
  incompleteJobs: ContentJob[];
}

export function UploadsTable({ incompleteJobs }: UploadsTableProps) {
  const jobsColumns = [
    {
      accessorKey: "id",
      header: "Job ID",
      cell: ({ row }: { row: any }) => (
        <div className="font-mono text-xs">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: any }) => {
        const status = row.getValue("status") as string;
        const isRunning = status.toLowerCase() === "running";
        
        return (
          <div className="flex items-center gap-2">
            {isRunning && (
              <Loader2 className="w-3 h-3 animate-spin" />
            )}
            <span className="capitalize">{status}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }: { row: any }) => (
        <div className="text-sm">
          {new Date(row.getValue("created_at")).toLocaleString()}
        </div>
      ),
    },
  ];

  const jobsTable = useReactTable({
    data: incompleteJobs,
    columns: jobsColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Incomplete Jobs</h4>
        <p className="text-sm text-muted-foreground">
          Content uploads currently being processed
        </p>
      </div>
      <ScrollArea className="h-64">
        {incompleteJobs.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No incomplete jobs
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {jobsTable.getHeaderGroups().map((headerGroup) => (
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
                {jobsTable.getRowModel().rows.map((row) => (
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