'use client';

import { useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { ArrowRightCircleIcon, Settings, UsersIcon, ChevronRight, TicketIcon, CheckCircle2, CircleDashedIcon, ClockIcon, ArrowUp, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Card, CardFooter } from "@/components/ui/card";
import Timeline from "./components/TImeline";
import { useOverviewQueries } from "@/hooks/useOverviewQueries";
import { usePhaseQueries } from '@/hooks/usePhaseQueries';
import { cn } from '@/lib/utils';
import { Chart } from './components/Chart';
import { UpcomingDeadlines } from './components/Upcoming';

interface Props {
    projectId: string;
}

export default function Overview({ projectId }: Props) {
    const { currentPhase } = usePhaseQueries(projectId, '');
    const { isLoading, projectOverview } = useOverviewQueries(
        projectId,
        currentPhase?.id ? currentPhase.id : ''
    );

    const completedTasks = useMemo(() => {
        if (!projectOverview?.tasks) return 0;
        return projectOverview.tasks.filter(task => task.status?.label === 'Done').length
    }, [projectOverview?.tasks])

    const overdueTasks = useMemo(() => {
        if (!projectOverview?.tasks) return 0;

        const now = new Date();
        return projectOverview.tasks.filter(task => {
            if (task.status?.label === 'Overdue') {
                return true;
            }
            if (task.endDate && task.status?.label !== 'Done') {
                const endDate = new Date(task.endDate);
                return endDate < now;
            }
            return false;
        }).length;
    }, [projectOverview?.tasks]);

    const completionPercentage = useMemo(() => {
        if (!projectOverview?.tasks) return 0;
        return Math.round((completedTasks / projectOverview.tasks.length) * 100);
    }, [projectOverview?.tasks, completedTasks]);

    const { daysRemainingText, daysRemaining, totalDays } = useMemo(() => {
        const getDaysInfo = (
            startDateInput?: string | Date | null,
            endDateInput?: string | Date | null
        ) => {
            if (!endDateInput) {
                return {
                    daysRemainingText: 'No deadline set',
                    daysRemaining: null,
                    totalDays: null
                };
            }

            let end: Date;
            if (endDateInput instanceof Date) {
                end = endDateInput;
            } else if (typeof endDateInput === 'string') {
                end = new Date(endDateInput);
            } else {
                return {
                    daysRemainingText: 'Invalid date format',
                    daysRemaining: null,
                    totalDays: null
                };
            }

            if (isNaN(end.getTime())) {
                return {
                    daysRemainingText: 'Invalid date',
                    daysRemaining: null,
                    totalDays: null
                };
            }

            const now = new Date();
            const timeDiff = end.getTime() - now.getTime();
            const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

            let daysRemainingText = '';
            if (daysRemaining > 0) {
                daysRemainingText = `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining`;
            } else if (daysRemaining === 0) {
                daysRemainingText = 'Due today';
            } else {
                daysRemainingText = `${Math.abs(daysRemaining)} ${Math.abs(daysRemaining) === 1 ? 'day' : 'days'} overdue`;
            }

            let totalDays: number | null = null;
            if (startDateInput) {
                const start = typeof startDateInput === 'string' ? new Date(startDateInput) : startDateInput;
                if (start instanceof Date && !isNaN(start.getTime())) {
                    const diff = end.getTime() - start.getTime();
                    totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
                }
            }

            return { daysRemainingText, daysRemaining, totalDays };
        };

        return getDaysInfo(
            projectOverview?.currentPhase?.startDate,
            projectOverview?.currentPhase?.endDate
        );
    }, [
        projectOverview?.currentPhase?.startDate,
        projectOverview?.currentPhase?.endDate
    ]);

    const isPhaseComplete = completionPercentage === 100;

    const todayCompletedTask = useMemo(() => {
        if (!projectOverview?.tasks) return 0;
        return projectOverview.tasks.filter(task => task.status?.label === 'Done' &&
            new Date(task.updated_at).toDateString() === new Date().toDateString()
        ).length
    }, [projectOverview?.tasks])

    return (
        <div className="flex flex-col gap-4">
            <Card className="p-4 bg-muted/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="space-y-1">
                        <h1 className="text-xl md:text-2xl font-bold">{projectOverview?.name}</h1>
                        <div className="flex flex-wrap items-center gap-1.5">
                            <Badge variant="outline" className="gap-1 text-xs py-1 px-2">
                                <TicketIcon className="h-3 w-3" />
                                {projectOverview?.project_code}
                            </Badge>
                            <Badge variant="outline" className="gap-1 text-xs py-1 px-2">
                                <UsersIcon className="h-3 w-3" />
                                {projectOverview?.membersCount} Members
                            </Badge>
                        </div>
                    </div>

                    <Link
                        href={`/projects/${projectId}/settings/project-settings`}
                        className="flex items-center gap-1 text-xs p-1.5 rounded-md hover:bg-accent transition-colors"
                    >
                        <Settings className="h-3.5 w-3.5" />
                        <span className="sr-only md:not-sr-only">Settings</span>
                    </Link>
                </div>
            </Card>

            <Card className="p-4">
                <Timeline phases={projectOverview?.phases ?? []} />
            </Card>

            <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <Link
                        href={`/projects/${projectId}/phase-activities`}
                        className={cn(
                            "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors group",
                            isPhaseComplete
                                ? "bg-green-50 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-200"
                                : "bg-blue-50 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-200"
                        )}
                    >
                        <ArrowRightCircleIcon className="h-3.5 w-3.5" />
                        <span>Current Phase: <strong>{projectOverview?.currentPhase?.label}</strong></span>
                        <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>

                    {isPhaseComplete ? (
                        <Badge variant="outline" className="gap-1.5 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                            </span>
                            Ready for Next Phase
                            <CheckCircle2 className="h-3.5 w-3.5 ml-0.5" />
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="gap-1.5 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500"></span>
                            </span>
                            Phase is on schedule
                            <CircleDashedIcon className="h-3.5 w-3.5 ml-0.5" />
                        </Badge>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Card className="p-3">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-xs font-medium">Phase Task Completion</h3>
                            <span className="text-xs font-semibold">
                                {completionPercentage}%
                            </span>
                        </div>
                        <Progress
                            value={completionPercentage}
                            className={cn(
                                "h-1.5 mb-1",
                                isPhaseComplete
                                    ? "[&>div]:bg-green-500 [&>div]:dark:bg-green-400"
                                    : "[&>div]:bg-yellow-500 [&>div]:dark:bg-yellow-400"
                            )}
                        />
                        <p className="text-[0.7rem] text-muted-foreground">
                            {completedTasks || 0} of {projectOverview?.tasks.length || 0} tasks completed
                        </p>
                    </Card>

                    <Card className="p-3">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-xs font-medium">Timeline</h3>
                            <span className={cn(
                                "text-xs font-semibold",
                                daysRemainingText.includes('overdue') ? 'text-red-500' : 'text-muted-foreground'
                            )}>
                                {daysRemainingText}
                            </span>
                        </div>
                        <div className="h-1.5 flex items-center mb-1">
                            <Progress
                                value={totalDays && daysRemaining !== null
                                    ? Math.min(100, Math.max(0, Math.round(((totalDays - daysRemaining) / totalDays) * 100)))
                                    : 0}
                                className={cn(
                                    "h-1.5 rounded-full",
                                    daysRemainingText.includes('overdue')
                                        ? "[&>div]:bg-red-500 [&>div]:dark:bg-red-400"
                                        : "[&>div]:bg-blue-500 [&>div]:dark:bg-blue-400"
                                )}
                            />
                        </div>
                        <div className="flex justify-between text-[0.7rem] text-muted-foreground">
                            <span>
                                {projectOverview?.currentPhase?.startDate
                                    ? new Date(projectOverview.currentPhase.startDate).toLocaleDateString()
                                    : 'No start date'}
                            </span>
                            <span>
                                {projectOverview?.currentPhase?.endDate
                                    ? new Date(projectOverview.currentPhase.endDate).toLocaleDateString()
                                    : 'No end date'}
                            </span>
                        </div>
                    </Card>
                </div>
            </Card>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items center">
                
                <Chart tasks={projectOverview?.tasks ?? []}/>

                <div className="flex flex-col gap-3">
                    <Card className="p-5 flex-1 group hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Completed Tasks</h3>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <p className="text-2xl font-bold">{completedTasks || 0}</p>
                                    {todayCompletedTask > 0 && (
                                        <span className="flex items-center text-sm text-green-600 dark:text-green-400">
                                            <ArrowUp className="h-3 w-3 mr-1" />
                                            {todayCompletedTask} today
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {projectOverview?.tasks?.length || 0} total tasks
                                </p>
                            </div>
                            <div className="relative">
                                <div className={cn(
                                    "p-3 rounded-lg transition-colors",
                                    todayCompletedTask > 0
                                        ? "bg-green-100/80 dark:bg-green-900/30"
                                        : "bg-muted"
                                )}>
                                    <CheckCircle2 className={cn(
                                        "h-6 w-6 transition-transform",
                                        todayCompletedTask > 0
                                            ? "text-green-600 dark:text-green-400 group-hover:scale-110"
                                            : "text-muted-foreground"
                                    )} />
                                </div>
                            </div>
                        </div>
                        <Progress
                            value={projectOverview?.tasks?.length ? (completedTasks / projectOverview.tasks.length) * 100 : 0}
                            className="h-[6px] mt-4 [&>div]:bg-green-500 [&>div]:dark:bg-green-400"
                        />
                        <CardFooter className="px-0 pb-0 pt-3 text-xs text-center">
                            {completedTasks > 0 ? (
                                <p className="text-green-600 dark:text-green-400">
                                    {completedTasks === projectOverview?.tasks?.length
                                        ? "🎉 All tasks completed! Great job team!"
                                        : todayCompletedTask > 0
                                            ? `Keep this momentum! ${todayCompletedTask} tasks crushed today`
                                            : "Progress looks good! Keep going!"}
                                </p>
                            ) : (
                                <p className="text-muted-foreground">Start completing tasks to see progress</p>
                            )}
                        </CardFooter>
                    </Card>

                    <Card className="p-5 flex-1 group hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Overdue Tasks</h3>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <p className="text-2xl font-bold">{overdueTasks || 0}</p>
                                    {overdueTasks > 0 && (
                                        <span className="flex items-center text-sm text-red-600 dark:text-red-400">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            urgent
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {overdueTasks ? `${Math.round((overdueTasks / (projectOverview?.tasks?.length || 1)) * 100)}% of total` : 'All tasks on time'}
                                </p>
                            </div>
                            <div className="relative">
                                <div className={cn(
                                    "p-3 rounded-lg transition-colors",
                                    overdueTasks > 0
                                        ? "bg-red-100/80 dark:bg-red-900/30 animate-pulse"
                                        : "bg-muted"
                                )}>
                                    <Clock className={cn(
                                        "h-6 w-6",
                                        overdueTasks > 0
                                            ? "text-red-600 dark:text-red-400 group-hover:scale-110"
                                            : "text-muted-foreground"
                                    )} />
                                </div>
                            </div>
                        </div>
                        <Progress
                            value={projectOverview?.tasks?.length ? (overdueTasks / projectOverview.tasks.length) * 100 : 0}
                            className="h-[6px] mt-4 [&>div]:bg-red-500 [&>div]:dark:bg-red-400"
                        />
                        <CardFooter className="px-0 pb-0 pt-3 text-xs text-center">
                            {overdueTasks > 0 ? (
                                <p className="text-red-600 dark:text-red-400">
                                    {overdueTasks > 5
                                        ? "🚨 Priority attention needed!"
                                        : overdueTasks > 2
                                            ? "Let's focus on these overdue items"
                                            : "Almost clean! Just a few to resolve"}
                                </p>
                            ) : (
                                <p className="text-muted-foreground">Clean slate! No overdue tasks</p>
                            )}
                        </CardFooter>
                    </Card>
                </div>
                <div className='h-full'>
                    <UpcomingDeadlines 
                        tasks={projectOverview?.tasks ?? []} 
                        projectId={projectId}
                    />
                </div>
            </div>
        </div>
    );
}