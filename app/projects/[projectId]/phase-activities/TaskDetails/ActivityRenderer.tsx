import { CustomFieldTagRenderer } from '@/components/CustomFieldTagRenderer';
import FileBadge from '@/components/ui/file-badge';
import { UserCard } from '@/components/UserCard';
import { ActivityResponse, IPriority, IStatus, IUser } from '@/types';
import { FC } from 'react';

// Helper components for each activity type
const User = ({ user }: { user?: Partial<IUser> }) => {
    if (!user) {
        return <span>Unknown User</span>;
    }

    return (
        <UserCard
            id={user.id as string}
            name={user.name as string}
            avatarUrl={user.avatar as string}
            description={user.description as string}
            avatarStyles="w-4 h-4"
        />
    );
};

const Users = ({ users }: { users?: Partial<IUser>[] }) => {
    if (!users || users.length === 0) {
        return <span>Unknown Users</span>;
    }

    return (
        <div className="flex items-center flex-wrap gap-2">
            {users?.map((user) => (
                <UserCard
                    key={user.id}
                    id={user.id as string}
                    name={user.name as string}
                    avatarUrl={user.avatar as string}
                    description={user.description as string}
                    avatarStyles="w-4 h-4"
                />
            ))}
        </div>
    );
};

const DateRenderer = ({ value }: { value: Date | string }) => {
    const date = new Date(value);
    const currentYear = new Date().getFullYear();
    const isCurrentYear = date.getFullYear() === currentYear;

    const formattedDate = isCurrentYear
        ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

    return <span>{formattedDate}</span>;
};

const StatusBadge = ({ status }: { status?: IStatus }) => {
    if (!status) {
        return <span>Unknown Status</span>;
    }

    return (
        <CustomFieldTagRenderer label={status.label} color={status.color} />
    );
};

const PriorityBadge = ({ priority }: { priority?: IPriority }) => {
    if (!priority) {
        return <span>Unknown Priority</span>;
    }

    return (
        <CustomFieldTagRenderer label={priority.label} color={priority.color} />
    );
};

interface ActivityRendererProps {
    activity: ActivityResponse;
    allMembers: Partial<IUser>[];
    statuses: IStatus[];
    priorities: IPriority[];
}

const ActivityRenderer: FC<ActivityRendererProps> = ({
    activity,
    allMembers,
    statuses,
    priorities,
}) => {
    console.log(activity)
    return (
        <div className="flex items-center flex-wrap text-xs gap-1 ml-3 my-3">
            {activity.content.map((item, index) => {
                if (typeof item === 'string') {
                    return (
                        <span key={index} className="text-gray-400">
                            {item}
                        </span>
                    );
                }
                switch (item.type) {
                    case 'user':
                        return (
                            <User
                                key={index}
                                user={allMembers?.find((member) => member.id === item.id)}
                            />
                        );
                    case 'date':
                        return <DateRenderer key={index} value={item.value} />;
                    case 'users':
                        return (
                            <Users
                                key={index}
                                users={item.ids
                                    .map((id) => allMembers?.find((member) => member.id === id))
                                    .filter((member): member is IUser => member !== undefined)}
                            />
                        );
                    case 'status':
                        return (
                            <StatusBadge
                                key={index}
                                status={statuses?.find(
                                    (status: IStatus) => status.id === item.id
                                )}
                            />
                        );
                    case 'attachment':
                        return (
                            <FileBadge
                                key={index}
                                filename={item.value}
                            />
                        );
                    case 'priority':
                        return (
                            <PriorityBadge
                                key={index}
                                priority={priorities?.find(
                                    (priority: IPriority) => priority.id === item.id
                                )}
                            />
                        );
                    default:
                        return null;
                }
            })}
        </div>
    );
};

export default ActivityRenderer;