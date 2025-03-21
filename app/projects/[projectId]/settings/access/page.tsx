import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AccessContainer } from "./AccessContainer";

interface AccessPageProps {
    params: Promise<{projectId: string}>;
}

export default async function Page({ params }: AccessPageProps) {
    const { projectId } = await params;
    const supabase = await createClient();

    const { data : { user }} = await supabase.auth.getUser();
    if (!user) redirect('/login')

    const [{ data: project }, { data: members }] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase
            .from('project_members')
            .select(`*, user:users (id, name, email, avatar)`)
            .eq('project_id', projectId),
    ]);

    if (!project) redirect('/projects');   

    const isCreator = project.created_by === user.id;
    const currentMember = members?.find((member) => member.user_id === user.id);
    const currentUserRole = isCreator ? 'owner' : currentMember?.role || 'read';

    return (
        <div className="flex-1 p-10">
            <AccessContainer 
                projectId={projectId}
                projectName={project.name}
                initialMembers={members || []}
                currentUserId={user.id}
                currentUserRole={currentUserRole}
                createdBy={project.created_by}
            />
        </div>
    );
}