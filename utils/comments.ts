import { CommentResponse } from '@/types';
import { createClient } from './supabase/client';

const supabase = createClient();

export const comments = {
    // Get all comments 
    getTaskComments: async (taskId: string) => {
        // Ambil semua komentar (termasuk replies) sekaligus
        const { data, error } = await supabase
            .from('comments')
            .select(`
                    id,
                    content,
                    created_at,
                    updated_at,
                    task_id,
                    parent_id,
                    user:user_id (id, name, avatar, description)
                    `)
            .eq('task_id', taskId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Kelompokkan parent dan replies secara manual
        const parents = data.filter(comment => comment.parent_id === null);
        const replies = data.filter(comment => comment.parent_id !== null);

        // Gabungkan replies ke parent
        const commentsWithReplies = parents.map(parent => ({
            ...parent,
            replies: replies.filter(reply => reply.parent_id === parent.id)
        }));

        return commentsWithReplies as CommentResponse[];
    },

    // Create new comment
    create: async (comment: {
        task_id: string;
        user_id: string;
        content: string;
    }) => {
        const { data, error } = await supabase
            .from('comments')
            .insert({
                ...comment,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .select(
                `
                    id,
                    content,
                    created_at,
                    updated_at,
                    task_id,
                    parent_id,
                    user:user_id (
                        id,
                        name,
                        avatar,
                        description
                    )
                `
            )
            .single();

        if (error) throw error;
        return data as CommentResponse;
    },

    // Delete comment
    delete: async (commentId: string) => {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);

        if (error) throw error;
    },

    // Update comment
    update: async (commentId: string, updates: { content: string }) => {
        const { data, error } = await supabase
            .from('comments')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', commentId)
            .select(
                `
                    id,
                    content,
                    created_at,
                    updated_at,
                    task_id,
                    user:user_id (
                    id,
                    name,
                    avatar,
                    description
                    )
                `
            )
            .single();

        if (error) throw error;
        return data as CommentResponse;
    },
};