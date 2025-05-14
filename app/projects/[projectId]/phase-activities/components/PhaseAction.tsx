"use client";

import { useState } from "react";
import { CircleCheck, MoreVertical } from "lucide-react";
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
import { usePhaseQueries } from "@/hooks/usePhaseQueries";
import { tasks } from "@/utils/tasks";
import { successButton } from "@/consts/buttonStyles";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useBoardQueries } from "@/hooks/useBoardQueries";
import { useOverviewQueries } from "@/hooks/useOverviewQueries";

interface Props {
    phaseId: string;
    phaseOrder: number;
    phaseLabel: string;
    phaseStatus: number;
}

export function PhaseAction({ phaseId, phaseOrder, phaseLabel, phaseStatus }: Props) {
    const params = useParams();
    const projectId = params.projectId;
    const isPhaseDone = phaseStatus === 2;

    const { user } = useCurrentUser();
    const { reloadProjectTasks } = useProjectQueries(projectId as string);
    const { reloadOverview } = useOverviewQueries(projectId as string, phaseId);
    const { reloadAllPhase, reloadCurrentPhase } = usePhaseQueries(projectId as string, '');
    const { reloadBoard } = useBoardQueries(user?.id as string);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    const handleSetPhaseAsDoneClick = () => {
        setIsDropdownOpen(false);
        setIsAlertDialogOpen(true);
    };

    const handleConfirm = async () => {
        try {
            setIsConfirming(true);

            const isDone = await tasks.check.isAllTasksDone(projectId as string, phaseLabel);
            if (!isDone) {
                toast({
                    variant: "destructive",
                    title: 'Action Blocked',
                    description: "To proceed, all tasks in this phase must be completed. If there are no tasks yet, please create and complete them first.",
                });
                return;
            }

            const supabase = createClient();

            await supabase
                .from('phases')
                .update({
                    status: 2,
                    actualEndDate: new Date(),
                })
                .eq('id', phaseId);

            await supabase
                .from('phases')
                .update({
                    status: 1,
                })
                .eq('project_id', projectId)
                .eq('phase_order', phaseOrder + 1);
            
            await reloadAllPhase();
            await reloadCurrentPhase();
            await reloadProjectTasks();
            await reloadOverview();
            await reloadBoard();

            toast({
                title: 'Success',
                description: 'Phase marked as done successfully',
            });
        } catch (error) {
            console.error("Failed to update phases:", error);
            toast({
                variant: "destructive",
                title: 'Error',
                description: 'Failed to set phase to done. Please try again.'
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
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={handleSetPhaseAsDoneClick}
                        className="text-green-600 hover:bg-green-50 focus:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/50 dark:focus:bg-green-900/50"
                        disabled={isPhaseDone}
                    >
                        <CircleCheck className="mr-2 h-4 w-4" />
                        Set Phase as Done
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will mark the phase as done. Are you sure you want to proceed?
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