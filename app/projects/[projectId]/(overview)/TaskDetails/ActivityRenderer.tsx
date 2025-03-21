import { UserCard } from '@/components/UserCard';
import { ActivityResponse, IStatus, IUser } from '@/types';
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

// Define the props and task activity types
interface ActivityRendererProps {
    activity: ActivityResponse;
    allMembers: Partial<IUser>[];
    statuses: IStatus[];
}

const ActivityRenderer: FC<ActivityRendererProps> = ({
    activity,
    allMembers,
}) => {
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
                    default:
                        return null;
                }
            })}
        </div>
    );
};

export default ActivityRenderer;