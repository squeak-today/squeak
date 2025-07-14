import React, { useState } from "react"
import {
  flexRender,
  type ColumnFiltersState,
  type SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnSizingState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { contentColumns } from './columns';
import { type ContentJob } from '@/hooks/useContentAPI';
import { UploadsTable } from './UploadsTable';
import { type Content } from '@/hooks/useDatabasesAPI';

interface DatabaseTableProps {
  data: Content[];
  onFetchIncompleteJobs?: () => Promise<void>;
  incompleteJobs?: ContentJob[];
  incompleteJobsLoading?: boolean;
  onRowClick: (row: Content) => void;
}

export function DatabaseTable({ 
  data, 
  onFetchIncompleteJobs, 
  incompleteJobs = [], 
  onRowClick,
}: DatabaseTableProps) {
  const columns = contentColumns;
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "created_at", desc: true }
  ])
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({})
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnSizingChange: setColumnSizing,
    columnResizeMode: 'onChange',
    state: {
      columnFilters,
      sorting,
      columnSizing,
    }
  })

  const handlePopoverOpen = async (open: boolean) => {
    setPopoverOpen(open);
    if (open && onFetchIncompleteJobs) {
      await onFetchIncompleteJobs();
    }
  };

  return (
    <div>
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Search by name"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm min-w-sm"
        />
        {onFetchIncompleteJobs && (
          <Popover open={popoverOpen} onOpenChange={handlePopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                Uploads ({incompleteJobs.length})
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto max-w-2xl min-w-96">
              <UploadsTable 
                incompleteJobs={incompleteJobs} 
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div>   
        <Table style={{ width: table.getCenterTotalSize() }}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead 
                      key={header.id}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => onRowClick(row.original as Content)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell 
                    key={cell.id}
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 