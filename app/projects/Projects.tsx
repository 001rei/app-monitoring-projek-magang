'use client';

import { IProjects } from "@/types";
import ProjectTabs from "./components/ProjectTabs";
import { CloseProjectDialog } from "./components/CloseProjectDialog";
import { DeleteProjectDialog } from "./components/DeleteProjectDialog";
import { ReopenProjectDialog } from "./components/ReopenProjectDialog";
import { useMemo, useState } from "react";
import { projects } from "@/utils/projects";
import { toast } from "@/hooks/use-toast";

interface ProjectsProps {
    initialProjects: IProjects[];
}

export default function Projects({ initialProjects }: ProjectsProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [availableProjects, setAvailableProjects] = useState(initialProjects);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [projectToClose, setProjectToClose] = useState<string | null>(null);
    const [projectToReOpen, setProjectToReOpen] = useState<string | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<IProjects | null>(null);

    const filteredProjects = useMemo(() => {
        return availableProjects
            .filter((project) => {
                const toLowerQuery = searchQuery.toLowerCase().trim();
                return (
                    project.name.toLowerCase().includes(toLowerQuery) ||
                    project.description.toLowerCase().includes(toLowerQuery)
                );
            })
            .sort((a, b) => {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
            })
    }, [searchQuery, availableProjects, sortOrder])

    const activeProjects = filteredProjects.filter(project => !project.closed);
    const closedProjects = filteredProjects.filter(project => project.closed);

    const handleSort = (order: 'newest' | 'oldest') => {
        setSortOrder(order);
    }

    const handleCloseProject = async () => {
        if (!projectToClose) return;
        try {
            await projects.management.close(projectToClose);
            setAvailableProjects(prev => prev.map(project => project.id === projectToClose ? {...project, closed: true} : project))
            toast({
                title: 'Success',
                description: 'Project closed successfully!',
            })
        } catch (error) {
            console.error(error); 
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to close project. Please try again.',
            })
        } finally {
            setProjectToClose(null);
        }
    }

    const handleReOpenProject = async () => {
        if (!projectToReOpen) return;
        try {
            await projects.management.reOpen(projectToReOpen);
            setAvailableProjects(prev => prev.map(project => project.id === projectToReOpen ? { ...project, closed: false } : project))
            toast({
                title: 'Success',
                description: 'Project re-open successfully!',
            })
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to re-open project. Please try again.',
            })
        } finally {
            setProjectToReOpen(null);
        }
    }

    const handleDeleteProject = async () => {
        if (!projectToDelete) return;
        try {
            await projects.management.delete(projectToDelete.id);
            setAvailableProjects(prev => prev.filter(project => project.id !== projectToDelete.id));
            toast({
                title: 'Success',
                description: 'Project deleted successfully.',
            })
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete project. Please try again.'
            })
        } finally {
            setProjectToDelete(null);
        }
    }

    return (
        <div>
            <ProjectTabs
                activeProjects={activeProjects}
                closedProjects={closedProjects}
                allProjects={filteredProjects}
                searchTerm={searchQuery}
                setSearchTerm={setSearchQuery}
                sortOrder={sortOrder}
                onSort={handleSort}
                setProjectToClose={setProjectToClose}
                setProjectToReopen={setProjectToReOpen}
                setProjectToDelete={setProjectToDelete}
            />

            <CloseProjectDialog
                open={!!projectToClose}
                onOpenChange={() => setProjectToClose(null)}
                onConfirm={handleCloseProject}
            />


            <DeleteProjectDialog
                open={!!projectToDelete}
                onOpenChange={() => setProjectToDelete(null)}
                onConfirm={handleDeleteProject}
                projectName={projectToDelete?.name || ''}
            />


            <ReopenProjectDialog
                open={!!projectToReOpen}
                onOpenChange={() => setProjectToReOpen(null)}
                onConfirm={handleReOpenProject}
            />
        </div>
    );
}