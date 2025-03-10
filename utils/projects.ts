import { IProject, ProjectWithOptions } from "@/types";
import { createClient } from "./supabase/client";
import generateProjectCode from "./code-project-generator";

const supabase = await createClient();

export const projects = {
    management: {
        close: async (projectId: string) => {
            const { error } = await supabase
                .from('projects')
                .update({
                    closed: true,
                    updated_at: new Date(),
                })
                .eq('id', projectId)
            if (error) throw error;
        },

        reOpen: async (projectId: string) => {
            const { error } = await supabase
                .from('projects')
                .update({
                    closed: false,
                    updated_at: new Date(),
                })
                .eq('id', projectId)
            if (error) throw error;
        },

        delete: async (projectId: string) => {
            const { error } = await supabase
                .from('projects')
                .delete()     
                .eq('id', projectId)
            if (error) throw error;
        },  

        create: async (projectData: ProjectWithOptions, userId: string) => {
            try {
                // console.log(projectData);
                const project_code = await generateProjectCode(projectData.category)
                const { data: project, error: projectError } = await supabase
                    .from('projects')
                    .insert({
                        name: projectData.name,
                        description: projectData.description,
                        category: projectData.category,
                        project_code,
                        created_by: userId,
                        updated_at: new Date(),
                        closed: false,
                    })
                    .select()
                    .single();

                if (projectError) throw projectError;
                console.log(project);

                let insertedPhase: any[] = [];
                if (projectData.phases) {
                    const { data ,error: phaseError } = await supabase
                        .from('phases')
                        .insert(
                            projectData.phases.map((phase, index) => ({
                                ...phase,
                                project_id: project.id,
                            }))
                        )
                        .select('*');
                    if (phaseError) throw phaseError;
                    insertedPhase = data || [];
                }

                if (projectData.priorities) {
                    const { error: priorityError} = await supabase
                        .from('priorities')
                        .insert(
                            projectData.priorities.map((priority, index) => ({
                                ...priority,
                                project_id: project.id,
                            }))
                        );
                    if (priorityError) throw priorityError;
                }

                if (projectData.statuses) {
                    const { error: priorityError } = await supabase
                        .from('statuses')
                        .insert(
                            projectData.statuses.map((status, index) => ({
                                ...status,
                                project_id: project.id,
                                updated_at: new Date(),
                            }))
                        );
                    if (priorityError) throw priorityError;
                }

                if (projectData.tasks) {
                    const phaseMap = Object.fromEntries(insertedPhase.map(p => [p.label, p.id]));
                    await supabase
                        .from('tasks')
                        .insert(
                            projectData.tasks.map((task, index) => ({
                                ...task,
                                project_id: project.id,
                                phase_id: phaseMap[task.phase_label],
                            }))
                        )
                }
                
                return project;
            } catch (error) {
                throw error
            }
        }
    },

    getUserProjects: async (userId:string) => {
        const [ownedProjects, memberProjects] = await Promise.all([
            supabase
                .from('projects')
                .select('*')
                .eq('created_by', userId)
                .order('created_at', {ascending: false}),

            supabase
                .from('project_members')
                .select(
                    `project:projects (*)`
                )
                .eq('user_id', userId)
                .eq('invitationStatus', 'accepted')
                .order('created_at', {ascending: false})
                .not('project.created_by', 'eq', userId),
        ]);

        if (ownedProjects.error) throw ownedProjects.error;
        if (memberProjects.error) throw memberProjects.error;

        const allProjects = [
            ...ownedProjects.data, 
            ...memberProjects.data.map(row => row.project)
        ];
        
        return allProjects as IProject[];
    },

}