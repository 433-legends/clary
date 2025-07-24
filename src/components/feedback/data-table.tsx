"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FeedbackItemProps } from "./feedback-item"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


export const columns: ColumnDef<FeedbackItemProps>[] = [
    {
      accessorKey: "tags",
      header: "Category",
      cell: ({ row }) => {
          const tags = row.getValue("tags") as string[]
          const category = tags[0] || 'UNCATEGORIZED';
          let variant: "destructive" | "secondary" | "success" = "secondary";
          let displayText = category.toLowerCase();

          if (category.toLowerCase() === 'problems') {
            variant = 'destructive';
            displayText = 'issues';
          } else if (category.toLowerCase() === 'requests') {
            variant = 'success';
          }
          return <Badge variant={variant} className="capitalize">{displayText}</Badge>
      },
      filterFn: (row, id, value) => {
        const tags = row.getValue(id) as string[];
        if (!tags || tags.length === 0) return false;
        const category = tags[0];
        return category.toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      accessorKey: "content",
      header: "Feedback",
      cell: ({ row }) => (
        <div className="capitalize whitespace-normal break-words">{row.getValue("content")}</div>
      ),
    },
    {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => (
          <div>{row.getValue("source") || "Email"}</div>
        ),
      },
  ]

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  hideAllTab?: boolean;
  initialVisibility?: VisibilityState;
}

export function FeedbackDataTable<TData, TValue>({
  columns,
  data,
  hideAllTab = false,
  initialVisibility = {},
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialVisibility)
  const [rowSelection, setRowSelection] = React.useState({})

  const hasTagsColumn = React.useMemo(() => columns.some(col => {
    const accessor = col as any;
    return accessor.accessorKey === 'tags';
  }), [columns]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: 0,
        pageSize: 50,
      }
    },
  })

  React.useEffect(() => {
    // Set initial filter to "requests" if "All" tab is hidden
    if (hideAllTab && hasTagsColumn) {
      table.getColumn("tags")?.setFilterValue("requests");
    }
  }, [hideAllTab, table, hasTagsColumn]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4 px-2">
        <Input
          placeholder="Filter feedback..."
          value={(table.getColumn("content")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("content")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        {hasTagsColumn && (
            <Tabs 
              defaultValue={hideAllTab ? "requests" : "all"}
              onValueChange={(value) => {
                const filterValue = value === "all" ? "" : value.toLowerCase();
                if (hasTagsColumn) {
                  table.getColumn("tags")?.setFilterValue(filterValue);
                }
              }}
            >
                <TabsList>
                    {!hideAllTab && <TabsTrigger value="all">All</TabsTrigger>}
                    <TabsTrigger value="requests">Requests</TabsTrigger>
                    <TabsTrigger value="problems">Issues</TabsTrigger>
                    <TabsTrigger value="praise">Praise</TabsTrigger>
                </TabsList>
            </Tabs>
        )}
      </div>
      <div className="rounded-md border h-[600px] overflow-auto">
        <Table className="table-fixed">
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
        </div>
      </div>
    </div>
  )
} 