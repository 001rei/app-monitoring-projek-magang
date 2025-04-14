import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { users } from "@/utils/users";
import AssignedTasksTable from './AssignedTasksTable';

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function Page({ params }: Props) {
  const { projectId } = await params;

  const supabase = await createClient();
      const { data: { user }, error} = await supabase.auth.getUser();

      if (error) throw error;
      if (!user) redirect('/login');
      
      const userData = await users.getUser(user.id)
      
      if (!userData) redirect('/login');

  return (
    <>
      <div className="flex-1">
        <AssignedTasksTable projectId={projectId} userId={userData.id} />
      </div>
    </>
  )
}
