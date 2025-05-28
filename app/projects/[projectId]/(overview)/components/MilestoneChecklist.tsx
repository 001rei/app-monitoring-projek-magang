"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, ChevronRight, Flag } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMilestoneQueries } from "@/hooks/useMilestoneQueries"
import { format } from "date-fns"

interface Props {
    projectId: string;
    phaseLabel: string;
}

export default function MilestoneChecklist({ projectId, phaseLabel }: Props) {
    const [expanded, setExpanded] = useState(true);
    const { currentMilestones } = useMilestoneQueries(projectId, phaseLabel);

    const sortedMilestones = Array.isArray(currentMilestones)
        ? [...currentMilestones].sort((a, b) => a.milestone_order - b.milestone_order)
        : [];

    const completedCount = sortedMilestones.filter((m) => m.status === 2).length;

    const progressPercentage = sortedMilestones.length > 0
        ? Math.round((completedCount / sortedMilestones.length) * 100)
        : 0;

    const formatDate = (date: Date | string | null) => {
        if (!date) return null;
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return format(dateObj, 'MMM dd, yyyy');
    };

    return (
        <Card className="w-full mx-auto border bg-card text-card-foreground shadow-sm">
            <CardHeader
                className="pb-2 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Flag className="h-5 w-5 text-primary" />
                        <span className="text-sm">Project Milestones</span>
                        <Badge variant="outline" className="ml-2">
                            {completedCount}/{sortedMilestones.length}
                        </Badge>
                    </CardTitle>
                    <ChevronRight className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform duration-200",
                        expanded ? "rotate-90" : ""
                    )} />
                </div>
                <CardDescription className="text-muted-foreground text-xs pb-3">
                    Track your project progress with these key milestones
                </CardDescription>
            </CardHeader>

            <div className={cn(
                "transition-all duration-300 ease-in-out overflow-hidden",
                expanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
            )}>
                <div className="px-6 pb-3">
                    <div className="flex items-center gap-4 mb-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Progress
                                        value={progressPercentage}
                                        className={`h-1.5 mb-1 ${progressPercentage === 100
                                            ? '[&>div]:bg-green-500 [&>div]:dark:bg-green-400'
                                            : '[&>div]:bg-yellow-400 [&>div]:dark:bg-yellow-300'
                                            }`}
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{progressPercentage}% completed</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <div className={cn(
                            "text-sm font-medium",
                            progressPercentage === 100 ? "text-green-500" : "text-foreground"
                        )}>
                            {progressPercentage}%
                        </div>
                    </div>
                </div>

                <CardContent className="pt-0">
                    <div className="space-y-2">
                        {sortedMilestones.map((milestone) => (
                            <div
                                key={milestone.id}
                                className={cn(
                                    "flex items-center gap-4 p-3 rounded-lg transition-colors border",
                                    milestone.status === 2 ? "border-green-500/20 bg-green-500/5" : "border-muted/50",
                                    "hover:shadow-sm hover:border-primary/30"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                                        milestone.status === 2
                                            ? "bg-green-500 border-green-500 text-white"
                                            : "border-muted-foreground/30 hover:border-primary"
                                    )}
                                >
                                    {milestone.status === 2 && <CheckCircle className="h-3 w-3" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={cn(
                                            "text-sm font-medium truncate transition-colors",
                                            milestone.status === 2
                                                ? "line-through text-muted-foreground"
                                                : "text-foreground"
                                        )}
                                    >
                                        {milestone.label}
                                    </p>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {milestone.status === 2 ? (
                                            milestone.actualEndDate && (
                                                <span className="text-green-600 dark:text-green-400">
                                                    Completed on {formatDate(milestone.actualEndDate)}
                                                </span>
                                            )
                                        ) : (
                                            <>
                                                {milestone.startDate && formatDate(milestone.startDate)}
                                                {milestone.startDate && milestone.endDate && " - "}
                                                {milestone.endDate && formatDate(milestone.endDate)}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <Badge
                                    variant={milestone.status === 2 ? "default" : "secondary"}
                                    className={cn(
                                        "shrink-0",
                                        milestone.status === 2
                                            ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 w-fit text-xs"
                                            : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 w-fit text-xs"
                                    )}
                                >
                                    {milestone.status === 2 ? "Completed" : "In Progress"}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </div>
        </Card>
    )
}