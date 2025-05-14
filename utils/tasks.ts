import { ITask, ITaskAttachment, ITaskWithOptions } from "@/types";
import { createClient } from "./supabase/client";
import { DateUpdates } from "@/hooks/useTaskQueries";
import { error } from "console";

const supabase = createClient();

export const tasks = {
    table: {
        getProjectTasks: async (projectId: string) => {
            // console.log(projectId);
            const { data, error } = await supabase
                .from('tasks')
                .select(
                    `
                        id,
                        title,
                        phase_id ( * ),
                        parent_task_id,
                        phase_label,
                        creator:created_by (id,name,avatar),
                        priority ( id, label, color, "order"),
                        status ( id, label, color, "order"),
                        milestone (id, label, color, milestone_order),
                        startDate,
                        endDate,
                        task_assignees (
                            users ( id, name, avatar, description )
                        ),
                        task_attachments ( id, file_path, file_name, file_type )
                    `
                )
                .eq('project_id', projectId)
            // console.log('get: ',data);
            if (error) throw error;
            return data.map((task) => ({
                ...task,
                assignees: task.task_assignees?.map((a) => a.users) || [],
            })) as any[];
        },

        getCurrentPhase: async (projectId:string) => {
            const { data, error } = await supabase
                .from('phases')
                .select(`id`)
                .eq('project_id', projectId)
                .eq('status', 1)
                .single();
            if (error) throw error;
            return data; 
        },

        getProjectPhase: async (projectId: string, phaseLabel: string) => {
            const { data, error } = await supabase
                .from('phases')
                .select('*')
                .eq('project_id', projectId)
                .eq('label', phaseLabel)
            if (error) throw error;
            return data;
        },

        getAllProjectPhase: async (projectId: string) => {
            const { data, error } = await supabase
                .from('phases')
                .select('*')
                .eq('project_id', projectId)
            if (error) throw error;
            return data;
        },

        getUserTasks: async (projectId: string, userId: string) => {
            const { data, error } = await supabase
                .from('tasks')
                .select(`
                        id,
                        title,
                        phase_id ( * ),
                        parent_task_id,
                        phase_label,
                        creator:created_by (id,name,avatar),
                        priority ( id, label, color, "order"),
                        status ( id, label, color, "order"),
                        milestone (id, label, color, milestone_order),
                        startDate,
                        endDate,
                        task_assignees !inner (
                            users ( id, name, avatar, description )
                        ),
                        task_attachments ( id, file_path, file_name, file_type )
                    `)
                .eq('project_id', projectId)
                .eq('task_assignees.user_id', userId);

            if (error) throw error;
            console.log(data);
            console.log('run2');

            return data.map((task) => ({
                ...task,
                assignees: task.task_assignees?.map((a) => a.users) || [],
            })) as any[];
        },
    },

    details: {
        get: async (taskId: string) => {
            const { data, error } = await supabase
                .from('tasks')
                .select(
                    `
                    *,
                    creator:created_by ( id, name, avatar, description ),
                    status ( id, label, color, order ),
                    priority ( id, label, color, order ),
                    milestone (id, label, color, milestone_order),
                    task_assignees (
                        users ( id, name, description, avatar )
                    )
                    `
                )
                .eq('id', taskId)
                .single();

            if (error) throw error;

            return {
                ...data,
                assignees: data.task_assignees?.map((a: any) => a.users) || [],
                task_assignees: null,
            } as ITaskWithOptions;
        },

        create: async (task: Partial<ITask>) => {
            const { error } = await supabase
                .from('tasks')
                .insert(task)
            if (error) throw error;
        },

        update: async (taskId: string, updates: Partial<ITask>) => {
            if ('assignees' in updates) {
                const assigneeIds = updates.assignees || [];

                delete updates.assignees;

                await supabase.from('task_assignees').delete().eq('task_id', taskId);

                if (assigneeIds.length > 0) {
                    await supabase.from('task_assignees').insert(
                        assigneeIds.map((userId) => ({
                            task_id: taskId,
                            user_id: userId,
                            created_at: new Date(),
                            updated_at: new Date(),
                        }))
                    );
                }
            }

            // Update main task if there are any direct table updates
            if (Object.keys(updates).length > 0) {
                const { data, error } = await supabase
                    .from('tasks')
                    .update({ ...updates, updated_at: new Date() })
                    .eq('id', taskId)
                    .select('*')
                    .single();

                if (error) throw error;
                return data as ITask;
            }

            return null;
        },

        delete: async (taskId: string) => {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId)
            if (error) throw error;
        },

        updateDates: async (taskId: string, dates: DateUpdates) => {
            const { data, error } = await supabase
                .from('tasks')
                .update({
                    startDate: dates.startDate,
                    endDate: dates.endDate,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', taskId)
                .select('*')
                .single();

            if (error) throw error;
            return data as ITask;
        },

        uploadAttachment: async (data: Partial<ITaskAttachment>) => {
            const { error } = await supabase
                .from('task_attachments')
                .insert(data)
            if (error) throw error;
        },

        deleteAttachment: async (fileURL:string) => {
            const { error } = await supabase
                .from('task_attachments')
                .delete()
                .eq('file_path', fileURL)
            if (error) throw error;
        }
    },

    check: {
        isAllTasksDone: async (projectId: string, phaseLabel: string) => {
            const DONE_STATUS_ID = 8;

            try {
                const { data: tasks, error: tasksError } = await supabase
                    .from('tasks')
                    .select('id')
                    .eq("project_id", projectId)
                    .eq("phase_label", phaseLabel)
                    .limit(1);  

                if (tasksError) throw tasksError;

                if (!tasks || tasks.length === 0) return false;

                const { data: notDoneTasks, error: notDoneError } = await supabase
                    .from("tasks")
                    .select("id")
                    .eq("project_id", projectId)
                    .eq("phase_label", phaseLabel)
                    .neq("status", DONE_STATUS_ID)
                    .limit(1);  

                if (notDoneError) throw notDoneError;
                
                return !notDoneTasks || notDoneTasks.length === 0;
            } catch (error) {
                console.error("Error checking task completion status:", error);
                throw error;
            }
        }
    }

}