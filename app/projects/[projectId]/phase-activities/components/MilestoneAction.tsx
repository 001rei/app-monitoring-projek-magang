"use client";

import { useState } from "react";
import { CircleCheck, MoreHorizontal, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import { useProjectQueries } from "@/hooks/useProjectQueries";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { tasks } from "@/utils/tasks";
import { successButton } from "@/consts/buttonStyles";
import { useMilestoneQueries } from "@/hooks/useMilestoneQueries";

interface Props {
    milestoneId: string;
    milestoneLabel: string;
    milestoneStatus: number;
}

export function MilestoneAction({ milestoneId, milestoneLabel, milestoneStatus }: Props) {
    const params = useParams();
    const projectId = params.projectId;
    const isMilestoneDone = milestoneStatus === 2;

    const { reloadAllMilestone } = useMilestoneQueries(projectId as string, '');
    const { reloadProjectTasks } = useProjectQueries(projectId as string);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    const handleSetMilestoneAsDoneClick = () => {
        setIsDropdownOpen(false);
        setIsAlertDialogOpen(true);
    };

    const handleConfirm = async () => {
        try {
            setIsConfirming(true);

            const isDone = await tasks.check.isAllMilestoneTaskDone(projectId as string, milestoneId);
            console.log(isDone)
            if (!isDone) {
                toast({
                    variant: "destructive",
                    title: 'Action Blocked',
                    description: "To proceed, all tasks in this milestone must be completed. If there are no tasks yet, please create and complete them first.",
                });
                return;
            }

            const supabase = createClient();

            await supabase
                .from('milestones')
                .update({
                    status: 2,
                    actualEndDate: new Date(),
                })
                .eq('id', milestoneId);
            
            const reloadPromises = [
                reloadAllMilestone(),
                reloadProjectTasks(),
            ];

            const results = await Promise.allSettled(reloadPromises);

            const failedReloads = results.filter(r => r.status === 'rejected');
            if (failedReloads.length > 0) {
                console.error('Some reloads failed:', failedReloads);
                throw new Error(`${failedReloads.length} reload operations failed`);
            }
        
            toast({
                title: 'Success',
                description: 'Milestone marked as done successfully',
            });
        } catch (error) {
            console.error("Failed to update milestone:", error);
            toast({
                variant: "destructive",
                title: 'Error',
                description: 'Failed to set milestone to done. Please try again.'
            });
        } finally {
            setIsConfirming(false);
            setIsAlertDialogOpen(false);
        }
    };


    return (
        <>
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-1">
                        <MoreHorizontal className="w-3 h-3 text-gray-500" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={handleSetMilestoneAsDoneClick}
                        className="text-green-600 hover:bg-green-50 focus:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/50 dark:focus:bg-green-900/50"
                        disabled={isMilestoneDone}
                    >
                        <CircleCheck className="h-2 w-2" />
                        <p className="text-xs">Set Milestone as Done</p>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will mark the milestone as done. Are you sure you want to proceed?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isConfirming}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm} disabled={isConfirming} className={cn(successButton)}>
                            {isConfirming ? "Updating..." : "Confirm"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}