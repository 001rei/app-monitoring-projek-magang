import { createClient } from "@/utils/supabase/server";
import AccountDetails from "./AccountDetails";
import Projects from "./Projects";
import { redirect } from "next/navigation";
import { users } from "@/utils/users";
import { projects } from "@/utils/projects";

export default async function Page() {
    const supabase = await createClient();

    const {data : { user }} = await supabase.auth.getUser();
    if (!user) redirect('/login');
    
    const userData = await users.getUser(user.id);
    if (!userData) redirect('/login');

    const userProjects = await projects.getUserProjects(user.id);
    return (
        <div className="flex flex-col md:flex-row mx-auto p-10 gap-4">
            <div className="w-full md:w-72">
                <AccountDetails initialData={userData} />
            </div>
            <div className="flex-1">
                <Projects initialProjects={userProjects} />
            </div>
        </div>
    );
}