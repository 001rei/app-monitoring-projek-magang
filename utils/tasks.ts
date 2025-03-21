import { ITask, ITaskWithOptions } from "@/types";
import { createClient } from "./supabase/client";
import { DateUpdates } from "@/hooks/useTaskQueries";

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
                    startDate,
                    endDate,
                    task_assignees (
                        users ( id, name, avatar, description )
                    )
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
                labels: data.task_labels?.map((tl: any) => tl.labels) || [],
                assignees: data.task_assignees?.map((a: any) => a.users) || [],
                task_labels: null,
                task_assignees: null,
            } as ITaskWithOptions;
        },

        create: async (task: Partial<ITask>) => {
            // console.log(task);
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

        delete: async (taskId:string) => {
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
    },
}