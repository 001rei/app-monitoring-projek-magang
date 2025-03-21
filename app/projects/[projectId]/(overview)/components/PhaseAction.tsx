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
import { successButton } from "@/consts/buttonStyles";
import { useProjectQueries } from "@/hooks/useProjectQueries";
import { title } from "process";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Props {
    phaseId: string;
    phaseOrder: number;
}

export function PhaseAction({ phaseId, phaseOrder }: Props) {
    const params = useParams();
    const projectId = params.projectId;
    const { reloadProjectTasks } = useProjectQueries(projectId as string);
    
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
            
            await reloadProjectTasks();

            toast({
                title: 'Success',
                description: 'Phase marked as done successfully',
            })
        } catch (error) {
            console.error("Failed to update phases:", error);
            toast({
                variant: "destructive",
                title: 'Error',
                description: 'Failed to set phase to done. Please try again.'
            })
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