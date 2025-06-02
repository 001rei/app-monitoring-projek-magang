'use client';

import { useMemo, useState } from "react"
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
import { ClipboardListIcon } from "lucide-react"
import { PhasePeriodDisplay } from "./PhasePeriodDisplay"
import { Separator } from "@/components/ui/separator";
import { MilestonePeriodDisplay } from "./MilestonePeriodDisplay";
import { useProjectAccess } from "@/hooks/useProjectAccess";
import { ProjectAction } from "@/consts/actions";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    phaseLabel: string;
    phaseId: string;
    phaseOrder: number;
    phaseStatus: number;
    phaseStart: Date | null;
    phaseEnd: Date | null;
    phaseCompleted: Date | null;
    milestoneId: string;
    milestoneLabel: string;
    milestoneOrder: number;
    milestoneStatus: number;
    milestoneStart: Date | null;
    milestoneEnd: Date | null;
    milestoneCompleted: Date | null;
    projectId: string;
}

export function DataTable<TData, TValue>(
    { columns, data, projectId,
        phaseLabel, phaseId, phaseOrder, phaseStatus, phaseStart, phaseEnd, phaseCompleted,
        milestoneId, milestoneLabel, milestoneOrder, milestoneStatus, milestoneStart, milestoneEnd, milestoneCompleted
    }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([
        { id: "status", desc: false }
    ]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const { can } = useProjectAccess({ projectId });
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
    const isMilestoneDone = milestoneStatus === 2;

    const memoizedInfo = useMemo(() => (
        <>
            <PhasePeriodDisplay
                isPhaseDone={isPhaseDone}
                startDate={phaseStart}
                endDate={phaseEnd}
                actualEndDate={phaseCompleted}
                phaseId={phaseId}
                phaseLabel={phaseLabel}
                phaseOrder={phaseOrder}
                phaseStatus={phaseStatus}
                projectId={projectId}
                />
            <MilestonePeriodDisplay 
                isMilestoneDone={isMilestoneDone}
                startDate={milestoneStart}
                endDate={milestoneEnd}
                actualEndDate={milestoneCompleted}
                milestoneId={milestoneId}
                milestoneLabel={milestoneLabel}
                milestoneOrder={milestoneOrder}
                milestoneStatus={milestoneStatus}
                projectId={projectId}
            />
        </>
        
    ), [isPhaseDone, phaseStart, phaseEnd, phaseCompleted, milestoneStart, milestoneEnd, milestoneCompleted]);

    return (
        <>
            <Separator className="mb-5" />
            <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-9 gap-4">
                
                    <div className="lg:col-span-2 space-y-4">
                        {memoizedInfo}
                    </div>

                    <div className="lg:col-span-7 space-y-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">  
                            <Input
                                placeholder="Filter tasks..."
                                value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                                onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
                                className="w-full sm:w-auto"
                            />
                            {can(ProjectAction.CREATE_TASKS) && (
                                <AddTaskDialog
                                    phaseId={phaseId as string}
                                    phaseLabel={phaseLabel as string}
                                    phaseStatus={phaseStatus}
                                    milestoneId={milestoneId as string}
                                    milestoneLabel={milestoneLabel as string}
                                    milestoneStatus={milestoneStatus as number}
                                    isOpen={isOpen}
                                    onOpenChange={setIsOpen}
                                />
                            )}
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                </TableHead>
                                            ))}
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
                                                    <TableCell key={cell.id}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="py-12">
                                                <div className="flex flex-col items-center justify-center space-y-2">
                                                    <ClipboardListIcon className="h-7 w-7 text-gray-400" />
                                                    <p className="text-base font-medium text-gray-500">No tasks found</p>
                                                    <p className="text-sm text-gray-400">Create a new task to get started</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}