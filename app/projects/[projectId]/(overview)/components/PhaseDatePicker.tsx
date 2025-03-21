"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { createClient } from "@/utils/supabase/client";
import { successButton } from "@/consts/buttonStyles";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useProjectQueries } from "@/hooks/useProjectQueries";
import { useParams } from "next/navigation";

interface Props {
    phaseId: string;
}

export default function PhaseDatePicker({ phaseId }: Props) {
    const params = useParams();
    const projectId = params.projectId;

    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const { reloadProjectTasks } = useProjectQueries(projectId as string);

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
                description: 'Please select a valid dates'
            })
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
            const { error } = await supabase
                .from("phases")
                .update({
                    startDate: dateRange.from, 
                    endDate: dateRange.to,   
                })
                .eq("id", phaseId); 
            await reloadProjectTasks();

            if (error) {
                throw error;
            }

            toast({
                title: 'Success',
                description: 'Phase period updated successfully.'
            })
        } catch (error) {
            console.error("Failed to update date range:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update periods. Please try again'
            })
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-10 h-10 p-0 flex items-center justify-center"
                    disabled={isLoading}
                >
                    <CalendarIcon className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto px-4 pb-3 flex flex-col gap-2">
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