import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { users } from "@/utils/users"
import { DynamicBreadcrumb } from "./components/DynamicBreadcrumb";

interface Props {
    params: { projectId: string };
    children: React.ReactNode;
}



export default async function Layout({ params, children }: Props) {
    const { projectId } = await params;
    const supabase = await createClient();

    // Fetch data proyek
    const { data: project, error } = await supabase
        .from('projects')
        .select(`name, project_code`)
        .eq('id', projectId)
        .single();
    if (error || !project) redirect('/projects');

    // Fetch data user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');
    const userData = await users.getUser(user.id);
    if (!userData) redirect('/login');

    return (
        <SidebarProvider>
            <AppSidebar
                projectId={projectId}
                projectName={project.name}
                projectCode={project.project_code}
                user={userData}
            />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <DynamicBreadcrumb projectId={projectId} projectName={project.name} />
                    </div>
                    <div className="ml-auto pr-5">
                        <ThemeToggle />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/75 dark:bg-muted/50 md:min-h-min">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
