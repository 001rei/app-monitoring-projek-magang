import TextEditor from '@/components/TextEditor';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserCard } from '@/components/UserCard';
import { useActivityQueries } from '@/hooks/useActivityQueries';
import { useCommentQueries } from '@/hooks/useCommentQueries';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Ellipsis, Pen, Reply, Trash, User } from 'lucide-react';
import { FC, useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTaskDetails } from '../TaskDetailsContext';
import { CommentResponse } from '@/types';
import { toast } from '@/hooks/use-toast';
import { secondaryButton, successButton } from '@/consts/buttonStyles';
import { Textarea } from '@/components/ui/textarea';

interface Props {
    comment: CommentResponse;
}

export const Comment: FC<Props> = ({ comment }) => {
    const [description, setDescription] = useState(comment.content);
    const [editable, setEditable] = useState(false);
    const { user } = useCurrentUser();
    const { selectedTask } = useTaskDetails();
    const [isExpanded, setIsExpanded] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const { updateComment, deleteComment, createComment, reloadCommentTask } = useCommentQueries(
        selectedTask?.id || ''
    );
    const { createActivity } = useActivityQueries(selectedTask?.id || '');

    const isCommentOwner = user?.id === comment.user.id;
    const replyCount = comment.replies ? comment.replies.length : 0;
    const replies = comment.replies;

    const handleUpdateComment = async () => {
        if (!description.trim()) return;

        try {
            await updateComment({
                commentId: comment.id,
                content: description,
            });

            setEditable(false);
        } catch (error) {
            toast({
                title: 'Failed to update comment',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteComment = async (id: string) => {
        try {
            await deleteComment(id);

            await createActivity({
                task_id: selectedTask?.id as string,
                user_id: user?.id as string,
                content: [
                    {
                        type: 'user',
                        id: user?.id as string,
                    },
                    'deleted a comment on',
                    { type: 'date', value: new Date().toISOString() },
                ],
            });
            await reloadCommentTask();
        } catch (error) {
            toast({
                title: 'Failed to delete comment',
                variant: 'destructive',
            });
        } 
    };

    const handleCancel = () => {
        setDescription(comment.content); // Reset to original content
        setEditable(false);
    };


    const handleSaveReply = async () => {
        if (!replyContent.trim() || !selectedTask?.id || !user?.id) return;

        try {
            setIsReplying(true);
            await createComment({
                task_id: selectedTask.id,
                user_id: user.id,
                parent_id: comment.id,
                content: replyContent,
            });
            setReplyContent('');
            setIsExpanded(true);

            toast({
                title: "Reply posted successfully",
                variant: "default",
            });
        } catch (error) {
            toast({
                title: 'Failed to add reply',
                variant: 'destructive',
            });
        } finally {
            setIsReplying(false);
        }
    };



    return (
        <div className="border border-sky-200 dark:border-blue-900 rounded">
            <div className="flex items-center justify-between bg-sky-100 dark:bg-slate-900 rounded-t border-b border-sky-200 dark:border-blue-900 overflow-x-auto px-4 py-2">
                <div className="flex items-center gap-2 text-sm">
                    <span>
                        <UserCard
                            id={comment.user.id || ''}
                            name={comment.user.name || ''}
                            avatarUrl={comment.user.avatar || ''}
                            description={comment.user.description || ''}
                        />
                    </span>{' '}
                    <span className="text-gray-500">
                        {new Date(comment.created_at).toDateString()}
                    </span>
                </div>

                {isCommentOwner && (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Ellipsis className="w-6 h-6 text-gray-600" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="mr-4">
                            <DropdownMenuItem onClick={() => setEditable(true)}>
                                <Pen className="w-4 h-4 mr-2" />
                                Edit
                            </DropdownMenuItem>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        className="text-red-500 bg-transparent hover:bg-red-200 hover:dark:bg-red-950"
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        <Trash className="w-3 h-3 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete this comment? This action
                                            cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleDeleteComment(comment.id as string)}
                                            className="bg-red-500 hover:bg-red-600"
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            <div className="p-2 min-h-[120px]">
                {editable ? (
                    <div>
                        <div className="min-h-[180px]">
                            <TextEditor
                                content={description}
                                onChange={setDescription}
                                isEditable={editable}
                            />
                        </div>
                        <div className="flex items-center justify-end space-x-3 pt-2">
                            <Button
                                className={cn(secondaryButton, 'h-8')}
                                onClick={handleCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                className={cn(successButton, 'h-8')}
                                onClick={handleUpdateComment}
                                disabled={
                                    !description.trim() || description === comment.content
                                }
                            >
                                Update Comment
                            </Button>
                        </div>
                    </div>
                ) : (
                    <TextEditor
                        content={description}
                        onChange={setDescription}
                        isEditable={false}
                    />
                )}
            </div>
        
            <div className="px-4 pb-2">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Reply className="w-4 h-4" />
                        <span>{replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}</span>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 h-6"
                    >
                        <ChevronDown
                            className={`w-4 h-4 transition-transform duration-400 ${isExpanded ? "rotate-180" : "rotate-0"}`}
                        />
                    </Button>
                </div>

                {isExpanded && (
                    <>
                        {replyCount > 0 && (
                            <div className="space-y-3 mt-3 pl-4 pt-3 border-l-2 border-gray-200 dark:border-gray-700">
                                {replies?.map((reply) => (
                                    <div key={reply.id} className="flex gap-3 group">
                                        <div className="flex-shrink-0">
                                            <UserCard
                                                id={reply.user?.id ?? ''}
                                                name={reply.user?.name ?? 'Unknown User'}
                                                description={reply.user?.description ?? ''}
                                                avatarUrl={reply.user?.avatar ?? ''}
                                                showPreviewName={false}
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    <span className='pr-2 text-white'>{reply.user.name}</span>
                                                    {new Date(reply.created_at).toLocaleString()}
                                                </div>

                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                                <Ellipsis className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem 
                                                                className='text-red-500'
                                                                onClick={() => handleDeleteComment(reply.id)}
                                                            >
                                                                <Trash/>
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>

                                            <div className="mt-1 py-3 px-3 text-sm rounded-sm bg-muted dark:bg-muted/40">
                                                {reply.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-2 pt-4">
                            <Textarea
                                placeholder="Write your reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="min-h-[80px]"
                            />
                            <div className="flex justify-end gap-2 pt-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setReplyContent('');
                                        setIsExpanded(true); 
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSaveReply}
                                    disabled={!replyContent.trim() || isReplying}
                                >
                                    {isReplying ? "Posting..." : "Post Reply"}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};