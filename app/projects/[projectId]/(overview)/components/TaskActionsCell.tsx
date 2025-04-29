import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MoreVertical, Info, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTaskDetails } from "../TaskDetailsContext";
import { prefetchTask } from "@/hooks/useTaskQueries";
import AddTaskDialog from "./AddTaskDialog";

export function TaskActionsCell({ row }: { row: any }) {
    const [isAddSubtaskDialogOpen, setIsAddSubtaskDialogOpen] = useState(false);

    const queryClient = useQueryClient();
    const { openDrawer } = useTaskDetails();

    const handleClick = async () => {
        await prefetchTask(queryClient, row.original.id as string);
        openDrawer(row.original);
    };

    const isSubtask = row.depth > 0;
    const phaseStatus = row.original.phase_id?.status as number;
    const isPhaseDone = phaseStatus === 2;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem className="cursor-pointer flex items-center text-yellow-500" onClick={handleClick}>
                        <Info className="mr-2 h-4 w-4" />
                        <span>Detail</span>
                    </DropdownMenuItem>

                    {!isSubtask && !isPhaseDone && (
                        <DropdownMenuItem className="cursor-pointer flex items-center" onSelect={() => setIsAddSubtaskDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Add Subtask</span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {!isSubtask && !isPhaseDone && (
                <AddTaskDialog
                    isOpen={isAddSubtaskDialogOpen}
                    onOpenChange={setIsAddSubtaskDialogOpen}
                    taskId={row.original.id as string}
                    taskTitle={row.original.title as string}
                    phaseId={row.original.phase_id.id as string}
                    phaseLabel={row.original.phase_label as string}
                    phaseStatus={phaseStatus}
                />
            )}
        </>
    );
}