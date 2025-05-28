'use client';

import { useAssignedTasksQueries } from "@/hooks/useAssignedTasksQueries";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { AssignedTasksSkeleton } from "./components/page-skeleton";

interface Props {
    userId: string;
    projectId: string
}

export default function AssignedTasksTable({ projectId, userId }: Props) {
    const { assignedTasks, isLoading } = useAssignedTasksQueries(projectId, userId);
    const isNoAssignedTasks = assignedTasks?.length != 0 ? true : false;

    if (isLoading) {
        return <AssignedTasksSkeleton />;
      }
    
    return (
        <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
                    <p className="text-muted-foreground">
                        { isNoAssignedTasks ?
                            "Here\'s a list of your tasks that need to be done!" :
                            "No tasks here! Time to relax"
                        }
                    </p>
                </div>
            </div>
            <DataTable data={assignedTasks ?? []} columns={columns} />
        </div>
    );
}