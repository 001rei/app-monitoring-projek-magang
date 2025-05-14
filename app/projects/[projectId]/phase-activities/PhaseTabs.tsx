'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { useProjectQueries } from "@/hooks/useProjectQueries";
import { useMemo } from "react";
import { ITaskWithOptions, IPhase } from "@/types";
import { SkeletonTable } from "./components/skeleton-table";
import { Lock } from "lucide-react";
import { usePhaseQueries } from "@/hooks/usePhaseQueries";

interface Props {
    projectId: string;
}

export default function PhaseTabs({ projectId }: Props) {
    const { projectTasks, isLoading } = useProjectQueries(projectId);
    const { allPhase } = usePhaseQueries(projectId, '');

    const tasksByPhase = useMemo(() => {
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
            const phaseName = task.phase_label;
            if (phaseName) {
                if (!map.has(phaseName)) {
                    map.set(phaseName, []);
                }
                map.get(phaseName)?.push({
                    ...task,
                    subtasks: subtasksGrouped[task.id] || []
                });
            }
        });

        return map;
    }, [projectTasks]);

    const phases = useMemo(() => {
        if (!allPhase) return [];

        return [...allPhase]
            .sort((a, b) => a.phase_order - b.phase_order)
            .map((phase: IPhase) => ({
                id: phase.id,
                value: phase.label.toLowerCase().replace(/\s+/g, '-'),
                label: phase.label,
                tasks: tasksByPhase.get(phase.label) || [],
                status: phase.status,
                order: phase.phase_order
            }));
    }, [allPhase, tasksByPhase]);

    const defaultPhase = useMemo(() => {
        const activePhase = phases.find(phase => phase.status === 1);
        return activePhase?.value || 'perencanaan'; 
    }, [phases]);

    return (
        <Tabs defaultValue={defaultPhase}>
            <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-10 md:mb-6">
                {phases.map(phase => {
                    const isPhaseEnabled = phase.status === 1 || phase.status === 2;
                    return (
                        <TabsTrigger
                            key={phase.value}
                            value={phase.value}
                            disabled={!isPhaseEnabled}
                            className="flex items-center gap-2"
                        >
                            {phase.label}
                            {!isPhaseEnabled && <Lock className="h-4 w-4" />}
                        </TabsTrigger>
                    );
                })}
            </TabsList>

            {isLoading ? (
                phases.map(phase => (
                    <TabsContent key={phase.value} value={phase.value}>
                        <SkeletonTable />
                    </TabsContent>
                ))
            ) : (
                phases.map(phase => (
                    <TabsContent key={phase.value} value={phase.value}>
                        <DataTable
                            columns={columns}
                            data={phase.tasks}
                            phaseId={phase.id}
                            phaseLabel={phase.label}
                            phaseOrder={phase.order as number}
                            phaseStatus={phase.status as number}
                            projectId={projectId}
                        />
                    </TabsContent>
                ))
            )}
        </Tabs>
    );
}