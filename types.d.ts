import { tasks } from './utils/tasks';
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
    startDate?: Date;
    endDate?: Date;
    actualEndDate?: Date;
    status?: number;
    phase_order?: number;
    created_at: Date;
}

export interface IStatus {
    id: number;
    label: string;
    color: string;
    description: string;
    order: number;
    created_at: Date;
}

export interface IPriority {
    id: string;
    label: string;
    color: string;
    description: string;
    order: number;
    created_at: Date;
}

export interface IMilestone {
    id: string;
    phase_label: string;
    label: string;
    description: string;
    color: string;
    milestone_order: number;
}

interface ITask {
    id: string;
    project_id: string;
    phase_id: string;
    phase_label: string;
    parent_task_id: string | null; 

    status: number;
    priority: string | null;
    milestone: string | null;
    title: string;
    description: string;
    startDate: Date | null;
    endDate: Date | null;
    created_at: Date;
    updated_at: Date;
    created_by: string;

    assignees?: string[];
    subtasks?: ITask[];
}

interface ITaskAttachment {
    id: string;
    project_id: string;
    task_id: string;
    file_path: string;
    file_name: string;
    file_type: string;
    phase_label: string;
    uploaded_by: string;
    uploaded_at: Date;
}

interface IComment {
    id: string;
    content: string;
    user_id: string;
    task_id: string;
    parent_id?: string;
    created_at: Date;
    updated_at: Date;
}

interface CommentResponse extends Omit<IComment, 'user_id'> {
    user: Partial<IUser>;
    replies?: Array<{
        id: string;
        content: string;
        created_at: Date;
        user: Partial<IUser>;
    }>;
}

type ActivityType = 'status' | 'priority' | 'date' | 'user' | 'users';
type ActivityPayload = 'id' | 'value' | 'ids';

type ActivityObject =
    | { type: 'status'; id: number }
    | { type: 'priority'; id: string }
    | { type: 'date'; value: string }
    | { type: 'user'; id: string }
    | { type: 'users'; ids: string[] };

type TaskActivity = (string | ActivityObject)[];

interface IActivity {
    id: string;
    created_at: Date;
    content: TaskActivity;
    user_id: string;
    task_id: string;
    updated_at: Date;
}

interface ActivityResponse extends Omit<IActivity, 'user_id'> {
    user: Partial<IUser>;
}

type TimelineType = 'activity' | 'comment';
interface ITimeline {
    id: string;
    created_at: Date;
    type: TimelineType;
    value: ActivityResponse | CommentResponse;
}



// ------------------------------
interface ICustomFieldData {
    id: string;
    order?: number;
    phase_order?: number;
    status?: number;
    label?: string;
    color?: string;
    description?: string;
}

interface ICustomFieldTask {
    id: string;
    title: string;
    phase_label: string;
    description?: string;
    status: number;
    priority: string;
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

interface ITaskWithOptions extends Partial<ITask> {
    creator?: {
        id: string;
        name: string;
        avatar: string;
        description: string;
    };
    status?: {
        id: number;
        label: string;
        color: string;
        order: number;
        description?: string;
    };
    priority?: {
        id: string;
        label: string;
        color: string;
        order: number;
        description?: string;
    };
    subtasks?: ITaskWithOptions[];
    assignees?: {
        id: string;
        name: string;
        description: string;
        avatar: string;
    }[];
    phase_id?: {
        id: string;
        label: string;
        startDate: Date;
        endDate: Date;
        actualEndDate: Date;
        status: number;
        phase_order: number;
    };
    milestone?: {
        id: string;
        label: string;
        color: string;
        milestone_order: number;
        description?: string;
    };
    task_attachments?: {
        id: string;
        file_path: string;
        file_name: string;
        file_type: string;
    }[];
}

interface MemberWithUser extends IProjectMember {
    user: Pick<IUser, 'id' | 'name' | 'email' | 'avatar'>;
}

interface IOverviewWithOption extends Partial<IProject> {
    membersCount: number;
    currentPhase: Partial<IPhase>;
    phases: Partial<IPhase>[];
    tasks: {
        id: string;
        title: string;
        status: Partial<IStatus>;
        priority: Partial<IPriority>;
        endDate: Date;
        created_at: Date;
        updated_at: Date;
        assignees?: {
            id: string;
            name: string;
            description: string;
            avatar: string;
        }[];
    }[];
}

type BoardProject = {
    id: string;
    label: string;
    endDate: Date;
    details: {
        id: string;
        name: string;
        description: string;
        project_code: string;
        category: string;
        total_tasks: number;
        done_tasks: number;
    } | null;
};

type OverviewTask = {
    id: string;
    phase_id: string;
    task_status?: {
        id: number;
        label: string;
        color: string;
        order: number;
    } | null;
    task_priority?: {
        id: string;
        label: string;
        color: string;
        order: number;
    } | null;
    endDate?: Date;
}