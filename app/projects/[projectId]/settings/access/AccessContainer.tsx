'use client';

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