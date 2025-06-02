'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { projects } from '@/utils/projects';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IProject } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { CloseProjectDialog } from '@/app/projects/components/CloseProjectDialog';
import { DeleteProjectDialog } from '@/app/projects/components/DeleteProjectDialog';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useBoardQueries } from '@/hooks/useBoardQueries';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, Loader2, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useProjectAccess } from '@/hooks/useProjectAccess';
import { ProjectAction } from '@/consts/actions';

export function ProjectSettingsForm({ project }: { project: IProject }) {
    const [isSaving, setIsSaving] = useState(false);
    const [showCloseDialog, setShowCloseDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [formData, setFormData] = useState({
        name: project.name,
        description: project.description,
    });
    const { toast } = useToast();
    const { user } = useCurrentUser();
    const { reloadBoard } = useBoardQueries(user?.id as string);
    const router = useRouter();

    const { can, role, isLoading } = useProjectAccess({
        projectId: project.id,
    });

    if (isLoading) return <div>Loading...</div>;
    if (!can(ProjectAction.VIEW_SETTINGS)) {
        return (
            <div>You don&apos;t have permission to manage project settings.</div>
        );
    }

    const hasChanges =
        formData.name !== project.name ||
        formData.description !== project.description;

    const handleUpdateProject = async () => {
        try {
            setIsSaving(true);
            await projects.management.update(project.id, formData);
            await reloadBoard();
            toast({
                title: 'Settings updated',
                description: 'Your project settings have been saved successfully',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Update failed',
                description: 'There was an error saving your changes',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 w-full">
            <Card className="border-grey-100 dark:border-grey-900/50 bg-grey-50/50 dark:bg-grey-900/10">
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Project Information</CardTitle>
                    <CardDescription className="text-sm">
                        Update your project details and description
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="project-name">Project Name</Label>
                        <Input
                            id="project-name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full max-w-md"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="project-description">Description</Label>
                        <Textarea
                            id="project-description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={4}
                            className="w-full max-w-xl"
                            placeholder="Describe your project's purpose and goals..."
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button
                        onClick={handleUpdateProject}
                        disabled={isSaving || !hasChanges}
                        className="ml-auto"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : 'Save Changes'}
                    </Button>
                </CardFooter>
            </Card>

            <Card className="border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
                <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                        <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <CardTitle className="text-red-600 dark:text-red-400">
                            Danger Zone
                        </CardTitle>
                    </div>
                    <CardDescription className="text-red-500 dark:text-red-400">
                        Irreversible actions - proceed with caution
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {can(ProjectAction.CLOSE_PROJECT) && (
                        <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-lg bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <h4 className="font-medium">Close Project</h4>
                                    <Badge variant="secondary" className="text-xs">
                                        Reversible
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Disable workflows and archive this project. You can reopen it later.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50/50 dark:hover:bg-red-900/10 self-end sm:self-center"
                                onClick={() => setShowCloseDialog(true)}
                            >
                                Close Project
                            </Button>
                        </div>
                    )}
                    
                    {can(ProjectAction.DELETE_PROJECT) && (
                        <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-lg bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <h4 className="font-medium">Delete Project</h4>
                                    <Badge variant="destructive" className="text-xs">
                                        Permanent
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Permanently remove this project and all its data. This cannot be undone.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50/50 dark:hover:bg-red-900/10 self-end sm:self-center"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                Delete Project
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <CloseProjectDialog
                open={showCloseDialog}
                onOpenChange={setShowCloseDialog}
                onConfirm={async () => {
                    try {
                        await projects.management.close(project.id);
                        toast({
                            title: 'Project closed',
                            description: 'The project has been successfully archived',
                        });
                        router.push('/projects');
                    } catch (error) {
                        toast({
                            variant: 'destructive',
                            title: 'Error',
                            description: 'Failed to close project',
                        });
                    }
                }}
            />

            <DeleteProjectDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={async () => {
                    try {
                        await projects.management.delete(project.id);
                        router.push('/projects');
                    } catch (error) {
                        toast({
                            variant: 'destructive',
                            title: 'Error',
                            description: 'Failed to delete project',
                        });
                    }
                }}
                projectName={project.name}
            />
        </div>
    );
}

