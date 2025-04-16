import { IProject, IUser, ProjectWithOptions } from "@/types";
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

                let insertedPhase: any[] = [];
                if (projectData.phases) {
                    const { data, error: phaseError } = await supabase
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

                if (projectData.tasks) {
                    const phaseMap = Object.fromEntries(insertedPhase.map(p => [p.label, p.id]));
                    await supabase
                        .from('tasks')
                        .insert(
                            projectData.tasks.map((task, index) => ({
                                ...task,
                                project_id: project.id,
                                phase_id: phaseMap[task.phase_label],
                                status: task.status,
                                priority: task.priority,
                                created_by: project.created_by
                            }))
                        )
                }

                return project;
            } catch (error) {
                throw error
            }
        },

        update: async (projectId: string, updates: Partial<IProject>) => {
            const { error } = await supabase
                .from('projects')
                .update({
                    ...updates,
                    updated_at: new Date(),
                })
                .eq('id', projectId);

            if (error) throw error;
        },
    },

    fields: {
        getStatuses: async () => {
            const { data, error } = await supabase
                .from('statuses')
                .select(`*`)
            if (error) throw error;
            return data;
        },

        getPriorities: async () => {
            const { data, error } = await supabase
                .from('priorities')
                .select(`*`)
            if (error) throw error;
            return data;
        },
        
        getMilestones: async () => {
            const { data, error } = await supabase
                .from('milestones')
                .select('*')
            if (error) throw error;
            return data;
        }
    },

    // Project members
    members: {
        getAll: async (projectId: string) => {
            const { data, error } = await supabase
                .from('project_members')
                .select(
                    `
                    user:users (
                        id,
                        name,
                        avatar,
                        description
                    )
                    `
                )
                .eq('project_id', projectId);

            if (error) throw error;
            return (data as any[]).map((m) => m.user) as IUser[];
        },
        getProjectOwner: async (projectId: string) => {
            const { data, error } = await supabase
                .from('projects')
                .select(
                    `
                    creator:created_by (
                        id,
                        name,
                        email,
                        avatar,
                        description,
                        created_at,
                        updated_at
                    )
                    `
                )
                .eq('id', projectId)
                .single();

            if (error) throw error;
            if (!data?.creator) return null;

            const creator = data.creator as Record<string, any>;

            return {
                id: creator.id,
                name: creator.name,
                email: creator.email,
                avatar: creator.avatar,
                description: creator.description,
                created_at: creator.created_at,
                updated_at: creator.updated_at,
            } as IUser;
        },
    },

    getUserProjects: async (userId: string) => {
        const [ownedProjects, memberProjects] = await Promise.all([
            supabase
                .from('projects')
                .select('*')
                .eq('created_by', userId)
                .order('created_at', { ascending: false }),

            supabase
                .from('project_members')
                .select(
                    `project:projects (*)`
                )
                .eq('user_id', userId)
                .eq('invitationStatus', 'accepted')
                .order('created_at', { ascending: false })
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