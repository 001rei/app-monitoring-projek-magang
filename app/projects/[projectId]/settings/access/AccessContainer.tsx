'use client';

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { IProjectMember, IUser, MemberWithUser, Role } from "@/types";
import { useState } from "react";
import InviteUsers from "./InviteUsers";
import ManageAccess from "./ManageAccess";

interface AccessContainerProps {
    projectId: string,
    projectName: String;
    initialMembers: MemberWithUser[];
    currentUserId: string;
    currentUserRole: string;
    createdBy: string;
}

export function AccessContainer({ 
    projectId, projectName, initialMembers, currentUserId, currentUserRole, createdBy 
}: AccessContainerProps) {
    const [members, setMembers] = useState<MemberWithUser[]>(initialMembers);
    const [currentRole, setCurrentRole] = useState(currentUserRole);

    const handleMemberAdded = (newMember: MemberWithUser) => {
        setMembers((prev: MemberWithUser[]) => [...prev, newMember]);
    };

    const handleCurrentUserRoleChange = (newRole: Role) => {
        setCurrentRole(newRole);
    };
    
    return (
        <>
            <Alert className="bg-muted/90 dark:bg-muted/60 border" >
                <div className="flex space-x-3 items-center">
                    <AlertCircle className="h-4 w-4 text-yellow-300" />
                    <div>
                        <AlertTitle>Project Visibility</AlertTitle>
                        <AlertDescription>
                            Only those with access to this project can view it.
                        </AlertDescription>
                    </div>
                </div>
            </Alert>
            <InviteUsers 
                projectName={projectName as string}
                projectId={projectId}
                onMemberAdded={handleMemberAdded}
                currentUserRole={currentRole as Role}
                createdBy={createdBy}
                members={members}
            />
            <ManageAccess 
                projectId={projectId}
                members={members}
                onMemberChange={setMembers}
                currentUserId={currentUserId}
                createdBy={createdBy}
                onCurrentUserRoleChange={handleCurrentUserRoleChange}
            />
        </>
    );
}