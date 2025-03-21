import { UserAvatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { MemberWithUser, Role } from "@/types";
import { RoleSelect } from "./RoleSelect";
import { useProjectOwner } from "@/hooks/useProjectOwner";
import { Badge } from "@/components/ui/badge";
import { SkeletonManageAccess } from "./components/skeleton-access";
import { useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { error } from "console";
import { toast } from "@/hooks/use-toast";

interface ManageAccessProps {
    members: MemberWithUser[];
    onMemberChange?: (
        members: MemberWithUser[] | ((prev: MemberWithUser[]) => MemberWithUser[])
    ) => void;
    currentUserId: string;
    projectId: string;
    createdBy: string;
    onCurrentUserRoleChange?: (newRole: Role) => void; 
}

export default function ManageAccess({ 
    members, onMemberChange, currentUserId, projectId, createdBy, onCurrentUserRoleChange
}:ManageAccessProps) {
    const { owner, isLoading: isLoadingOwner } = useProjectOwner(projectId);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isUpdating, setIsUpdating] = useState(false);

    const supabase = createClient();

    const allMembers = useMemo(() => {
        if (!members || !owner) return members ?? [];
        const isOwnerInMembers = members.some((m) => m.user.id === owner.id);
        if (isOwnerInMembers) return members;

        return [
            {
                id: `owner-${owner.id}`,
                user_id: owner.id,
                project_id: projectId,
                role: 'owner' as Role,
                invitationStatus: 'accepted',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user: {
                    id: owner.id,
                    name: owner.name,
                    email: owner.email,
                    avatar: owner.avatar,
                },
            },
            ...members,
        ]
    }, [members, owner, projectId])

    const handleSelectMembers = (id:string, checked:boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedIds(newSelected);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const selectableMembers = allMembers.filter(
                (member) => 
                    member.user_id !== currentUserId && member.user_id !== createdBy
            );
            setSelectedIds(new Set(selectableMembers.map( m => m.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleRoleChange = async (memberId: string, newRole: Role) => {
        try {
            setIsUpdating(true);
            const { error } = await supabase
                .from('project_members')
                .update({ role:newRole, updated_at:new Date() })
                .eq('id', memberId)
            if (error) throw error;

            const member = members.find(m => m.id === memberId);
            if (member?.user_id === currentUserId) {
                onCurrentUserRoleChange?.(newRole);
            }

            onMemberChange?.(( prev: MemberWithUser[] ) => 
                prev.map(member => 
                    member.id === memberId ? { ...member, role: newRole } : member
                )
            );

            toast({
                title: 'Success',
                description: 'Member role updated successfully',
            });
        } catch (error) {
            console.error('Failed updating member role: ',error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update member role. Please try again'
            })
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemoveMembers = async () => {
        if (selectedIds.size === 0) return;
        try {
            setIsUpdating(true);
            const idsToRemove = Array.from(selectedIds).filter((id) => {
                const member = members.find(m => m.id === id);
                return (
                    member?.user_id !== currentUserId &&
                    member?.user_id !== createdBy
                );
            });

            if ( idsToRemove.length === 0 ) return;

            const { error } = await supabase
                .from('project_members')
                .delete()
                .eq('id', idsToRemove)
            if (error) throw error;

            onMemberChange?.(( prev: MemberWithUser[] ) => 
                prev.filter(member => !idsToRemove.includes(member.id))
            );

            setSelectedIds(new Set());

            toast({
                title: 'Success',
                description: 'Members removed succesfully',
            });
        } catch (error) {
                console.error('Error removing members: ', error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to remove members. Please try again',
                });
        } finally {
            setIsUpdating(false);
        }
    }

    if (isLoadingOwner) return <SkeletonManageAccess />;

    return (
        <div>
            <h1 className="text-base mb-4">Manage Access</h1>

            <div className="rounded-md border overflow-hidden mt-4">
                <div className="bg-muted dark:bg-muted/30 flex justify-between items-center px-4 py-2 border-b">
                    <div className="flex items-center gap-4">
                        <Checkbox 
                            checked={
                                allMembers.length > 0 &&
                                allMembers
                                    .filter(
                                        m => 
                                            m.user_id !== currentUserId && m.user_id !== createdBy
                                    )
                                    .every( m => selectedIds.has(m.id))
                            }
                            onCheckedChange={handleSelectAll}
                        />
                        <span className="text-xs">
                            {selectedIds.size} of {allMembers.length} members
                        </span>
                    </div>

                    { selectedIds.size > 0 && 
                        <Button
                            variant='ghost'
                            size='sm'
                            className="text-red-500 hover:text-red-600"
                            onClick={handleRemoveMembers}
                            disabled={isUpdating}
                        >
                            Remove Selected
                        </Button>
                    }
                </div>  

                <div className="px-4 py-3 border-b">
                    <Input
                        placeholder="Find a member"
                        className="h-7 rounded-sm bg-muted/50 dark:bg-muted/20"
                    />
                </div>

                <div className="divide-y">
                    { allMembers.map(( member ) => (
                        <div 
                            key={ member.id }
                            className="p-4 flex items-center justify-between hover:bg-muted/50"
                        >
                            <div className="flex items-center gap-3">
                                {member.user_id !== owner?.id 
                                    && currentUserId !== member.user_id && (
                                    <Checkbox 
                                        checked={selectedIds.has(member.id)}
                                        onCheckedChange={(checked: boolean) =>
                                            handleSelectMembers(member.id, checked)
                                        }
                                    />
                                )}

                                <div className="flex items-center gap-2">
                                    <UserAvatar 
                                        src={ member.user.avatar } 
                                        fallback={ member.user.name  } 
                                        className="h-6 w-6" 
                                    />
                                    <div>
                                        <p className="text-sm font-medium">
                                            { member.user.name }
                                            { member.user.id === currentUserId && (
                                                <span className="text-xs text-muted-foreground">
                                                    {' '}
                                                    (You)
                                                </span>
                                            )}
                                        </p>
                                        { member.invitationStatus === 'invited' && (
                                            <p className="text-xs text-muted-foreground">
                                                Pending Invitation
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                { member.user.id === owner?.id ? (
                                    <Badge variant={'secondary'} className="text-xs">
                                        Owner
                                    </Badge>
                                ) : (
                                    <RoleSelect 
                                        value={member.role} 
                                        onValueChange={(role) => handleRoleChange(member.id, role)} 
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}