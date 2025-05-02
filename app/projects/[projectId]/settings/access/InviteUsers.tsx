import { IUser, MemberWithUser, Role } from "@/types";
import { Loader, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { successButton } from "@/consts/buttonStyles";
import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { createClient } from "@/utils/supabase/client";
import { RoleSelect } from './RoleSelect';
import { error } from "console";
import { toast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { emails } from "@/utils/emails";



interface InviteUsersProps {
    projectName: string;
    projectId: string;
    onMemberAdded?: (member: MemberWithUser) => void;
    currentUserRole: Role;
    createdBy: string;
    members: MemberWithUser[];
}

export default function InviteUsers({
    projectName, projectId, onMemberAdded, currentUserRole, createdBy, members
}: InviteUsersProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<IUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);   
    const [role, setRole] = useState<Role>('read');
    const [isSearching, setIsSearching] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const { user } = useCurrentUser();
    
    const supabase = createClient();

    const debouncedSearch = useDebounce(async(term: string) => {
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            setIsSearching(true);
            const excludedUserIds = [
                ...members.map((member) => member.user_id),
                createdBy,
            ];

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .ilike('name', `%${term}%`)
                .not('id', 'in', `(${excludedUserIds.join(',')})`)
                .limit(5);
            if (error) throw error;

            setSearchResults(data as IUser[] || [])
        } catch (error) {
            console.error('Error searching users: ', error);
        } finally {
            setIsSearching(false)
        }
        
    }, 1000);

    const handleInviteUser = async () => {
        if (!selectedUser) return;
        try {
            setIsInviting(true);
            const memberDetails = {
                id: crypto.randomUUID(),
                project_id: projectId,
                user_id: selectedUser.id,
                role,
                invitationStatus: 'invited',
                invited_at: new Date(), 
            }
            const { error: memberError } = await supabase
                .from('project_members')
                .insert(memberDetails);
            if (memberError) throw memberError;

            const newMember = {
                ...memberDetails,
                user: selectedUser,
            } as MemberWithUser;

            // send invitation email
            await emails.sendProjectInvitation({
                to: selectedUser.email,
                projectId,
                role,
                username: selectedUser.name,
                projectName,
                invitedByUsername: user?.name || '', 
            });

            onMemberAdded?.(newMember);

            toast({
                title: 'Success',
                description: 'Invitation sent successfully.'
            })
            
            //reset
            setSelectedUser(null);
            setSearchTerm('');
            setSearchResults([]);
        } catch (error) {
            console.error('Error Invite: ',error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to send invitation. Please try again'
            })
        } finally {
            setIsInviting(false);
        }
    }

    if (currentUserRole !== 'admin' && currentUserRole !== 'owner') {
        return null;
    }

    return (
        <div className="py-8">
            <h1 className="text-lg font-medium">Invite users</h1>
            <p className="text-xs text-muted-foreground pb-2">
                Send invitations via email
            </p>
            <div className="flex items-center gap-2">
                <div className="relative ml-auto flex-1">
                    <User className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                    { isSearching && <Loader className="absolute right-2.5 top-2 h-4 w-4 animate-spin" /> }
                    <Input 
                        placeholder="Search by name ..."
                        className="w-full rounded-sm  bg-background pl-8 h-8"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            debouncedSearch(e.target.value)
                        }}
                    />

                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-sm shadow-lg z-10">
                            {searchResults.map((user) => (
                                <div
                                    key={user.id}
                                    className="p-2 text-sm hover:bg-muted cursor-pointer"
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setSearchTerm(user.name);
                                        setSearchResults([]);
                                    }}
                                >
                                    {user.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <RoleSelect value={role} onValueChange={setRole} />
                <Button 
                    onClick={handleInviteUser} 
                    className={cn(successButton, 'px-3')}
                    disabled={!selectedUser || isInviting}
                >
                    { isInviting ? 'Inviting...' : 'Invite'}
                </Button>
            </div>
        </div>
    );
}