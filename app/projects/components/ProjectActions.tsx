'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { IProjects } from '@/types';
import { deleteButton } from '@/consts/buttonStyles';

interface ProjectActionsProps {
    project: IProjects;
    tab: 'active' | 'all' | 'closed';
    setProjectToClose?: (id: string) => void;
    setProjectToReopen?: (id: string) => void;
    setProjectToDelete?: (project: IProjects) => void;
}

export const ProjectActions = ({
    project,
    tab,
    setProjectToClose,
    setProjectToReopen,
    setProjectToDelete,
}: ProjectActionsProps) => (
    <div className="relative">
        <DropdownMenu>
            <DropdownMenuTrigger className="font-bold">. . .</DropdownMenuTrigger>
            <DropdownMenuContent
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                {tab === 'closed' || (tab === 'all' && project.closed) ? (
                    <>
                        <DropdownMenuItem onClick={() => setProjectToReopen?.(project.id)}>
                            ReOpen
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={cn(deleteButton)}
                            onClick={() => setProjectToDelete?.(project)}
                        >
                            Delete Permanently
                        </DropdownMenuItem>
                    </>
                ) : (
                    <>
                        <DropdownMenuItem asChild>
                            <Link href={`/projects/${project.id}/settings`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={cn(deleteButton)}
                            onClick={() => setProjectToClose?.(project.id)}
                        >
                            Close
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
);