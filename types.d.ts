type userProvider = "email" | "github" | "google";
type Role = 'read' | 'write' | 'admin' | 'owner';
type InvitationStatus = 'invited' | 'accepted' | 'declined' | 'expired';

export interface IUser {
    id: string,
    email: string,
    name: string,
    description: string,
    avatar: string,
    created_at: Date;
    updated_at: Date;
    provider: 'google' | 'github' | 'email',
}

export interface IProject {
    id: string;
    category: string;
    project_code: string;
    name: string;
    description: string;
    readme: string;
    created_by: string;
    created_at: Date;
    updated_at: Date;
    closed: boolean;
}

interface IProjectMember {
    id: string;
    project_id: string;
    user_id: string;
    role: Role;
    invitationStatus: InvitationStatus;
    invited_at: Date;
    joined_at?: Date;
}

export interface IPhase {
    id: string;
    project_id?: string;
    label: string;
    created_at: Date;
}

export interface IStatus {
    id: string;
    project_id?: string;
    label: string;
    color: string;
    description: string;
    created_at: Date;
    updated_at: Date;
}

export interface IPriority {
    id: string;
    project_id?: string;
    label: string;
    color: string;
    created_at: Date;
}

export interface ITask {
    id: string;
    project_id: string;
    parent_task_id: string;
    phase_id: string;
    phase_label: string;
    title: string;
    description: string;
    priority: string | null;
    status: string | null;
    startDate: Date | null;
    endDate: Date | null;
    created_at: Date;
    updated_at: Date;
    created_by: string;
    assignees?: string[];
}


// ------------------------------
interface ICustomFieldData {
    id: string;
    label?: string;
    color?: string;
    description?: string;
}

interface ICustomFieldTask {
    id: string;
    title: string;
    phase_label: string;
    description?: string;
}

type ProjectWithOptions = {
    name: string;
    description: string;
    category: "internal" | "external";
    phases?: Omit<IPhase, 'created_at'>[];
    statuses?: Omit<IStatus, 'created_at' | 'updated_at'>[];
    priorities?: Omit<IPriority, 'created_at' | 'updated_at'>[];
    tasks?: Omit<ITask, 'created_at' | 'updated_at'>[];
};