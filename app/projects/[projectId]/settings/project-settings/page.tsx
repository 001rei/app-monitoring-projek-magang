import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ProjectSettingsForm } from './ProjectSettingsForm';

interface Props {
    params: Promise<{ projectId: string }>;
}

export default async function Page({ params }: Props) {
    const { projectId } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

    if (error || !project) redirect('/projects');

    return (
        <div className="flex-1 p-10">
            <ProjectSettingsForm project={project} />
        </div>
    );
}