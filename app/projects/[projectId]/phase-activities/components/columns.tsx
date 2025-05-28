"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, ArrowUpDown } from "lucide-react"
import { ITaskWithOptions } from "@/types"
import OpenTaskDetails from "./OpenTaskDetails"
import StackedAvatars from "@/components/StackedAvatars"
import { IUser } from '../../../../../types';
import { CustomFieldTagRenderer } from "@/components/CustomFieldTagRenderer"
import { useParams } from "next/navigation";
import { useCallback, useState } from "react"
import { useProjectQueries } from "@/hooks/useProjectQueries"
import { createClient } from "@/utils/supabase/client"
import { TaskDoneConfirmationDialog } from "./TaskDoneConfirmationDialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useOverviewQueries } from "@/hooks/useOverviewQueries"
import { format } from "date-fns"
import { useBoardQueries } from "@/hooks/useBoardQueries"
import { useCurrentUser } from "@/hooks/useCurrentUser"

export const columns: ColumnDef<ITaskWithOptions>[] = [
    {
        id: "select",
        cell: ({ row }) => {
            const params = useParams();
            const projectId = params.projectId;
            const supabase = createClient();
            const [isLoading, setIsLoading] = useState(false);
            const [isDialogOpen, setIsDialogOpen] = useState(false);
            const [isChecked, setIsChecked] = useState(row.original.status?.label === "Done");

            const task = row.original;
            const { user } = useCurrentUser();
            const { updateStatusOnTable } = useProjectQueries(projectId as string || "", task.id);
            const { reloadProjectTasks } = useProjectQueries(projectId as string || "");
            const { reloadOverview } = useOverviewQueries(projectId as string, task.phase_id?.id as string)
            const { reloadBoard } = useBoardQueries(user?.id as string);


            const handleStatusChange = useCallback(
                async (value: boolean) => {
                    const newStatus = value
                        ? 8
                        : 3;

                    try {
                        setIsLoading(true);

                        updateStatusOnTable(newStatus || 0);
                        await supabase
                            .from("tasks")
                            .update({ status: newStatus, updated_at: new Date() })
                            .eq("parent_task_id", task.id);

                        await reloadProjectTasks();
                        await reloadOverview();
                        await reloadBoard();

                        row.toggleSelected(!!value);
                        setIsChecked(true);
                    } catch (error) {
                        console.error("Gagal mengubah status:", error);
                    } finally {
                        setIsLoading(false);
                    }
                },
                [updateStatusOnTable, task, row, supabase, reloadProjectTasks]
            );

            const handleCheckboxClick = () => {
                if (!isChecked) {
                    setIsDialogOpen(true);
                }
            };

            const handleConfirm = () => {
                handleStatusChange(true);
                setIsDialogOpen(false);
            };

            const handleCancel = () => {
                setIsDialogOpen(false);
            };

            return (
                <>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={handleCheckboxClick}
                                    disabled={isLoading || isChecked}
                                    aria-label="Select row"
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Mark this task as done</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TaskDoneConfirmationDialog
                        isOpen={isDialogOpen}
                        onClose={handleCancel}
                        onConfirm={handleConfirm}
                    />
                </>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: "expander",
        header: "",
        cell: ({ row }) => {
            const task = row.original

            if (!task.subtasks || task.subtasks.length === 0) {
                return null
            }

            return (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => row.toggleExpanded()}
                    aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
                >
                    {row.getIsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
            )
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "title",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Task
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const isSubtask = row.depth > 0
            const task = row.original
            const currentStatus = task.status || { id: "unknown", label: "Unknown", color: "gray" }

            return (
                <div className={`flex items-center gap-2 ${isSubtask ? "pl-4" : ""}`}>
                    <span
                        className={`flex-1 truncate ${currentStatus.label === "Done"
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                            }`}
                        title={task.title}
                    >
                        {task.title}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const status = row.original.status;

            return status ? (
                <div className="pl-3">
                    <CustomFieldTagRenderer
                        color={status.color as string}
                        label={status.label as string}
                    />
                </div>
            ) : (
                <p className="text-gray-500/75 pl-5">None</p>
            );
        },
        sortingFn: (rowA, rowB, columnId) => {
            const statusA = rowA.original.status;
            const statusB = rowB.original.status;

            if (statusA?.label === "Done" && statusB?.label === "Done") return 0;
            if (statusA?.label === "Done") return 1;
            if (statusB?.label === "Done") return -1;

            const orderA = statusA?.order;
            const orderB = statusB?.order;
            return (orderA as number) - (orderB as number);
        },
    },
    {
        accessorKey: "priority",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Priority
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const priority = row.original.priority;

            return priority ? (
                <div className="pl-3">
                    <CustomFieldTagRenderer
                        color={priority.color as string}
                        label={priority.label as string}
                    />
                </div>

            ) : (
                <p className="text-gray-500/75 pl-5">None</p>
            );
        },
        sortingFn: (rowA, rowB, columnId) => {
            const orderA = rowA.original.priority?.order || Infinity;
            const orderB = rowB.original.priority?.order || Infinity;
            return orderB - orderA;
        },

    },
    {
        accessorKey: "assignees",
        header: 'Assignees',
        size: 180,
        cell: ({ row }) => {
            const task = row.original;
            const assignees = task.assignees as Partial<IUser>[] | undefined; // Pastikan tipe data assignees

            return (
                <>
                    {assignees && assignees.length > 0 ? (
                        <StackedAvatars users={assignees} />
                    ) : (
                        <p className="text-gray-500/75">No Assignees</p>
                    )}
                </>
            );
        },
    },
    {
        accessorKey: "endDate",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Due Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const task = row.original;
            const currentStatus = task.status || { id: "unknown", label: "Unknown", color: "gray" };

            const formattedDate = task.endDate
                ? format(new Date(task.endDate), 'PPP')
                : "No Due Date";

            return (
                <div className={currentStatus.label === "Done" ? "line-through text-muted-foreground ml-5" : "ml-5"}>
                    <span className={task.endDate ? "" : "text-gray-500/75"}>
                        {formattedDate}
                    </span>
                </div>
            );
        }
    },
    {
        id: "actions",
        header: "",
        cell: ({ row }) => {
            return (
                <OpenTaskDetails row={row} />
            );
        },
    },
]