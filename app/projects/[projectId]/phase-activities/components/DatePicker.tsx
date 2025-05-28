"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { successButton } from "@/consts/buttonStyles";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useProjectQueries } from "@/hooks/useProjectQueries";
import { useParams } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useBoardQueries } from "@/hooks/useBoardQueries";
import { useOverviewQueries } from "@/hooks/useOverviewQueries";
import { useMilestoneQueries } from "@/hooks/useMilestoneQueries";
import { usePhaseQueries } from "@/hooks/usePhaseQueries";

interface Props {
    id: string;
    status: number;
    category: string;
}

export default function DatePicker({ id, status, category }: Props) {
    const params = useParams();
    const projectId = params.projectId;
    const isDone = status === 2;

    const { user } = useCurrentUser();
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const { reloadProjectTasks } = useProjectQueries(projectId as string);
    const { reloadCurrentMilestones, reloadAllMilestone } = useMilestoneQueries(projectId as string, '');
    const { reloadAllPhase } = usePhaseQueries(projectId as string, '');
    const { reloadOverview } = useOverviewQueries(projectId as string, id);
    const { reloadBoard } = useBoardQueries(user?.id as string)

    const isDateDisabled = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const handleSelectDate = async () => {
        if (!dateRange?.from || !dateRange?.to) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please select a valid date range'
            });
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDate = new Date(dateRange.from);
        startDate.setHours(0, 0, 0, 0);

        if (startDate < today) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Start date cannot be before today'
            });
            return;
        }

        try {
            setIsLoading(true);

            const supabase = createClient();
            const { data, error } = await supabase
                .from(category)
                .update({
                    startDate: dateRange.from,
                    endDate: dateRange.to,
                })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;

            if (!data) {
                throw new Error('No data returned from update');
            }

            const reloadPromises = [
                reloadOverview(),
                reloadProjectTasks(),
                reloadAllMilestone(),
                reloadAllPhase(),
                reloadBoard()
            ];

            const results = await Promise.allSettled(reloadPromises);

            const failedReloads = results.filter(r => r.status === 'rejected');
            if (failedReloads.length > 0) {
                console.error('Some reloads failed:', failedReloads);
                throw new Error(`${failedReloads.length} reload operations failed`);
            }

            toast({
                title: 'Success',
                description: `${category} period updated successfully`
            });
        } catch (error) {
            console.error("Failed to update date range:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to update periods. Please try again'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className="p-1"
                    disabled={isLoading || isDone}
                >
                    <CalendarIcon className="w-1 h-1 text-gray-500" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto px-4 pb-3 flex flex-col gap-2"
                align="end"
                sideOffset={5}
            >
                <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    disabled={isDateDisabled}
                />
                <Button
                    onClick={handleSelectDate}
                    disabled={isLoading || !dateRange?.from || !dateRange?.to}
                    className={cn(successButton)}
                >
                    {isLoading ? "Saving..." : "Save Period"}
                </Button>
            </PopoverContent>
        </Popover>
    );
}