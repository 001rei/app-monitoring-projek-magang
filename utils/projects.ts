import { IOverviewWithOption, IProject, IUser, ProjectWithOptions } from "@/types";
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

                if (projectData.phases) {
                    const { data: dataPhase, error: phaseError } = await supabase
                        .from('phases')
                        .insert(
                            projectData.phases.map((phase) => ({
                                ...phase,
                                project_id: project.id,
                            }))
                        )
                        .select('*');
                    if (phaseError) throw phaseError;
                }

                if (projectData.milestones) {
                    const { data: dataMilestone, error: milestoneError } = await supabase
                        .from('milestones')
                        .insert(
                            projectData.milestones.map((milestone) => ({
                                ...milestone,
                                project_id: project.id,
                            }))
                        )
                        .select('*');
                    if (milestoneError) throw milestoneError;
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

    getOverviewData: async (projectId: string, phaseId: string) => {
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select(`
            id,
            name,
            project_code,
            phases (id, label, startDate, endDate, actualEndDate, status, phase_order),
            project_members (id)
        `)
            .eq('id', projectId)
            .single();
        if (projectError) throw projectError;

        const { data: tasks, error: taskError } = await supabase
            .from('tasks')
            .select(`
            id,
            title,
            status (id, label, color, "order"),
            priority (id, label, color, "order"),
            endDate,
            updated_at,
            assignees:task_assignees (
                users ( id, name, avatar, description )
            ),
            created_at
        `)
            .eq('project_id', projectId)
            .eq('phase_id', phaseId);
        if (taskError) throw taskError;

        const sortedPhases = project.phases
            .sort((a, b) => a.phase_order - b.phase_order)
            .map(phase => ({
                id: phase.id,
                label: phase.label,
                status: phase.status,
                startDate: phase.startDate,
                endDate: phase.endDate,
                actualEndDate: phase.actualEndDate
            }));

        const currentPhase = sortedPhases.find(phase => phase.status === 1);

        const transformedTasks = tasks.map(task => ({
            ...task,
            assignees: task.assignees?.map(assignment => assignment.users)?.flat() || []
        }));

        return {
            id: project.id,
            name: project.name,
            project_code: project.project_code,
            membersCount: project.project_members.length + 1,
            currentPhase: currentPhase ? {
                label: currentPhase.label,
                id: currentPhase.id,
                startDate: currentPhase.startDate,
                endDate: currentPhase.endDate,
                actualEndDate: currentPhase.actualEndDate
            } : null,
            phases: sortedPhases,
            tasks: transformedTasks
        } as IOverviewWithOption;
    }

}