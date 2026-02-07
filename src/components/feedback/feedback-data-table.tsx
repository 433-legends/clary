"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { z } from "zod"
import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const feedbackSchema = z.object({
  id: z.string(),
  content: z.string(),
  sentiment: z.enum(["positive", "negative", "neutral"]),
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
  date: z.string().optional(),
})

export type Feedback = z.infer<typeof feedbackSchema>

export const columns: ColumnDef<Feedback>[] = [
  {
    accessorKey: "content",
    header: "Feedback Text",
    cell: ({ row }) => <div className="min-w-[300px]">{row.getValue("content")}</div>,
  },
  {
    accessorKey: "sentiment",
    header: "Sentiment",
    cell: ({ row }) => {
      const sentiment = row.getValue("sentiment") as string
      const sentimentClass = cn({
        "text-red-500": sentiment === "negative",
        "text-green-500": sentiment === "positive",
        "text-muted-foreground": sentiment === "neutral",
      })

      return <div className={sentimentClass}>{sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}</div>
    },
  },
  {
    accessorKey: "tags",
    header: "AI Themes",
    cell: ({ row }) => {
      const tags = row.getValue("tags") as string[] | undefined
      if (!tags || tags.length === 0) {
        return <span className="text-muted-foreground">N/A</span>
      }
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
        </div>
      )
    },
  },
  {
    accessorKey: "source",
    header: "Source",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
]

export function FeedbackDataTable({ data }: { data: Feedback[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="space-y-4">
      <Input
        placeholder="Filter feedback..."
        value={(table.getColumn("content")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("content")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
  )
} 
