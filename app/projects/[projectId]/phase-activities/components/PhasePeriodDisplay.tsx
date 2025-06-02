"use client"

import { useMemo } from "react"
import { CheckCircle, Clock } from "lucide-react"
import DatePicker from "./DatePicker"
import { PhaseAction } from "./PhaseAction"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useProjectAccess } from "@/hooks/useProjectAccess"

interface PhasePeriodDisplayProps {
    isPhaseDone: boolean;
    startDate: Date | null;
    endDate: Date | null;
    actualEndDate: Date | null;
    phaseId: string;
    phaseStatus: number;
    phaseOrder: number;
    phaseLabel: string;
    projectId: string;
}

export const PhasePeriodDisplay = ({
    isPhaseDone,
    startDate,
    endDate,
    actualEndDate,
    phaseId,
    phaseStatus,
    phaseOrder,
    phaseLabel,
    projectId
}: PhasePeriodDisplayProps) => {
    const { hasMinRole } = useProjectAccess({ projectId });
    
    const formatDate = useMemo(
        () =>
            (date: Date | null): string => {
                if (!date) return ""
                return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                })
            },
        [],
    )

    return (
        <Card className="w-full">
            <CardHeader className="pb-2 px-3 pt-3">
                <div className="flex items-center justify-between gap-1">
                    <CardTitle className="text-sm font-semibold leading-tight">Phase Period</CardTitle>
                    {hasMinRole('admin') && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <DatePicker
                                id={phaseId}
                                status={phaseStatus}
                                category="phases"
                            />
                            <PhaseAction
                                phaseId={phaseId}
                                phaseOrder={phaseOrder}
                                phaseLabel={phaseLabel}
                                phaseStatus={phaseStatus}
                            />
                        </div>
                    )} 
                </div>
                {isPhaseDone ?
                    <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 w-fit text-xs"
                    >
                        <CheckCircle className="w-2.5 h-2.5 mr-1" />
                        Done
                    </Badge> :
                    <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 w-fit text-xs"
                >
                    <Clock className="w-2.5 h-2.5 mr-1" />
                    In Progress
                </Badge>
                }
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-2">
                <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Start</span>
                    <span className={startDate ? 'font-medium' : 'text-muted-foreground'}>{startDate ? formatDate(startDate) : '—'}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">End</span>
                    <span className={endDate ? 'font-medium' : 'text-muted-foreground'}>{endDate ? formatDate(endDate) : '—'}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Done</span>
                    <span className={actualEndDate ? "font-medium text-green-500" : "text-muted-foreground"}>
                        {actualEndDate ? formatDate(actualEndDate) : '—'}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}


