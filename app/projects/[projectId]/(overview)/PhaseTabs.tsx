'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { useProjectQueries } from "@/hooks/useProjectQueries";
import { useMemo } from "react";
import { ITaskWithOptions } from "@/types";
import { SkeletonTable } from "./components/skeleton-table";
import { Lock } from "lucide-react"; 

interface Props {
    projectId: string;
}

export default function PhaseTabs({ projectId }: Props) {
    const { projectTasks, isLoading } = useProjectQueries(projectId);

    // Proses data setiap kali projectTasks berubah
    const tasks = useMemo(() => {
        if (!projectTasks) return [];

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

        return mainTasks.map(task => ({
            ...task,
            subtasks: subtasksGrouped[task.id] || []
        }));
    }, [projectTasks]);

    // Daftar fase 
    const phases = [
        { value: "perencanaan", label: "Perencanaan", tasks: tasks.filter(task => task.phase_label === 'Perencanaan') },
        { value: "pendefinisian", label: "Pendefinisian", tasks: tasks.filter(task => task.phase_label === 'Pendefinisian') },
        { value: "pengembangan", label: "Pengembangan", tasks: tasks.filter(task => task.phase_label === 'Pengembangan') },
        { value: "testing-plan", label: "Testing Plan", tasks: tasks.filter(task => task.phase_label === 'Testing Plan') },
        { value: "implementasi", label: "Implementasi", tasks: tasks.filter(task => task.phase_label === 'Implementasi') },
        { value: "PIR", label: "PIR", tasks: [] }
    ];

    return (
        <Tabs defaultValue="perencanaan">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-10 md:mb-6">
                {phases.map(phase => {
                    const isPhaseEnabled = phase.tasks.some(task => task.phase_id?.status === 1 || task.phase_id?.status === 2);

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
                        <DataTable columns={columns} data={phase.tasks} />
                    </TabsContent>
                ))
            )}
        </Tabs>
    );
}