'use client';

import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { IProjects } from '@/types';
import { ProjectActions } from './ProjectActions';

interface ProjectItemProps {
    project: IProjects;
    tab: 'active' | 'all' | 'closed';
    setProjectToClose?: (id: string) => void;
    setProjectToReopen?: (id: string) => void;
    setProjectToDelete?: (project: IProjects) => void;
}

export const ProjectItem = ({
    project,
    tab,
    setProjectToClose,
    setProjectToReopen,
    setProjectToDelete,
}: ProjectItemProps) => {
    return (
        <div className="p-6 border-b flex justify-between items-center">
            <div className='w-[calc(100%-50px)]'>
                <div className="flex items-center gap-2 w-76">
                    {project.closed ? (
                        <h1 className="text-lg font-semibold text-gray-500">
                            {project.name}
                        </h1>
                    ) : (
                        <Link href={`/projects/${project.id}`}>
                            <h1 className="text-lg font-semibold">{project.name}</h1>
                        </Link>
                    )}
                    {tab === 'all' && (
                        <Badge
                            className={`text-xs text-white border transition-colors duration-200 
                                    ${project.closed
                                    ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
                                    : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
                                }`}
                        >
                            {project.closed ? 'Closed' : 'Active'}
                        </Badge>
                    )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {project.description}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                    {new Date(project.created_at).toDateString()}
                </p>
            </div>
            <ProjectActions
                project={project}
                tab={tab}
                setProjectToClose={setProjectToClose}
                setProjectToReopen={setProjectToReopen}
                setProjectToDelete={setProjectToDelete}
            />
        </div>
    );
};