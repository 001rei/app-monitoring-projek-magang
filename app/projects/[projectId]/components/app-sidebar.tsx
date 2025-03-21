"use client"

import * as React from "react"
import {
    Command,
    Settings2,
    ListTodo,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { IUser } from "@/types"

interface CustomSidebarProps extends React.ComponentProps<typeof Sidebar> {
    projectId: string; 
    projectName: string;
    projectCode: string;
    user: IUser;
}

export function AppSidebar({ projectId, projectName, projectCode, user, ...props }: CustomSidebarProps) {
    const [userData, setUserData] = React.useState<IUser>(user);

    const navMain = React.useMemo(() => [
        {
            title: "Phase Activities",
            url: `/projects/${projectId}`,
            icon: ListTodo,
            isActive: true,
        },
        {
            title: "Settings",
            url: `/projects/${projectId}/settings/project-settings`,
            icon: Settings2,
            items: [
                {
                    title: "Project setting",
                    url: `/projects/${projectId}/settings/project-settings`,
                },
                {
                    title: "Manage access",
                    url: `/projects/${projectId}/settings/access`,
                },
            ],
        },
    ], [projectId]);

    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{projectName}</span>
                                    <span className="truncate text-xs">{projectCode}</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser userData={userData} />
            </SidebarFooter>
        </Sidebar>
    )
}
