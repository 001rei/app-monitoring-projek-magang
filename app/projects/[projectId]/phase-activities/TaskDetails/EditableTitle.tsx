import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectAction } from '@/consts/actions';
import { secondaryButton, successButton } from '@/consts/buttonStyles';
import { useAssignedTasksQueries } from '@/hooks/useAssignedTasksQueries';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useProjectAccess } from '@/hooks/useProjectAccess';
import { useProjectQueries } from '@/hooks/useProjectQueries';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';

interface Props {
    title: string;
    isEditing: boolean;
    setIsEditing: Dispatch<SetStateAction<boolean>>;
    onSave: (newTitle: string) => Promise<void>;
}

export const EditableTitle = ({
    title,
    isEditing,
    setIsEditing,
    onSave,
}: Props) => {
    const params = useParams();
    const projectId = params.projectId as string;
    const [text, setText] = useState(title);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const { user } = useCurrentUser();
    const { can } = useProjectAccess({ projectId });
    const { reloadAssignedTasks } = useAssignedTasksQueries(
        projectId, user?.id as string
    );
    const { reloadProjectTasks } = useProjectQueries(projectId);

    const handleSave = async () => {
        if (text.length > 50) {
            setError('Title must be 50 characters or less');
            return;
        }

        try {
            setIsSaving(true);
            await onSave(text);
            await reloadProjectTasks();
            await reloadAssignedTasks();
            setIsEditing(false);
            setError('');
        } catch (error) {
            console.error('Failed to save title:', error);
            setError('Failed to save title');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setText(title);
        setIsEditing(false);
        setError('');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newText = e.target.value;
        if (newText.length <= 50) {
            setError('');
        }
        setText(newText);
    };

    if (isEditing) {
        return (
            <div className="flex flex-col w-full">
                <div className="flex items-center w-full">
                    <div className="flex-grow mr-2">
                        <Input
                            type="text"
                            value={text}
                            onChange={handleChange}
                            className="border border-gray-300 rounded p-1 h-8"
                            disabled={isSaving}
                            maxLength={50}
                        />
                    </div>
                    <div className="space-x-2">
                        <Button
                            onClick={handleSave}
                            className={cn(successButton, 'px-2 md:px-4')}
                            disabled={isSaving || text.length > 50}
                        >
                            <span className="hidden md:inline">
                                {isSaving ? 'Saving...' : 'Save'}
                            </span>
                            <span className="md:hidden">
                                <Check className="w-3 h-3" />
                            </span>
                        </Button>
                        <Button
                            onClick={handleCancel}
                            className={cn(secondaryButton, 'px-2 md:px-4')}
                            disabled={isSaving}
                        >
                            <span className="hidden md:inline">Cancel</span>
                            <span className="md:hidden">
                                <X className="w-3 h-3" />
                            </span>
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                        {text.length}/50 characters
                    </span>
                    {error && (
                        <span className="text-xs text-destructive">
                            {error}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-grow items-center">
            <h1
                title={title}
                className="text-left text-sm sm:text-md md:text-2xl lg:text-3xl flex-grow truncate"
            >
                {text}
            </h1>
            {can(ProjectAction.UPDATE_TASKS) && (
                <Button
                    onClick={() => setIsEditing(true)}
                    className={cn(secondaryButton, 'px-2 h-7 hidden md:inline-flex')}
                >
                    Edit
                </Button>
            )}
        </div>
    );
};