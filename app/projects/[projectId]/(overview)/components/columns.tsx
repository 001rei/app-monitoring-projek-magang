"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
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
            const { updateStatusOnTable } = useProjectQueries(projectId as string || "", task.id);
            const { reloadProjectTasks } = useProjectQueries(projectId as string || "");

            const handleStatusChange = useCallback(
                async (value: boolean) => {
                    const newStatus = value
                        ? "921614a8-4417-4fb9-acb0-cf1536b28e1a"
                        : "33529e8d-3041-4b1f-98d4-848ac85323b4";

                    try {
                        setIsLoading(true);
                        await updateStatusOnTable(newStatus || null);
                        await supabase
                            .from("tasks")
                            .update({ status: newStatus, updated_at: new Date() })
                            .eq("parent_task_id", task.id);

                        row.toggleSelected(!!value);
                        setIsChecked(true); 
                    } catch (error) {
                        console.error("Gagal mengubah status:", error);
                    } finally {
                        await reloadProjectTasks();
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
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const isSubtask = row.depth > 0
            const task = row.original
            const currentStatus = task.status || { id: "unknown", label: "Unknown", color: "gray" }
            return (
                <div
                    className={`${isSubtask ? "pl-4" : ""} ${currentStatus.label === "Done" ? "line-through text-muted-foreground" : ""}`}
                >
                    {task.title}
                </div>
            )
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
            console.log("Order A:", rowA.original.status?.order, "Order B:", rowB.original.status?.order);
            const orderA = rowA.original.status?.order || Infinity; // Gunakan order dari status
            const orderB = rowB.original.status?.order || Infinity; // Gunakan order dari status
            return orderB - orderA;
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
            return orderA - orderB; 
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
                        <StackedAvatars users={assignees}  />
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
            const endDate = task.endDate ? new Date(task.endDate).toLocaleDateString() : <p className="text-gray-500/75">No Due Date</p>; // Convert Date to string or show fallback

            return (
                <div className={currentStatus.label === "Done" ? "line-through text-muted-foreground ml-5" : "ml-5"}>
                    {endDate}
                </div>
            );
        },
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