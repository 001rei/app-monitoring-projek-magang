'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { defaultPhases, defaultTasks } from '../../consts/default-options';
import { createClient } from '@/utils/supabase/client';
import { projects } from '@/utils/projects';
import { ProjectWithOptions } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function NewProjectForm() {
    const router = useRouter();

    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('internal');
    const [phases, setPhases] = useState(defaultPhases);
    const [tasks, setTasks] = useState(defaultTasks);

    const handleCreateProject = async () => {
        try {
            setIsCreating(true);
            const supabase = createClient();

            const { data: {session} } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const projectData = {
                name,
                description,
                phases,
                category,
                tasks
            };

            const project = await projects.management.create(
                projectData as ProjectWithOptions,
                session.user.id
            );  
            
            toast({
                title: 'Success',
                description: 'Project created successfully'
            });

            router.push(`/projects/${project.id}`);
        } catch (error) {
            console.error('Error creating project:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to create project. Please try again.',
            });
        } finally {
            setIsCreating(false);
        }
    }
    return (
        <div className="space-y-4">
            <div className="space-y-1 max-w-96">
                <Label className='text-s'>Project Name</Label>
                <Input
                    placeholder='name of project'
                    value={name}
                    onChange={e => setName(e.currentTarget.value)}
                />
            </div>

            <div className="space-y-2 max-w-[28rem]">
                <Label className='text-s'>Project Category</Label>
                <RadioGroup value={category} onValueChange={setCategory}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="internal" id="internal" />
                        <Label htmlFor="internal" className='text-xs'>Internal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="external" id="external" />
                        <Label htmlFor="external" className='text-xs'>External</Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-1 max-w-[28rem]">
                <Label className='text-xs'>Description</Label>
                <Textarea
                    value={description}
                    onChange={e => setDescription(e.currentTarget.value)}
                    placeholder='short description about this project'
                    rows={8}
                />
            </div>
            <div className="flex">
                <Button 
                    className='px-4 py-2 font-semibold text-white bg-green-600 hover:bg-green-700 rounded'
                    onClick={handleCreateProject}
                    disabled={isCreating}
                >
                    {isCreating ? 'Creating...' : 'Create'}
                </Button>
            </div>

        </div>
    );
}