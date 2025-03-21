import { Role } from '@/types';
import { createClient } from '@/utils/supabase/server';
import { error } from 'console';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ projectId: string }>;
    searchParams: Promise<{ role: Role }>;
}

export default async function InvitePage({ params, searchParams }: Props) {
    const supabase = await createClient();
    const { projectId } = await params;
    const { role } = await searchParams;

    const {data : { user }} = await supabase.auth.getUser();

    if (!user) {
        redirect(`/login?next=/invites/${projectId}?role=${role}`);
    }

    const { data: projectMember, error: memberCheckError } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .eq('invitationStatus', 'invited')
        .single();

    if (memberCheckError || !projectMember) {
        console.log('cok iki biang e');
        notFound();
    }
    console.log('gak sampai');
    const { error: updateError } = await supabase
        .from('project_members')
        .update({
            invitationStatus: 'accepted',
            joined_at: new Date().toISOString(),
        })
        .eq('project_id', projectId)
        .eq('user_id', user.id);

    if (updateError) {
        throw updateError;
    }
    console.log('sampai sini');
    redirect(`/projects/${projectId}`);
}