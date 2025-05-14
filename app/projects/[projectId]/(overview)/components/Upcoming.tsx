'use client';

import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarClock, AlertTriangle, Clock, User2, UsersRoundIcon, Users } from "lucide-react";
import { IPriority, IStatus, IUser } from "@/types";
import { CustomFieldTagRenderer } from "@/components/CustomFieldTagRenderer";
import StackedAvatars from "@/components/StackedAvatars";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import debounce from 'lodash.debounce';

interface Props {
    tasks: {
        id: string;
        title: string;
        status: Partial<IStatus>;
        priority: Partial<IPriority>;
        endDate: Date;
        created_at: Date;
        assignees?: Partial<IUser>[];
    }[];
    projectId: string;
}

export function UpcomingDeadlines({ tasks, projectId }: Props) {
    const supabase = createClient();

    const currentDate = useMemo(() => new Date(), []);
    const upcomingTasks = useMemo(() => {
        const filteredTasks = tasks.filter((task) => {
            const endDate = new Date(task.endDate);
            const timeDiff = endDate.getTime() - currentDate.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

            return daysDiff >= 0 && daysDiff <= 7;
        });

        return filteredTasks.sort((a, b) => {
            const aEndDate = new Date(a.endDate);
            const bEndDate = new Date(b.endDate);
            const aDiff = aEndDate.getTime() - currentDate.getTime();
            const bDiff = bEndDate.getTime() - currentDate.getTime();

            return aDiff - bDiff;
        });
    }, [tasks, currentDate]);

    const updateToOverdue = async (taskIds: string[]) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .update({
                    status: 7,
                    updated_at: new Date()
                })
                .in('id', taskIds);

            if (error) throw error;
            console.log(`Updated ${taskIds.length} tasks to overdue`);
        } catch (error) {
            console.error('Error updating tasks status:', error);
        }
    };

    const debouncedUpdate = debounce(updateToOverdue, 1000);

    useEffect(() => {
        const overdueTaskIds = tasks
            .filter(task => {
                if (!task.endDate || task.status?.label === 'Done' || task.status?.label === 'Overdue') {
                    return false;
                }

                const endDate = new Date(task.endDate);
                const now = new Date();

                return endDate < now;
            })
            .map(task => task.id);

        if (overdueTaskIds.length > 0) {
            debouncedUpdate(overdueTaskIds);
        }

        return () => debouncedUpdate.cancel();
    }, [tasks, currentDate]);

    const maxItems = 3;
    const itemHeight = 96;
    const scrollAreaHeight = maxItems * itemHeight;

    return (
        <Card >
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Upcoming Deadlines</CardTitle>
                    <Badge variant="outline" className="px-2 py-1 text-xs">
                        {upcomingTasks.length} tasks
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="px-2">
                {upcomingTasks.length > 0 ? (
                    <ScrollArea className="h-full" style={{ height: `${scrollAreaHeight}px` }}>
                        <div className="space-y-4 pr-3">
                            {upcomingTasks.map((task) => {
                                const endDate = new Date(task.endDate);
                                const timeDiff = endDate.getTime() - currentDate.getTime();
                                const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

                                const formattedDate = endDate.toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                });

                                const priority = task.priority
                                return (
                                    <div
                                        key={task.id}
                                        className="flex items-start gap-4 rounded-lg p-2 transition-all hover:bg-muted/50"
                                    >
                                        <div className="mt-1">
                                            {daysLeft <= 3 ? (
                                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                            ) : (
                                                <CalendarClock className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="grid flex-1 gap-1">
                                            <div className="flex items-center justify-between">
                                                <Link
                                                    href={`${location?.origin}/projects/${projectId}/${task.id}`}
                                                    className="hover:underline"
                                                >
                                                    <p className="text-sm font-medium leading-none">
                                                        {task.title}
                                                    </p>
                                                </Link>

                                                {priority && (
                                                    <CustomFieldTagRenderer
                                                        label={priority.label as string}
                                                        color={priority.color as string}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span className="text-orange-400 flex items-center gap-1">
                                                    <Clock size={12} />
                                                    Deadline: {formattedDate}
                                                </span>
                                                {daysLeft === 1 ? (
                                                    <span>{daysLeft} day left</span>
                                                ) : daysLeft === 0 ? (
                                                    <span>Due today</span>
                                                ) : daysLeft < 0 ? (
                                                    <span className="text-destructive">Overdue</span>
                                                ) : (
                                                    <span>{daysLeft} days left</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Users size={12} />
                                                    { task.assignees?.length as number > 0 ? (
                                                        <>
                                                            Assignees: <StackedAvatars users={task?.assignees ?? []} />
                                                        </>
                                                    ) : (
                                                        'Unassigned'
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="flex h-[286px] flex-col items-center justify-center rounded-lg p-4 text-center">
                        <CalendarClock className="h-6 w-6 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                            No upcoming deadlines
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Tasks due in the next 7 days will appear here
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}