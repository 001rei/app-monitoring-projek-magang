'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { useProjectQueries } from "@/hooks/useProjectQueries";
import { useMemo } from "react";
import { ITaskWithOptions, IPhase, IMilestone } from "@/types";
import { SkeletonTable } from "./components/skeleton-table";
import { CheckCircle, Lock } from "lucide-react";
import { usePhaseQueries } from "@/hooks/usePhaseQueries";
import { useMilestoneQueries } from "@/hooks/useMilestoneQueries";

interface Props {
    projectId: string;
}

export default function PhaseTabs({ projectId }: Props) {
    const { projectTasks, isLoading } = useProjectQueries(projectId);
    const { allPhase } = usePhaseQueries(projectId, '');
    const { allMilestone } = useMilestoneQueries(projectId, '');

    const tasksByPhaseLabel = useMemo(() => {
        const map = new Map<string, ITaskWithOptions[]>();

        if (!projectTasks) return map;

        const mainTasks = projectTasks.filter(task => !task.parent_task_id);
        const subtasks = projectTasks.filter(task => task.parent_task_id !== null);

        const subtasksGrouped = subtasks.reduce((acc, subTask) => {
            const parentId = subTask.parent_task_id;
            if (parentId) {
                if (!acc[parentId]) acc[parentId] = [];
                acc[parentId].push(subTask);
            }
            return acc;
        }, {} as Record<string, ITaskWithOptions[]>);

        mainTasks.forEach(task => {
            const phaseLabel = task.phase_label;
            if (!phaseLabel) return;

            if (!map.has(phaseLabel)) {
                map.set(phaseLabel, []);
            }
            map.get(phaseLabel)?.push({
                ...task,
                subtasks: subtasksGrouped[task.id] || []
            });
        });

        return map;
    }, [projectTasks]);

    const phasesWithData = useMemo(() => {
        if (!allPhase || !allMilestone) return [];

        return allPhase
            .sort((a, b) => a.phase_order - b.phase_order)
            .map(phase => {
                const phaseTasks = tasksByPhaseLabel.get(phase.label) || [];

                const tasksByMilestone = new Map<string, ITaskWithOptions[]>();
                phaseTasks.forEach(task => {
                    const milestoneId = task.milestone_id?.id || 'unassigned';
                    if (!tasksByMilestone.has(milestoneId)) {
                        tasksByMilestone.set(milestoneId, []);
                    }
                    tasksByMilestone.get(milestoneId)?.push(task);
                });

                const phaseMilestones = allMilestone
                    .filter(milestone => milestone.phase_label === phase.label)
                    .sort((a, b) => a.milestone_order - b.milestone_order)
                    .map(milestone => ({
                        ...milestone,
                        tasks: tasksByMilestone.get(milestone.id) || []
                    }));

                return {
                    ...phase,
                    value: phase.label.toLowerCase().replace(/\s+/g, '-'),
                    tasks: phaseTasks,
                    milestones: phaseMilestones
                };
            });
    }, [allPhase, allMilestone, tasksByPhaseLabel]);

    const defaultPhase = useMemo(() => {
        const activePhase = phasesWithData.find(phase => phase.status === 1);
        if (activePhase) return activePhase.value;

        // If none in progress, find the first incomplete phase (status !== 2)
        const firstIncompletePhase = phasesWithData.find(phase => phase.status !== 2);
        if (firstIncompletePhase) return firstIncompletePhase.value;

        return phasesWithData[0]?.value || 'perencanaan';
    }, [phasesWithData]);

    if (isLoading) {
        return <SkeletonTable />;
    }

    const parseSafeDate = (dateStr: unknown): Date | null => {
        if (!dateStr) return null;
        if (dateStr instanceof Date) return dateStr;
        try {
            const date = new Date(dateStr as string);
            return isNaN(date.getTime()) ? null : date;
        } catch {
            return null;
        }
    };

    return (
        <Tabs defaultValue={defaultPhase}>
            <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-10 md:mb-3">
                {phasesWithData.map(phase => {
                    const isPhaseEnabled = phase.status === 1 || phase.status === 2;
                    const isPhaseCompleted = phase.status === 2;
                    const isPhaseInProgress = phase.status === 1;

                    return (
                        <TabsTrigger
                            key={phase.value}
                            value={phase.value}
                            disabled={!isPhaseEnabled}
                            className="flex items-center gap-2"
                        >
                            {phase.label}
                            {isPhaseCompleted && <CheckCircle className="w-3 h-3 ml-2 text-green-400" />}
                            {isPhaseInProgress && <div className="w-2 h-2 rounded-full mr-2 bg-yellow-400"></div>}
                            {!isPhaseEnabled && <Lock className="h-4 w-4" />}
                        </TabsTrigger>
                    );
                })}
            </TabsList>

            {phasesWithData.map(phase => (
                <TabsContent key={phase.value} value={phase.value}>
                    {phase.milestones.length > 0 ? (
                        <Tabs defaultValue={phase.milestones[0].id}>
                            <TabsList className={`grid grid-cols-2 gap-2 mb-4 
                                ${phase.milestones.length === 1 ? 'md:grid-cols-1' :
                                    phase.milestones.length === 2 ? 'md:grid-cols-2' :
                                        phase.milestones.length === 3 ? 'md:grid-cols-3' :
                                            'md:grid-cols-4'}`}
                            >
                                {phase.milestones.map((milestone: IMilestone) => {
                                    const isMilestoneCompleted = milestone.status === 2;
                                    return (
                                        <TabsTrigger
                                            key={milestone.id}
                                            value={milestone.id}
                                            className="flex items-center gap-2"
                                        >
                                            {milestone.label}
                                            {isMilestoneCompleted ? (
                                                <div className="w-2 h-2 rounded-full mr-2 border-2 border-green-400 bg-transparent"></div>
                                            ) : (
                                                <div className="w-2 h-2 rounded-full mr-2 border-2 border-yellow-400 bg-transparent"></div>
                                            )}
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>

                            {phase.milestones.map((milestone: any) => (
                                <TabsContent key={milestone.id} value={milestone.id}>
                                    <DataTable
                                        columns={columns}
                                        data={milestone.tasks || []}
                                        phaseId={phase.id}
                                        phaseLabel={phase.label}
                                        phaseOrder={phase.phase_order}
                                        phaseStatus={phase.status}
                                        phaseStart={parseSafeDate(phase.startDate)}
                                        phaseEnd={parseSafeDate(phase.endDate)}
                                        phaseCompleted={parseSafeDate(phase.actualEndDate)}
                                        milestoneId={milestone.id}
                                        milestoneLabel={milestone.label}
                                        milestoneOrder={milestone.milestone_order}
                                        milestoneStatus={milestone.status}
                                        milestoneStart={parseSafeDate(milestone.startDate)}
                                        milestoneEnd={parseSafeDate(milestone.endDate)}
                                        milestoneCompleted={parseSafeDate(milestone.actualEndDate)}
                                        projectId={projectId}
                                    />
                                </TabsContent>
                            ))}
                        </Tabs>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={phase.tasks || []}
                            phaseId={phase.id}
                            phaseLabel={phase.label}
                            phaseOrder={phase.phase_order}
                            phaseStatus={phase.status}
                            phaseStart={parseSafeDate(phase.startDate)}
                            phaseEnd={parseSafeDate(phase.endDate)}
                            phaseCompleted={parseSafeDate(phase.actualEndDate)}
                            milestoneId=""
                            milestoneLabel="Unassigned"
                            milestoneOrder={0}
                            milestoneStatus={0}
                            milestoneStart={null}
                            milestoneEnd={null}
                            milestoneCompleted={null}
                            projectId={projectId}
                        />
                    )}
                </TabsContent>
            ))}
        </Tabs>
    );
}