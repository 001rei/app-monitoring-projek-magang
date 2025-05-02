import { useState } from "react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    getExpandedRowModel,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import AddTaskDialog from "./AddTaskDialog"
import PhaseDatePicker from "./PhaseDatePicker"
import { CalendarDays, CheckCircle } from "lucide-react"
import { PhaseAction } from "./PhaseAction"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    phaseLabel: string;
    phaseId: string;
    phaseOrder: number;
    phaseStatus: number;
    projectId: string;
}

export function DataTable<TData, TValue>({ columns, data, phaseLabel, phaseId, phaseOrder, phaseStatus }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([
        { id: "status", desc: false } 
    ]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [expanded, setExpanded] = useState({});
    const [isOpen, setIsOpen] = useState(false);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onExpandedChange: setExpanded,
        getExpandedRowModel: getExpandedRowModel(),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            expanded,
        },
        getSubRows: (row: any) => row.subtasks,
    });

    const isPhaseDone = phaseStatus === 2;

    const startDate = table.getRowModel().rows?.length && table.getRowModel().rows[0].original.phase_id.startDate
        ? new Date(table.getRowModel().rows[0].original.phase_id.startDate)
        : null;
    const endDate = table.getRowModel().rows?.length && table.getRowModel().rows[0].original.phase_id.endDate
        ? new Date(table.getRowModel().rows[0].original.phase_id.endDate)
        : null;
    const actualEndDate = table.getRowModel().rows?.length && table.getRowModel().rows[0].original.phase_id.actualEndDate
        ? new Date(table.getRowModel().rows[0].original.phase_id.actualEndDate)
        : null;

    return (
        <div className="space-y-4">
            <div className={`p-3 rounded-sm ${isPhaseDone ? 'bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800' : 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800'} shadow-sm`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {isPhaseDone ? (
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-300 mr-1" />
                        ) : (
                            <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-300 mr-1" />
                        )}
                        <p className={`text-sm ${isPhaseDone ? 'text-green-900 dark:text-green-100' : 'text-blue-900 dark:text-blue-100'}`}>
                            <strong>{isPhaseDone ? 'Phase Period' : 'Current Phase Period'}</strong>:{" "}
                            {startDate ? startDate.toDateString() + ' -' : "Not set"} {endDate ? endDate.toDateString() : ""}
                            {isPhaseDone && actualEndDate && (
                                <span className="ml-2">
                                    (Completed on: {actualEndDate.toDateString()})
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <PhaseDatePicker
                            phaseId={phaseId}
                            phaseStatus={phaseStatus}
                        />
                        <PhaseAction
                            phaseId={phaseId as string}
                            phaseOrder={phaseOrder as number}
                            phaseLabel={phaseLabel}
                            phaseStatus={phaseStatus}
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <Input
                    placeholder="Filter tasks..."
                    value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                    onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                />
                <AddTaskDialog
                    phaseId={phaseId as string}
                    phaseLabel={phaseLabel as string}
                    phaseStatus={phaseStatus}
                    isOpen={isOpen}
                    onOpenChange={setIsOpen}
                />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                                    className={`
                                        ${row.original.status === "done" ? "bg-muted/50" : ""}
                                        ${row.getParentRow() ? "bg-muted hover:bg-muted" : ""} 
                                    `}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No tasks found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}