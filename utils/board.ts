import { createClient } from "./supabase/client";

const supabase = await createClient();

export const board = {
    getProjects: async () => {
        const DONE_STATUS_ID = '921614a8-4417-4fb9-acb0-cf1536b28e1a';

        const { data: phases, error } = await supabase
            .from('phases')
            .select(`
                id,
                label,
                endDate,
                details: project_id (
                    id,
                    name,
                    description,
                    category,
                    project_code
                ),
                tasks: tasks!inner (
                    id,
                    status
                )
            `)
            .eq('status', 1);

        if (error) throw error;

        const result = phases.map((phase: any) => {
            const total_tasks = phase.tasks.length;
            const done_tasks = phase.tasks.filter((task: any) => task.status === DONE_STATUS_ID).length;

            return {
                id: phase.id,
                label: phase.label,
                endDate: phase.endDate,
                details: phase.details ? {
                    id: phase.details.id,
                    name: phase.details.name,
                    description: phase.details.description,
                    category: phase.details.category,
                    project_code: phase.details.project_code,
                    total_tasks: total_tasks,
                    done_tasks: done_tasks
                } : null
            };
        });

        console.log('Success reload board');
        return result;
    }
}
