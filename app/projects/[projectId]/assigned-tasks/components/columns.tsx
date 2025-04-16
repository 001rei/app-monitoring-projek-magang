"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import { ITaskWithOptions } from "@/types"
import { CustomFieldTagRenderer } from "@/components/CustomFieldTagRenderer"
import Link from "next/link"
import { useParams } from "next/navigation"

export const columns: ColumnDef<ITaskWithOptions>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" className="ps-[15px]"/>
    ),
    cell: ({ row }) => {
      const params = useParams();
      const projectId = params.projectId;
      const milestone = row.original.milestone
      
      return (
        <div className="flex space-x-2">
          {row.original.phase_label && (
            <CustomFieldTagRenderer
              color={'hsl(0, 0%, 75%)'}
              label={row.original.phase_label}
            />
          )}
          {milestone && (
            <CustomFieldTagRenderer
              color={milestone.color}
              label={milestone.label}
            />
          )}
          <span className="max-w-[500px] truncate font-medium">
            <Link
              href={`${location?.origin}/projects/${projectId}/${row.original.id}`}
              className="hover:underline" 
            >
              {row.original.title}
            </Link>
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status

      return status ? (
        <div className="flex w-[100px] items-center">
          <CustomFieldTagRenderer
            color={status.color as string}
            label={status.label as string}
          />
        </div>
      ) : (
        <p className="text-gray-500/75 pl-5">None</p>
      )
    },
    filterFn: (row, id, value) => {
      const status = row.getValue(id) as { id: string, label: string } | null;
      return status ? value.includes(status.id) : false;
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.status?.order || 0;
      const b = rowB.original.status?.order || 0;
      return a - b;
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const priority = row.original.priority

      return priority ? (
        <div className="flex w-[100px] items-center">
          <CustomFieldTagRenderer
            color={priority.color as string}
            label={priority.label as string}
          />
        </div>
      ) : (
        <p className="text-gray-500/75 pl-5">None</p>
      )
    },
    filterFn: (row, id, value) => {
      const priority = row.getValue(id) as { id: string, label: string } | null;
      return priority ? value.includes(priority.id) : false;
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.priority?.order || 0;
      const b = rowB.original.priority?.order || 0;
      return a - b;
    },
  },
  {
    accessorKey: "Due Date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due Date" />
    ),
    cell: ({ row }) => {
      const task = row.original;
      const endDate = task.endDate ? new Date(task.endDate).toLocaleDateString() : <p className="text-gray-500/75">No Due Date</p>; 

      return endDate;
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.endDate ? new Date(rowA.original.endDate).getTime() : 0;
      const b = rowB.original.endDate ? new Date(rowB.original.endDate).getTime() : 0;
      return a - b;
    },
  },
  {
    id: "actions",

  },
]
