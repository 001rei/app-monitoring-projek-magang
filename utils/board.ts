import { createClient } from "./supabase/client";

const supabase = await createClient();

export const board = {
    getProjects: async (userId: string) => {
        const DONE_STATUS_ID = 8;

        const { data: ownedProjects } = await supabase
            .from('projects')
            .select('id')
            .eq('created_by', userId);

        const { data: memberProjects } = await supabase
            .from('project_members')
            .select('project_id')
            .eq('user_id', userId);

        const ownedProjectIds = ownedProjects?.map(p => p.id) || [];
        const memberProjectIds = memberProjects?.map(p => p.project_id) || [];

        const accessibleProjectIds = [...new Set([...ownedProjectIds, ...memberProjectIds])];
        if (accessibleProjectIds.length === 0) return [];

        const { data: projects, error } = await supabase
            .from('projects')
            .select(`
                id,
                name,
                description,
                category,
                project_code,
                created_by,
                phases:phases!inner(
                    id,
                    label,
                    endDate,
                    status,
                    tasks:tasks!inner(
                        id,
                        status
                    )
                )
            `)
            .in('id', accessibleProjectIds)
            .eq('phases.status', 1);

        if (error) throw error;
        if (!projects) return [];

        const result = projects.flatMap(project => {
            return project.phases.map(phase => {
                const total_tasks = phase.tasks.length;
                const done_tasks = phase.tasks.filter(task => task.status === DONE_STATUS_ID).length;

                return {
                    id: phase.id,
                    label: phase.label,
                    endDate: phase.endDate,
                    details: {
                        id: project.id,
                        name: project.name,
                        description: project.description,
                        category: project.category,
                        project_code: project.project_code,
                        created_by: project.created_by,
                        total_tasks,
                        done_tasks
                    }
                };
            });
        });

        return result;
    }
}