'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { useProjectQueries } from "@/hooks/useProjectQueries";
import { useMemo } from "react";
import { ITaskWithOptions } from "@/types";
import { SkeletonTable } from "./components/skeleton-table";

interface Props {
    projectId: string;
}

export default function PhaseTabs({ projectId }: Props) {
    const { projectTasks, isLoading } = useProjectQueries(projectId);

    // Proses data setiap kali projectTasks berubah
    const tasks = useMemo(() => {
        if (!projectTasks) return [];

        // Pisahkan task utama dan subtask
        const mainTasks = projectTasks.filter(task => !task.parent_task_id);
        const subtasks = projectTasks.filter(task => task.parent_task_id !== null);

        // Kelompokkan subtask berdasarkan parent_task_id
        const subtasksGrouped = subtasks.reduce((acc, subTask) => {
            const parentId = subTask.parent_task_id;
            if (parentId) {
                if (!acc[parentId]) acc[parentId] = [];
                acc[parentId].push(subTask);
            }
            return acc;
        }, {} as Record<string, ITaskWithOptions[]>);

        // Gabungkan subtask ke task utama
        return mainTasks.map(task => ({
            ...task,
            subtasks: subtasksGrouped[task.id] || []
        }));
    }, [projectTasks]);

    // Filter berdasarkan fase proyek
    const tasksPerencanaan = tasks.filter(task => task.phase_label === 'Perencanaan');
    const tasksPendefinisian = tasks.filter(task => task.phase_label === 'Pendefinisian');
    const tasksPengembangan = tasks.filter(task => task.phase_label === 'Pengembangan');
    const tasksTestingPlan = tasks.filter(task => task.phase_label === 'Testing Plan');
    const tasksImplementasi = tasks.filter(task => task.phase_label === 'Implementasi');

    return (
        <Tabs defaultValue="perencanaan">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-10 md:mb-6">
                <TabsTrigger value="perencanaan">Perencanaan</TabsTrigger>
                <TabsTrigger value="pendefinisian">Pendefinisian</TabsTrigger>
                <TabsTrigger value="pengembangan">Pengembangan</TabsTrigger>
                <TabsTrigger value="testing-plan">Testing Plan</TabsTrigger>
                <TabsTrigger value="implementasi">Implementasi</TabsTrigger>
                <TabsTrigger value="PIR">PIR</TabsTrigger>
            </TabsList>

            {isLoading ? (
                <>
                    <TabsContent value="perencanaan"><SkeletonTable /></TabsContent>
                    <TabsContent value="pendefinisian"><SkeletonTable /></TabsContent>
                    <TabsContent value="pengembangan"><SkeletonTable /></TabsContent>
                    <TabsContent value="testing-plan"><SkeletonTable /></TabsContent>
                    <TabsContent value="implementasi"><SkeletonTable /></TabsContent>
                    <TabsContent value="PIR"><SkeletonTable /></TabsContent>
                </>
            ) : (
                <>
                    <TabsContent value="perencanaan">
                        <DataTable columns={columns} data={tasksPerencanaan} />
                    </TabsContent>
                    <TabsContent value="pendefinisian">
                        <DataTable columns={columns} data={tasksPendefinisian} />
                    </TabsContent>
                    <TabsContent value="pengembangan">
                        <DataTable columns={columns} data={tasksPengembangan} />
                    </TabsContent>
                    <TabsContent value="testing-plan">
                        <DataTable columns={columns} data={tasksTestingPlan} />
                    </TabsContent>
                    <TabsContent value="implementasi">
                        <DataTable columns={columns} data={tasksImplementasi} />
                    </TabsContent>
                    <TabsContent value="PIR">
                        {/* <DataTable columns={columns} data={tasksImplementasi} /> */}
                    </TabsContent>
                </>
            )}
        </Tabs>
    );
}
